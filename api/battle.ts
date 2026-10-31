// Vercel serverless function: friendly-battle matchmaking, keyed by the VERIFIED Telegram user id.
//  GET  /api/battle                        (no auth)  -> { enabled: boolean }
//  GET  /api/battle?action=list            (auth)     -> { list: OpenBattle[] }  open challenges of others
//  GET  /api/battle?action=get&id=...      (auth)     -> { battle: BattleView | null }
//  POST /api/battle  { action: 'open',   questions, rating, name, avatar? } -> { battle }
//  POST /api/battle  { action: 'join',   id, rating, name, avatar? }        -> { battle }
//  POST /api/battle  { action: 'submit', id, score }                        -> { battle }
//  POST /api/battle  { action: 'cancel', id }                               -> { ok: true }
//
// The challenger generates the 7 questions from the app's own content; both players answer the
// SAME questions on their own devices; when both scores are in, the server computes the winner
// and the Elo deltas (K=24) so both clients see a consistent result.
// Env (server only): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import crypto from 'node:crypto';

interface Quiz {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
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
const MAX_DELTA = 24; // safety clamp per battle (= K)
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

function rateLimited(key: string, limit = 60, windowMs = 60_000): boolean {
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

    // ---- GET / battle state (polling) ----
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

    // ---- POST / join someone's challenge ----
    if (action === 'join') {
      const id = cleanText(body?.id, 60);
      const row = await getRow(db, id);
      if (!row || row.status !== 'open' || String(row.p1) === uid) {
        res.status(409).json({ error: 'not_joinable' });
        return;
      }
      const patched: Partial<BattleRow> = {
        p2: Number(uid),
        p2_name: cleanText(body?.name, 24) || 'O‘quvchi',
        p2_rating: cleanRating(body?.rating),
        p2_avatar: cleanText(body?.avatar, 8) || null,
        status: 'active',
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

    // ---- POST / submit my score ----
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
        const raw1 = Math.round(24 * (result - expectedScore(row.p1_rating, opp)));
        const raw2 = Math.round(24 * (1 - result - expectedScore(row.p2_rating ?? row.p1_rating, row.p1_rating)));
        patched.p1_score = p1Score;
        patched.p2_score = p2Score;
        patched.status = 'finished';
        patched.winner = winner as number;
        patched.p1_delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, raw1));
        patched.p2_delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, raw2));
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
