// Verified question bank for the Friend Quiz, built from SmartLingo's OWN
// reviewed educational content — no new question sources are introduced:
//   grammar  -> the 34 grammar lessons' quizzes (src/data/grammar*.ts, level-tagged)
//   grammar  -> the battle-only "think first" pool (src/data/battle-extra.ts, level-tagged)
//   vocab    -> generated from the app's 380+ reviewed words (src/data/vocab*.ts)
//               exactly like the in-app vocabulary quiz builds them
//               (same word → same question, deterministic ids/keys, so the
//               "no duplicate questions" rule is checkable and testable).
// The bank is built ONCE per serverless instance at module load, fully
// deterministically (no Math.random here) — randomness (question order, option
// order, selection) happens at quiz-creation time in api/quiz.ts.
import type { Level, Quiz } from '../../src/types';
import { GRAMMAR } from '../../src/data/grammar';
import { BATTLE_EXTRA } from '../../src/data/battle-extra';
import { VOCAB } from '../../src/data/vocab';

export type QuizCategory = 'vocab' | 'grammar' | 'mixed' | 'random';
export type QuizDifficulty = 'beginner' | 'elementary' | 'intermediate' | 'advanced';

export const CATEGORY_IDS: QuizCategory[] = ['vocab', 'grammar', 'mixed', 'random'];
export const DIFFICULTY_IDS: QuizDifficulty[] = ['beginner', 'elementary', 'intermediate', 'advanced'];

/** Difficulty -> CEFR levels. Must stay in sync with the UI labels (src/pages/QuizFriends.tsx). */
export const DIFFICULTY_LEVELS: Record<QuizDifficulty, Level[]> = {
  beginner: ['Pre-A1', 'A1'],
  elementary: ['A2'],
  intermediate: ['B1'],
  advanced: ['B2', 'C1', 'C2'],
};

