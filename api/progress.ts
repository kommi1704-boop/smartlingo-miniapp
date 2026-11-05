// Vercel serverless function: saves a learner's progress online (Supabase), keyed by the VERIFIED Telegram user id.
//  GET    /api/progress  (no auth)          -> { enabled: boolean }
//  GET    /api/progress  (valid initData)   -> { enabled: true, state: object | null, updatedAt: string | null }
//  PUT    /api/progress  (valid initData)   -> { ok: true }     body: { state }
//  DELETE /api/progress  (valid initData)   -> { ok: true }     (removes the server copy)
//
// Side duties (both best-effort, never fail the sync):
// - presence snapshot for the daily streak-reminder cron (api/reminders.ts):
//   last_active day (Asia/Tashkent) + stored streak freezes, parsed SERVER-SIDE
//   from the verified state json.
// - referral settle: the first sync of an invited learner flips their referral to
//   'rewarded' and pays the referrer through the atomic reward_referral RPC;
//   the referrer gets a Telegram message. Coins reach both sides via the
//   coin_grants ledger the Mini App applies exactly once (see src/lib/billing.ts).
//
// Env (server only, never VITE_-prefixed): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// The browser never talks to Supabase. The user id is taken only from the verified initData, never from the body.
// Chat history and writing texts are NOT stored online (privacy: the learners are minors).
import crypto from 'node:crypto';

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
}

const MAX_BYTES = 300_000;
const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same check as api/tutor.ts (kept here so this function is self-contained).
function validateInitData(initData: string, botToken: string, maxAgeSec = 7 * 24 * 3600): { ok: boolean; userId?: string } {
  if (!initData) return { ok: false };
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false };
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const a = Buffer.from(calc, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };
  const authDate = Number(params.get('auth_date') ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return { ok: false };
  let userId: string | undefined;
  try {
    userId = String(JSON.parse(params.get('user') ?? '{}').id ?? '');
  } catch {
    /* ignore */
  }
  return /^\d{1,15}$/.test(userId ?? '') ? { ok: true, userId } : { ok: false };
}

function rateLimited(key: string, limit = 40, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  cur.n++;
  return cur.n > limit;
}

