// Vercel serverless function: the leaderboards, built from the saved progress rows.
//  GET /api/leaderboard  (no auth)        -> { enabled: boolean }
//  GET /api/leaderboard  (valid initData) -> { me, list (rating), weekly (7-day XP), monthly (30-day XP) }
//
// Only safe, minimal fields leave the server: first name, avatar emoji, active frame id,
// rating, battle W/L and XP aggregates. Ages, goals, contacts and other progress stay private.
// The rating board mirrors ratingOf() in src/lib/gamification.ts: 1000 + battle Elo delta
// (never below 900). XP, stars and badges do NOT count toward the rating — it is duel-only.
// The weekly / monthly boards rank by XP earned in the last 7 / 30 UTC days (0-XP learners
// are not ranked there). Every learner who synced at least once appears on the rating board.
// Also upserts the requester's public identity (username / first name) for student profiles.
// Env (server only): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import crypto from 'node:crypto';

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  url?: string;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
}

interface LeaderRow {
  id: string;
  name: string;
  avatar?: string;
  frame?: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  delta: number; // accumulated battle Elo
  xp: number; // total XP (shown on weekly/monthly boards and public profiles)
  xpWeek: number; // XP earned in the last 7 UTC days
  xpMonth: number; // XP earned in the last 30 UTC days
}

const LIMIT = 100;
const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same check as api/progress.ts (kept here so this function is self-contained).
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
  if (authDate && Date.now() / 1000 - authDate > maxAgeSec) return { ok: false };
  let userId: string | undefined;
  try {
    userId = String(JSON.parse(params.get('user') ?? '{}').id ?? '');
  } catch {
    /* ignore */
  }
  return /^\d{1,15}$/.test(userId ?? '') ? { ok: true, userId } : { ok: false };
}

function rateLimited(key: string, limit = 20, windowMs = 60_000): boolean {
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

const MAX_WIN = 64; // largest single-battle gain (PvP K=64, between-equals win is +32) — keep in sync with src/lib/battle.ts
const MAX_LOSS = 64;
// Rating frames (rf-<tier>) need this rating; keep in sync with RANK_TIERS in src/lib/shop.ts.
const RF_MIN: Record<string, number> = {
  specialist: 1400, expert: 1600, cm: 1700, master: 1850, im: 2050, gm: 2250, igm: 2500, lgm: 2750,
};

/** Mirrors ratingOf(): duel-only, with the delta clamped to a plausible range for the W/L/D record. */
function ratingFromBattle(b: { wins: number; losses: number; draws: number; delta: number }): number {
  const maxUp = b.wins * MAX_WIN + b.draws * MAX_WIN;
  const maxDown = (b.losses + b.draws) * MAX_LOSS;
  const d = Math.min(maxUp, Math.max(-maxDown, b.delta));
  return Math.max(900, 1000 + Math.round(d));
}

function rowFromState(id: string, raw: unknown, todayUtc: string): LeaderRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const profile = (s.profile ?? null) as { name?: string } | null;
  const shop = (s.shop ?? {}) as { equipped?: { avatar?: string; frame?: string }; owned?: Record<string, { expiresAt?: string }> };
  const battle = (s.battle ?? {}) as { wins?: number; losses?: number; draws?: number; ratingDelta?: number };
  const activity = (s.activity ?? {}) as Record<string, { xp?: number }>;
  const wins = Math.max(0, Math.floor(Number(battle.wins) || 0));
  const losses = Math.max(0, Math.floor(Number(battle.losses) || 0));
  const draws = Math.max(0, Math.floor(Number(battle.draws) || 0));
  const delta = Math.round(Number(battle.ratingDelta) || 0);
  const rating = ratingFromBattle({ wins, losses, draws, delta });
  const xp = Math.max(0, Math.floor(Number(s.xp) || 0));
  const xpWeek = xpInWindow(activity, 7, todayUtc);
  const xpMonth = xpInWindow(activity, 30, todayUtc);

  const rawName = (profile?.name ?? '').trim();
  const name = (rawName.split(/\s+/)[0] || 'O‘quvchi').slice(0, 24);
  const equippedFrame = shop.equipped?.frame;
  let frame: string | undefined;
  if (equippedFrame && typeof equippedFrame === 'string') {
    const owned = shop.owned?.[equippedFrame];
    const need = equippedFrame.startsWith('rf-') ? RF_MIN[equippedFrame.slice(3)] : undefined;
    const active = equippedFrame.startsWith('rf-') ? need !== undefined && rating >= need : !owned || !owned.expiresAt || new Date(owned.expiresAt).getTime() > Date.now();
    if (active) frame = equippedFrame;
  }
  return {
    id,
    name,
    avatar: typeof shop.equipped?.avatar === 'string' ? shop.equipped.avatar.slice(0, 8) : undefined,
    frame,
    rating,
    wins,
    losses,
    draws,
    delta,
    xp,
    xpWeek,
    xpMonth,
  };
}

/** Sum of XP over the last `days` UTC day keys ending at `end` (YYYY-MM-DD). */
function xpInWindow(activity: Record<string, { xp?: number }>, days: number, end: string): number {
  const dt = new Date(`${end}T00:00:00Z`);
  let sum = 0;
  for (let i = 0; i < days; i++) {
    const k = new Date(dt.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    sum += Math.max(0, Math.floor(activity?.[k]?.xp ?? 0));
  }
  return sum;
}

/** Upserts the requester's public identity (username / first name from verified initData). */
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
    /* identity is a nice-to-have — never fail the request over it */
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
  if (rateLimited(auth.userId)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  try {
    void upsertIdentity(db, initData);
    const r = await fetch(`${db.url}/rest/v1/progress?select=telegram_user_id,state&order=updated_at.desc&limit=500`, {
      headers: sbHeaders(db.key),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) throw new Error(`supabase_${r.status}`);
    const rows = (await r.json()) as { telegram_user_id: number; state: unknown }[];
    const todayUtc = new Date().toISOString().slice(0, 10);
    const parsed = rows
      .map((x) => rowFromState(String(x.telegram_user_id), x.state, todayUtc))
      .filter((x): x is LeaderRow => x !== null);
    const list = [...parsed]
      .sort((a, b) => b.rating - a.rating || b.wins - a.wins || a.losses - b.losses || a.name.localeCompare(b.name))
      .slice(0, LIMIT);
    const weekly = [...parsed]
      .filter((x) => x.xpWeek > 0)
      .sort((a, b) => b.xpWeek - a.xpWeek || b.xp - a.xp || a.name.localeCompare(b.name))
      .slice(0, LIMIT);
    const monthly = [...parsed]
      .filter((x) => x.xpMonth > 0)
      .sort((a, b) => b.xpMonth - a.xpMonth || b.xp - a.xp || a.name.localeCompare(b.name))
      .slice(0, LIMIT);
    res.status(200).json({ me: auth.userId, list, weekly, monthly });
  } catch (e) {
    console.error('leaderboard failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
