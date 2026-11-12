// Vercel serverless function: PUBLIC student profiles.
//  GET /api/profile            (no auth)  -> { enabled: boolean }
//  GET /api/profile?uid=<id>   (valid initData) -> { profile: PublicProfile | null }
//
// Reads the target learner's EXISTING progress row (the same JSONB the whole app uses)
// and projects a sanitized public view: equipped cosmetics (avatar, frame, name style,
// title, background), level & CEFR, XP, streak, learned words, completed lessons,
// badges, battle record and global/weekly/monthly ranks.
//
// PRIVACY (learners are minors): never leaves the server —
//   age, goals, daily minutes, interests, placement details, uploaded photo
//   (profile.photoAvatar), chats, essays, mistakes, quiz history, per-day activity.
//   Only the learner's first name, public @username and learning aggregates.
//   There is no email/phone in the system at all.
//
// Also upserts the REQUESTER's public identity (username / first name) so other
// students' profiles can show @handles. Usernames are public Telegram handles.
//
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

const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same check as api/progress.ts (kept here so this function is self-contained).
function validateInitData(initData: string, botToken: string, maxAgeSec = 7 * 24 * 3600): { ok: boolean; userId?: string; username?: string; firstName?: string } {
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
  try {
    const user = JSON.parse(params.get('user') ?? '{}') as { id?: number | string; username?: string; first_name?: string };
    const userId = String(user.id ?? '');
    if (!/^\d{1,15}$/.test(userId)) return { ok: false };
    const clean = (s: unknown): string | undefined => (typeof s === 'string' && /^[\w.]{2,32}$/.test(s) ? s : undefined);
    return { ok: true, userId, username: clean(user.username), firstName: typeof user.first_name === 'string' ? user.first_name.slice(0, 24) : undefined };
  } catch {
    return { ok: false };
  }
}