function supa(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

/** Upserts the learner's PUBLIC identity (username / first name from verified initData) for student profiles. */
async function upsertIdentity(db: { url: string; key: string }, initData: string): Promise<void> {
  try {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user') ?? '{}') as { id?: number | string; username?: string; first_name?: string };
    const uid = Number(user.id);
    if (!uid) return;
    const clean = (s: unknown): string | null => (typeof s === 'string' && /^[\w.]{2,32}$/.test(s) ? s : null);
    const username = clean(user.username);
    const firstName = typeof user.first_name === 'string' && user.first_name.trim() ? user.first_name.trim().slice(0, 24) : null;
    if (!username && !firstName) return;
    await fetch(`${db.url}/rest/v1/identities?on_conflict=telegram_user_id`, {
      method: 'POST',
      headers: { ...sbHeaders(db.key), prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ telegram_user_id: uid, username, first_name: firstName }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    /* identity is a nice-to-have — never fail the sync over it */
  }
}

/** Keeps only what is needed to restore progress. Chats and writing texts stay on the device. */
function cleanState(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const s = { ...(raw as Record<string, unknown>) };
  if (s.version !== 1) return null;
  delete s.conversations;
  delete s.writing;
  return s;
}

// ---------- Presence + referral settle (shared with api/reminders.ts) ----------

/** Current day in Asia/Tashkent (UTC+5, no DST) as YYYY-MM-DD — matches the app's local day keys. */
export function uztDay(ts: number = Date.now()): string {
  return new Date(ts + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

export interface PresenceSnapshot {
  last_active: string | null; // YYYY-MM-DD of the newest day with any activity, or null
  freezes: number; // streak freezes held at sync time
}

/** Server-side read of the client's activity map: the newest day with XP or a freeze. */
export function presenceFromState(state: unknown): PresenceSnapshot {
  let last: string | null = null;
  let freezes = 0;
  if (state && typeof state === 'object' && !Array.isArray(state)) {
    const s = state as { activity?: Record<string, { xp?: number; frozen?: boolean }>; shop?: { streakFreezes?: unknown } };
    const act = s.activity;
    if (act && typeof act === 'object' && !Array.isArray(act)) {
      for (const [key, day] of Object.entries(act)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue; // only well-formed day keys
        const d = day && typeof day === 'object' ? day : {};
        if ((d.xp ?? 0) > 0 || d.frozen === true) {
          if (last === null || key > last) last = key;
        }
      }
    }
    const f = s.shop?.streakFreezes;
    freezes = typeof f === 'number' && Number.isFinite(f) ? Math.max(0, Math.floor(f)) : 0;
  }
  return { last_active: last, freezes };
}

/** Keep in sync with api/bot.ts REFERRAL_COINS (tests cross-check both). */
export const REFERRAL_COINS = 50;

async function tgSend(token: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    /* notifications are best-effort */
  }
}

// The referral settles exactly once (the RPC guards it); this in-memory set just
// avoids re-running the RPC on every sync within one serverless instance.
const settled = new Set<number>();

/** Best-effort presence upsert + referral settle. Called after GET and PUT. */
async function afterSync(db: { url: string; key: string }, uid: number, state: unknown, botToken: string | undefined): Promise<void> {
  try {
    // 1) presence snapshot (for the reminder cron)
    const p = presenceFromState(state);
    if (p.last_active) {
      await fetch(`${db.url}/rest/v1/presence?on_conflict=telegram_user_id`, {
        method: 'POST',
        headers: { ...sbHeaders(db.key), prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ telegram_user_id: uid, last_active: p.last_active, freezes: p.freezes }),
        signal: AbortSignal.timeout(15_000),
      });
    }

    // 2) first sync of a referred learner -> pay the referrer (atomic, once)
    if (settled.has(uid)) return;
    settled.add(uid);
    const r = await fetch(`${db.url}/rest/v1/rpc/reward_referral`, {
      method: 'POST',
      headers: sbHeaders(db.key),
      body: JSON.stringify({ p_referred: uid, p_coins: REFERRAL_COINS }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok || !botToken) return;
    const coins = (await r.json().catch(() => 0)) as unknown;
    if (typeof coins !== 'number' || coins <= 0) return;
    const rr = await fetch(`${db.url}/rest/v1/referrals?referred_id=eq.${uid}&select=referrer_id&limit=1`, {
      headers: sbHeaders(db.key),
      signal: AbortSignal.timeout(15_000),
    });
    if (!rr.ok) return;
    const rows = (await rr.json()) as { referrer_id: number }[];
    const rid = rows[0]?.referrer_id;
    if (rid) {
      void tgSend(botToken, {
        chat_id: rid,
        text: `🎉 Do‘stingiz o‘rganishni boshladi!\n\nHisobingizga 🪙 +${coins} Coin qo‘shildi — ilovani ochib oling. Yana do‘stlaringizni taklif qiling! 💎`,
      });
    }
  } catch {
    /* best-effort — never fail the sync over this */
  }
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const db = supa();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const enabled = Boolean(db && botToken);

  const initData = header(req, 'x-telegram-init-data');
  if (req.method === 'GET' && !initData) {
    res.status(200).json({ enabled });
    return;
  }
  if (!db || !botToken) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const auth = validateInitData(initData, botToken);
  if (!auth.ok || !auth.userId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const uid = auth.userId;
  if (rateLimited(uid)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${db.url}/rest/v1/progress?telegram_user_id=eq.${uid}&select=state,updated_at&limit=1`, {
        headers: sbHeaders(db.key),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      const rows = (await r.json()) as { state: unknown; updated_at: string }[];
      void afterSync(db, Number(uid), rows[0]?.state ?? null, botToken); // best-effort, response is not delayed
      res.status(200).json({ enabled: true, state: rows[0]?.state ?? null, updatedAt: rows[0]?.updated_at ?? null });
      return;
    }

    if (req.method === 'PUT') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as { state?: unknown } | undefined;
      const state = cleanState(body?.state);
      if (!state) {
        res.status(400).json({ error: 'bad_state' });
        return;
      }
      const text = JSON.stringify(state);
      if (Buffer.byteLength(text) > MAX_BYTES) {
        res.status(413).json({ error: 'too_large' });
        return;
      }
      const r = await fetch(`${db.url}/rest/v1/progress?on_conflict=telegram_user_id`, {
        method: 'POST',
        headers: { ...sbHeaders(db.key), prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ telegram_user_id: Number(uid), state, updated_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      void afterSync(db, Number(uid), state, botToken); // best-effort, response is not delayed
      void upsertIdentity(db, initData); // fire-and-forget; public identity for student profiles
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const r = await fetch(`${db.url}/rest/v1/progress?telegram_user_id=eq.${uid}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(db.key), prefer: 'return=minimal' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('progress failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
