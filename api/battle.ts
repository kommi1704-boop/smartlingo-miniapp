// Vercel serverless function: friendly-battle matchmaking, keyed by the VERIFIED Telegram user id.
//  GET  /api/battle                          (no auth) -> { enabled: boolean }
//  GET  /api/battle?action=list              (auth)    -> { list: OpenBattle[] }  open challenges of others
//  GET  /api/battle?action=get&id=...        (auth)    -> { battle: BattleView | null }
//  GET  /api/battle?action=sync&id=...       (auth)    -> { live: LiveSync | { legacy: true } }
//  POST /api/battle  { action: 'open',     questions, rating, name, avatar? } -> { battle }
//  POST /api/battle  { action: 'join',     id, rating, name, avatar? }        -> { battle }
//  POST /api/battle  { action: 'answer',   id, round, correct (0|1), t (ms) } -> { live: LiveSync }
//  POST /api/battle  { action: 'forfeit',  id }                               -> { live: LiveSync }
//  POST /api/battle  { action: 'submit',   id, score }                        -> { battle }   (legacy async flow)
//  POST /api/battle  { action: 'cancel',   id }                               -> { ok: true }
//
// LIVE MODE (user report: "both players must see the same question at the same time; whoever
// answers correctly FIRST takes the point and the next question appears right away; a wrong
// answer waits for the opponent; if both are wrong, the next question comes"):
// - the battle row keeps a `live` jsonb state: current round, round start (server clock),
//   both answers, running scores and per-player heartbeats (seen1/seen2).
// - clients poll action=sync (~1.2s) which doubles as a heartbeat. The round is advanced by the
//   SERVER: on the first correct answer (point + next question), when both have answered wrong,
//   or when the question clock (15s/22s + 3s network grace) runs out.
// - a player who stops polling for 25s (closed the app / left the page) FORFEITS: the battle
//   finishes, the opponent gets the win and both Elo deltas are applied — quitting no longer
//   escapes the rating loss.
// - Elo: K=64 for both sides (user report: climbing was too slow) — a win between equals is
//   +32, an underdog upset up to the ±64 clamp. Must match PVP_ELO_K in src/lib/battle.ts.
// Env (server only): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Schema: supabase/schema.sql adds `alter table battles add column if not exists live jsonb`.
import crypto from 'node:crypto';
import { dispatch } from './_lib/notify';

