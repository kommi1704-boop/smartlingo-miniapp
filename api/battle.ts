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
  oppAvatar?: string;
  oppRating?: number;
  meScore?: number;
  oppScore?: number;
  winner: 'me' | 'opp' | 'draw' | null;
  myDelta?: number;
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
const STALE_MS = 25_000; // no heartbeat for this long mid-battle = forfeit
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
    oppAvatar: (mine ? row.p2_avatar : row.p1_avatar) ?? undefined,
    oppRating: (mine ? row.p2_rating : row.p1_rating) ?? undefined,
    meScore: mine ? row.p1_score ?? undefined : row.p2_score ?? undefined,
    oppScore: mine ? row.p2_score ?? undefined : row.p1_score ?? undefined,
    winner,
    myDelta: (mine ? row.p1_delta : row.p2_delta) ?? undefined,
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

/** Writes the finished-battle fields onto the row (caller PATCHes row). */
function finishRow(row: BattleRow, side: 'p1' | 'p2' | 'draw', left?: 'p1' | 'p2' | null): void {
  const live = row.live as LiveState;
  const { d1, d2 } = deltasFor(row, side);
  row.status = 'finished';
  row.winner = side === 'draw' ? 0 : side === 'p1' ? row.p1 : row.p2;
  row.p1_score = live.s1;
  row.p2_score = live.s2;
  row.p1_delta = d1;
  row.p2_delta = d2;
  live.round = row.questions.length;
  live.roundStart = null;
  live.a1 = null;
  live.a2 = null;
  if (left !== undefined) live.left = left;
}

