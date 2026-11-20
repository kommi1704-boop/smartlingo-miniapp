// Vercel serverless function: the server-authoritative reward engine (Phases 1-6).
// ONE function for everything the XP ledger touches (Hobby-plan function limit):
//
//  GET  /api/xp                (no auth)  -> { enabled }
//  GET  /api/xp?k=me           (auth)     -> { summary, week, isChampion }
//  GET  /api/xp?k=championship (auth)     -> { week, standings, me, champions, prizes }
//  POST { action:'vocab_answers',  items:[{id, known, ctx:'quiz'|'match'}], errors? } -> { granted, evidence, summary, milestone }
//  POST { action:'vocab_learned',  word }   -> { ok, granted, summary } | { ok:false, reason:'evidence' }
//  POST { action:'matching',       errors, items? } -> { granted, capped, duplicate, summary }
//  POST { action:'game_done',      gameId, score, stars, daily, playId } -> { granted, bonus, capped, duplicate, summary, milestone }
//  POST { action:'lesson_done',    lessonKey, score, total } -> { granted, completed, summary, milestone }
//  POST { action:'placement_next', selfLevel, answers } -> { done:false, questions, group } | { done:true, result }
//         (the final call also stores history, awards XP and updates the profile)
//  POST { action:'discovery_get',  level?, interests? } -> { day, item, completed }
//  POST { action:'discovery_done', day }   -> { ok, granted, summary }
//  POST { action:'purchase',       itemId } -> { ok, journal }
//
// Design invariants:
//  - XP amounts NEVER come from the client. The client only reports the action;
//    this file maps it to the fixed rules in _lib/xpcore.ts and the grant_xp RPC
//    applies idempotency + daily caps in the database.
//  - The placement answer key never leaves the server (see _lib/placement-bank.ts).
//  - Streaks advance only through grant_xp (a verified activity), never client-side.
//  - Every failure mode degrades gracefully: {error:'not_configured'} when env is
//    missing so the client can fall back to its offline behavior.
//
// Env (server only): TELEGRAM_BOT_TOKEN, WEBAPP_URL, SUPABASE_URL,
//                    SUPABASE_SERVICE_ROLE_KEY, optional GEMINI/GROQ keys for discovery.
import crypto from 'node:crypto';
import { dispatch } from './_lib/notify.js';
import {
  champTop, events, GAME_IDS, gameXpFor, grantXp, MILESTONES, tashkentDay, weekMonday,
  xpForMatching, xpForBattle, XP_RULES, xpSummary, type GrantResult, type Ledger,
} from './_lib/xpcore.js';
import { adaptiveStep, sanitizeAnswers, LEVELS, type Level } from './_lib/placement-bank.js';
import { catalogItem } from './_lib/catalog.js';
import { generateDiscovery, present, recentKinds, type DiscoveryItem } from './_lib/discover-lib.js';

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

// Strictest variant: auth_date REQUIRED (nothing long-lived), uid format checked.
function validateInitData(initData: string, botToken: string, maxAgeSec = 7 * 24 * 3600): { ok: boolean; userId?: string } {
  if (!initData) return { ok: false };
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false };
  params.delete('hash');
  const dataCheckString = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('\n');
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

function supa(): Ledger | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

