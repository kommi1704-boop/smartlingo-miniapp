// Vercel serverless function: the rating leaderboard.
//  GET /api/leaderboard  (no auth)        -> { enabled: boolean }
//  GET /api/leaderboard  (valid initData) -> { me: string, list: LeaderRow[] }
//
// THE NUMBERS COME FROM public.ratings, which only the server writes (see api/battle.ts and
// supabase/schema.sql): rating, wins, losses, draws. Nothing the browser reports can change them.
// From the learner's saved progress only cosmetic fields are read: first name, avatar emoji and the
// equipped frame. Ages, goals, XP and other progress stay private.
// XP, stars and badges do NOT count. Every learner with a ratings row is listed: a fresh learner
// appears with the base rating 1000 and moves up only via duels.
// No logging (privacy): errors become a generic 502.
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

// Rating frames (rf-<tier>) need this rating; keep in sync with RANK_TIERS in src/lib/shop.ts.
const RF_MIN: Record<string, number> = {
  specialist: 1400, expert: 1600, cm: 1700, master: 1850, im: 2050, gm: 2250, igm: 2500, lgm: 2750,
};

interface RatingRow { telegram_user_id: number; rating: number; wins: number; losses: number; draws: number }
interface CosmeticRow {
  telegram_user_id: number;
  name: string | null;
  equipped: { avatar?: string; frame?: string } | null;
  owned: Record<string, { expiresAt?: string }> | null;
}

function toRow(r: RatingRow, c: CosmeticRow | undefined): LeaderRow {
  const rating = Math.max(900, Math.round(Number(r.rating) || 1000));
  const rawName = (typeof c?.name === 'string' ? c.name : '').trim();
  const name = (rawName.split(/\s+/)[0] || 'O‘quvchi').slice(0, 24);
  const equipped = c?.equipped && typeof c.equipped === 'object' ? c.equipped : {};
  const equippedFrame = equipped.frame;
  let frame: string | undefined;
  if (equippedFrame && typeof equippedFrame === 'string') {
    const owned = c?.owned && typeof c.owned === 'object' ? c.owned[equippedFrame] : undefined;
    const need = equippedFrame.startsWith('rf-') ? RF_MIN[equippedFrame.slice(3)] : undefined;
    const active = equippedFrame.startsWith('rf-') ? need !== undefined && rating >= need : !owned || !owned.expiresAt || new Date(owned.expiresAt).getTime() > Date.now();
    if (active) frame = equippedFrame;
  }
  return {
    id: String(r.telegram_user_id),
    name,
    avatar: typeof equipped.avatar === 'string' ? equipped.avatar.slice(0, 8) : undefined,
    frame,
    rating,
    wins: Math.max(0, r.wins | 0),
    losses: Math.max(0, r.losses | 0),
    draws: Math.max(0, r.draws | 0),
    delta: rating - 1000,
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
    const get = (path: string) => fetch(`${db.url}/rest/v1/${path}`, { headers: sbHeaders(db.key), signal: AbortSignal.timeout(15_000) });
    const r = await get(`ratings?select=telegram_user_id,rating,wins,losses,draws&order=rating.desc,wins.desc,losses.asc&limit=${LIMIT}`);
    if (!r.ok) throw new Error(`supabase_${r.status}`);
    const ratings = (await r.json()) as RatingRow[];
    // Cosmetics only (name / avatar / frame) for exactly these learners — never the whole saved state.
    const cos = new Map<number, CosmeticRow>();
    if (ratings.length) {
      const ids = ratings.map((x) => x.telegram_user_id).join(',');
      const c = await get(`progress?select=telegram_user_id,name:state->profile->>name,equipped:state->shop->equipped,owned:state->shop->owned&telegram_user_id=in.(${ids})`);
      if (c.ok) for (const x of (await c.json()) as CosmeticRow[]) cos.set(x.telegram_user_id, x);
    }
    const list = ratings
      .map((x) => toRow(x, cos.get(x.telegram_user_id)))
      .sort((a, b) => b.rating - a.rating || b.wins - a.wins || a.losses - b.losses || a.name.localeCompare(b.name));
    res.status(200).json({ me: auth.userId, list });
  } catch {
    // No logging on purpose (privacy).
    res.status(502).json({ error: 'storage_error' });
  }
}
