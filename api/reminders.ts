// Vercel cron function: the daily streak engine (Phase 3 rebuild).
// Scheduled in vercel.json ->  0 13 * * *  (13:00 UTC = 18:00 Asia/Tashkent).
// Vercel Hobby allows exactly 2 daily cron jobs — this one slot carries all
// cron-driven streak messages, timed as the "evening" check before the day ends.
//
// Message types (all gated by the 'streak' category in notification prefs —
// a user who switched it off is never contacted; quiet hours and pauses apply):
//   1. Daily practice reminder  — no streak yet, but active in the last 7 days
//      (presence.last_active within 7 days, streaks.current == 0 or missing row).
//   2. Evening streak warning   — has a streak, last practiced YESTERDAY
//      (streaks.last_day == yesterday), no freeze held. Never a false alarm:
//      the streaks table is server-authoritative, so "not practiced today" is
//      a fact, not a guess.
//   3. Restart encouragement    — streak broken by a whole missed day
//      (last_day <= day-2, previous streak >= 3): one kind message to start again.
//   4. Milestone / record celebration — NOT here: it is event-driven and fires
//      inside api/xp.ts the moment qualifying activity happens (a milestone can
//      never be announced before the practice that earned it).
//
// Freeze holders (streaks.freezes > 0) are protected — the freeze will consume
// itself when they next practice, so they are skipped transparently.
//
// Idempotency & delivery log: every message carries an eventKey unique per user
// per day (streak_warn:<day>, streak_invite:<day>, streak_restart:<day>) — the
// notification_history primary key makes cron retries send at most once, and
// every outcome (sent/failed/skipped + why) is recorded for the Settings page.
//
// Auth: Vercel sends `x-vercel-cron: 1` on scheduled calls, or a matching
// `Authorization: Bearer <CRON_SECRET>` for manual runs. Everything else: 401.
//
// Env (server only): TELEGRAM_BOT_TOKEN, WEBAPP_URL, SUPABASE_URL,
//                    SUPABASE_SERVICE_ROLE_KEY, optional CRON_SECRET.
import { dispatch, fetchPrefsMap, recordSkip, type DbCtx } from './_lib/notify.js';
import { tashkentDay, shiftDay } from './_lib/xpcore.js';

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}

interface StreakRow {
  telegram_user_id: number;
  current: number;
  longest: number;
  last_day: string | null;
  freezes: number;
}

interface PresenceRow {
  telegram_user_id: number;
  last_active: string | null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

export function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);
}

