// The Learning Profile engine.
//
// Every learner answer leaves a trace (quiz results, SRS reviews, writing checks, mistakes).
// This module turns those traces into ONE coherent picture of the learner. It is derived on
// demand from the persisted state — so it is always up to date, needs no extra storage, and
// never invents evidence: when there is not enough data, the field is null and the UI/AI
// are told "unknown" instead of a guess.
//
// PRIVACY: aiDigest() exports only aggregates (levels, topic titles, counts). It never
// contains chat messages, essay texts or recordings, so it is safe to send to the AI endpoints.

import type { ContentKind, Level, PersistedState, QuizHistoryItem, Skill } from '../types';
import { LEVELS } from '../types';
import { GRAMMAR } from '../data/grammar';
import { VOCAB } from '../data/vocab';
import { isDue } from './srs';
import { lastDays, today as todayStr } from './dates';

const ALL: Skill[] = ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing'];

export interface SkillEvidence {
  /** Recent accuracy 0..1, or null with fewer than MIN_EVIDENCE answered items. */
  accuracy: number | null;
  /** How many answerable items the accuracy rests on. */
  attempts: number;
  /** YYYY-MM-DD of the last activity in this skill, if any. */
  lastActive?: string;
  /** True when the learner has practised this skill at least once. */
  started: boolean;
}

export interface GrammarTopicState {
  id: string;
  title: string;
  level: Level;
  status: 'done' | 'weak' | 'fresh'; // done >= 80%, weak = attempted below 80%, fresh = untouched
  bestRatio: number | null; // null when never attempted
}

export interface VocabProfile {
  seen: number; // words with any progress record
  learning: number;
  learned: number;
  dueToday: number;
  /** correct / reviews over all reviewed words, or null when nothing was reviewed yet. */
  retention: number | null;
  /** Words forgotten at least once (hardest first, max 12 ids). */
  struggling: string[];
}

export interface WritingProfile {
  submissions: number;
  /** Issues per 10 words across recent submissions (lower is better), or null. */
  issuesPer10: number | null;
  lastDate?: string;
}

export interface LearnerProfile {
  skills: Record<Skill, SkillEvidence>;
  grammar: GrammarTopicState[];
  vocab: VocabProfile;
  writing: WritingProfile;
  speaking: { completions: number; lastDate?: string };
  /** Uncorrected mistakes: newest first. `top` = most frequent question stems (max 5). */
  mistakes: { open: number; total: number; top: { question: string; count: number; kind: ContentKind }[] };
  /** Grammar/reading topics the learner should revise soon (weakest first, max 6). */
  reviseTopics: { key: string; kind: ContentKind; title: string; ratio: number }[];
  /** Learning speed signals from the last 7 days. */
  speed: { activeDays: number; xp: number; quizzes: number; lessonsCompleted: number };
}

const MIN_EVIDENCE = 8; // same threshold plan.ts used: below this, accuracy stays unknown

function accuracyOf(history: QuizHistoryItem[], kinds: string[]): SkillEvidence {
  const items = history.filter((q) => kinds.includes(q.kind));
  if (!items.length) return { accuracy: null, attempts: 0, started: false };
  const recent = items.slice(-20);
  const total = recent.reduce((a, b) => a + b.total, 0);
  const score = recent.reduce((a, b) => a + b.score, 0);
  const lastActive = [...items].reverse().find((q) => q.date)?.date;
  return {
    accuracy: total >= MIN_EVIDENCE ? score / total : null,
    attempts: total,
    started: true,
    lastActive: lastActive ? lastActive.slice(0, 10) : undefined,
  };
}

function grammarTopics(s: PersistedState): GrammarTopicState[] {
  return GRAMMAR.map((g) => {
    const r = s.lessons[`grammar:${g.id}`];
    if (!r || r.attempts === 0) return { id: g.id, title: g.title, level: g.level, status: 'fresh' as const, bestRatio: null };
    const ratio = r.total ? r.bestScore / r.total : 0;
    return { id: g.id, title: g.title, level: g.level, status: ratio >= 0.8 ? ('done' as const) : ('weak' as const), bestRatio: ratio };
  });
}

