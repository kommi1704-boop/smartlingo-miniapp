// Vercel serverless function: the rating leaderboard, built from the saved progress rows.
//  GET /api/leaderboard  (no auth)        -> { enabled: boolean }
//  GET /api/leaderboard  (valid initData) -> { me: string, list: LeaderRow[] }
//
// Only safe, minimal fields leave the server: first name, avatar emoji, active frame id,
// rating and battle W/L. Ages, goals, XP and other progress stay private.
// Rating mirrors ratingOf() in src/lib/gamification.ts: 1000 + battle Elo delta (never below 900).
// XP, stars and badges do NOT count. Only players with at least one battle are listed, and the
// client-reported delta is clamped to what their W/L/D record could plausibly have produced.
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

const MAX_WIN = 24; // largest single-battle gain (PvP K)
const MAX_LOSS = 24;
// Rating frames (rf-<tier>) need this rating; keep in sync with RANK_TIERS in src/lib/shop.ts.
const RF_MIN: Record<string, number> = {
  specialist: 1600, expert: 1700, cm: 1800, master: 2000, im: 2200, gm: 2400, igm: 2700, lgm: 3000,
};

/** Mirrors ratingOf(): duel-only, with the delta clamped to a plausible range for the W/L/D record. */
function ratingFromBattle(b: { wins: number; losses: number; draws: number; delta: number }): number {
  const maxUp = b.wins * MAX_WIN + b.draws * MAX_WIN;
  const maxDown = (b.losses + b.draws) * MAX_LOSS;
  const d = Math.min(maxUp, Math.max(-maxDown, b.delta));
  return Math.max(900, 1000 + Math.round(d));
}

function rowFromState(id: string, raw: unknown): LeaderRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const profile = (s.profile ?? null) as { name?: string } | null;
  const shop = (s.shop ?? {}) as { equipped?: { avatar?: string; frame?: string }; owned?: Record<string, { expiresAt?: string }> };
  const battle = (s.battle ?? {}) as { wins?: number; losses?: number; draws?: number; ratingDelta?: number };
  const wins = Math.max(0, Math.floor(Number(battle.wins) || 0));
  const losses = Math.max(0, Math.floor(Number(battle.losses) || 0));
  const draws = Math.max(0, Math.floor(Number(battle.draws) || 0));
  if (wins + losses + draws === 0) return null; // not listed until the first battle
  const delta = Math.round(Number(battle.ratingDelta) || 0);
  const rating = ratingFromBattle({ wins, losses, draws, delta });

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
  };
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
    const r = await fetch(`${db.url}/rest/v1/progress?select=telegram_user_id,state&order=updated_at.desc&limit=500`, {
      headers: sbHeaders(db.key),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) throw new Error(`supabase_${r.status}`);
    const rows = (await r.json()) as { telegram_user_id: number; state: unknown }[];
    const list = rows
      .map((x) => rowFromState(String(x.telegram_user_id), x.state))
      .filter((x): x is LeaderRow => x !== null)
      .sort((a, b) => b.rating - a.rating || b.wins - a.wins || a.losses - b.losses)
      .slice(0, LIMIT);
    res.status(200).json({ me: auth.userId, list });
  } catch (e) {
    console.error('leaderboard failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
