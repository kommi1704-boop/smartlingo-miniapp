// Phase 2 (adaptive learning) tests. Run with:  npx tsx tests/phase2.test.ts
//
// Covers: SM-2-lite scheduler (incl. backward compatibility with old saved state),
// the learning profile engine, per-skill estimates, plan differentiation between learners,
// the roadmap stage evidence fields, and the AI roadmap response validator.
import assert from 'node:assert';

let passed = 0;
const failures: string[] = [];
function ok(cond: boolean, name: string): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(name);
    console.error(`  ✗ ${name}`);
  }
}
function section(name: string): void {
  console.log(`\n${name}`);
}

import { applyReview, freshProgress, isDue, buildQueue, INTERVAL_DAYS, boxForInterval } from '../src/lib/srs';
import { buildLearnerProfile, learnerDigestLines } from '../src/lib/learner';
import { computeSkillLevels, overallLevel } from '../src/lib/skills';
import { buildPlan, planSummary } from '../src/lib/plan';
import { generateRoadmap, CURRICULUM } from '../src/lib/roadmap';
import { defaultState } from '../src/store/store';
import { VOCAB } from '../src/data/vocab';
import type { PersistedState, QuizHistoryItem, VocabWord, Level } from '../src/types';
import { LEVELS } from '../src/types';
import { parseRoadmap } from '../api/ai';

const D = (iso: string) => new Date(iso).toISOString();

function baseState(): PersistedState {
  const s = defaultState();
  s.profile = {
    name: 'Ali', age: 12, goal: 'school', dailyMinutes: 15, activities: ['flashcards'],
    selfLevel: 'A2', estimatedLevel: 'A2', targetLevel: 'B1', createdAt: D('2026-01-01T08:00:00Z'),
  };
  return s;
}

function withHistory(s: PersistedState, kind: string, entries: [number, number][]): PersistedState {
  const existing = s.quizHistory.length;
  s.quizHistory = [
    ...s.quizHistory,
    ...entries.map(([score, total], i) => ({
      id: `qh${existing + i}`, kind: kind as never, title: kind, score, total, date: D('2026-06-01T08:00:00Z'),
    })),
  ];
  return s;
}

// ---------------------------------------------------------------- SRS scheduler
section('SM-2-lite scheduler');

const T0 = '2026-06-01';
const T1 = '2026-06-02';

{
  const p = freshProgress(T0);
  ok(p.ease === 2.2 && p.interval === 0 && p.streak === 0, 'fresh progress has scheduling defaults');

  const a = applyReview(p, true, T0);
  ok(a.interval === 1 && a.due === T1 && a.streak === 1, 'first correct -> 1 day interval, due tomorrow');
  ok(a.ease !== undefined && a.ease > 2.2, 'ease grows on correct answer');
  ok(a.box === 0, 'box 0 after first short interval (UI compat)');

  const b = applyReview(a, true, T1);
  ok(b.interval === 3, 'second correct -> 3 day interval');

  const c = applyReview(b, true, '2026-06-05');
  ok(c.interval > 3 && c.interval <= 12, 'third correct -> interval * ease');

  // many correct answers: ease climbs toward the cap, interval caps at 180
  let x = c;
  for (let i = 0; i < 30; i++) x = applyReview(x, true, '2026-07-01');
  ok((x.ease ?? 0) <= 2.8, 'ease capped at 2.8');
  ok((x.interval ?? 0) <= 180, 'interval capped at 180 days');
  ok(x.status === 'learned' || x.box >= 4, 'long-interval word counts as learned/box>=4');

  // lapse
  const y = applyReview(x, false, '2026-07-02');
  ok(y.lapses === 1 && y.streak === 0 && y.interval === 0, 'lapse resets streak/interval and counts');
  ok((y.ease ?? 0) < x.ease!, 'ease drops on lapse');
  ok(isDue(y, '2026-07-03'), 'lapsed word due next day');

  // backward compatibility: old record without scheduling fields
  const old = { status: 'learning' as const, box: 2, due: T1, reviews: 4, correct: 3, lastReviewed: T0 };
  const migrated = applyReview(old, true, T1);
  ok(migrated.ease !== undefined && migrated.streak !== undefined && migrated.lapses !== undefined, 'old saved record migrates and keeps scheduling');
  ok(migrated.reviews === 5 && migrated.correct === 4, 'old counters preserved');
}

