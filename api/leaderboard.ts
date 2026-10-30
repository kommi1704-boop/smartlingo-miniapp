// Vercel serverless function: the rating leaderboard, built from the saved progress rows.
//  GET /api/leaderboard  (no auth)        -> { enabled: boolean }
//  GET /api/leaderboard  (valid initData) -> { me: string, list: LeaderRow[] }
//
// Only safe, minimal fields leave the server: first name, avatar emoji, active frame id,
// rating pieces and battle W/L. Ages, goals and other progress stay private.
// The rating formula mirrors ratingOf() in src/lib/gamification.ts:
//   1000 + XP/3 + stars*5 + badges*5 + battle Elo delta (never below 900).
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
  xp: number;
  wins: number;
  losses: number;
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

/** Mirrors ratingOf() in src/lib/gamification.ts. */
function ratingFromState(s: Record<string, unknown>): number {
  const xp = Math.max(0, Number(s.xp) || 0);
  const games = (s.games ?? {}) as { best?: Record<string, { stars?: number }> };
  const stars = Object.values(games.best ?? {}).reduce((a, b) => a + (Number(b?.stars) || 0), 0);
  const badges = Object.keys((s.badges ?? {}) as Record<string, unknown>).length;
  const battle = (s.battle ?? {}) as { ratingDelta?: number };
  const delta = Number(battle.ratingDelta) || 0;
  return Math.max(900, 1000 + Math.floor(xp / 3) + stars * 5 + badges * 5 + delta);
}

function rowFromState(id: string, raw: unknown): LeaderRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const profile = (s.profile ?? null) as { name?: string } | null;
  const shop = (s.shop ?? {}) as { equipped?: { avatar?: string; frame?: string }; owned?: Record<string, { expiresAt?: string }> };
  const battle = (s.battle ?? {}) as { wins?: number; losses?: number; ratingDelta?: number };

  const rawName = (profile?.name ?? '').trim();
  const name = (rawName.split(/\s+/)[0] || 'O‘quvchi').slice(0, 24);
  const equippedFrame = shop.equipped?.frame;
  let frame: string | undefined;
  if (equippedFrame && typeof equippedFrame === 'string') {
    const owned = shop.owned?.[equippedFrame];
    const active = equippedFrame.startsWith('rf-') || !owned || !owned.expiresAt || new Date(owned.expiresAt).getTime() > Date.now();
    if (active) frame = equippedFrame;
  }
  return {
    id,
    name,
    avatar: typeof shop.equipped?.avatar === 'string' ? shop.equipped.avatar.slice(0, 8) : undefined,
    frame,
    rating: ratingFromState(s),
    xp: Math.max(0, Number(s.xp) || 0),
    wins: Math.max(0, Number(battle.wins) || 0),
    losses: Math.max(0, Number(battle.losses) || 0),
    delta: Math.round(Number(battle.ratingDelta) || 0),
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
      .sort((a, b) => b.rating - a.rating || b.xp - a.xp)
      .slice(0, LIMIT);
    res.status(200).json({ me: auth.userId, list });
  } catch (e) {
    console.error('leaderboard failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
