// Vercel serverless function: Friend Quiz ("Do'st quizi") — create, share, play, grade.
//  GET  /api/quiz                                  (no auth) -> { enabled, botUsername }
//  GET  /api/quiz?action=meta                      (auth)    -> { categories, difficulties, sizes, costs, bank }
//  GET  /api/quiz?action=get&id=fq_...             (auth)    -> { quiz, questions?, participants, myAttempt?, role }
//  GET  /api/quiz?action=mine                      (auth)    -> { created[], attempts[] }
//  POST /api/quiz { action:'create', title, category, difficulty, size, spendId? } -> { quiz }
//  POST /api/quiz { action:'submit', id, answers:[0..3], durationMs }              -> { result }
//  POST /api/quiz { action:'close', id }                                           -> { ok }   (creator only)
//  POST /api/quiz { action:'card', id, theme }                                     -> { ok }   (result-card theme, 20 Coins)
//
// SECURITY MODEL (mirrors api/payments.ts):
// - The user id comes ONLY from the HMAC-verified initData, never from the body.
// - Correct answers NEVER leave the server before the attempt is submitted: the
//   get endpoint strips `answer` AND `explain` (an explanation quotes the key).
//   Grading happens here, from the stored copy — client input is only option indices.
// - One attempt per player per quiz, enforced by the friend_quiz_attempts
//   UNIQUE (quiz_id, player_id) index — a second submission can never land.
// - The creator cannot submit their own quiz (they already know the answers).
// - Coin cost (10-question quizzes: 50, premium result cards: 20) is fixed
//   SERVER-SIDE (the client cannot name an amount). The device wallet stays the
//   existing one; every spend is journaled in coin_spends with a deterministic
//   id (retries are no-ops) and failed creations are refunded through the
//   EXISTING coin_grants ledger the Mini App already applies exactly once.
// - Rate limits: bursts in-memory per instance, daily quotas via DB counts.
//
// Env (server only): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WEBAPP_URL.
import crypto from 'node:crypto';
import {
  CATEGORY_IDS, DIFFICULTY_IDS, BANK_STATS, selectQuestions, shuffledQuizOf,
  type QuizCategory, type QuizDifficulty, type BankQuestion,
} from './_lib/quizBank';
import { dispatch } from './_lib/notify';
import { uztDay } from './progress';

export const EXTENDED_QUIZ_COINS = 50; // 10-question quiz
export const CARD_THEME_COINS = 20; // premium result-card theme
export const MAX_TITLE_LEN = 60;
export const DAILY_CREATE_LIMIT = 15; // quizzes per user per day (free + paid)
export const DAILY_PAID_LIMIT = 6; // paid creates per user per day
export const MIN_MS_PER_QUESTION = 700; // anti-cheat: submitting faster than reading is rejected

interface StoredQuestion {
  id: string;
  bankKey: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
  level: string;
}

interface QuizRow {
  id: string;
  creator_id: number;
  creator_name: string;
  title: string;
  category: string;
  difficulty: string;
  size: number;
  cost_coins: number;
  status: string;
  questions: StoredQuestion[];
  spend_id: string | null;
  created_at: string;
}

interface AttemptRow {
  id: string;
  quiz_id: string;
  player_id: number;
  player_name: string;
  player_avatar: string | null;
  score: number;
  total: number;
  answers: number[];
  duration_ms: number;
  created_at: string;
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

const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same initData check as api/payments.ts / api/progress.ts (self-contained here).
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

function rateLimited(key: string, limit: number, windowMs = 60_000): boolean {
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

const okId = (id: unknown): id is string => typeof id === 'string' && /^fq_[0-9a-z_]{3,50}$/.test(id);

function cleanTitle(v: unknown): string {
  return typeof v === 'string' ? v.replace(/[\p{C}]/gu, ' ').trim().replace(/\s+/g, ' ').slice(0, MAX_TITLE_LEN) : '';
}

/** Player-visible copy of a question: NO answer, NO explanation (it quotes the key). */
function stripAnswer(q: StoredQuestion): { id: string; q: string; options: string[] } {
  return { id: q.id, q: q.q, options: q.options };
}

/** Bot username from getMe — cached per serverless instance (same pattern as api/payments.ts). */
let botUsernamePromise: Promise<string | null> | null = null;
function botUsername(token: string): Promise<string | null> {
  botUsernamePromise ??= (async () => {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(12_000),
      });
      const j = (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; result?: { username?: unknown } };
      const u = j.result?.username;
      return typeof u === 'string' && /^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(u) ? u : null;
    } catch {
      return null;
    }
  })();
  return botUsernamePromise;
}