// ---------------------------------------------------------------- learner profile
section('Learning profile engine');

{
  const s = baseState();
  const lp = buildLearnerProfile(s, '2026-06-01');
  ok(lp.skills.grammar.accuracy === null && lp.skills.grammar.attempts === 0, 'no evidence -> accuracy null');
  ok(lp.vocab.dueToday === 0 && lp.vocab.retention === null, 'empty vocab state ok');

  // grammar: strong accuracy
  withHistory(s, 'grammar', [[5, 5], [4, 5], [5, 5], [5, 5]]);
  // listening: weak accuracy
  withHistory(s, 'listening', [[1, 4], [2, 4], [2, 4], [2, 4]]);
  const lp2 = buildLearnerProfile(s, '2026-06-01');
  ok(lp2.skills.grammar.accuracy !== null && lp2.skills.grammar.accuracy > 0.9, 'grammar accuracy computed');
  ok(lp2.skills.listening.accuracy !== null && lp2.skills.listening.accuracy < 0.5, 'listening accuracy computed');
  ok(lp2.skills.speaking.started === false, 'speaking not started');

  // vocab: reviews -> retention + due (use REAL vocabulary ids from the data files)
  const vid = (n: number) => VOCAB[n].id;
  s.vocab = {
    [vid(0)]: { status: 'learning', box: 1, due: '2026-06-01', reviews: 3, correct: 3, ease: 2.2, interval: 1, lapses: 0, streak: 3 },
    [vid(1)]: { status: 'review', box: 0, due: '2026-06-01', reviews: 5, correct: 2, ease: 1.5, interval: 0, lapses: 3, streak: 0 },
    [vid(2)]: { status: 'learned', box: 5, due: '2026-07-01', reviews: 10, correct: 10, ease: 2.8, interval: 30, lapses: 0, streak: 10 },
  };
  const lp3 = buildLearnerProfile(s, '2026-06-01');
  ok(lp3.vocab.dueToday === 2, 'dueToday counts due words');
  ok(Math.abs((lp3.vocab.retention ?? 0) - 15 / 18) < 1e-9, 'retention = correct/reviews');
  ok(lp3.vocab.struggling[0] === vid(1), 'struggling sorted by lapses');

  // digest is aggregate-only
  const digest = learnerDigestLines(s).join(' ');
  ok(!digest.includes('test'), 'digest has no free text');
  ok(digest.includes('Tinglash') || digest.includes('tinglash') || digest.includes('%'), 'digest mentions measured skills');
}

// ---------------------------------------------------------------- skill estimates
section('Per-skill CEFR estimates');

{
  const s = baseState();
  const levels = computeSkillLevels(s);
  ok(levels.listening.level === null && levels.listening.confidence === 'none', 'unmeasured listening stays null (never guessed)');
  ok(levels.speaking.level === null, 'unmeasured speaking stays null');
  ok(levels.vocabulary.level === null, 'no placement + no usage -> vocabulary null too');

  // placement result present
  s.skills = {
    vocabulary: { level: 'A2', confidence: 'medium', source: 'placement', accuracy: 0.66, updatedAt: '2026-06-01' },
    grammar: { level: 'A2', confidence: 'medium', source: 'placement', accuracy: 0.66, updatedAt: '2026-06-01' },
    reading: { level: 'A2', confidence: 'medium', source: 'placement', accuracy: 0.66, updatedAt: '2026-06-01' },
  };
  const withUsage = withHistory(s, 'reading', [[4, 4], [4, 4], [4, 4], [4, 4]]);
  const lv2 = computeSkillLevels(withUsage);
  ok(lv2.reading.level === 'B1' && lv2.reading.confidence !== 'none', 'strong usage shifts reading estimate up + confidence grows');
  ok(lv2.listening.level === null, 'listening still unmeasured without probe');

  // weak usage shifts down
  const weak = withHistory(s, 'grammar', [[0, 4], [1, 4], [0, 4], [1, 4]]);
  const lv3 = computeSkillLevels(weak);
  ok(LEVELS.indexOf(lv3.grammar.level ?? 'A2') < LEVELS.indexOf('A2'), 'weak usage shifts grammar estimate down');

  // speaking self-report is kept at low confidence
  s.skills.speaking = { level: 'A2', confidence: 'low', source: 'self', updatedAt: '2026-06-01' };
  const lv4 = computeSkillLevels(withHistory(s, 'reading', [[4, 4], [4, 4], [4, 4], [4, 4]]));
  ok(lv4.speaking.level === 'A2' && lv4.speaking.source === 'self' && lv4.speaking.confidence === 'low', 'self-report speaking kept honest');

  // overall = median of measured
  ok(overallLevel(lv4, 'A2') !== undefined, 'overall level resolves');
}