function rateLimited(key: string, limit = 30, windowMs = 60_000): boolean {
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

// ===== Pure projection helpers (exported for tests) =====

const MAX_WIN = 64;
const MAX_LOSS = 64;
const RF_MIN: Record<string, number> = {
  specialist: 1400, expert: 1600, cm: 1700, master: 1850, im: 2050, gm: 2250, igm: 2500, lgm: 2750,
};
const CEFR: string[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const BGS: string[] = ['doodle', 'plain', 'mesh', 'sunset', 'mint', 'grid'];

/** Mirrors ratingOf() + the client clamp: 1000 + duel Elo, floored at 900. */
export function ratingFromBattle(b: { wins: number; losses: number; draws: number; delta: number }): number {
  const maxUp = b.wins * MAX_WIN + b.draws * MAX_WIN;
  const maxDown = (b.losses + b.draws) * MAX_LOSS;
  const d = Math.min(maxUp, Math.max(-maxDown, b.delta));
  return Math.max(900, 1000 + Math.round(d));
}

/** Sum of XP over the last `days` day keys ending at `end` (UTC YYYY-MM-DD). */
export function xpInWindow(activity: Record<string, { xp?: number } | undefined>, days: number, end: string): number {
  const dt = new Date(`${end}T00:00:00Z`);
  let sum = 0;
  for (let i = 0; i < days; i++) {
    const k = new Date(dt.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    sum += Math.max(0, Math.floor(activity?.[k]?.xp ?? 0));
  }
  return sum;
}

/** Streak of active days (xp > 0 or frozen), mirroring streakOf() in src/lib/gamification.ts. */
export function streakFrom(activity: Record<string, { xp?: number; frozen?: boolean } | undefined>, ref: string): number {
  const active = (k: string) => (activity?.[k]?.xp ?? 0) > 0 || !!activity?.[k]?.frozen;
  const dt = new Date(`${ref}T00:00:00Z`);
  const keyOf = (d: Date) => d.toISOString().slice(0, 10);
  let cursor = active(ref) ? ref : keyOf(new Date(dt.getTime() - 86_400_000));
  let n = 0;
  while (active(cursor) && n < 3650) {
    n++;
    cursor = keyOf(new Date(new Date(`${cursor}T00:00:00Z`).getTime() - 86_400_000));
  }
  return n;
}

const activeRental = (item: { expiresAt?: string } | undefined): boolean =>
  !!item && (!item.expiresAt || new Date(item.expiresAt).getTime() > Date.now());

export interface Ranks {
  global: Map<string, number>;
  week: Map<string, number>;
  month: Map<string, number>;
}

/** Rank maps (id -> 1-based position) from all progress rows. Users with 0 XP in a window are unranked there. */
export function buildRanks(rows: { id: string; rating: number; xpWeek: number; xpMonth: number }[]): Ranks {
  const mk = (key: 'rating' | 'xpWeek' | 'xpMonth', zeroExcluded: boolean): Map<string, number> => {
    const sorted = [...rows]
      .filter((r) => !zeroExcluded || r[key] > 0)
      .sort((a, b) => b[key] - a[key]);
    const m = new Map<string, number>();
    sorted.forEach((r, i) => m.set(r.id, i + 1));
    return m;
  };
  return { global: mk('rating', false), week: mk('xpWeek', true), month: mk('xpMonth', true) };
}

export interface PublicProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  frame?: string;
  nameColor?: string;
  nameFx?: string;
  title?: string;
  bg: string;
  xp: number;
  xpLevel: number;
  cefr?: string;
  streak: number;
  words: number;
  lessons: number;
  badges: { id: string; date: string }[];
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  rankGlobal: number | null;
  rankWeek: number | null;
  rankMonth: number | null;
  xpWeek: number;
  xpMonth: number;
  collectibles: { kind: 'frame' | 'avatar' | 'title' | 'nameColor' | 'nameFx'; id: string }[];
  chestsOpened: number;
  lastActive: string | null;
}

/** Projects the raw saved state down to the safe public view. Everything sensitive stays behind. */
export function projectPublic(id: string, raw: unknown, identity: { username?: string } | undefined, ranks: Ranks, todayUtc: string): PublicProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const profile = (s.profile ?? null) as { name?: string; estimatedLevel?: string } | null;
  const shop = (s.shop ?? {}) as {
    equipped?: { frame?: string; avatar?: string; title?: string; nameColor?: string; nameFx?: string };
    owned?: Record<string, { expiresAt?: string }>;
    chestsOpened?: number;
  };
  const battle = (s.battle ?? {}) as { wins?: number; losses?: number; draws?: number; ratingDelta?: number };
  const settings = (s.settings ?? {}) as { bg?: string };
  const vocab = (s.vocab ?? {}) as Record<string, { status?: string }>;
  const lessons = (s.lessons ?? {}) as Record<string, { completed?: boolean }>;
  const badges = (s.badges ?? {}) as Record<string, string>;
  const activity = (s.activity ?? {}) as Record<string, { xp?: number; frozen?: boolean }>;

  const wins = Math.max(0, Math.floor(Number(battle.wins) || 0));
  const losses = Math.max(0, Math.floor(Number(battle.losses) || 0));
  const draws = Math.max(0, Math.floor(Number(battle.draws) || 0));
  const delta = Math.round(Number(battle.ratingDelta) || 0);
  const rating = ratingFromBattle({ wins, losses, draws, delta });

  const xp = Math.max(0, Math.floor(Number(s.xp) || 0));
  const xpWeek = xpInWindow(activity, 7, todayUtc);
  const xpMonth = xpInWindow(activity, 30, todayUtc);

  const equippedFrame = shop.equipped?.frame;
  let frame: string | undefined;
  if (equippedFrame && typeof equippedFrame === 'string') {
    const owned = shop.owned?.[equippedFrame];
    const need = equippedFrame.startsWith('rf-') ? RF_MIN[equippedFrame.slice(3)] : undefined;
    const okFrame = equippedFrame.startsWith('rf-')
      ? need !== undefined && rating >= need
      : activeRental(owned);
    if (okFrame) frame = equippedFrame;
  }

  const eq = (kind: 'title' | 'nameColor' | 'nameFx'): string | undefined => {
    const v = shop.equipped?.[kind];
    return v && typeof v === 'string' && activeRental(shop.owned?.[v]) ? v : undefined;
  };

  const rawName = (profile?.name ?? '').trim();
  const name = (rawName.split(/\s+/)[0] || 'O‘quvchi').slice(0, 24);

  const collectibles: PublicProfile['collectibles'] = [];
  for (const [itemId, item] of Object.entries(shop.owned ?? {})) {
    if (!activeRental(item)) continue;
    if (itemId.startsWith('frame-')) collectibles.push({ kind: 'frame', id: itemId });
    else if (itemId.startsWith('av-')) collectibles.push({ kind: 'avatar', id: itemId });
    else if (itemId.startsWith('title-')) collectibles.push({ kind: 'title', id: itemId });
    else if (itemId.startsWith('nc-')) collectibles.push({ kind: 'nameColor', id: itemId });
    else if (itemId.startsWith('nfx-')) collectibles.push({ kind: 'nameFx', id: itemId });
  }

  const badgeList = Object.entries(badges)
    .filter(([bid, date]) => /^[\w-]{1,40}$/.test(bid) && typeof date === 'string')
    .slice(0, 40)
    .map(([bid, date]) => ({ id: bid, date: String(date).slice(0, 10) }));

  const cefr = profile?.estimatedLevel && CEFR.includes(profile.estimatedLevel) ? profile.estimatedLevel : undefined;

  const words = Object.values(vocab).filter((v) => v?.status === 'learned').length;
  const lessonsDone = Object.entries(lessons).filter(([k, v]) => k.includes(':') && v?.completed === true).length;

  return {
    id,
    name,
    username: identity?.username,
    avatar: typeof shop.equipped?.avatar === 'string' ? shop.equipped.avatar.slice(0, 8) : undefined,
    frame,
    nameColor: eq('nameColor'),
    nameFx: eq('nameFx'),
    title: eq('title'),
    bg: settings.bg && BGS.includes(settings.bg) ? settings.bg : 'doodle',
    xp,
    xpLevel: Math.floor(Math.sqrt(xp / 40)) + 1,
    cefr,
    streak: streakFrom(activity, todayUtc),
    words,
    lessons: lessonsDone,
    badges: badgeList,
    rating,
    wins,
    losses,
    draws,
    rankGlobal: ranks.global.get(id) ?? null,
    rankWeek: ranks.week.get(id) ?? null,
    rankMonth: ranks.month.get(id) ?? null,
    xpWeek,
    xpMonth,
    collectibles: collectibles.slice(0, 40),
    chestsOpened: Math.max(0, Math.floor(Number(shop.chestsOpened) || 0)),
    lastActive: null, // filled by the handler from updated_at
  };
}

// ===== Handler =====

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

  // target from ?uid= (dynamic user id routing)
  const q = new URL(req.url ?? '', 'https://x.local');
  const target = q.searchParams.get('uid') ?? '';
  if (!/^\d{1,15}$/.test(target)) {
    res.status(400).json({ error: 'bad_uid' });
    return;
  }

  try {
    const h = sbHeaders(db.key);
    const todayUtc = new Date().toISOString().slice(0, 10);

    // requester identity (public username) — upserted on every visit
    if (auth.username || auth.firstName) {
      await fetch(`${db.url}/rest/v1/identities?on_conflict=telegram_user_id`, {
        method: 'POST',
        headers: { ...h, prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ telegram_user_id: Number(uid), username: auth.username ?? null, first_name: auth.firstName ?? null }),
        signal: AbortSignal.timeout(15_000),
      }).catch(() => undefined);
    }

    // target row + all rows (for ranks) — same 500-row window as /api/leaderboard
    const [tRes, allRes, idRes] = await Promise.all([
      fetch(`${db.url}/rest/v1/progress?telegram_user_id=eq.${target}&select=telegram_user_id,state,updated_at&limit=1`, { headers: h, signal: AbortSignal.timeout(15_000) }),
      fetch(`${db.url}/rest/v1/progress?select=telegram_user_id,state&order=updated_at.desc&limit=500`, { headers: h, signal: AbortSignal.timeout(15_000) }),
      fetch(`${db.url}/rest/v1/identities?telegram_user_id=eq.${target}&select=username&limit=1`, { headers: h, signal: AbortSignal.timeout(15_000) }),
    ]);
    if (!tRes.ok || !allRes.ok || !idRes.ok) throw new Error(`supabase_${tRes.status}/${allRes.status}/${idRes.status}`);

    const tRows = (await tRes.json()) as { telegram_user_id: number; state: unknown; updated_at: string }[];
    const targetRow = tRows[0];
    if (!targetRow) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const allRows = (await allRes.json()) as { telegram_user_id: number; state: unknown }[];
    const identityRows = (await idRes.json()) as { username: string | null }[];

    const enriched = allRows.map((x) => {
      const st = (x.state ?? {}) as Record<string, unknown>;
      const battle = (st.battle ?? {}) as { wins?: number; losses?: number; draws?: number; ratingDelta?: number };
      const activity = (st.activity ?? {}) as Record<string, { xp?: number }>;
      const wins = Math.max(0, Math.floor(Number(battle.wins) || 0));
      const losses = Math.max(0, Math.floor(Number(battle.losses) || 0));
      const draws = Math.max(0, Math.floor(Number(battle.draws) || 0));
      return {
        id: String(x.telegram_user_id),
        rating: ratingFromBattle({ wins, losses, draws, delta: Math.round(Number(battle.ratingDelta) || 0) }),
        xpWeek: xpInWindow(activity, 7, todayUtc),
        xpMonth: xpInWindow(activity, 30, todayUtc),
      };
    });
    const ranks = buildRanks(enriched);

    const profile = projectPublic(String(targetRow.telegram_user_id), targetRow.state, { username: identityRows[0]?.username ?? undefined }, ranks, todayUtc);
    if (profile) profile.lastActive = typeof targetRow.updated_at === 'string' ? targetRow.updated_at.slice(0, 10) : null;

    res.status(200).json({ profile });
  } catch (e) {
    console.error('profile failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