/** The winner if the battle ended right now by score. */
function naturalSide(live: LiveState): 'p1' | 'p2' | 'draw' {
  return live.s1 > live.s2 ? 'p1' : live.s2 > live.s1 ? 'p2' : 'draw';
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
      finishRow(row, naturalSide(live));
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
  const enabled = Boolean(db && botToken);

  const initData = header(req, 'x-telegram-init-data');
  const urlQuery = parseQuery(req.url ?? '');
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
    const q = urlQuery;
    const action = (req.method === 'GET' ? q.action : safeBody(req)?.action) as string | undefined;

    // ---- GET / list open battles ----
    if (req.method === 'GET' && action === 'list') {
      const since = new Date(Date.now() - OPEN_LIST_TTL_MS).toISOString();
      const r = await sbFetch(db, `battles?select=*&status=eq.open&p1=neq.${uid}&created_at=gte.${since}&order=created_at.asc&limit=20`);
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      const rows = (await r.json()) as BattleRow[];
      res.status(200).json({
        list: rows.map((b) => ({ id: b.id, name: b.p1_name || 'Raqib', rating: b.p1_rating, avatar: b.p1_avatar ?? undefined, createdAt: b.created_at })),
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
      let changed = false;
      if (row.status === 'active') {
        if (isP1) row.seen1 = Date.now();
        else row.seen2 = Date.now();
        changed = resolveTimeouts(row);
        // Opponent vanished (closed the app / left the page) -> forfeit, I win.
        const oppSeen = isP1 ? row.seen2 : row.seen1;
        if (row.status === 'active' && oppSeen != null && Date.now() - oppSeen > STALE_MS && live.roundStart != null) {
          finishRow(row, isP1 ? 'p1' : 'p2', isP1 ? 'p2' : 'p1');
          changed = true;
        }
      }
      if (changed) {
        // Conditional write: only lands if the round has not moved underneath us.
        const r = await sbFetch(db, `battles?id=eq.${row.id}&status=eq.active&live->>round=eq.${readRound}`, {
          method: 'PATCH', headers: { prefer: 'return=representation' },
          body: JSON.stringify({ live, status: row.status, winner: row.winner, p1_score: row.p1_score, p2_score: row.p2_score, p1_delta: row.p1_delta, p2_delta: row.p2_delta }),
        });
        if (r.ok) {
          const arr = (await r.json().catch(() => [])) as BattleRow[];
          if (arr.length === 0) {
            const fresh = await getRow(db, row.id);
            if (fresh) {
              res.status(200).json({ live: fresh.live ? liveSync(fresh, uid) : { legacy: true } });
              return;
            }
          }
        }
      }
      // Heartbeat only: never touches `live`, so it cannot clobber a concurrent answer.
      await sbFetch(db, `battles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify(isP1 ? { seen1: row.seen1 } : { seen2: row.seen2 }) });
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
        live: freshLive(), seen1: Date.now(), seen2: null,
        created_at: new Date().toISOString(),
      };
      const r = await sbFetch(db, 'battles', { method: 'POST', headers: { prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify(row) });
      if (!r.ok && r.status !== 409) throw new Error(`supabase_${r.status}`);
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
      live.s1 = 0; live.s2 = 0;
      live.a1 = null; live.a2 = null;
      live.left = null;
      const patched: Partial<BattleRow> = {
        p2: Number(uid),
        p2_name: cleanText(body?.name, 24) || 'O‘quvchi',
        p2_rating: cleanRating(body?.rating),
        p2_avatar: cleanText(body?.avatar, 8) || null,
        status: 'active',
        live,
        seen2: Date.now(),
      };
      // only one joiner wins the race: patch WHERE status is still open
      const r = await sbFetch(db, `battles?id=eq.${id}&status=eq.open`, { method: 'PATCH', body: JSON.stringify(patched) });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      const fresh = await getRow(db, id);
      if (!fresh || String(fresh.p2) !== uid) {
        res.status(409).json({ error: 'not_joinable' });
        return;
      }
      res.status(200).json({ battle: view(fresh, uid) });
      return;
    }

    // ---- POST / my answer for the current live round ----
    if (action === 'answer') {
      const id = cleanText(body?.id, 60);
      const row = await getRow(db, id);
      if (!row || (String(row.p1) !== uid && String(row.p2) !== uid) || !row.live) {
        res.status(409).json({ error: 'not_active' });
        return;
      }
      const live = row.live;
      const isP1 = String(row.p1) === uid;
      const round = Math.round(Number(body?.round));
      const correct = Number(body?.correct) === 1;
      const t = Math.max(0, Math.min(120_000, Math.round(Number(body?.t) || 0)));
      if (row.status === 'finished') {
        res.status(200).json({ live: liveSync(row, uid) });
        return;
      }
      const seen = Date.now();
      resolveTimeouts(row);
      let wrote = false;
      if (row.status === 'active' && live.roundStart != null && round === live.round) {
        const myAns = isP1 ? live.a1 : live.a2;
        if (myAns == null) {
          const ans: LiveAns = { c: correct ? 1 : 0, t };
          if (isP1) live.a1 = ans;
          else live.a2 = ans;
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
          // Conditional write: only lands if the round is still the one I read.
          const r = await sbFetch(db, `battles?id=eq.${row.id}&status=eq.active&live->>round=eq.${round}`, {
            method: 'PATCH', headers: { prefer: 'return=representation' },
            body: JSON.stringify({ live, status: row.status, winner: row.winner, p1_score: row.p1_score, p2_score: row.p2_score, p1_delta: row.p1_delta, p2_delta: row.p2_delta, ...(isP1 ? { seen1: seen } : { seen2: seen }) }),
          });
          wrote = r.ok;
          if (r.ok) {
            const arr = (await r.json().catch(() => [])) as BattleRow[];
            if (arr.length === 0) wrote = false; // lost the race — the round already moved
          }
        }
      }
      if (!wrote) {
        // nothing to change (late / duplicate / lost race) — refresh my heartbeat and
        // return the CURRENT server state so the client catches up
        const fresh = (await getRow(db, row.id)) ?? row;
        await sbFetch(db, `battles?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify(isP1 ? { seen1: seen } : { seen2: seen }) }).catch(() => undefined);
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
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      const fresh = (await getRow(db, id)) ?? row;
      res.status(200).json({ battle: view(fresh, uid) });
      return;
    }

    res.status(400).json({ error: 'bad_action' });
  } catch (e) {
    console.error('battle failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}

async function getRow(db: { url: string; key: string }, id: string): Promise<BattleRow | null> {
  if (!/^[a-z0-9_]{3,60}$/i.test(id)) return null;
  const r = await sbFetch(db, `battles?select=*&id=eq.${id}&limit=1`);
  if (!r.ok) return null;
  const rows = (await r.json()) as BattleRow[];
  return rows[0] ?? null;
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