async function sbGet<T>(db: { url: string; key: string }, path: string): Promise<T[] | null> {
  try {
    const r = await fetch(`${db.url}/rest/v1/${path}`, { headers: sbHeaders(db.key), signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    return (await r.json()) as T[];
  } catch {
    return null;
  }
}

/** Daily quota counters (Asia/Tashkent day). */
async function todayCounts(db: { url: string; key: string }, uid: number): Promise<{ created: number; paid: number }> {
  const dayStart = new Date(Date.parse(`${uztDay()}T00:00:00Z`) - 5 * 3600 * 1000).toISOString();
  const [qz, sp] = await Promise.all([
    sbGet<{ id: string }>(db, `friend_quizzes?select=id&creator_id=eq.${uid}&created_at=gte.${dayStart}`),
    sbGet<{ id: string }>(db, `coin_spends?select=id&telegram_user_id=eq.${uid}&purpose=eq.quiz_create_10&status=eq.spent&created_at=gte.${dayStart}`),
  ]);
  return { created: qz?.length ?? 0, paid: sp?.length ?? 0 };
}

/** Bank keys used in the creator's most recent quizzes -> keeps new quizzes fresh (no immediate repeats). */
async function recentBankKeys(db: { url: string; key: string }, uid: number): Promise<string[]> {
  const rows = await sbGet<{ questions: StoredQuestion[] }>(db, `friend_quizzes?select=questions&creator_id=eq.${uid}&order=created_at.desc&limit=5`);
  const keys: string[] = [];
  for (const row of rows ?? []) for (const q of row.questions ?? []) if (q?.bankKey) keys.push(q.bankKey);
  return keys;
}

/**
 * Journals the device-side coin spend (idempotent) and marks it refunded when
 * creation fails afterwards. The refund itself is a coin_grants row the Mini
 * App already applies exactly once (same flow as referral rewards).
 */
async function journalSpend(db: { url: string; key: string }, uid: number, spendId: string, coins: number, purpose: string, refId: string | null): Promise<boolean> {
  const ins = await fetch(`${db.url}/rest/v1/coin_spends?on_conflict=id`, {
    method: 'POST',
    headers: { ...sbHeaders(db.key), prefer: 'return=representation,resolution=ignore-duplicates' },
    body: JSON.stringify({ id: spendId, telegram_user_id: uid, coins, purpose, ref_id: refId, status: 'spent' }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!ins || !ins.ok) return false;
  const rows = (await ins.json().catch(() => [])) as { id: string }[];
  return Array.isArray(rows) && rows.length > 0; // false = retry of an already-journaled spend
}

async function refundSpend(db: { url: string; key: string }, spendId: string, uid: number, coins: number): Promise<void> {
  await fetch(`${db.url}/rest/v1/coin_spends?id=eq.${encodeURIComponent(spendId)}`, {
    method: 'PATCH',
    headers: sbHeaders(db.key),
    body: JSON.stringify({ status: 'refunded', refunded_at: new Date().toISOString() }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => undefined);
  await fetch(`${db.url}/rest/v1/coin_grants?on_conflict=id`, {
    method: 'POST',
    headers: { ...sbHeaders(db.key), prefer: 'return=minimal,resolution=ignore-duplicates' },
    body: JSON.stringify({ id: `gr_qzref_${spendId}`, telegram_user_id: uid, coins, source: 'quiz_refund' }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => undefined);
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const db = supa();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const appUrl = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '') ?? '';
  const enabled = Boolean(db && botToken);

  const q = parseQuery(req.url ?? '');
  const initData = header(req, 'x-telegram-init-data');
  if (req.method === 'GET' && !initData && !q.action) {
    // `why` names the exact missing env vars so the UI banner can show the cause
    // (names only — no secret value is ever sent to the client).
    const missing = [
      !process.env.SUPABASE_URL?.trim() && 'SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() && 'SUPABASE_SERVICE_ROLE_KEY',
      !botToken && 'TELEGRAM_BOT_TOKEN',
    ].filter((v): v is string => Boolean(v));
    res.status(200).json({ enabled, botUsername: enabled && botToken ? await botUsername(botToken) : null, why: enabled ? null : { missing } });
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
  const nuid = Number(uid);
  if (rateLimited(`quiz:${uid}`, 60)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  try {
    // ---------- GET ----------
    if (req.method === 'GET') {
      if (q.action === 'meta') {
        res.status(200).json({
          categories: CATEGORY_IDS,
          difficulties: DIFFICULTY_IDS,
          sizes: [5, 10],
          costs: { 5: 0, 10: EXTENDED_QUIZ_COINS },
          cardThemeCost: CARD_THEME_COINS,
          bank: BANK_STATS,
          botUsername: await botUsername(botToken),
        });
        return;
      }
      if (q.action === 'mine') {
        const [created, attempts] = await Promise.all([
          sbGet<QuizRow>(db, `friend_quizzes?select=id,title,category,difficulty,size,cost_coins,status,created_at&creator_id=eq.${nuid}&order=created_at.desc&limit=20`),
          sbGet<AttemptRow>(db, `friend_quiz_attempts?select=id,quiz_id,player_id,player_name,score,total,duration_ms,created_at&player_id=eq.${nuid}&order=created_at.desc&limit=20`),
        ]);
        // titles for attempted quizzes
        const ids = [...new Set((attempts ?? []).map((a) => a.quiz_id))];
        const quizzes = ids.length ? await sbGet<{ id: string; title: string; creator_name: string }>(db, `friend_quizzes?select=id,title,creator_name&id=in.(${ids.join(',')})`) : [];
        const titleOf = new Map((quizzes ?? []).map((r) => [r.id, r]));
        res.status(200).json({
          created: (created ?? []).map((c) => ({
            id: c.id, title: c.title, category: c.category, difficulty: c.difficulty, size: c.size,
            costCoins: c.cost_coins, status: c.status, createdAt: c.created_at,
          })),
          attempts: (attempts ?? []).map((a) => ({
            id: a.id, quizId: a.quiz_id, score: a.score, total: a.total, durationMs: a.duration_ms,
            createdAt: a.created_at, title: titleOf.get(a.quiz_id)?.title ?? 'Quiz', creator: titleOf.get(a.quiz_id)?.creator_name ?? '',
          })),
        });
        return;
      }
      if (q.action === 'get') {
        const id = q.id ?? '';
        if (!okId(id)) {
          res.status(400).json({ error: 'bad_id' });
          return;
        }
        const rows = await sbGet<QuizRow>(db, `friend_quizzes?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
        const quiz = rows?.[0];
        if (!quiz) {
          res.status(404).json({ error: 'not_found' });
          return;
        }
        const attempts = (await sbGet<AttemptRow>(db, `friend_quiz_attempts?select=*&quiz_id=eq.${encodeURIComponent(id)}&order=score.desc&limit=100`)) ?? [];
        // leaderboard: best score first, ties -> faster finish
        const board = [...attempts].sort((a, b) => b.score - a.score || a.duration_ms - b.duration_ms || a.created_at.localeCompare(b.created_at));
        const mine = attempts.find((a) => a.player_id === nuid) ?? null;
        const isCreator = quiz.creator_id === nuid;
        res.status(200).json({
          quiz: {
            id: quiz.id,
            title: quiz.title,
            creatorId: quiz.creator_id,
            creatorName: quiz.creator_name,
            category: quiz.category,
            difficulty: quiz.difficulty,
            size: quiz.size,
            costCoins: quiz.cost_coins,
            status: quiz.status,
            createdAt: quiz.created_at,
          },
          // questions ship ONLY when there is still something to play (never with answers)
          questions: mine || isCreator || quiz.status !== 'active' ? undefined : (quiz.questions ?? []).map(stripAnswer),
          participants: board.slice(0, 100).map((a) => ({
            playerId: a.player_id, name: a.player_name, avatar: a.player_avatar ?? undefined,
            score: a.score, total: a.total, durationMs: a.duration_ms, at: a.created_at,
          })),
          myAttempt: mine
            ? {
                score: mine.score, total: mine.total, answers: mine.answers, durationMs: mine.duration_ms,
                // my own attempt -> the full copy WITH answers + explanations
                questions: quiz.questions ?? [],
                at: mine.created_at,
              }
            : undefined,
          role: isCreator ? 'creator' : 'player',
          cardThemeCost: CARD_THEME_COINS,
        });
        return;
      }
      res.status(400).json({ error: 'bad_action' });
      return;
    }

    // ---------- POST ----------
    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<string, unknown> | undefined;
      const action = body?.action;

      if (action === 'create') {
        if (rateLimited(`create:${uid}`, 6)) {
          res.status(429).json({ error: 'too_many_requests' });
          return;
        }
        const title = cleanTitle(body?.title);
        const category = String(body?.category ?? '') as QuizCategory;
        const difficulty = String(body?.difficulty ?? '') as QuizDifficulty;
        const size = Math.round(Number(body?.size));
        if (!title) {
          res.status(400).json({ error: 'bad_title' });
          return;
        }
        if (!CATEGORY_IDS.includes(category) || !DIFFICULTY_IDS.includes(difficulty) || (size !== 5 && size !== 10)) {
          res.status(400).json({ error: 'bad_options' });
          return;
        }
        const cost = size === 10 ? EXTENDED_QUIZ_COINS : 0;

        // daily quotas (DB = truth across instances, in-memory only tames bursts)
        const counts = await todayCounts(db, nuid);
        if (counts.created >= DAILY_CREATE_LIMIT) {
          res.status(429).json({ error: 'daily_limit' });
          return;
        }
        if (cost > 0 && counts.paid >= DAILY_PAID_LIMIT) {
          res.status(429).json({ error: 'daily_limit' });
          return;
        }

        // Idempotency: a retried create with the same spendId returns the SAME quiz.
        const spendId = typeof body?.spendId === 'string' && /^cs_[0-9a-zA-Z_]{3,64}$/.test(body.spendId) ? body.spendId : null;
        if (cost > 0) {
          if (!spendId) {
            res.status(402).json({ error: 'spend_required' }); // client must journal the 50-coin spend
            return;
          }
          const existing = await sbGet<QuizRow>(db, `friend_quizzes?select=*&spend_id=eq.${encodeURIComponent(spendId)}&limit=1`);
          if (existing?.[0]) {
            res.status(200).json({ quiz: quizMeta(existing[0]), existing: true });
            return;
          }
        }

        // Build the questions SERVER-SIDE from the verified bank.
        let picked: BankQuestion[];
        try {
          picked = selectQuestions(category, difficulty, size, await recentBankKeys(db, nuid));
        } catch {
          res.status(502).json({ error: 'bank_exhausted' });
          return;
        }
        const rnd = () => crypto.randomBytes(4).readUInt32BE(0) / 0x1_0000_0000;
        const questions: StoredQuestion[] = picked.map((bq) => {
          const s = shuffledQuizOf(bq, rnd);
          return { id: s.id, bankKey: s.bankKey, q: s.q, options: s.options, answer: s.answer, explain: s.explain, level: s.level };
        });

        const id = `fq_${nuid}_${crypto.randomBytes(5).toString('hex')}`;
        const insert = {
          id,
          creator_id: nuid,
          creator_name: creatorNameOf(body),
          title,
          category,
          difficulty,
          size,
          cost_coins: cost,
          status: 'active',
          questions,
          spend_id: cost > 0 ? spendId : null,
        };

        if (cost > 0 && spendId) {
          // Journal the spend (idempotent). When the row already exists this is a RETRY:
          // the client paid once and the quiz never landed — proceed with the SAME spend_id
          // so the payment is honoured exactly once (never refunded AND re-created).
          await journalSpend(db, nuid, spendId, cost, 'quiz_create_10', id);
        }

        const ins = await fetch(`${db.url}/rest/v1/friend_quizzes`, {
          method: 'POST',
          headers: { ...sbHeaders(db.key), prefer: 'return=representation' },
          body: JSON.stringify(insert),
          signal: AbortSignal.timeout(15_000),
        });
        if (!ins.ok) {
          // creation failed AFTER the spend was journaled -> refund through the ledger
          if (cost > 0 && spendId) await refundSpend(db, spendId, nuid, cost);
          res.status(502).json({ error: 'storage_error' });
          return;
        }
        const rows = (await ins.json().catch(() => [])) as QuizRow[];
        const row = rows[0];
        if (!row) {
          if (cost > 0 && spendId) await refundSpend(db, spendId, nuid, cost);
          res.status(502).json({ error: 'storage_error' });
          return;
        }
        res.status(200).json({ quiz: quizMeta(row) });
        return;
      }

      if (action === 'submit') {
        if (rateLimited(`submit:${uid}`, 12)) {
          res.status(429).json({ error: 'too_many_requests' });
          return;
        }
        const id = body?.id;
        const answers = Array.isArray(body?.answers) ? (body?.answers as unknown[]).map((a) => Math.round(Number(a))) : [];
        const durationMs = Math.max(0, Math.min(2 * 3600_000, Math.round(Number(body?.durationMs) || 0)));
        if (!okId(id) || answers.length === 0 || answers.length > 10 || answers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)) {
          res.status(400).json({ error: 'bad_input' });
          return;
        }
        const rows = await sbGet<QuizRow>(db, `friend_quizzes?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
        const quiz = rows?.[0];
        if (!quiz) {
          res.status(404).json({ error: 'not_found' });
          return;
        }
        if (quiz.creator_id === nuid) {
          res.status(403).json({ error: 'own_quiz' });
          return;
        }
        if (quiz.status !== 'active') {
          res.status(409).json({ error: 'quiz_closed' });
          return;
        }
        if (answers.length !== (quiz.questions ?? []).length) {
          res.status(400).json({ error: 'bad_answers' });
          return;
        }
        if (durationMs < answers.length * MIN_MS_PER_QUESTION) {
          res.status(400).json({ error: 'too_fast' }); // anti-cheat: nobody reads a question in 20 ms
          return;
        }
        const score = (quiz.questions ?? []).reduce((acc, question, i) => acc + (answers[i] === question.answer ? 1 : 0), 0);

        // deep-link display name (validated, never trusted for anything else)
        const rawName = typeof body?.playerName === 'string' ? body.playerName : '';
        const playerName = rawName.replace(/[\p{C}]/gu, ' ').trim().slice(0, 24) || 'Do‘st';
        const avatar = typeof body?.playerAvatar === 'string' && body.playerAvatar.length <= 8 ? body.playerAvatar : null;

        const attemptId = `fqa_${crypto.randomBytes(6).toString('hex')}`;
        const ins = await fetch(`${db.url}/rest/v1/friend_quiz_attempts?on_conflict=quiz_id,player_id`, {
          method: 'POST',
          headers: { ...sbHeaders(db.key), prefer: 'return=representation,resolution=ignore-duplicates' },
          body: JSON.stringify({
            id: attemptId, quiz_id: quiz.id, player_id: nuid, player_name: playerName, player_avatar: avatar,
            score, total: quiz.size, answers, duration_ms: durationMs,
          }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!ins.ok) {
          res.status(502).json({ error: 'storage_error' });
          return;
        }
        const saved = (await ins.json().catch(() => [])) as AttemptRow[];
        if (!Array.isArray(saved) || saved.length === 0) {
          res.status(409).json({ error: 'already_attempted' }); // the UNIQUE index is the final say
          return;
        }

        // Tell the creator (respecting their notification preferences; exactly once).
        void dispatch(
          { url: db.url, key: db.key },
          botToken,
          appUrl,
          {
            uid: quiz.creator_id,
            kind: 'quiz',
            eventKey: `result:${quiz.id}:${nuid}`,
            text:
              `📝 ${playerName} sizning «${quiz.title}» testngizni yakunladi!\n\n` +
              `Natija: ${score}/${quiz.size} to‘g‘ri javob${score === quiz.size ? ' — mukammal! 🏆' : score * 2 >= quiz.size ? ' — juda yaxshi! 👏' : ' — keyingi safar albatta yaxshi bo‘ladi 💪'}\n\n` +
              'Batafsil natijalarni ilovada ko‘ring:',
            button: { label: '🏆 Natijalar', webApp: true },
          },
        );

        res.status(200).json({
          result: {
            score,
            total: quiz.size,
            durationMs,
            questions: quiz.questions ?? [], // submission complete -> full copy WITH answers + explanations
            answers,
          },
        });
        return;
      }

      if (action === 'close') {
        const id = body?.id;
        if (!okId(id)) {
          res.status(400).json({ error: 'bad_id' });
          return;
        }
        await fetch(`${db.url}/rest/v1/friend_quizzes?id=eq.${encodeURIComponent(id)}&creator_id=eq.${nuid}&status=eq.active`, {
          method: 'PATCH',
          headers: sbHeaders(db.key),
          body: JSON.stringify({ status: 'closed' }),
          signal: AbortSignal.timeout(15_000),
        });
        res.status(200).json({ ok: true });
        return;
      }

      if (action === 'card') {
        if (rateLimited(`card:${uid}`, 10)) {
          res.status(429).json({ error: 'too_many_requests' });
          return;
        }
        const id = body?.id;
        const theme = body?.theme;
        if (!okId(id) || theme !== 'gold') {
          res.status(400).json({ error: 'bad_input' });
          return;
        }
        const spendId = typeof body?.spendId === 'string' && /^cs_[0-9a-zA-Z_]{3,64}$/.test(body.spendId) ? body.spendId : null;
        if (!spendId) {
          res.status(402).json({ error: 'spend_required' });
          return;
        }
        const ok = await journalSpend(db, nuid, spendId, CARD_THEME_COINS, 'quiz_card', id);
        res.status(200).json({ ok: true, journaled: ok, theme: 'gold', cost: CARD_THEME_COINS }); // journal is audit; unlock is client-side
        return;
      }

      res.status(400).json({ error: 'bad_action' });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('quiz failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}

// ---------------------------------------------------------------------------

function quizMeta(row: QuizRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    size: row.size,
    costCoins: row.cost_coins,
    status: row.status,
    createdAt: row.created_at,
  };
}

function creatorNameOf(body: Record<string, unknown> | undefined): string {
  const raw = typeof body?.creatorName === 'string' ? body.creatorName : '';
  return raw.replace(/[\p{C}]/gu, ' ').trim().slice(0, 24) || 'O‘quvchi';
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

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
