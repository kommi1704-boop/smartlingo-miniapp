// Vercel cron function: weekly challenge message + scheduled/unfinished admin campaigns.
// Scheduled in vercel.json ->  5 13 * * *  (13:05 UTC = 18:05 Asia/Tashkent, five minutes
// AFTER the existing streak-reminder cron so the two never fight over Telegram's rate limit).
//
// Runs every day and does three idempotent things:
//   1. Monday only: the weekly challenge message (kind 'weekly') to learners who were
//      active in the last 7 days — never to inactive users, never twice per week
//      (deterministic history id `n_weekly_<uid>_weekly:<day>`).
//   2. Every day: campaigns an admin SCHEDULED (status 'scheduled', scheduled_at due) are
//      sent chunk-by-chunk. This is still an explicit admin action (the admin scheduled it)
//      — nothing is ever broadcast automatically.
//   3. Every day: continuation of campaigns that are mid-send (status 'sending', cursor
//      last_uid) so a partial run (function timeout) resumes instead of restarting.
//
// Every recipient keeps their notification preferences (category, quiet hours, pause) via
// the shared dispatcher — users who opted out simply never receive these.
//
// Auth: Vercel sends `x-vercel-cron: 1`. With CRON_SECRET set, `Authorization: Bearer <secret>`
// is also accepted (manual testing, `?force=1` to try the weekly part on a non-Monday).
// Env: TELEGRAM_BOT_TOKEN, WEBAPP_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET(optional).
import { audienceIds, runCampaignSend, type CampaignRow } from './admin-notify';
import { dispatch, fetchPrefsMap, sbHeaders, uztHour, type DbCtx } from './notify';
import { uztDay } from './progress';

interface Req {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}

const WEEKLY_TEXT =
  '🏁 Haftalik challenge boshlandi!\n\n' +
  'Shu hafta ichida 5 ta mashqni bajaring va +50 XP bonus oling! Har kuni kichik qadam — hafta oxirida katta natija. 🚀\n\n' +
  'Do‘stlaringizni ham challenge’ga taklif qiling — birga o‘rganish ancha qiziqarli!';

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

export default async function handler(req: Req, res: Res): Promise<void> {
  const secret = process.env.CRON_SECRET?.trim();
  const viaCronHeader = header(req, 'x-vercel-cron') === '1';
  const viaSecret = secret ? header(req, 'authorization') === `Bearer ${secret}` : false;
  if (!viaCronHeader && !viaSecret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const appUrl = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '');
  const dbUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!token || !appUrl || !dbUrl || !dbKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const db: DbCtx = { url: dbUrl, key: dbKey };
  const q = new URL(req.url ?? '', 'http://local').searchParams;
  const force = q.get('force') === '1' && viaSecret;
  const today = uztDay();
  const isMonday = new Date(`${today}T12:00:00Z`).getUTCDay() === 1;
  const out: Record<string, unknown> = { ok: true, day: today };

  try {
    // ---------- 1) weekly challenge (Mondays, active learners, prefs respected) ----------
    if (isMonday || force) {
      const prefs = await fetchPrefsMap(db);
      const active = await audienceIds(db, 'active');
      const targets = active.filter((uid) => {
        const p = prefs.get(uid);
        return !p || p.categories.weekly !== false; // default-on; explicit opt-out wins
      });
      let sent = 0;
      let skipped = 0;
      let failed = 0;
      const chunk = targets.slice(0, 300);
      for (let i = 0; i < chunk.length; i += 15) {
        const part = chunk.slice(i, i + 15);
        const results = await Promise.all(
          part.map(async (uid) => {
            const r = await dispatch(db, token, appUrl, {
              uid,
              kind: 'weekly',
              eventKey: `weekly:${today}`,
              text: WEEKLY_TEXT,
              button: { label: '🏁 Challenge’ga qo‘shilish', webApp: true },
            });
            return r.status;
          }),
        );
        for (const s of results) {
          if (s === 'sent') sent++;
          else if (s === 'failed') failed++;
          else skipped++;
        }
        if (i + 15 < chunk.length) await new Promise((r) => setTimeout(r, 1500));
      }
      out.weekly = { targets: targets.length, sent, failed, skipped, hour: uztHour() };
    } else {
      out.weekly = { skipped: 'not_monday' };
    }

    // ---------- 2) due scheduled campaigns + 3) continuations ----------
    const nowIso = new Date().toISOString();
    const r = await fetch(
      `${dbUrl}/rest/v1/notification_campaigns?select=*&or=(and(status=eq.scheduled,scheduled_at=lte.${nowIso}),status=eq.sending)&order=created_at.asc&limit=5`,
      { headers: sbHeaders(dbKey), signal: AbortSignal.timeout(20_000) },
    );
    const campaigns = r.ok ? ((await r.json().catch(() => [])) as CampaignRow[]) : [];
    const campaignResults: Record<string, unknown>[] = [];
    for (const c of campaigns) {
      const cursor = c.status === 'sending' ? c.last_uid : null;
      if (c.status !== 'sending') {
        await fetch(`${dbUrl}/rest/v1/notification_campaigns?id=eq.${c.id}`, {
          method: 'PATCH',
          headers: sbHeaders(dbKey),
          body: JSON.stringify({ status: 'sending', sent_count: 0, failed_count: 0, updated_at: nowIso }),
          signal: AbortSignal.timeout(15_000),
        }).catch(() => undefined);
      }
      const run = await runCampaignSend(db, token, appUrl, { ...c, status: 'sending' }, cursor);
      await fetch(`${dbUrl}/rest/v1/notification_campaigns?id=eq.${c.id}`, {
        method: 'PATCH',
        headers: sbHeaders(dbKey),
        body: JSON.stringify({
          status: run.more ? 'sending' : 'sent',
          sent_at: run.more ? c.sent_at : new Date().toISOString(),
          sent_count: c.sent_count + run.sent,
          failed_count: c.failed_count + run.failed,
          last_uid: run.more ? run.last : null,
          updated_at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(15_000),
      }).catch(() => undefined);
      campaignResults.push({ id: c.id, ...run });
    }
    out.campaigns = campaignResults;
    res.status(200).json(out);
  } catch (e) {
    console.error('weekly failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
