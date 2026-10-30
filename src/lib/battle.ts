// Friendly battle logic: question pool, level-matched Lingo AI, Elo rating math.
// Pure module (no store imports) so pages, actions and tests can use it freely.
import type { Level, PersistedState, Quiz } from '../types';
import { LEVELS } from '../types';
import { GRAMMAR } from '../data/grammar';
import { PLACEMENT } from '../data/placement';
import { seededRng } from './games';

// ===== Tunables =====

export const BATTLE_QUESTIONS = 7; // questions per battle
export const AI_BATTLES_PER_DAY = 5; // only the first N AI battles per day change the rating
export const AI_ELO_K = 20; // AI battles move the rating less than real duels
export const PVP_ELO_K = 32; // standard Elo K-factor for player vs player
export const RATING_FLOOR = 900; // the rating never drops below this (kids stay motivated)

export function levelIdx(level: Level): number {
  return LEVELS.indexOf(level);
}

// ===== Question pool =====

type LeveledQuiz = Quiz & { level: Level };

let poolCache: LeveledQuiz[] | null = null;

/** Every battle-eligible question in the app, each tagged with its level. */
function questionPool(): LeveledQuiz[] {
  if (poolCache) return poolCache;
  const out: LeveledQuiz[] = [];
  // Grammar quizzes are self-contained (question + options + Uzbek explanation).
  // Reading passages are skipped: they are too long to show inside a quick duel.
  for (const l of GRAMMAR) for (const q of l.quiz) out.push({ ...q, level: l.level });
  // Placement questions have short passages — perfect for battles.
  for (const p of PLACEMENT) out.push({ id: p.id, q: p.passage ? `${p.passage}\n\n${p.q}` : p.q, options: p.options, answer: p.answer, explain: p.explain, level: p.level });
  const seen = new Set<string>();
  poolCache = out.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
  return poolCache;
}

/**
 * Picks BATTLE_QUESTIONS questions at/below the learner's level (a bit above when the pool is small).
 * The same seed always gives the same set — both players in a PvP battle answer identical questions.
 */
export function buildBattleQuestions(level: Level, seed: string): Quiz[] {
  const maxIdx = Math.max(0, levelIdx(level));
  const pool = questionPool();
  let candidates = pool.filter((q) => levelIdx(q.level) <= maxIdx);
  if (candidates.length < BATTLE_QUESTIONS * 2) candidates = pool.filter((q) => levelIdx(q.level) <= maxIdx + 1);
  if (candidates.length < BATTLE_QUESTIONS) candidates = pool;
  const rnd = seededRng(`battle:${seed}`);
  const arr = [...candidates];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, BATTLE_QUESTIONS).map(({ level: _lv, ...q }) => {
    void _lv;
    return q;
  });
}

// ===== Level-matched Lingo AI =====

/**
 * The AI's accuracy mirrors the learner's own recent quiz accuracy, so it plays
 * neither stronger nor weaker than them. With little history it assumes 60%.
 */
export function aiAccuracy(quizHistory: PersistedState['quizHistory']): number {
  const recent = quizHistory.slice(-25);
  const total = recent.reduce((a, b) => a + b.total, 0);
  const score = recent.reduce((a, b) => a + b.score, 0);
  const base = total >= 10 ? score / total : 0.6;
  return Math.min(0.9, Math.max(0.3, base));
}

/** Deterministic per-battle decision: will Lingo answer question `idx` correctly? */
export function aiCorrectFor(seed: string, idx: number, accuracy: number): boolean {
  return seededRng(`lingo:${seed}:${idx}`)() < accuracy;
}

/** How long the AI "thinks" over a question, in ms (for the live duel feel). */
export function aiThinkMs(seed: string, idx: number): number {
  return 1400 + Math.floor(seededRng(`lingo-t:${seed}:${idx}`)() * 3200); // 1.4s .. 4.6s
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