async function rest<T>(db: Ledger, path: string, init?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(`${db.url}/rest/v1/${path}`, { headers: { ...sbHeaders(db.key), ...(init?.headers ?? {}) }, ...init, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    const rows = (await r.json().catch(() => null)) as T | null;
    return rows;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Milestone celebration (event-driven — never sent before qualifying activity)
// ---------------------------------------------------------------------------

const MILESTONE_TEXT = (n: number, record: boolean): string =>
  record
    ? `🏆 ${n} kunlik seriya — SHAXSIY REKORD!\n\nHar kuni kichik qadam — bugun esa katta natija. Bu sizning eng uzun seriyangiz! Davom eting, navbatdagi marra yaqin. 🚀`
    : `🎉 ${n} kunlik seriya!\n\nSiz ${n} kun ketma-ket o'rgandingiz — bu katta yutuq! Bonus: +25 XP. Ajoyib odat shakllanmoqda 💪`;

async function maybeCelebrate(db: Ledger, botToken: string | undefined, appUrl: string, uid: number, g: GrantResult | null): Promise<{ milestone: number; record: boolean } | null> {
  const cur = g?.streak?.current ?? 0;
  if (!cur || !MILESTONES.includes(cur) || !botToken) return null;
  const record = cur >= (g?.streak?.longest ?? 0) && cur > 3;
  const granted = await grantXp(db, uid, events.milestone(cur), 'milestone', XP_RULES.milestone.amount, undefined, true);
  await dispatch(db, botToken, appUrl, {
    uid,
    kind: 'achievements',
    eventKey: `milestone:${cur}`,
    text: MILESTONE_TEXT(cur, record),
    button: { label: '🔥 Davom ettirish', webApp: true },
  });
  return { milestone: cur, record };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

interface VocabItem {
  id?: unknown;
  known?: unknown;
  ctx?: unknown;
}

function cleanVocabItems(raw: unknown): { id: string; known: boolean; ctx: 'quiz' | 'match' | 'cards' }[] {
  const out: { id: string; known: boolean; ctx: 'quiz' | 'match' | 'cards' }[] = [];
  if (!Array.isArray(raw)) return out;
  const seen = new Set<string>();
  for (const it of raw.slice(0, 50)) {
    const o = it && typeof it === 'object' ? (it as VocabItem) : null;
    const id = typeof o?.id === 'string' ? o.id.trim().slice(0, 64) : '';
    if (!id || seen.has(id)) continue;
    const known = o?.known === true;
    const ctx = o?.ctx === 'match' ? 'match' : o?.ctx === 'cards' ? 'cards' : 'quiz';
    out.push({ id, known, ctx });
    seen.add(id);
  }
  return out;
}

async function handleVocabAnswers(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const items = cleanVocabItems(body.items);
  if (!items.length) return { error: 'bad_items' };
  const day = tashkentDay();
  let grantedTotal = 0;
  const evidence: { id: string; correct: number; wrong: number }[] = [];
  let lastGrant: GrantResult | null = null;
  for (const it of items) {
    // evidence + XP only for real recall (Test/Matching); flashcard self-reports stay local
    if (it.ctx !== 'quiz' && it.ctx !== 'match') continue;
    await rest(db, 'rpc/record_vocab_answer', { method: 'POST', body: JSON.stringify({ p_uid: uid, p_word: it.id, p_known: it.known }) });
    const ev = await rest<{ correct: number; wrong: number }[]>(db, `vocab_evidence?telegram_user_id=eq.${uid}&word_id=eq.${encodeURIComponent(it.id)}&select=correct,wrong&limit=1`);
    evidence.push({ id: it.id, correct: ev?.[0]?.correct ?? 0, wrong: ev?.[0]?.wrong ?? 0 });
    if (it.known) {
      const g = await grantXp(db, uid, events.vocabQuiz(day, it.id), XP_RULES.vocabQuiz.source, XP_RULES.vocabQuiz.amount, XP_RULES.vocabQuiz.cap, true);
      if (g?.granted) {
        grantedTotal += g.granted;
        lastGrant = g;
      }
    }
  }
  const summary = await xpSummary(db, uid);
  return { granted: grantedTotal, capped: grantedTotal === 0 && !!lastGrant?.capped, evidence, summary, milestone: await maybeCelebrate(db, process.env.TELEGRAM_BOT_TOKEN?.trim(), appUrlOf(), uid, lastGrant) };
}

async function handleVocabLearned(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const word = typeof body.word === 'string' ? body.word.trim().slice(0, 64) : '';
  if (!word) return { error: 'bad_word' };
  const j = await rest<{ ok: boolean; correct: number }[]>(db, 'rpc/mark_word_learned', { method: 'POST', body: JSON.stringify({ p_uid: uid, p_word: word }) });
  const ok = j?.[0]?.ok === true || (j as unknown as { ok?: boolean })?.ok === true;
  if (!ok) return { ok: false, reason: 'evidence', correct: j?.[0]?.correct ?? (j as unknown as { correct?: number })?.correct ?? 0 };
  const g = await grantXp(db, uid, events.vocabLearned(word), XP_RULES.vocabLearned.source, XP_RULES.vocabLearned.amount, XP_RULES.vocabLearned.cap, true);
  const summary = await xpSummary(db, uid);
  return { ok: true, granted: g?.granted ?? 0, capped: !!g?.capped, duplicate: !!g?.duplicate, summary, milestone: await maybeCelebrate(db, process.env.TELEGRAM_BOT_TOKEN?.trim(), appUrlOf(), uid, g) };
}

async function handleMatching(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const errors = Number(body.errors);
  if (!Number.isFinite(errors) || errors < 0 || errors > 100) return { error: 'bad_errors' };
  const items = cleanVocabItems(body.items).filter((i) => i.ctx === 'match');
  for (const it of items) {
    await rest(db, 'rpc/record_vocab_answer', { method: 'POST', body: JSON.stringify({ p_uid: uid, p_word: it.id, p_known: it.known }) });
  }
  const day = tashkentDay();
  const g = await grantXp(db, uid, events.vocabMatch(day), XP_RULES.vocabMatch.source, xpForMatching(errors), XP_RULES.vocabMatch.cap, true);
  const summary = await xpSummary(db, uid);
  return {
    granted: g?.granted ?? 0,
    capped: !!g?.capped,
    duplicate: !!g?.duplicate,
    summary,
    milestone: await maybeCelebrate(db, process.env.TELEGRAM_BOT_TOKEN?.trim(), appUrlOf(), uid, g),
  };
}

/** Lesson-key contract: `part:part`, each part [a-z0-9-] max 41 chars (also exported for tests). */
export const LESSON_KEY_RE = /^[a-z0-9][a-z0-9-]{0,40}:[a-z0-9][a-z0-9-]{0,40}$/i;

/** O'yinlar page (memory/runner/scramble/blitz/listen): fixed per-result reward, 60 XP/day cap,
 *  daily-challenge bonus (+15, idempotent once per day). XP amounts come from the server rules,
 *  never from the client — the client only reports gameId/score/stars/daily plus a play id. */
async function handleGameDone(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const gameId = String(body.gameId ?? '');
  if (!(GAME_IDS as readonly string[]).includes(gameId)) return { error: 'bad_game' };
  const stars = Number(body.stars);
  const score = Number(body.score);
  if (!Number.isInteger(stars) || stars < 0 || stars > 3) return { error: 'bad_stars' };
  if (!Number.isFinite(score) || score < 0 || score > 100_000) return { error: 'bad_score' };
  const daily = body.daily === true;
  const day = tashkentDay();
  const playId = String(body.playId ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  const g = await grantXp(db, uid, events.gamePlay(day, playId), XP_RULES.game.source, gameXpFor(stars), XP_RULES.game.cap, true);
  let bonus = 0;
  let bonusCapped = false;
  if (daily && stars >= 1) {
    const gb = await grantXp(db, uid, events.gameDaily(day), XP_RULES.gameDaily.source, XP_RULES.gameDaily.amount, XP_RULES.gameDaily.cap, true);
    bonus = gb?.granted ?? 0;
    bonusCapped = !!gb?.capped;
  }
  return {
    granted: (g?.granted ?? 0) + bonus,
    bonus,
    capped: !!g?.capped || bonusCapped,
    duplicate: !!g?.duplicate,
    summary: await xpSummary(db, uid),
    milestone: await maybeCelebrate(db, process.env.TELEGRAM_BOT_TOKEN?.trim(), appUrlOf(), uid, g),
  };
}

async function handleLessonDone(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const lessonKey = typeof body.lessonKey === 'string' ? body.lessonKey.trim() : '';
  const score = Number(body.score);
  const total = Number(body.total);
  if (!LESSON_KEY_RE.test(lessonKey) || !Number.isInteger(score) || !Number.isInteger(total) || total < 1 || total > 100 || score < 0 || score > total) {
    return { error: 'bad_lesson' };
  }
  const day = tashkentDay();
  const completed = score / total >= 0.6;
  let granted = 0;
  let lastGrant: GrantResult | null = null;
  if (completed) {
    const g1 = await grantXp(db, uid, events.lessonDay(lessonKey, day), XP_RULES.lessonDay.source, XP_RULES.lessonDay.amount, XP_RULES.lessonDay.cap, true);
    if (g1?.granted) {
      granted += g1.granted;
      lastGrant = g1;
    }
    const first = await grantXp(db, uid, events.lessonFirst(lessonKey), XP_RULES.lessonFirst.source, XP_RULES.lessonFirst.amount, undefined, true);
    if (first?.granted) {
      granted += first.granted;
      lastGrant = first;
    }
    if (score === total && total >= 3) {
      const gp = await grantXp(db, uid, events.lessonPerfect(lessonKey, day), XP_RULES.lessonPerfect.source, XP_RULES.lessonPerfect.amount, XP_RULES.lessonDay.cap, true);
      if (gp?.granted) {
        granted += gp.granted;
        lastGrant = gp;
      }
    }
  }
  const summary = await xpSummary(db, uid);
  return { completed, granted, capped: granted === 0 && !!lastGrant?.capped, summary, milestone: await maybeCelebrate(db, process.env.TELEGRAM_BOT_TOKEN?.trim(), appUrlOf(), uid, lastGrant) };
}

function cleanLevel(v: unknown): Level {
  return LEVELS.includes(v as Level) ? (v as Level) : 'A2';
}

async function handlePlacementNext(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const selfLevel = cleanLevel(body.selfLevel);
  const answers = sanitizeAnswers(body.answers);
  const step = adaptiveStep(selfLevel, answers);
  if (!step.done) {
    return { done: false, questions: step.questions, group: step.group, answeredCount: step.answeredCount };
  }
  const result = step.result;
  const day = tashkentDay();
  // history: one row per learner per day (upsert keeps the day's latest attempt)
  await rest(db, 'placement_history?on_conflict=id', {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: `ph_${uid}_${day}`,
      telegram_user_id: uid,
      level: result.level,
      confidence: result.confidence,
      score: result.total,
      asked: result.asked,
      by_section: { vocabulary: result.bySection.vocabulary, grammar: result.bySection.grammar, reading: result.bySection.reading },
      source: 'server',
      day,
    }),
  });
  await rest(db, 'learner_profiles?on_conflict=telegram_user_id', {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ telegram_user_id: uid, level: result.level, updated_at: new Date().toISOString() }),
  });
  const g = await grantXp(db, uid, events.placement(day), XP_RULES.placement.source, XP_RULES.placement.amount, XP_RULES.placement.cap, true);
  const summary = await xpSummary(db, uid);
  return { done: true, result, granted: g?.granted ?? 0, summary, milestone: await maybeCelebrate(db, process.env.TELEGRAM_BOT_TOKEN?.trim(), appUrlOf(), uid, g) };
}

function hashSeed(uid: number, day: string): number {
  let h = 2166136261;
  const s = `${uid}:${day}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function handleDiscoveryGet(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const day = tashkentDay();
  const existing = await rest<{ kind: string; payload: DiscoveryItem; completed: boolean }[]>(
    db,
    `discovery?telegram_user_id=eq.${uid}&day=eq.${day}&select=kind,payload,completed&limit=1`,
  );
  if (existing?.[0]) {
    return { day, item: present(existing[0].payload), completed: existing[0].completed === true };
  }
  const level = cleanLevel(body.level);
  const interests = Array.isArray(body.interests) ? (body.interests as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 6).map((s) => s.slice(0, 24)) : [];
  await rest(db, 'learner_profiles?on_conflict=telegram_user_id', {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ telegram_user_id: uid, level, interests, updated_at: new Date().toISOString() }),
  });
  const recentRows = (await rest<{ kind: string; day: string }[]>(db, `discovery?telegram_user_id=eq.${uid}&order=day.desc&limit=7&select=kind,day`)) ?? [];
  const seenKinds = recentKinds(recentRows, 7, day);
  const item = await generateDiscovery({ level, interests, seenKinds, day, seed: hashSeed(uid, day) });
  const saved = await rest<boolean>(db, 'rpc/record_discovery', {
    method: 'POST',
    body: JSON.stringify({ p_uid: uid, p_day: day, p_kind: item.kind, p_payload: item }),
  });
  if (saved === false) {
    // another device wrote first — return its row (cache is per user per day)
    const winner = await rest<{ kind: string; payload: DiscoveryItem; completed: boolean }[]>(db, `discovery?telegram_user_id=eq.${uid}&day=eq.${day}&select=kind,payload,completed&limit=1`);
    if (winner?.[0]) return { day, item: present(winner[0].payload), completed: winner[0].completed === true };
  }
  return { day, item: present(item), completed: false };
}

async function handleDiscoveryDone(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const day = typeof body.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.day) ? body.day : tashkentDay();
  if (day !== tashkentDay()) return { error: 'bad_day' };
  const done = await rest<boolean>(db, 'rpc/complete_discovery', { method: 'POST', body: JSON.stringify({ p_uid: uid, p_day: day }) });
  let granted = 0;
  if (done === true) {
    const g = await grantXp(db, uid, events.discovery(day), XP_RULES.discovery.source, XP_RULES.discovery.amount, XP_RULES.discovery.cap, true);
    granted = g?.granted ?? 0;
  }
  const summary = await xpSummary(db, uid);
  return { ok: true, granted, summary };
}

async function isChampion(db: Ledger, uid: number): Promise<boolean> {
  const rows = await rest<{ week_start: string }[]>(db, `champions?telegram_user_id=eq.${uid}&place=eq.1&select=week_start&limit=1`);
  return !!rows?.length;
}

async function handlePurchase(db: Ledger, uid: number, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const itemId = typeof body.itemId === 'string' ? body.itemId.trim().slice(0, 64) : '';
  const item = itemId ? catalogItem(itemId) : undefined;
  if (!item) return { error: 'bad_item' };
  if (item.kind === 'unlock') {
    // earned cosmetics cannot be bought — champion frame is granted by settlement
    return { error: item.unlock === 'champion' ? 'champion_only' : 'locked' };
  }
  const ok = await rest<boolean>(db, 'rpc/record_purchase', {
    method: 'POST',
    body: JSON.stringify({ p_uid: uid, p_item: item.id, p_coins: item.price, p_kind: item.kind }),
  });
  return { ok: true, journal: ok === true };
}

async function handleMe(db: Ledger, uid: number): Promise<Record<string, unknown>> {
  const summary = await xpSummary(db, uid);
  const weekStart = weekMonday(tashkentDay());
  const weekEnd = new Date(`${weekStart}T00:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const daysLeft = Math.max(1, Math.ceil((weekEnd.getTime() - Date.now()) / 86_400_000));
  return { summary, week: { start: weekStart, end: weekEnd.toISOString().slice(0, 10), daysLeft }, isChampion: await isChampion(db, uid) };
}

async function handleChampionship(db: Ledger, uid: number): Promise<Record<string, unknown>> {
  const day = tashkentDay();
  const weekStart = weekMonday(day);
  const top = await champTop(db, weekStart, 50);
  const ids = top.map((r) => r.uid);
  let identities: { telegram_user_id: number; username: string | null; first_name: string | null }[] = [];
  if (ids.length) {
    identities = (await rest(db, `identities?telegram_user_id=in.(${ids.join(',')})&select=telegram_user_id,username,first_name&limit=100`)) ?? [];
  }
  const nameOf = (id: number) => {
    const row = identities.find((x) => Number(x.telegram_user_id) === id);
    return (row?.first_name || row?.username || 'O‘quvchi').slice(0, 24);
  };
  const standings = top.map((r, i) => ({ rank: i + 1, uid: r.uid, xp: r.xp, name: nameOf(r.uid), me: r.uid === uid }));
  const myRow = standings.find((s) => s.uid === uid);
  const myXp = myRow?.xp ?? (await xpSummary(db, uid))?.xpWeek ?? 0;
  const myRank = myRow?.rank ?? (myXp > 0 ? null : null);
  const histRows = (await rest<{ week_start: string; place: number; telegram_user_id: number; xp: number; prizes: Record<string, unknown> }[]>(
    db,
    `champions?order=week_start.desc&limit=24&select=week_start,place,telegram_user_id,xp,prizes`,
  )) ?? [];
  const weekMap = new Map<string, { rank: number; uid: number; xp: number; name?: string }[]>();
  for (const r of histRows) {
    const list = weekMap.get(r.week_start) ?? [];
    list.push({ rank: r.place, uid: Number(r.telegram_user_id), xp: Number(r.xp) || 0, name: nameOf(Number(r.telegram_user_id)) });
    weekMap.set(r.week_start, list);
  }
  const history = [...weekMap.entries()].slice(0, 8).map(([week, winners]) => ({ week, winners: winners.sort((a, b) => a.rank - b.rank) }));
  const weekEnd = new Date(`${weekStart}T00:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  return {
    week: { start: weekStart, end: weekEnd.toISOString().slice(0, 10), daysLeft: Math.max(1, Math.ceil((weekEnd.getTime() - Date.now()) / 86_400_000)) },
    standings,
    me: { uid, xp: myXp, rank: myRow?.rank ?? null, provisional: !myRow && myXp > 0 },
    champions: history,
    isChampion: await isChampion(db, uid),
  };
}

function appUrlOf(): string {
  return process.env.WEBAPP_URL?.trim().replace(/\/+$/, '') ?? '';
}

function kOf(req: Req): string {
  try {
    return new URL(req.url ?? '', 'http://local').searchParams.get('k') ?? '';
  } catch {
    return '';
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
  const uid = Number(auth.userId);
  if (rateLimited(auth.userId)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  try {
    const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<string, unknown> | undefined;
    const action = req.method === 'GET' ? kOf(req) : String(body?.action ?? '');

    // ---- GET endpoints ----
    if (req.method === 'GET') {
      if (action === 'me') {
        res.status(200).json(await handleMe(db, uid));
        return;
      }
      if (action === 'championship') {
        res.status(200).json(await handleChampionship(db, uid));
        return;
      }
      res.status(400).json({ error: 'bad_action' });
      return;
    }

    // ---- POST actions ----
    switch (action) {
      case 'vocab_answers':
        res.status(200).json(await handleVocabAnswers(db, uid, body ?? {}));
        return;
      case 'vocab_learned':
        res.status(200).json(await handleVocabLearned(db, uid, body ?? {}));
        return;
      case 'matching':
        res.status(200).json(await handleMatching(db, uid, body ?? {}));
        return;
      case 'game_done':
        res.status(200).json(await handleGameDone(db, uid, body ?? {}));
        return;
      case 'lesson_done':
        res.status(200).json(await handleLessonDone(db, uid, body ?? {}));
        return;
      case 'placement_next':
        res.status(200).json(await handlePlacementNext(db, uid, body ?? {}));
        return;
      case 'discovery_get':
        res.status(200).json(await handleDiscoveryGet(db, uid, body ?? {}));
        return;
      case 'discovery_done':
        res.status(200).json(await handleDiscoveryDone(db, uid, body ?? {}));
        return;
      case 'purchase':
        res.status(200).json(await handlePurchase(db, uid, body ?? {}));
        return;
      case 'battle_done': {
        // verified PvP result (called by api/battle.ts internally, exposed for future use)
        const battleId = typeof body?.battleId === 'string' ? body.battleId.trim().slice(0, 48) : '';
        const result = body?.result === 'win' || body?.result === 'draw' || body?.result === 'loss' ? body.result : null;
        if (!battleId || !result) {
          res.status(400).json({ error: 'bad_battle' });
          return;
        }
        const g = await grantXp(db, uid, events.battle(battleId, result), XP_RULES.battleWin.source, xpForBattle(result), XP_RULES.battleWin.cap, true);
        res.status(200).json({ granted: g?.granted ?? 0, summary: await xpSummary(db, uid) });
        return;
      }
      default:
        res.status(400).json({ error: 'bad_action' });
        return;
    }
  } catch (e) {
    console.error('xp failure', e instanceof Error ? e.message : String(e));
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