/** Who should get which message today (pure — unit-tested in tests/streaks.test.ts). */
export function selectTargets(
  streakRows: StreakRow[],
  recentPresence: PresenceRow[],
  day: string,
): { warn: StreakRow[]; invite: number[]; restart: StreakRow[]; protectedByFreeze: number[] } {
  const warn: StreakRow[] = [];
  const restart: StreakRow[] = [];
  const protectedByFreeze: number[] = [];
  for (const r of streakRows) {
    if ((r.current ?? 0) <= 0 || !r.last_day) continue;
    const gap = dayDiff(day, r.last_day);
    if (gap === 1) {
      if ((r.freezes ?? 0) > 0) protectedByFreeze.push(r.telegram_user_id);
      else warn.push(r);
    } else if (gap >= 2 && (r.longest ?? 0) >= 3) {
      restart.push(r);
    }
  }
  const withStreak = new Set(streakRows.filter((r) => (r.current ?? 0) > 0 && r.last_day).map((r) => r.telegram_user_id));
  const cutoff = shiftDay(day, -6);
  const invite: number[] = [];
  for (const p of recentPresence) {
    const uid = Number(p.telegram_user_id);
    if (withStreak.has(uid)) continue;
    if (p.last_active && p.last_active >= cutoff && p.last_active < day) invite.push(uid);
  }
  return { warn, invite, restart, protectedByFreeze };
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
  const url = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '');
  const dbUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!token || !url || !dbUrl || !dbKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const db: DbCtx = { url: dbUrl, key: dbKey };

  try {
    const day = tashkentDay();
    const yesterday = shiftDay(day, -1);

    // ---- load the server-authoritative streak table + recent presence ----
    const [streakRows, presenceRows] = await Promise.all([
      fetch(`${dbUrl}/rest/v1/streaks?select=telegram_user_id,current,longest,last_day,freezes&order=telegram_user_id&limit=1000`, { headers: sbHeaders(dbKey), signal: AbortSignal.timeout(20_000) }),
      fetch(`${dbUrl}/rest/v1/presence?select=telegram_user_id,last_active&order=telegram_user_id&limit=1000`, { headers: sbHeaders(dbKey), signal: AbortSignal.timeout(20_000) }),
    ]);
    if (!streakRows.ok || !presenceRows.ok) {
      // a missing streaks table (schema-2.0.sql not run) fails honestly here
      res.status(502).json({ error: 'storage_error' });
      return;
    }
    const streaks = (await streakRows.json()) as StreakRow[];
    const presence = (await presenceRows.json()) as PresenceRow[];

    const { warn, invite, restart, protectedByFreeze } = selectTargets(streaks, presence, day);

    // transparent history for protected users (why nothing was sent)
    await Promise.allSettled(protectedByFreeze.map((uid) => recordSkip(db, uid, 'streak', `streak_warn:${day}`, 'skipped_block')));

    const prefs = await fetchPrefsMap(db);
    const texts = {
      warn:
        '🔥 Seriyangiz xavf ostida!\n\nBugun hali mashq qilmadingiz — bugungi Learning Journey bir-ikki bosqich bilan seriyani davom ettiradi. Sizni kutmoqda! 💪',
      invite:
        '🚀 Bugungi o‘rganish safari tayyor!\n\nSiz uchun shaxsiy mavzu va bosqichlar tanlandi: kashfiyot, yangi so‘zlar, grammatika va mini-o‘yin. 15-25 daqiqada kunlik safarni yakunlang!',
      restart:
        '🌱 Yangi boshlanish — endi biz bilan!\n\nSeriya uzilgan bo‘lsa ham muammo yo‘q: eng uzun seriyalarni boshidan boshlaganlar yutadi. Bugungi safarning birinchi bosqichi bilan olovni yana yoqamizmi? 🔥',
    } as const;

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    const runBatch = async (targets: number[], eventKey: string, text: string, buttonLabel: string): Promise<void> => {
      for (let i = 0; i < targets.length; i += 15) {
        const chunk = targets.slice(i, i + 15);
        const results = await Promise.all(
          chunk.map(async (uid) => {
            const r = await dispatch(db, token, url, { uid, kind: 'streak', eventKey, text, button: { label: buttonLabel, webApp: true } });
            if (r.status === 'sent') sent++;
            else if (r.status === 'failed') failed++;
            else skipped++;
            return r.status;
          }),
        );
        if (results.every((x) => x === 'sent') && i + 15 < targets.length) await new Promise((res2) => setTimeout(res2, 1200));
      }
    };

    await runBatch(warn.map((r) => r.telegram_user_id), `streak_warn:${day}`, texts.warn, '🔥 Seriyani saqlash');
    await runBatch(invite, `streak_invite:${day}`, texts.invite, '🚀 Safarni boshlash');
    await runBatch(restart.map((r) => r.telegram_user_id), `streak_restart:${day}`, texts.restart, '🌱 Yana boshlash');

    res.status(200).json({
      ok: true,
      day,
      streakUsers: streaks.length,
      warn: warn.length,
      invite: invite.length,
      restart: restart.length,
      protectedByFreeze: protectedByFreeze.length,
      sent,
      failed,
      skipped,
    });
  } catch (e) {
    console.error('reminders failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
