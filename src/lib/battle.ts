// Friendly battle logic: question pool, level-matched Lingo AI, Elo rating math.
// Pure module (no store imports) so pages, actions and tests can use it freely.
import type { Level, PersistedState, Quiz } from '../types';
import { LEVELS } from '../types';
import { GRAMMAR } from '../data/grammar';
import { PLACEMENT } from '../data/placement';
import { BATTLE_EXTRA } from '../data/battle-extra';
import { seededRng } from './games';

// ===== Tunables =====

export const BATTLE_QUESTIONS = 7; // questions per battle
export const AI_BATTLES_PER_DAY = 3; // only the first N AI battles per day change the rating
export const AI_ELO_K = 40; // AI battles move the rating a bit less than real duels (user report: +8..16 per win felt too slow)
export const PVP_ELO_K = 48; // Elo K-factor for player vs player (the server in api/battle.ts uses the same value)
export const QUESTION_TIME_MS = 15_000; // default time per duel question

const PASSAGE_LEN = 160; // questions longer than this (mini-passage items) get extra reading time

/** Time budget for one duel question: 15s normally, 22s when a passage must be read. */
export function timeForQuestion(q: Quiz): number {
  return q.q.length > PASSAGE_LEN ? 22_000 : QUESTION_TIME_MS;
}

/** Climbing gets slower the higher you are: the same win is worth less at 1800 than at 1000. */
export function kScale(rating: number): number {
  return rating < 1300 ? 1 : rating < 1500 ? 0.85 : rating < 1700 ? 0.7 : rating < 1900 ? 0.55 : 0.45;
}
export const aiK = (rating: number): number => Math.max(4, Math.round(AI_ELO_K * kScale(rating)));

export function levelIdx(level: Level): number {
  return LEVELS.indexOf(level);
}

// ===== Question pool =====

/** A duel question that knows which level it belongs to (kept on the client). */
export type BattleQuiz = Quiz & { level: Level };

let poolCache: BattleQuiz[] | null = null;

/** Every battle-eligible question in the app, each tagged with its level. */
function questionPool(): BattleQuiz[] {
  if (poolCache) return poolCache;
  const out: BattleQuiz[] = [];
  // Grammar quizzes are self-contained (question + options + Uzbek explanation).
  // Reading passages are skipped: they are too long to show inside a quick duel.
  for (const l of GRAMMAR) for (const q of l.quiz) out.push({ ...q, level: l.level });
  // Placement questions have short passages — perfect for battles.
  for (const p of PLACEMENT) out.push({ id: p.id, q: p.passage ? `${p.passage}\n\n${p.q}` : p.q, options: p.options, answer: p.answer, explain: p.explain, level: p.level });
  // Extra duel-only challenges so B2/C1 duels are not stuck with easy items.
  for (const q of BATTLE_EXTRA) out.push({ ...q });
  const seen = new Set<string>();
  poolCache = out.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
  return poolCache;
}

function shuffleSeeded<T>(arr: readonly T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Picks n items without replacement, each pick proportional to weight(). */
function sampleWeighted<T>(arr: readonly T[], weight: (x: T) => number, n: number, rnd: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const ws = pool.map(weight);
    const total = ws.reduce((a, b) => a + b, 0);
    let r = rnd() * total;
    let k = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= ws[i];
      if (r <= 0) {
        k = i;
        break;
      }
    }
    out.push(pool.splice(k, 1)[0]);
  }
  return out;
}

/**
 * Level-matched mix of BATTLE_QUESTIONS questions — the same seed always gives
 * the same set, so both players in a PvP battle answer identical questions.
 *
 * The old version picked from everything AT OR BELOW the level, which buried
 * B2/C1 learners under easy A1–A2 items. Now the mix is anchored at the
 * learner's own level: 2 at-level anchors, 1 challenge from the next level up
 * (a real thinking question), and the rest weighted towards the level itself
 * with a little revision below.
 */