interface Quiz {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

interface LiveAns { c: 0 | 1; t: number }

interface LiveState {
  round: number;
  roundStart: number | null; // server epoch ms when the current question opened (null = not started / finished)
  s1: number;
  s2: number;
  a1: LiveAns | null; // p1's answer for the CURRENT round
  a2: LiveAns | null;
  left: 'p1' | 'p2' | null; // who abandoned the battle (set on forfeit)
  n?: number; // total answers RECORDED in this battle (user report: battles with zero answers
              // must not move the rating — anything the clock/stale-forfeit finishes at n=0 aborts)
  startedAt?: number; // server epoch ms when the join activated the battle — the absent-opponent
                      // timer below runs from here (rows joined before this field existed fall
                      // back to roundStart - START_DELAY_MS, which join also derived from)
  aborted?: true; // set when the battle finished without a single answer (connection issue)
}

interface BattleRow {
  id: string;
  p1: number;
  p2: number | null;
  p1_name: string;
  p2_name: string | null;
  p1_rating: number;
  p2_rating: number | null;
  p1_avatar: string | null;
  p2_avatar: string | null;
  p1_score: number | null;
  p2_score: number | null;
  p1_done: boolean;
  p2_done: boolean;
  status: 'open' | 'active' | 'finished';
  questions: Quiz[];
  winner: number | null;
  p1_delta: number | null;
  p2_delta: number | null;
  live: LiveState | null;
  seen1: number | null; // heartbeat: last time p1 polled sync (separate columns so
  seen2: number | null; //  heartbeats never clobber concurrent `live` writes)
  created_at: string;
  updated_at?: string;
}

interface BattleView {
  id: string;
  status: 'open' | 'active' | 'finished';
  me: 'p1' | 'p2';
  questions?: Quiz[];
  oppName: string;
  oppId?: string; // opponent's telegram user id -> opens their public profile
  oppAvatar?: string;
  oppRating?: number;
  meScore?: number;
  oppScore?: number;
  winner: 'me' | 'opp' | 'draw' | null;
  myDelta?: number;
  aborted?: boolean; // true = finished with zero answers (connection issue) — rating untouched
  createdAt: string;
}

/** Compact per-round state sent to both clients by action=sync. */
interface LiveSync {
  round: number;
  roundStart: number | null;
  serverNow: number;
  s1: number;
  s2: number;
  mine: LiveAns | null;
  opp: LiveAns | null; // opp answered (c=1 cannot stay visible: a correct answer ends the round immediately)
  status: 'open' | 'active' | 'finished';
  winner: 'me' | 'opp' | 'draw' | null;
  myDelta?: number;
  left: 'me' | 'opp' | null;
  aborted?: boolean; // finished with zero answers — rating untouched, client shows a neutral screen
}

interface Req {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
}

const OPEN_LIST_TTL_MS = 10 * 60 * 1000; // open challenges are listed for 10 minutes
const ROW_TTL_MS = 2 * 60 * 60 * 1000; // all rows are garbage-collected after 2 hours
const MAX_QUESTIONS = 12;
const PVP_K = 64; // must match PVP_ELO_K in src/lib/battle.ts
const MAX_DELTA = 64; // safety clamp per battle
const PASSAGE_LEN = 160;
const ROUND_GRACE_MS = 3000; // extra time on the server clock for network latency
const START_DELAY_MS = 3500; // countdown between join and round 0
const ADVANCE_DELAY_MS = 1500; // reveal pause between rounds
const STALE_MS = 40_000; // no heartbeat for this long mid-battle = forfeit (25s punished slow
                         // mobile networks — user report: the duel ended 0:0 before question 1)
const GONE_MS = 75_000; // opponent NEVER polled since the battle went active = they are not
                        // coming (ghost challenge: the challenger closed the app right after
                        // opening it). 75s = >20 missed 1.2s polls, still under a minute of
                        // waiting; generous enough that a slow first sync never trips it.
const NOTIFY_BUDGET_MS = 8000; // hard cap on the awaited Telegram notify at battle end — the
                               // full path can take ~22s (2 x prefs/send timeouts) and would
                               // blow past the Vercel Hobby 10s function cap mid-notify.
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

function rateLimited(key: string, limit = 240, windowMs = 60_000): boolean {
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

async function sbFetch(db: { url: string; key: string }, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${db.url}/rest/v1/${path}`, { ...init, headers: { ...sbHeaders(db.key), ...(init.headers ?? {}) }, signal: AbortSignal.timeout(15_000) });
}

/**
 * Turns a failed PostgREST response into a precise, PII-free error for the server log, e.g.
 *   supabase_404:PGRST205 (battle:list)  -> table missing  (supabase/schema.sql was not run)
 *   supabase_400:PGRST204 (battle:join)  -> column missing  (schema.sql is older than the code)
 *   supabase_401/403                     -> wrong SUPABASE_SERVICE_ROLE_KEY
 * Before this, every Supabase failure was logged as just "supabase_<status>" or swallowed.
 */
async function sbFail(r: Response, what: string): Promise<Error> {
  let code = '';
  try {
    const j = (await r.json()) as { code?: unknown };
    if (j && typeof j.code === 'string') code = `:${j.code.slice(0, 12)}`;
  } catch {
    /* body is not JSON */
  }
  return new Error(`supabase_${r.status}${code} (${what})`);
}

/**
 * Optimistic-concurrency guard for the conditional PATCH on `live`: the write only lands if the
 * round AND the answer counter are still what this request read. Round alone was not enough —
 * two players answering WRONG in the same round both read an empty round, and the second write
 * silently erased the first player's answer (the round then hung until the question clock ran out).
 * Rows without a counter (legacy) fall back to the round-only guard.
 */
function liveGuard(round: number, n: number | undefined): string {
  return `live->>round=eq.${round}${n === undefined ? '' : `&live->>n=eq.${n}`}`;
}

function expectedScore(you: number, opp: number): number {
  return 1 / (1 + 10 ** ((opp - you) / 400));
}

const clampDelta = (d: number): number => Math.max(-MAX_DELTA, Math.min(MAX_DELTA, Math.round(d)));

/** Mirrors timeForQuestion() in src/lib/battle.ts (server knows the questions). */
function qTimeMs(questions: Quiz[], i: number): number {
  return (questions[i]?.q.length ?? 0) > PASSAGE_LEN ? 22_000 : 15_000;
}

function view(row: BattleRow, uid: string): BattleView {
  const me: 'p1' | 'p2' = String(row.p1) === uid ? 'p1' : 'p2';
  const mine = me === 'p1';
  const winner: BattleView['winner'] =
    row.status !== 'finished' || row.winner == null ? null : row.winner === 0 ? 'draw' : String(row.winner) === uid ? 'me' : 'opp';
  return {
    id: row.id,
    status: row.status,
    me,
    questions: mine || String(row.p2) === uid ? row.questions : undefined,
    oppName: (mine ? row.p2_name : row.p1_name) ?? 'Raqib',
    oppId: String(mine ? row.p2 ?? '' : row.p1) || undefined,
    oppAvatar: (mine ? row.p2_avatar : row.p1_avatar) ?? undefined,
    oppRating: (mine ? row.p2_rating : row.p1_rating) ?? undefined,
    meScore: mine ? row.p1_score ?? undefined : row.p2_score ?? undefined,
    oppScore: mine ? row.p2_score ?? undefined : row.p1_score ?? undefined,
    winner,
    myDelta: (mine ? row.p1_delta : row.p2_delta) ?? undefined,
    aborted: row.status === 'finished' && row.live?.aborted === true ? true : undefined,
    createdAt: row.created_at,
  };
}

/** Builds the compact sync payload for one side. */
function liveSync(row: BattleRow, uid: string): LiveSync {
  const live = row.live as LiveState;
  const isP1 = String(row.p1) === uid;
  const mine = isP1 ? live.a1 : live.a2;
  const opp = isP1 ? live.a2 : live.a1;
  const winner: LiveSync['winner'] =
    row.status !== 'finished' || row.winner == null ? null : row.winner === 0 ? 'draw' : String(row.winner) === uid ? 'me' : 'opp';
  return {
    round: live.round,
    roundStart: live.roundStart,
    serverNow: Date.now(),
    s1: live.s1,
    s2: live.s2,
    mine,
    opp,
    status: row.status,
    winner,
    myDelta: (isP1 ? row.p1_delta : row.p2_delta) ?? undefined,
    left: live.left == null ? null : live.left === (isP1 ? 'p1' : 'p2') ? 'me' : 'opp',
    aborted: row.status === 'finished' && live.aborted === true ? true : undefined,
  };
}

function freshLive(): LiveState {
  return { round: 0, roundStart: null, s1: 0, s2: 0, a1: null, a2: null, left: null };
}

/** Elo result for p1 given the winner side ('p1' | 'p2' | 'draw'). */
function deltasFor(row: BattleRow, side: 'p1' | 'p2' | 'draw'): { d1: number; d2: number } {
  const r1 = side === 'p1' ? 1 : side === 'p2' ? 0 : 0.5;
  const p2r = row.p2_rating ?? row.p1_rating;
  const d1 = clampDelta(PVP_K * (r1 - expectedScore(row.p1_rating, p2r)));
  const d2 = clampDelta(PVP_K * (1 - r1 - expectedScore(p2r, row.p1_rating)));
  return { d1, d2 };
}

/**
 * Writes the finished-battle fields onto the row (caller PATCHes row).
 * `opts.auto` marks machine-made endings (question clock / stale heartbeat). An AUTO finish
 * with ZERO recorded answers is a connection failure, not a game: the battle is ABORTED —
 * winner 0, both Elo deltas 0 — so nobody loses rating for a duel that never really started
 * (user report: "savollar boshlanmadan jang tugadi 0:0 durrang -44 reyting"). Manual forfeits
 * (the player pressed "tark etish") always count as a real loss, exactly as before.
 * `opts.ghost` marks the opponent-never-appeared finish: the battle is ALWAYS aborted, even
 * when the syncing player answered alone — a "win" against someone who never showed up must
 * not move the rating (it would make joining abandoned challenges a farming strategy).
 */
function finishRow(row: BattleRow, side: 'p1' | 'p2' | 'draw', left?: 'p1' | 'p2' | null, opts?: { auto?: boolean; ghost?: boolean }): void {
  const live = row.live as LiveState;
  const nothingHappened = opts?.auto === true && ((live.n ?? 0) === 0 || opts.ghost === true);
  const { d1, d2 } = deltasFor(row, side);
  row.status = 'finished';
  row.winner = nothingHappened ? 0 : side === 'draw' ? 0 : side === 'p1' ? row.p1 : row.p2;
  row.p1_score = live.s1;
  row.p2_score = live.s2;
  row.p1_delta = nothingHappened ? 0 : d1;
  row.p2_delta = nothingHappened ? 0 : d2;
  live.round = row.questions.length;
  live.roundStart = null;
  live.a1 = null;
  live.a2 = null;
  if (nothingHappened) live.aborted = true;
  if (left !== undefined) live.left = left;
}

/** The winner if the battle ended right now by score. */
function naturalSide(live: LiveState): 'p1' | 'p2' | 'draw' {
  return live.s1 > live.s2 ? 'p1' : live.s2 > live.s1 ? 'p2' : 'draw';
}

/**
 * Friend-battle finished -> both players get a short Telegram note (kind 'battle').
 * Best-effort and idempotent (deterministic eventKey per battle per user, so poll
 * retries can never double-send). Aborted battles (zero answers / connection
 * issues) stay silent — there is nothing to celebrate.
 * Hard-capped with a race: the caller awaits this INSIDE the finish response, and the
 * full pipeline (2 x fetchPrefs + 2 x reserve + 2 x Telegram send, each 10-12s timeout)
 * can legally take ~22s — past the Vercel Hobby 10s function cap, which used to freeze
 * the instance mid-notify and leave the history row stuck in 'sending' forever.
 */
async function notifyBattleEnd(db: { url: string; key: string }, token: string, appUrl: string, row: BattleRow): Promise<void> {
  const budget = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), NOTIFY_BUDGET_MS));
  const work = (async () => {
    try {
      if (row.status !== 'finished' || !row.p2) return;
      if ((row.live as LiveState | null)?.aborted) return;
      const s1 = row.p1_score ?? 0;
      const s2 = row.p2_score ?? 0;
      const line = (name: string, you: number, them: number, delta: number | null): string => {
        const verdict = you > them ? 'G‘alaba sizniki! 🏆' : you < them ? 'Bu safar raqib kuchli bo‘ldi — keyingi jangda ochasiz! 💪' : 'Durrang! Ikkala jangchi ham kuchli ekan 🤝';
        return `⚔️ «${name}» bilan jang yakunlandi!\n\nNatija: ${you}:${them}${delta ? ` (reyting ${delta > 0 ? '+' : ''}${delta})` : ''}\n\n${verdict}`;
      };
      await Promise.allSettled([
        dispatch(db, token, appUrl, {
          uid: row.p1, kind: 'battle', eventKey: `finished:${row.id}`,
          text: line(row.p2_name || 'Raqib', s1, s2, row.p1_delta),
          button: { label: '⚔️ Janglar', webApp: true },
        }),
        dispatch(db, token, appUrl, {
          uid: row.p2, kind: 'battle', eventKey: `finished:${row.id}`,
          text: line(row.p1_name || 'Raqib', s2, s1, row.p2_delta),
          button: { label: '⚔️ Janglar', webApp: true },
        }),
      ]);
    } catch {
      /* notifications are best-effort — never touch the battle flow */
    }
  })();
  await Promise.race([work, budget]); // past 8s the response goes out; the sends keep draining
}

/**
 * Advances past every question whose clock ran out with nobody scoring (server is the clock
 * authority). Mutates row.live / row status; returns true when something changed.
 */
function resolveTimeouts(row: BattleRow): boolean {
  const live = row.live;
  if (!live || row.status !== 'active' || live.roundStart == null) return false;
  let changed = false;
  let guard = 0;
  while (row.status === 'active' && live.roundStart != null && Date.now() > live.roundStart + qTimeMs(row.questions, live.round) + ROUND_GRACE_MS && guard++ < 16) {
    live.round += 1;
    if (live.round >= row.questions.length) {
      finishRow(row, naturalSide(live), undefined, { auto: true });
      return true;
    }
    live.roundStart += qTimeMs(row.questions, live.round - 1); // keep the cadence when catching up
    live.a1 = null;
    live.a2 = null;
    changed = true;
  }
  return changed;
}

function sanitizeQuestions(raw: unknown): Quiz[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_QUESTIONS) return null;
  const out: Quiz[] = [];
  for (const x of raw) {
    const q = x as Partial<Quiz>;
    if (typeof q.id !== 'string' || typeof q.q !== 'string' || !Array.isArray(q.options) || q.options.length !== 4 ||
        typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3 || typeof q.explain !== 'string') return null;
    out.push({ id: q.id.slice(0, 40), q: q.q.slice(0, 400), options: q.options.map((o) => String(o).slice(0, 80)), answer: Math.round(q.answer), explain: q.explain.slice(0, 500) });
  }
  return out;
}

const cleanText = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const cleanRating = (v: unknown): number => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(5000, Math.max(900, n)) : 1000;
};

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const db = supa();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const appUrl = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '') ?? '';
  const enabled = Boolean(db && botToken);

  const initData = header(req, 'x-telegram-init-data');
  const urlQuery = parseQuery(req.url ?? '');
  if (req.method === 'GET' && !initData) {
    // `why` names the exact missing env vars so the UI banner can show the cause
    // (names only — no secret value is ever sent to the client).
    const missing = [
      !process.env.SUPABASE_URL?.trim() && 'SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() && 'SUPABASE_SERVICE_ROLE_KEY',
      !botToken && 'TELEGRAM_BOT_TOKEN',
    ].filter((v): v is string => Boolean(v));
    res.status(200).json({ enabled, why: enabled ? null : { missing } });
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
    const q = urlQuery;
    const action = (req.method === 'GET' ? q.action : safeBody(req)?.action) as string | undefined;

    // ---- GET / list open battles ----
    if (req.method === 'GET' && action === 'list') {
      const since = new Date(Date.now() - OPEN_LIST_TTL_MS).toISOString();
      const r = await sbFetch(db, `battles?select=*&status=eq.open&p1=neq.${uid}&created_at=gte.${since}&order=created_at.asc&limit=20`);
      if (!r.ok) throw await sbFail(r, 'battle:list');
      const rows = (await r.json()) as BattleRow[];
      res.status(200).json({
        list: rows.map((b) => ({ id: b.id, uid: String(b.p1), name: b.p1_name || 'Raqib', rating: b.p1_rating, avatar: b.p1_avatar ?? undefined, createdAt: b.created_at })),
      });
      return;
    }

    // ---- GET / battle state (polling, used while waiting for a joiner) ----
    if (req.method === 'GET' && action === 'get') {
      const id = cleanText(q.id, 60);
      if (!id) {
        res.status(400).json({ error: 'bad_id' });
        return;
      }
      const row = await getRow(db, id);
      if (!row || (String(row.p1) !== uid && String(row.p2) !== uid)) {
        res.status(200).json({ battle: null });
        return;
      }
      // Waiting-phase heartbeat: the challenger polls `get` every ~3s while waiting for a
      // joiner. Without this their `seen` column stays frozen at open-time, and the joiner's
      // very first sync saw a 60s-old heartbeat -> instant 0:0 forfeit before question 1
      // (user report: the battle ended before the questions started).
      if (row.status !== 'finished') {
        const seen = Date.now();
        if (String(row.p1) === uid) {
          row.seen1 = seen;
          await sbFetch(db, `battles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ seen1: seen }) }).catch(() => undefined);
        } else {
          row.seen2 = seen;
          await sbFetch(db, `battles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ seen2: seen }) }).catch(() => undefined);
        }
      }
      res.status(200).json({ battle: view(row, uid) });
      return;
    }

    // ---- GET / live round sync (also the heartbeat) ----
    if (req.method === 'GET' && action === 'sync') {
      const id = cleanText(q.id, 60);
      const row = await getRow(db, id);
      if (!row || (String(row.p1) !== uid && String(row.p2) !== uid)) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      if (!row.live) {
        res.status(200).json({ live: { legacy: true } });
        return;
      }
      const isP1 = String(row.p1) === uid;
      const live = row.live;
      const readRound = live.round;
      const readN = live.n;
      let changed = false;
      if (row.status === 'active') {
        if (isP1) row.seen1 = Date.now();
        else row.seen2 = Date.now();
        changed = resolveTimeouts(row);
        // Opponent vanished (closed the app / left the page) -> forfeit, I win.
        // Four guards keep slow networks out of trouble (user report: "ulandi lekin sekin",
        // the duel died before question 1):
        //  1. oppSeen == null -> the opponent has not polled ONCE since the battle went
        //     active (join resets pre-activation heartbeats) — handled by the GONE_MS rule
        //     below, never by the instant forfeit;
        //  2. the current question must actually be OPEN (roundStart in the past) — the
        //     3.5s countdown is a grace period, not a deadline;
        //  3. 40s of silence (was 25s) — enough to survive a flaky mobile connection;
        //  4. the NEVER-seen opponent gets its own, longer window (GONE_MS = 75s from the
        //     join). That case used to hang forever: a challenger who opened a challenge and
        //     closed the app left the joiner stuck in a dead battle, and answering alone
        //     against the ghost even paid out full Elo (farming vector). Now it ABORTS:
        //     winner 0, deltas 0, rating untouched.
        const oppSeen = isP1 ? row.seen2 : row.seen1;
        const roundOpen = live.roundStart != null && Date.now() > live.roundStart;
        if (row.status === 'active' && roundOpen && oppSeen != null && Date.now() - oppSeen > STALE_MS) {
          finishRow(row, isP1 ? 'p1' : 'p2', isP1 ? 'p2' : 'p1', { auto: true });
          changed = true;
        } else if (row.status === 'active' && roundOpen && oppSeen == null) {
          const startedAt = live.startedAt ?? (live.roundStart ?? Date.now()) - START_DELAY_MS;
          if (Date.now() - startedAt > GONE_MS) {
            finishRow(row, isP1 ? 'p1' : 'p2', isP1 ? 'p2' : 'p1', { auto: true, ghost: true });
            changed = true;
          }
        }
      }
      if (changed) {
        // Conditional write: only lands if the round has not moved underneath us.
        // The heartbeat rides along, so a sync that changed something costs ONE db write.
        const r = await sbFetch(db, `battles?id=eq.${row.id}&status=eq.active&${liveGuard(readRound, readN)}`, {
          method: 'PATCH', headers: { prefer: 'return=representation' },
          body: JSON.stringify({ live, status: row.status, winner: row.winner, p1_score: row.p1_score, p2_score: row.p2_score, p1_delta: row.p1_delta, p2_delta: row.p2_delta, ...(isP1 ? { seen1: row.seen1 } : { seen2: row.seen2 }) }),
        });
        if (r.ok) {
          const arr = (await r.json().catch(() => [])) as BattleRow[];
          if (arr.length === 0) {
            const fresh = await getRow(db, row.id);
            if (fresh) {
              res.status(200).json({ live: fresh.live ? liveSync(fresh, uid) : { legacy: true } });
              return;
            }
          } else {
            // written (heartbeat included) — no extra PATCH needed
            if (row.status === 'finished') await notifyBattleEnd(db, botToken, appUrl, row); // idempotent
            res.status(200).json({ live: liveSync(row, uid) });
            return;
          }
        } else {
          console.error('battle sync write failed', (await sbFail(r, 'battle:sync')).message); // keep serving the read
        }
      }
      // Heartbeat only: never touches `live`, so it cannot clobber a concurrent answer.
      // Best-effort: a hiccup here used to throw -> 502 on every poll while Supabase was slow.
      if (row.status !== 'finished') {
        await sbFetch(db, `battles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify(isP1 ? { seen1: row.seen1 } : { seen2: row.seen2 }) }).catch(() => undefined);
      }
      res.status(200).json({ live: liveSync(row, uid) });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const body = safeBody(req) as Record<string, unknown> | undefined;

    // ---- POST / open a challenge ----
    if (action === 'open') {
      const questions = sanitizeQuestions(body?.questions);
      if (!questions) {
        res.status(400).json({ error: 'bad_questions' });
        return;
      }
      // garbage-collect stale rows, then drop my previous open challenges
      await sbFetch(db, `battles?created_at=lt.${new Date(Date.now() - ROW_TTL_MS).toISOString()}`, { method: 'DELETE' });
      await sbFetch(db, `battles?p1=eq.${uid}&status=eq.open`, { method: 'DELETE' });
      const row: BattleRow = {
        id: crypto.randomUUID().slice(0, 8) + '_' + uid + '_' + Date.now().toString(36),
        p1: Number(uid), p2: null,
        p1_name: cleanText(body?.name, 24) || 'O‘quvchi', p2_name: null,
        p1_rating: cleanRating(body?.rating), p2_rating: null,
        p1_avatar: cleanText(body?.avatar, 8) || null, p2_avatar: null,
        p1_score: null, p2_score: null, p1_done: false, p2_done: false,
        status: 'open', questions, winner: null, p1_delta: null, p2_delta: null,
        live: freshLive(), seen1: null, seen2: null,
        // seen1 starts null: a pre-activation heartbeat means nothing, and a frozen one must
        // never look like an abandoned battle once an opponent joins
        created_at: new Date().toISOString(),
      };
      const r = await sbFetch(db, 'battles', { method: 'POST', headers: { prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify(row) });
      if (!r.ok && r.status !== 409) throw await sbFail(r, 'battle:open');
      res.status(200).json({ battle: view(row, uid) });
      return;
    }

    // ---- POST / cancel my open challenge ----
    if (action === 'cancel') {
      const id = cleanText(body?.id, 60);
      if (id) await sbFetch(db, `battles?id=eq.${id}&p1=eq.${uid}&status=eq.open`, { method: 'DELETE' });
      res.status(200).json({ ok: true });
      return;
    }

    // ---- POST / join someone's challenge (both sides get the same question at the same time) ----
    if (action === 'join') {
      const id = cleanText(body?.id, 60);
      const row = await getRow(db, id);
      if (!row || row.status !== 'open' || String(row.p1) === uid) {
        res.status(409).json({ error: 'not_joinable' });
        return;
      }
      const live: LiveState = row.live ?? freshLive();
      live.round = 0;
      live.roundStart = Date.now() + START_DELAY_MS; // shared countdown — both clients start together
      live.startedAt = Date.now(); // the absent-opponent timer runs from the activation moment
      live.s1 = 0; live.s2 = 0;
      live.a1 = null; live.a2 = null;
      live.left = null;
      live.n = 0; // zero answers so far — an auto-finish before the first answer aborts, rating untouched
      delete live.aborted;
      const patched: Partial<BattleRow> = {
        p2: Number(uid),
        p2_name: cleanText(body?.name, 24) || 'O‘quvchi',
        p2_rating: cleanRating(body?.rating),
        p2_avatar: cleanText(body?.avatar, 8) || null,
        status: 'active',
        live,
        // Reset p1's pre-activation heartbeat: while p1 waited for a joiner (possibly minutes,
        // polling only `get`) their `seen1` went stale. Without the reset the joiner's first
        // sync instantly "forfeited" p1 — the 0:0/-44-before-question-1 bug.
        seen1: null,
        seen2: Date.now(),
      };
      // only one joiner wins the race: patch WHERE status is still open
      const r = await sbFetch(db, `battles?id=eq.${id}&status=eq.open`, { method: 'PATCH', body: JSON.stringify(patched) });
      if (!r.ok) throw await sbFail(r, 'battle:join');
      const fresh = await getRow(db, id);
      if (!fresh || String(fresh.p2) !== uid) {
        res.status(409).json({ error: 'not_joinable' });
        return;
      }
      // The joiner just entered a duel — their own open challenges (opened by a parallel
      // search on another device / a race with the cross-join poll) would linger as joinable
      // ghosts for the next searcher. Delete them now; best-effort, never fail the join.
      await sbFetch(db, `battles?p1=eq.${uid}&status=eq.open`, { method: 'DELETE' }).catch(() => undefined);
      res.status(200).json({ battle: view(fresh, uid) });
      return;
    }

    // ---- POST / my answer for the current live round ----
    if (action === 'answer') {
      const id = cleanText(body?.id, 60);
      let row = await getRow(db, id);
      if (!row || (String(row.p1) !== uid && String(row.p2) !== uid) || !row.live) {
        res.status(409).json({ error: 'not_active' });
        return;
      }
      const isP1 = String(row.p1) === uid;
      const round = Math.round(Number(body?.round));
      // Correctness is decided HERE whenever the client says which option it picked (`choice`):
      // the server holds the questions, so a modified client can no longer claim "I was correct".
      // The legacy `correct` flag is only honoured for old cached clients that send no `choice`
      // (remove that fallback once every client is on the new bundle).
      const choice = Number.isInteger(body?.choice) ? (body?.choice as number) : null;
      const asked = row.questions[round];
      const correct = choice !== null && asked ? choice === asked.answer : Number(body?.correct) === 1;
      const t = Math.max(0, Math.min(120_000, Math.round(Number(body?.t) || 0)));
      if (row.status === 'finished') {
        res.status(200).json({ live: liveSync(row, uid) });
        return;
      }
      const seen = Date.now();
      let wrote = false;
      // Up to 3 attempts: the write below is conditional (round + answer counter), so when the
      // opponent's answer lands between my read and my write the write is refused — instead of
      // dropping MY answer (it used to vanish and the round hung until the clock ran out) I
      // re-read the fresh row and apply my answer on top of theirs.
      for (let attempt = 0; attempt < 3 && !wrote; attempt++) {
        if (attempt > 0) {
          const again = await getRow(db, id);
          if (!again || !again.live) break;
          row = again;
        }
        const live = row.live as LiveState;
        if (row.status === 'finished') break;
        const readN = live.n; // counter BEFORE this answer
        resolveTimeouts(row);
        if (!(row.status === 'active' && live.roundStart != null && round === live.round)) break; // late / wrong round
        // The question must actually be OPEN: during the shared countdown (3.5s) or the
        // reveal pause (1.5s) the clock has not started, so an answer cannot race in early
        // (honest clients already refuse to tap there — now the server agrees).
        if (Date.now() < live.roundStart) break;
        if ((isP1 ? live.a1 : live.a2) != null) break; // duplicate answer
        const ans: LiveAns = { c: correct ? 1 : 0, t };
        if (isP1) live.a1 = ans;
        else live.a2 = ans;
        live.n = (live.n ?? 0) + 1; // a real answer happened — the battle is "played" from now on
        let scored = false;
        if (correct) {
          // first correct answer takes the point (the t-comparison guards the rare
          // simultaneous-correct race that slips past the conditional write)
          const oppAns = isP1 ? live.a2 : live.a1;
          if (!(oppAns && oppAns.c === 1 && oppAns.t <= ans.t)) {
            if (isP1) live.s1 += 1;
            else live.s2 += 1;
            scored = true;
          }
        }
        const bothAnswered = live.a1 != null && live.a2 != null;
        if (scored || bothAnswered) {
          // next question right away; the short delay gives both clients a reveal pause
          live.round += 1;
          if (live.round >= row.questions.length) {
            finishRow(row, naturalSide(live));
          } else {
            live.roundStart = Date.now() + ADVANCE_DELAY_MS;
            live.a1 = null;
            live.a2 = null;
          }
        }
        // else: I answered wrong — wait for the opponent or the buzzer
        const r = await sbFetch(db, `battles?id=eq.${row.id}&status=eq.active&${liveGuard(round, readN)}`, {
          method: 'PATCH', headers: { prefer: 'return=representation' },
          body: JSON.stringify({ live, status: row.status, winner: row.winner, p1_score: row.p1_score, p2_score: row.p2_score, p1_delta: row.p1_delta, p2_delta: row.p2_delta, ...(isP1 ? { seen1: seen } : { seen2: seen }) }),
        });
        if (!r.ok) {
          console.error('battle answer write failed', (await sbFail(r, 'battle:answer')).message);
          break;
        }
        const arr = (await r.json().catch(() => [])) as BattleRow[];
        if (arr.length > 0) {
          wrote = true;
          if ((row.status as string) === 'finished') await notifyBattleEnd(db, botToken, appUrl, row); // idempotent
        }
        // arr.length === 0 -> lost the race: loop re-reads the row and tries again
      }
      if (!wrote) {
        // nothing to change (late / duplicate / lost race) — refresh my heartbeat and
        // return the CURRENT server state so the client catches up
        const fresh = (await getRow(db, id)) ?? row;
        await sbFetch(db, `battles?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(isP1 ? { seen1: seen } : { seen2: seen }) }).catch(() => undefined);
        res.status(200).json({ live: fresh.live ? liveSync(fresh, uid) : { legacy: true } });
        return;
      }
      res.status(200).json({ live: liveSync(row, uid) });
      return;
    }

    // ---- POST / I give up this battle (counts as a loss, opponent wins) ----
    if (action === 'forfeit') {
      const id = cleanText(body?.id, 60);
      const row = await getRow(db, id);
      if (!row || (String(row.p1) !== uid && String(row.p2) !== uid)) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      if (row.status === 'active' && row.live) {
        finishRow(row, String(row.p1) === uid ? 'p2' : 'p1', String(row.p1) === uid ? 'p1' : 'p2');
        const r = await sbFetch(db, `battles?id=eq.${row.id}&status=eq.active`, {
          method: 'PATCH', headers: { prefer: 'return=representation' },
          body: JSON.stringify({ live: row.live, status: row.status, winner: row.winner, p1_score: row.p1_score, p2_score: row.p2_score, p1_delta: row.p1_delta, p2_delta: row.p2_delta }),
        });
        if (r.ok) {
          const arr = (await r.json().catch(() => [])) as BattleRow[];
          if (arr.length > 0) {
            await notifyBattleEnd(db, botToken, appUrl, row); // forfeit finish — both sides are told
            res.status(200).json({ live: liveSync(row, uid) });
            return;
          }
        }
      }
      const fresh = (await getRow(db, row.id)) ?? row;
      res.status(200).json({ live: fresh.live ? liveSync(fresh, uid) : { legacy: true } });
      return;
    }

    // ---- POST / submit my score (legacy async flow, kept for old clients) ----
    if (action === 'submit') {
      const id = cleanText(body?.id, 60);
      const score = Math.max(0, Math.min(MAX_QUESTIONS, Math.round(Number(body?.score))));
      if (!id || !Number.isFinite(score)) {
        res.status(400).json({ error: 'bad_input' });
        return;
      }
      const row = await getRow(db, id);
      if (!row || (String(row.p1) !== uid && String(row.p2) !== uid) || row.status === 'open') {
        res.status(409).json({ error: 'not_active' });
        return;
      }
      if (row.status === 'finished') {
        res.status(200).json({ battle: view(row, uid) });
        return;
      }
      const mine = String(row.p1) === uid;
      const patched: Partial<BattleRow> = mine ? { p1_score: score, p1_done: true } : { p2_score: score, p2_done: true };
      const bothDoneNow = mine ? row.p2_done : row.p1_done;
      if (bothDoneNow) {
        const p1Score = mine ? score : row.p1_score ?? 0;
        const p2Score = mine ? row.p2_score ?? 0 : score;
        const opp = mine ? row.p2_rating ?? row.p1_rating : row.p1_rating;
        const result = p1Score === p2Score ? 0.5 : p1Score > p2Score ? 1 : 0;
        const winner = p1Score === p2Score ? 0 : p1Score > p2Score ? row.p1 : row.p2;
        patched.p1_score = p1Score;
        patched.p2_score = p2Score;
        patched.status = 'finished';
        patched.winner = winner as number;
        patched.p1_delta = clampDelta(PVP_K * (result - expectedScore(row.p1_rating, opp)));
        patched.p2_delta = clampDelta(PVP_K * (1 - result - expectedScore(row.p2_rating ?? row.p1_rating, row.p1_rating)));
      }
      const r = await sbFetch(db, `battles?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(patched) });
      if (!r.ok) throw await sbFail(r, 'battle:submit');
      const fresh = (await getRow(db, id)) ?? row;
      if (fresh.status === 'finished') await notifyBattleEnd(db, botToken, appUrl, fresh); // legacy async finish
      res.status(200).json({ battle: view(fresh, uid) });
      return;
    }

    res.status(400).json({ error: 'bad_action' });
  } catch (e) {
    // PII-free: action + error code only (no ids, names or answers)
    console.error('battle failure', `${req.method ?? '?'} ${req.method === 'GET' ? q0(urlQuery) : q0(safeBody(req))}`, e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}

async function getRow(db: { url: string; key: string }, id: string): Promise<BattleRow | null> {
  if (!/^[a-z0-9_]{3,60}$/i.test(id)) return null;
  const r = await sbFetch(db, `battles?select=*&id=eq.${id}&limit=1`);
  // A Supabase failure is NOT "battle not found": it used to return null here, so a database
  // outage / missing table looked like a vanished battle (404 not_found / {battle:null}) and the
  // real cause never reached the log. Now it surfaces as 502 storage_error + a precise log line.
  if (!r.ok) throw await sbFail(r, 'battle:getRow');
  const rows = (await r.json()) as BattleRow[];
  return rows[0] ?? null;
}

/** The `action` of a request, for log lines only. */
function q0(x: Record<string, unknown> | undefined): string {
  const a = x?.action;
  return typeof a === 'string' ? `action=${a.slice(0, 16)}` : 'action=?';
}

function parseQuery(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const [k, v] of new URL(url, 'http://local').searchParams) out[k] = v;
  } catch {
    /* ignore */
  }
  return out;
}

function safeBody(req: Req): Record<string, unknown> | undefined {
  const raw = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : undefined;
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