const LEVEL_INDEX: Record<Level, number> = { 'Pre-A1': 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

export interface BankQuestion {
  key: string; // stable unique key ("g:g07:2" / "v:v031")
  q: string;
  options: string[]; // exactly 4
  answer: number; // index into options
  explain: string; // Uzbek explanation (shown only AFTER submission)
  category: 'vocab' | 'grammar';
  level: Level;
}

// ---------------------------------------------------------------------------
// Grammar pool — every lesson quiz item, tagged with the lesson's CEFR level.
// ---------------------------------------------------------------------------

const GRAMMAR_POOL: BankQuestion[] = [];
{
  const seen = new Set<string>();
  for (const lesson of GRAMMAR) {
    lesson.quiz.forEach((item, i) => {
      const dupKey = item.q.trim().toLowerCase();
      if (seen.has(dupKey)) return; // the same question text never enters the bank twice
      if (item.options.length !== 4 || item.answer < 0 || item.answer > 3) return;
      seen.add(dupKey);
      GRAMMAR_POOL.push({
        key: `g:${lesson.id}:${i}`,
        q: item.q,
        options: item.options,
        answer: item.answer,
        explain: item.explain,
        category: 'grammar',
        level: lesson.level,
      });
    });
  }
  for (const item of BATTLE_EXTRA) {
    const dupKey = item.q.trim().toLowerCase();
    if (seen.has(dupKey)) continue;
    if (item.options.length !== 4 || item.answer < 0 || item.answer > 3) continue;
    seen.add(dupKey);
    GRAMMAR_POOL.push({
      key: `g:bx:${GRAMMAR_POOL.length}`,
      q: item.q,
      options: item.options,
      answer: item.answer,
      explain: item.explain,
      category: 'grammar',
      level: item.level,
    });
  }
}

// ---------------------------------------------------------------------------
// Vocab pool — one deterministic question per reviewed word, alternating the
// two directions the in-app quiz uses (en->uz / uz->en). Distractors prefer the
// SAME level, then any level; ties resolved by id so the bank never changes
// between runs (stable keys -> the duplicate-exclusion logic is reliable).
// ---------------------------------------------------------------------------

const VOCAB_POOL: BankQuestion[] = [];
{
  const byId = [...VOCAB].sort((a, b) => (a.id < b.id ? -1 : 1));
  const takenTexts = new Set<string>();
  byId.forEach((w, wi) => {
    const toUz = wi % 2 === 0;
    const near = byId.filter((x) => x.id !== w.id && x.level === w.level && x.uz !== w.uz && x.en !== w.en);
    const rest = byId.filter((x) => x.id !== w.id && x.uz !== w.uz && x.en !== w.en);
    const distract = (near.length >= 3 ? near.slice(0, 3) : [...near, ...rest.slice(0, 3 - near.length)]).slice(0, 3);
    if (distract.length < 3) return;
    const opts = [w, ...distract];
    const options = opts.map((x) => (toUz ? x.uz : x.en));
    // de-dupe options (two words may share an Uzbek meaning like "ona, oyi")
    const uniq = new Set(options);
    if (uniq.size !== 4) return;
    const q = toUz ? `“${w.en}” so‘zining ma’nosi qaysi?` : `Qaysi inglizcha so‘z “${w.uz}” degani?`;
    // two words may share one Uzbek gloss — the FIRST word wins the question text,
    // so the bank never carries the same question twice (selection is text-based too)
    const textKey = q.trim().toLowerCase();
    if (takenTexts.has(textKey)) return;
    takenTexts.add(textKey);
    VOCAB_POOL.push({
      key: `v:${w.id}`,
      q,
      options,
      answer: 0, // the correct word always sits at index 0 pre-shuffle; api/quiz.ts shuffles per quiz
      explain: `${w.en} = ${w.uz}. Misol: ${w.exEn}`,
      category: 'vocab',
      level: w.level,
    });
  });
}

const POOLS: Record<'vocab' | 'grammar', BankQuestion[]> = { vocab: VOCAB_POOL, grammar: GRAMMAR_POOL };

/** Bank sizes (also asserted by tests/quiz.test.ts). */
export const BANK_STATS = {
  vocab: VOCAB_POOL.length,
  grammar: GRAMMAR_POOL.length,
  total: VOCAB_POOL.length + GRAMMAR_POOL.length,
};

export function categoryPool(category: QuizCategory): BankQuestion[] {
  if (category === 'vocab') return POOLS.vocab;
  if (category === 'grammar') return POOLS.grammar;
  return [...POOLS.vocab, ...POOLS.grammar]; // mixed & random use everything
}

/**
 * Selects `size` unique questions for a new quiz:
 *  1. exact difficulty levels -> widen by CEFR distance when the pool is short
 *     (a 10-question quiz is ALWAYS possible, even for rare level buckets);
 *  2. drops questions used in the creator's recent quizzes (excludeKeys);
 *  3. never repeats a question text within one quiz.
 * Throws when the bank itself is exhausted (practically impossible: 500+ items).
 */
export function selectQuestions(
  category: QuizCategory,
  difficulty: QuizDifficulty,
  size: number,
  excludeKeys: string[] = [],
): BankQuestion[] {
  const pool = categoryPool(category);
  const base = LEVEL_INDEX[DIFFICULTY_LEVELS[difficulty][0]];
  const wanted = new Set<Level>(DIFFICULTY_LEVELS[difficulty]);
  const excluded = new Set(excludeKeys);

  const pick = (levels: Set<Level>, usedTexts: Set<string>, take: number): BankQuestion[] => {
    const candidates = pool.filter((c) => levels.has(c.level) && !excluded.has(c.key) && !usedTexts.has(c.q.trim().toLowerCase()));
    // deterministic shuffle by key-hash so selection is unbiased but testable
    const shuffled = [...candidates].sort((a, b) => hashKey(a.key) - hashKey(b.key));
    return shuffled.slice(0, take);
  };

  const usedTexts = new Set<string>();
  const out: BankQuestion[] = [];
  for (const c of pick(wanted, usedTexts, size)) {
    usedTexts.add(c.q.trim().toLowerCase());
    out.push(c);
  }
  // widen: neighbouring CEFR levels, then the whole pool as a last resort
  for (let dist = 1; dist <= 6 && out.length < size; dist++) {
    const near = new Set<Level>(
      [...wanted, ...Object.keys(LEVEL_INDEX) as Level[]].filter((l) => Math.abs(LEVEL_INDEX[l] - base) <= dist),
    );
    for (const c of pick(near, usedTexts, size - out.length)) {
      usedTexts.add(c.q.trim().toLowerCase());
      out.push(c);
    }
  }
  if (out.length < size) {
    for (const c of pick(new Set(Object.keys(LEVEL_INDEX) as Level[]), usedTexts, size - out.length)) {
      usedTexts.add(c.q.trim().toLowerCase());
      out.push(c);
    }
  }
  if (out.length < size) throw new Error('bank_exhausted');
  return out;
}

/** Small stable string hash (FNV-1a) — only used to shuffle deterministically. */
function hashKey(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Per-quiz shuffling (creation time). Question order AND option order are
// randomized; the answer index is remapped so the stored copy stays correct.
// ---------------------------------------------------------------------------

export function shuffledQuizOf(bq: BankQuestion, rnd: () => number): Quiz & { level: Level; bankKey: string } {
  const order = bq.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    id: bq.key,
    bankKey: bq.key,
    q: bq.q,
    options: order.map((i) => bq.options[i]),
    answer: order.indexOf(bq.answer),
    explain: bq.explain,
    level: bq.level,
  };
}