export function buildBattleQuestions(level: Level, seed: string): BattleQuiz[] {
  const L = levelIdx(level);
  const rnd = seededRng(`battle:${seed}`);
  const off = (q: BattleQuiz) => levelIdx(q.level) - L;
  // Relative weight by distance from the learner's level.
  const rel = (d: number) => (d === 0 ? 6 : d === -1 ? 2.5 : d === -2 ? 1 : d <= -3 ? 0.4 : d === 1 ? 0.5 : 0);

  const pool = questionPool().filter((q) => rel(off(q)) > 0);
  const out: BattleQuiz[] = [];
  // 1) up to 2 at-level anchors
  out.push(...shuffleSeeded(pool.filter((q) => off(q) === 0), rnd).slice(0, 2));
  // 2) one challenge from the next level up, when the pool has one
  out.push(...shuffleSeeded(pool.filter((q) => off(q) === 1), rnd).slice(0, 1));
  // 3) fill the rest with the weighted mix (no duplicates)
  const chosen = new Set(out.map((q) => q.id));
  const rest = pool.filter((q) => !chosen.has(q.id));
  out.push(...sampleWeighted(rest, (q) => rel(off(q)), Math.max(0, BATTLE_QUESTIONS - out.length), rnd));

  return shuffleSeeded(out, rnd).slice(0, BATTLE_QUESTIONS);
}

// ===== Level-matched Lingo AI =====

/**
 * Lingo's base accuracy. It mirrors the learner's own recent quiz accuracy but
 * stays clearly BELOW it, so the AI is beatable rather than perfect (user
 * report: "the AI mostly answers everything right"). With little history it
 * assumes a modest 55%.
 */
export function aiAccuracy(quizHistory: PersistedState['quizHistory']): number {
  const recent = quizHistory.slice(-25);
  const total = recent.reduce((a, b) => a + b.total, 0);
  const score = recent.reduce((a, b) => a + b.score, 0);
  const base = total >= 10 ? score / total : 0.55;
  return Math.min(0.72, Math.max(0.35, base - 0.1));
}

/**
 * Per-question accuracy: Lingo is also a learner. Above-level (challenge)
 * questions trip it more, much-easier questions it rarely misses.
 */
export function aiAccFor(base: number, qLevel: Level | undefined, userLevel: Level): number {
  if (!qLevel) return base;
  const d = levelIdx(qLevel) - levelIdx(userLevel);
  let a = base;
  if (d >= 1) a -= 0.12; // challenge questions
  else if (d <= -2) a += 0.1; // far-below revision
  return Math.min(0.88, Math.max(0.3, a));
}

/** Deterministic per-battle decision: will Lingo answer question `idx` correctly? */
export function aiCorrectFor(seed: string, idx: number, accuracy: number): boolean {
  return seededRng(`lingo:${seed}:${idx}`)() < accuracy;
}

/**
 * How long the AI "thinks" over a question, in ms. Used to be 1.4–4.6s, which
 * made beating Lingo to the answer nearly impossible; now 3.2–9.6s (a bit
 * longer on challenge questions), so a focused learner can answer first.
 */
export function aiThinkMs(seed: string, idx: number, challenge = false): number {
  const t = 3200 + Math.floor(seededRng(`lingo-t:${seed}:${idx}`)() * 6400); // 3.2s .. 9.6s
  return challenge ? t + 1200 : t;
}

// ===== Elo =====

export type BattleScore = 0 | 0.5 | 1;

export function expectedScore(you: number, opp: number): number {
  return 1 / (1 + 10 ** ((opp - you) / 400));
}

/** Round rating change for one battle. */
export function eloDelta(you: number, opp: number, score: BattleScore, k: number): number {
  return Math.round(k * (score - expectedScore(you, opp)));
}

export function battleResultOf(you: number, them: number): 'win' | 'loss' | 'draw' {
  return you > them ? 'win' : you < them ? 'loss' : 'draw';
}

export function scoreOf(result: 'win' | 'loss' | 'draw'): BattleScore {
  return result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
}

/** How many rated AI battles are left today (0 = unrated zone). */
export function aiRatedLeft(s: PersistedState): number {
  const t = new Date().toISOString().slice(0, 10);
  const used = s.battle.ratedToday.date === t ? s.battle.ratedToday.count : 0;
  return Math.max(0, AI_BATTLES_PER_DAY - used);
}