export function buildLearnerProfile(s: PersistedState, now: string = todayStr()): LearnerProfile {
  // --- skills ---
  const skills = {
    vocabulary: accuracyOf(s.quizHistory, ['vocab-quiz', 'matching', 'placement']),
    grammar: accuracyOf(s.quizHistory, ['grammar']),
    reading: accuracyOf(s.quizHistory, ['reading']),
    listening: accuracyOf(s.quizHistory, ['listening']),
    speaking: { accuracy: null, attempts: 0, started: Object.keys(s.speakingDone).length > 0 },
    writing: { accuracy: null, attempts: 0, started: s.writing.length > 0 },
  } as Record<Skill, SkillEvidence>;

  // --- vocabulary ---
  const allVocab = VOCAB; // already includes base + B1 + B2 files
  const progress = allVocab.map((w) => s.vocab[w.id]).filter(Boolean);
  const reviews = progress.reduce((a, p) => a + p.reviews, 0);
  const correct = progress.reduce((a, p) => a + p.correct, 0);
  const dueToday = allVocab.filter((w) => isDue(s.vocab[w.id], now)).length;
  const struggling = allVocab
    .filter((w) => (s.vocab[w.id]?.lapses ?? 0) > 0)
    .sort((a, b) => (s.vocab[b.id]?.lapses ?? 0) - (s.vocab[a.id]?.lapses ?? 0) || (s.vocab[a.id]?.box ?? 0) - (s.vocab[b.id]?.box ?? 0))
    .slice(0, 12)
    .map((w) => w.id);

  // --- writing ---
  const recentWriting = s.writing.slice(-15);
  const words = recentWriting.reduce((a, w) => a + w.words, 0);
  const issues = recentWriting.reduce((a, w) => a + w.issues, 0);

  // --- speaking ---
  const speakingDates = Object.values(s.speakingDone).flat();

  // --- mistakes ---
  const open = s.mistakes.filter((m) => !m.corrected);
  const counts = new Map<string, { question: string; count: number; kind: ContentKind }>();
  for (const m of open) {
    const cur = counts.get(m.question);
    if (cur) cur.count++;
    else counts.set(m.question, { question: m.question, count: 1, kind: m.source });
  }
  const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  // --- topics to revise (weakest completed lessons + weak grammar) ---
  const revise: LearnerProfile['reviseTopics'] = [];
  for (const t of grammarTopics(s)) {
    if (t.status === 'weak' && t.bestRatio !== null) revise.push({ key: `grammar:${t.id}`, kind: 'grammar', title: t.title, ratio: t.bestRatio });
  }
  for (const kind of ['reading', 'listening'] as const) {
    for (const [key, r] of Object.entries(s.lessons)) {
      if (!key.startsWith(`${kind}:`) || r.attempts === 0) continue;
      const ratio = r.total ? r.bestScore / r.total : 0;
      if (ratio < 0.8) revise.push({ key, kind, title: key, ratio });
    }
  }
  revise.sort((a, b) => a.ratio - b.ratio);

  // --- speed (last 7 days) ---
  const week = lastDays(7, now);
  const xp = week.reduce((a, d) => a + (s.activity[d]?.xp ?? 0), 0);
  const activeDays = week.filter((d) => (s.activity[d]?.xp ?? 0) > 0).length;
  const quizzes = s.quizHistory.filter((q) => week.includes(q.date.slice(0, 10))).length;
  const lessonsCompleted = Object.values(s.lessons).filter((r) => r.completed && week.includes(r.lastDate.slice(0, 10))).length;

  return {
    skills,
    grammar: grammarTopics(s),
    vocab: {
      seen: progress.length,
      learning: progress.filter((p) => p.status === 'learning' || p.status === 'review').length,
      learned: progress.filter((p) => p.status === 'learned').length,
      dueToday,
      retention: reviews >= MIN_EVIDENCE ? correct / reviews : null,
      struggling,
    },
    writing: {
      submissions: s.writing.length,
      issuesPer10: words >= 60 ? (issues / words) * 10 : null,
      lastDate: recentWriting[recentWriting.length - 1]?.date,
    },
    speaking: {
      completions: speakingDates.length,
      lastDate: speakingDates.sort().at(-1),
    },
    mistakes: { open: open.length, total: s.mistakes.length, top },
    reviseTopics: revise.slice(0, 6),
    speed: { activeDays, xp, quizzes, lessonsCompleted },
  };
}

// ---------------------------------------------------------------- AI digest (privacy-safe)

/** Short Uzbek lines describing the learner. Aggregate evidence only — no free text, no chat, no essays. */
export function learnerDigestLines(s: PersistedState, stageFocus?: string): string[] {
  const lp = buildLearnerProfile(s);
  const p = s.profile;
  if (!p) return [];
  const lines: string[] = [];
  lines.push(`Taxminiy daraja: ${p.estimatedLevel}. Maqsad: ${p.targetLevel}.`);
  const measured = ALL.filter((k) => {
    const acc = lp.skills[k].accuracy;
    return acc !== null;
  });
  if (measured.length) {
    const parts = measured.map((k) => {
      const acc = Math.round((lp.skills[k].accuracy ?? 0) * 100);
      const label = { vocabulary: 'so‘z boyligi', grammar: 'grammatika', reading: 'o‘qish', listening: 'tinglash', speaking: 'gaplashish', writing: 'yozish' }[k];
      return `${label} ${acc}%`;
    });
    lines.push(`So‘nggi mashqlar natijasi: ${parts.join(', ')}.`);
  }
  const weakGrammar = lp.grammar.filter((g) => g.status === 'weak').map((g) => g.title);
  if (weakGrammar.length) lines.push(`Grammatikada mustahkamlash kerak: ${weakGrammar.slice(0, 4).join(', ')}.`);
  if (lp.vocab.retention !== null) lines.push(`So‘z eslab qolish darajasi ${Math.round(lp.vocab.retention * 100)}%, ${lp.vocab.dueToday} ta so‘z bugun takrorlashga tog‘ri keladi.`);
  if (lp.writing.issuesPer10 !== null) lines.push(`Yozuvda har 10 so‘zga o‘rtacha ${lp.writing.issuesPer10.toFixed(1)} ta xato tushadi.`);
  if (lp.mistakes.open > 0) lines.push(`Xatolar daftarida ${lp.mistakes.open} ta tuzatilmagan xato bor.`);
  if (stageFocus) lines.push(`Joriy bosqich: ${stageFocus}.`);
  lines.push(`Haftada ${lp.speed.activeDays} kun faol, kuniga o‘rtacha ${Math.round(lp.speed.xp / 7)} XP.`);
  return lines.slice(0, 10);
}

/** Level index of the learner's estimated level. */
export function estIdx(s: PersistedState): number {
  return LEVELS.indexOf(s.profile?.estimatedLevel ?? 'A1');
}
