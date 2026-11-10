// Vercel cron function: daily streak reminder ("Kunlik seriya" push).
// Scheduled in vercel.json ->  0 13 * * *  (13:00 UTC = 18:00 Asia/Tashkent,
// after school hours). One message per user per day, ever.
//
// Who gets a reminder:
//   presence.last_active == YESTERDAY (Asia/Tashkent)  — studied recently, so a
//   streak is at stake, but has not been active today (last_active == today is
//   a different row value, so today's learners are never matched), and was not
//   reminded yet (presence.reminded_on). Users holding a streak freeze are
//   skipped (they are protected anyway).
//
// UPGRADED to respect the notification preferences (api/notify.ts dispatcher):
//   - the 'streak' category can be turned off in Settings (Bildirishnomalar);
//   - quiet hours and a temporary pause are honoured;
//   - every outcome (sent / failed / skipped + why) is recorded in
//     notification_history with a deterministic id — webhook/cron retries can
//     never double-send, and the Settings page shows the real history;
//   - the message keeps its positive, no-guilt wording and now carries a
//     "Sozlamalar" footer button (one tap to adjust or opt out).
// The schedule, the presence table and the one-per-day guard are UNCHANGED —
// no duplicate cron was created.
//
// Auth: Vercel sends `x-vercel-cron: 1` on scheduled calls. If you also set the
// CRON_SECRET env var, a matching `Authorization: Bearer <secret>` is accepted —
// handy for manual testing. Everything else is rejected with 401.
//
// Env (server only): TELEGRAM_BOT_TOKEN, WEBAPP_URL, SUPABASE_URL,
//                    SUPABASE_SERVICE_ROLE_KEY, optional CRON_SECRET.
import { dispatch, fetchPrefsMap, recordSkip, type DbCtx } from './notify';
import { uztDay } from './progress';

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}

interface PresenceRow {
  telegram_user_id: number;
  freezes: number;
  reminded_on: string | null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

export default async function handler(req: Req, res: Res): Promise<void> {
  // ---- auth (cron header or Bearer secret) ----
  const secret = process.env.CRON_SECRET?.trim();
  const bearer = header(req, 'authorization');
  const viaCronHeader = header(req, 'x-vercel-cron') === '1';
  const viaSecret = secret ? bearer === `Bearer ${secret}` : false;
  if (!viaCronHeader && !viaSecret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const url = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '');
  const dbUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!token || !url || !dbUrl || !dbKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const db: DbCtx = { url: dbUrl, key: dbKey };

  try {
    const today = uztDay();
    const yesterday = uztDay(Date.now() - 24 * 3600 * 1000);

    const r = await fetch(
      `${dbUrl}/rest/v1/presence?last_active=eq.${yesterday}&select=telegram_user_id,freezes,reminded_on&order=telegram_user_id&limit=1000`,
      { headers: sbHeaders(dbKey), signal: AbortSignal.timeout(20_000) },
    );
    if (!r.ok) {
      res.status(502).json({ error: 'storage_error' });
      return;
    }
    const rows = (await r.json()) as PresenceRow[];

    // freeze holders are protected by the product rule — record the WHY (transparent history)
    for (const u of rows) {
      if ((u.freezes ?? 0) > 0 && u.reminded_on !== today) {
        void recordSkip(db, u.telegram_user_id, 'streak', `streak:${today}`, 'skipped_block');
      }
    }

    const prefs = await fetchPrefsMap(db);
    const targets = rows.filter((u) => (u.freezes ?? 0) <= 0 && u.reminded_on !== today).slice(0, 300);

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    for (let i = 0; i < targets.length; i += 15) {
      const chunk = targets.slice(i, i + 15);
      const results = await Promise.all(
        chunk.map(async (u) => {
          // the dispatcher gates (category / quiet hours / pause), reserves the
          // history row and sends — a cron retry lands on the same history id
          const result = await dispatch(db, token, url, {
            uid: u.telegram_user_id,
            kind: 'streak',
            eventKey: `streak:${today}`,
            text:
              '🔥 Seriyangiz xavf ostida!\n\nBugun hali mashq qilmadingiz — kunlik seriyangizni saqlab qolish uchun atigi necha daqiqa kerak. Bir-ikki mashq bilan seriyangiz davom etadi! 💪',
            button: { label: '🔥 Seriyani saqlash', webApp: true },
          });
          if (result.status === 'sent' || result.status === 'duplicate') {
            // duplicate => an earlier run already delivered today — keep the guard in sync
            await fetch(`${dbUrl}/rest/v1/presence?telegram_user_id=eq.${u.telegram_user_id}`, {
              method: 'PATCH',
              headers: sbHeaders(dbKey),
              body: JSON.stringify({ reminded_on: today }),
              signal: AbortSignal.timeout(15_000),
            }).catch(() => undefined);
          }
          if (result.status === 'sent') sent++;
          else if (result.status === 'failed') failed++;
          else skipped++;
          return result.status;
        }),
      );
      if (results.every((x) => x === 'sent') && i + 15 < targets.length) await new Promise((res2) => setTimeout(res2, 1500));
    }

    res.status(200).json({ ok: true, day: today, checked: rows.length, targets: targets.length, sent, failed, skipped });
  } catch (e) {
    console.error('reminders failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