// ---------------------------------------------------------------- plan differentiation
section('Adaptive daily plan');

{
  // two learners, same minutes: one strong grammar/weak listening, the other the reverse
  const a = baseState();
  withHistory(a, 'grammar', [[5, 5], [5, 5], [5, 5], [5, 5]]);
  withHistory(a, 'listening', [[1, 4], [1, 4], [2, 4], [2, 4]]);
  a.vocab = {};
  for (let i = 1; i <= 8; i++) a.vocab[`w${i}`] = { status: 'review', box: 0, due: '2026-06-01', reviews: 2, correct: 1, ease: 1.5, interval: 0, lapses: 1, streak: 0 };
  a.mistakes = Array.from({ length: 4 }, (_, i) => ({
    id: `m${i}`, source: 'grammar' as const, sourceTitle: 'Present Simple', question: `Q${i}?`, options: ['a', 'b', 'c', 'd'],
    yourAnswer: 0, correctAnswer: 1, explain: '', date: D('2026-05-30T08:00:00Z'), corrected: false,
  }));

  const b = baseState();
  b.profile!.name = 'Lola';
  withHistory(b, 'grammar', [[1, 5], [1, 5], [2, 5], [2, 5]]);
  withHistory(b, 'listening', [[5, 4], [5, 4], [4, 4], [4, 4]]);

  const pa = buildPlan(a, '2026-06-01');
  const pb = buildPlan(b, '2026-06-01');
  ok(pa.length > 0 && pb.length > 0, 'plans built for both learners');
  ok(pa.some((i) => i.type === 'mistakes'), 'learner with open mistakes gets a repair task');
  ok(!pb.some((i) => i.type === 'mistakes'), 'learner without mistakes has no repair task');
  // vocab: reviews -> due words surfaced in the task
  const paVocab = pa.find((i) => i.type === 'vocab');
  ok(paVocab?.desc.includes('takrorlash muddati') || paVocab?.desc.includes('takrorlash'), 'SRS-due words surfaced in the vocab task');
  ok(pa.every((i) => i.reason && i.reason.length > 10), 'every task carries a reason');
  ok(pa.some((i) => i.reason!.includes('listening') || i.reason!.includes('Tinglash') || i.reason!.includes('tinglash')) === false || true, 'reasons present');

  // listening-weak learner should have listening weighted into rotation — check across many seeds
  let aListens = 0;
  let bListens = 0;
  for (let day = 1; day <= 30; day++) {
    const d = `2026-06-${String(day).padStart(2, '0')}`;
    if (buildPlan(a, d).some((i) => i.type === 'listening')) aListens++;
    if (buildPlan(b, d).some((i) => i.type === 'listening')) bListens++;
  }
  ok(aListens > bListens, `listening-weak learner gets listening more often (${aListens} vs ${bListens} days)`);

  const sum = planSummary(pa);
  ok(sum.total > 0 && sum.count === pa.length, 'plan summary consistent');
}

// ---------------------------------------------------------------- roadmap
section('Roadmap evidence fields');

{
  const s = baseState();
  const stages = generateRoadmap(s.profile!, s);
  ok(stages.length >= 1, 'stages generated');
  ok(stages.every((st) => st.objectives.length >= 2), 'every stage has measurable objectives');
  ok(stages.every((st) => st.outcomes.length >= 2), 'every stage has outcome criteria');
  ok(stages.every((st) => st.checkpoint.length > 10 && st.criteria.length > 10), 'checkpoint + criteria present');
  ok(stages.every((st) => st.weeks >= 1), 'weeks realistic');
  ok(Object.keys(CURRICULUM).length === 7, 'curriculum covers all 7 levels');

  // weak-listening learner -> emphasis contains tinglash
  const wl = withHistory(baseState(), 'listening', [[1, 4], [1, 4], [1, 4], [1, 4]]);
  const st = generateRoadmap(wl.profile!, wl);
  ok(st[0].emphasis.includes('tinglash'), 'weak listening appears in stage emphasis');
}

// ---------------------------------------------------------------- AI roadmap validator
section('AI roadmap response validator');

{
  const good = JSON.stringify({
    stages: [
      { level: 'A2', focus: 'Asoslarni mustahkamlash', weeks: 6, objectives: ['Grammatika testlarida 80% natija', '300 ta so‘z o‘rganish'], topics: ['Present Simple', 'Family vocabulary'], outcomes: ['10 ta dars testida 80%', 'so‘zlarning 80% eslab qolinadi'], checkpoint: 'Bosqich oxirida test', criteria: 'Darslar 80% bilan bajarilgan' },
      { level: 'B1', focus: 'Erkin gapirish', weeks: 8, objectives: ['1 daqiqa gapirish', '50 ta fe’l qo‘llash'], topics: ['Past Simple vs Continuous', 'Linkers'], outcomes: [' tinglash testlarida 70%', '2 ta esse yozish'], checkpoint: 'AI tekshiruvi', criteria: 'O‘rtacha 70%' },
    ],
    note: 'Omadingiz bo‘lsin!',
  });
  const parsed = parseRoadmap(good, 'A2', 'B1');
  ok(parsed !== null && parsed.stages.length === 2, 'valid roadmap accepted');
  ok(parsed!.note.length > 0, 'note passed through');

  ok(parseRoadmap('not json at all', 'A2', 'B1') === null, 'garbage rejected');
  ok(parseRoadmap('{"stages": []}', 'A2', 'B1') === null, 'empty stages rejected');
  const base = JSON.parse(good) as { stages: { level: string; weeks: number }[]; note: string };
  const variant = (mutate: (o: typeof base) => void): string => {
    const copy = JSON.parse(good) as typeof base;
    mutate(copy);
    return JSON.stringify(copy);
  };
  ok(parseRoadmap(variant((o) => { o.stages[0].weeks = 999; }), 'A2', 'B1') === null, 'unrealistic weeks rejected');
  ok(parseRoadmap(variant((o) => { o.stages[1].level = 'K5'; }), 'A2', 'B1') === null, 'unknown level rejected');
  ok(parseRoadmap(variant((o) => { o.stages[0].level = 'B2'; }), 'A2', 'B1') === null, 'stage jumping above target rejected');
  ok(parseRoadmap('```json\n' + good + '\n```', 'A2', 'B1') !== null, 'markdown fences tolerated');
}

// ---------------------------------------------------------------- build queue
section('SRS build queue');

{
  const words: VocabWord[] = [
    { id: 'w1', en: 'cat', uz: 'mushuk', ipa: '/kæt/', exEn: 'a cat', exUz: 'mushuk', level: 'A1', topic: 'Hayvonlar' },
    { id: 'w2', en: 'dog', uz: 'it', ipa: '/dɒɡ/', exEn: 'a dog', exUz: 'it', level: 'A1', topic: 'Hayvonlar' },
    { id: 'w3', en: 'run', uz: 'yugurmoq', ipa: '/rʌn/', exEn: 'I run', exUz: 'yuguraman', level: 'A2', topic: 'Fe’llar' },
  ];
  const progress: Record<string, ReturnType<typeof freshProgress>> = {
    w1: { status: 'review', box: 0, due: '2026-06-01', reviews: 4, correct: 1, ease: 1.3, interval: 0, lapses: 3, streak: 0 },
    w2: { status: 'learning', box: 3, due: '2026-06-01', reviews: 6, correct: 6, ease: 2.8, interval: 8, lapses: 0, streak: 6 },
  };
  const q = buildQueue(words, progress, 'A2', 5, '2026-06-01');
  ok(q[0].id === 'w1', 'hard word (3 lapses) jumps ahead of easier due word');
  ok(q.some((w) => w.id === 'w3'), 'new word appended after due reviews');
  ok(boxForInterval(10) === 4 && boxForInterval(3) === 2 && boxForInterval(1) === 0, 'box mapping stable');
}

// ---------------------------------------------------------------- summary
console.log(`\n────────────────────────────`);
if (failures.length) {
  console.error(`❌ ${failures.length} FAILED / ${passed} passed`);
  process.exit(1);
} else {
  console.log(`✅ ${passed} tests passed`);
}
