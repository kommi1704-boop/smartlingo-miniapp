// Daily Learning Journey — engine + persistence tests (Phase 13).
// Run with: npx tsx tests/journey.test.ts
//
// Part A exercises the PURE engine (buildJourney / validateJourney / fallback /
// keys / AI merge). Part B runs the real store + journeyActions headless with a
// localStorage shim — covering persistence, idempotent stage completion and the
// once-per-day bonus guard exactly the way the app runs in the browser.
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

// ---------------------------------------------------------------------------
// Browser-ish globals shim (BEFORE any app import — the store hydrates on import)
// ---------------------------------------------------------------------------
const mem = new Map<string, string>();
const g = globalThis as unknown as Record<string, unknown>;
g.window = {
  localStorage: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
    removeItem: (k: string) => void mem.delete(k),
  },
  location: { hash: '', pathname: '/', search: '', replace() {} },
  addEventListener() {},
  removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
};
g.SpeechSynthesisUtterance = function () {};
g.AbortSignal = AbortSignal;

// ---------------------------------------------------------------------------
// Part A — pure engine
// ---------------------------------------------------------------------------
const {
  buildJourney, validateJourney, buildFallbackJourney, minimalJourney, withAiText,
  journeyDoneKey, journeyStageKey, JOURNEY_THEMES, pickTheme,
} = await import('../src/lib/journey');
const { LESSON_KEY_RE } = await import('../api/xp.js');
import type { PersistedState, Profile } from '../src/types';

function makeProfile(over: Partial<Profile> = {}): Profile {
  return {
    name: 'Ali', age: 12, goal: 'school', dailyMinutes: 20, activities: [],
    selfLevel: 'A2', estimatedLevel: 'A2', targetLevel: 'B1',
    interests: [], createdAt: '2026-01-01T00:00:00.000Z', ...over,
  };
}

function makeState(over: Partial<PersistedState> = {}): PersistedState {
  return {
    version: 1,
    profile: makeProfile(),
    xp: 120,
    vocab: {},
    lessons: {},
    quizHistory: [],
    activity: {},
    mistakes: [],
    badges: {},
    conversations: [],
    writing: [],
    speakingDone: {},
    highlights: {},
    settings: { theme: 'dark', bg: 'doodle', accent: 'green', dailyWordGoal: 10, haptics: true, sound: true, showTranslation: false },
    games: { best: {}, plays: 0, daily: { date: '', done: false }, dailyCount: 0, xpToday: { date: '', xp: 0 } },
    coins: { balance: 0, earnedToday: { date: '', amount: 0 }, spentTotal: 0 },
    shop: { owned: {}, equipped: {}, chestsOpened: 0, streakFreezes: 0 },
    quests: { date: '', progress: {}, claimed: [] },
    battle: { ratingDelta: 0, wins: 0, losses: 0, draws: 0, ratedToday: { date: '', count: 0 }, history: [] },
    skills: {},
    aiRoadmap: null,
    journey: null,
    ...over,
  };
}

const DATE = '2026-11-20';

section('Journey engine — determinism & validity');
{
  const s = makeState();
  const a = buildJourney(s, DATE);
  const b = buildJourney(s, DATE);
  ok(JSON.stringify(a) === JSON.stringify(b), 'A1: same seed -> byte-identical session');
  ok(validateJourney(a, s), 'A2a: session passes QC');
  ok(a.stages.length >= 4 && a.stages.length <= 7, `A2b: 4-7 stages (got ${a.stages.length})`);
  ok(a.stages[0].kind === 'discover', 'A2c: first stage is discover');
  ok(a.minutes >= 12 && a.minutes <= 40, `A2d: total minutes sane (${a.minutes})`);
  ok(a.stages.every((st, i) => st.id === `s${i}`), 'A2e: stage ids stable s0..sN');

  const small = buildJourney(makeState({ profile: makeProfile({ dailyMinutes: 15 }) }), DATE);
  const big = buildJourney(makeState({ profile: makeProfile({ dailyMinutes: 25 }) }), DATE);
  ok(small.minutes < big.minutes, `A3: minutes adapt (${small.minutes} < ${big.minutes})`);
  ok(small.stages.length <= big.stages.length, 'A3b: longer budget -> not fewer stages');
}

section('Journey engine — adaptation');
{
  const withMistakes = makeState({
    mistakes: Array.from({ length: 5 }, (_, i) => ({
      id: `m${i}`, source: 'grammar' as const, sourceTitle: 'T', question: `q${i}`, options: ['a', 'b', 'c', 'd'],
      yourAnswer: 0, correctAnswer: 1, explain: 'x', date: '2026-11-19T00:00:00.000Z', corrected: false,
    })),
  });
  const j = buildJourney(withMistakes, DATE);
  const ch = j.stages.find((st) => st.kind === 'challenge');
  ok(ch?.challenge?.type === 'mistakes', 'A4: 5 open mistakes -> repair challenge');

  const s = makeState({ profile: makeProfile({ estimatedLevel: 'A1' }) });
  const j2 = buildJourney(s, DATE);
  const vocabIds = j2.stages.find((st) => st.kind === 'vocab')?.words ?? [];
  const li = (l: string) => ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(l);
  const { VOCAB } = await import('../src/data/vocab');
  const allFit = vocabIds.every((id) => {
    const w = VOCAB.find((v) => v.id === id);
    return !!w && li(w.level) <= li('A1') + 1;
  });
  ok(allFit, 'A5a: vocab words respect the level ceiling (est+1)');
  ok(vocabIds.length >= 3 && vocabIds.length <= 6, `A5b: 3-6 vocab words (got ${vocabIds.length})`);
  ok(new Set(vocabIds).size === vocabIds.length, 'A5c: vocab words unique');
}

section('Journey engine — interests & variety');
{
  let spaceDays = 0;
  const themes = new Set<string>();
  for (let d = 1; d <= 24; d++) {
    const date = `2026-11-${String(d).padStart(2, '0')}`;
    const s = makeState({ profile: makeProfile({ interests: ['kosmos'] }) });
    const j = buildJourney(s, date);
    themes.add(j.themeId);
    if (j.themeId === 'space') spaceDays++;
  }
  ok(spaceDays >= 2, `A6a: kosmos interest boosts space theme (${spaceDays}/24 days)`);
  ok(themes.size >= 5, `A6b: daily variety across a month (${themes.size} distinct themes)`);

  const hist = JOURNEY_THEMES.map((t) => t.id);
  const picked = pickTheme(makeState(), DATE, hist, (() => 0.5) as () => number);
  ok(!!picked.id, 'A6c: pickTheme never crashes even with full history');
}

section('Journey engine — quality control rejects broken content');
{
  const s = makeState();
  const base = buildJourney(s, DATE);
  const clone = (): typeof base => JSON.parse(JSON.stringify(base));

  const m1 = clone(); m1.stages[0].kind = 'vocab';
  ok(!validateJourney(m1, s), 'A7a: non-discover first stage rejected');

  const m2 = clone();
  const vocabStage = m2.stages.find((st) => st.kind === 'vocab')!;
  vocabStage.words = [...(vocabStage.words ?? []), vocabStage.words![0]];
  ok(!validateJourney(m2, s), 'A7b: duplicate vocab word rejected');

  const m3 = clone();
  const g = m3.stages.find((st) => st.kind === 'grammar')!;
  g.grammarId = 'grammar-ghost';
  ok(!validateJourney(m3, s), 'A7c: unknown grammar id rejected');

  const m4 = clone();
  m4.stages[0].check!.answer = 99;
  ok(!validateJourney(m4, s), 'A7d: out-of-range answer rejected');

  const m5 = clone();
  m5.stages.forEach((st) => (st.minutes = 60));
  ok(!validateJourney(m5, s), 'A7e: absurd minutes rejected');

  const m6 = clone();
  m6.titleEn = '';
  ok(!validateJourney(m6, s), 'A7f: empty title rejected');
}

section('Journey engine — fallbacks never break');
{
  const s = makeState();
  ok(validateJourney(buildFallbackJourney(s, DATE), s), 'A8a: fallback session passes QC');
  ok(validateJourney(minimalJourney(DATE)), 'A8b: minimal session passes QC');

  // empty profile (impossible in the app, defensive) still builds something
  const noProfile = makeState({ profile: null });
  ok(buildJourney(noProfile, DATE).stages.length >= 3, 'A8c: missing profile -> minimal journey');
}

section('Journey engine — server keys match the ledger contract');
{
  ok(LESSON_KEY_RE.test(journeyDoneKey(DATE)), `A9a: ${journeyDoneKey(DATE)}`);
  for (let i = 0; i < 8; i++) ok(LESSON_KEY_RE.test(journeyStageKey(DATE, i, 'read')), `A9b: stage key ${i}`);
  ok(!LESSON_KEY_RE.test('journey-20261120:bad_key!'), 'A9c: ledger rejects malformed keys (sanity)');
  ok(journeyStageKey(DATE, 3, 'W!eird.part') === journeyStageKey(DATE, 3, 'weirdpart'), 'A9d: stage key sanitization stable');
}

section('Journey engine — AI reading merge');
{
  const s = makeState();
  // the fallback session ALWAYS carries a reading stage — deterministic merge target
  const base = buildFallbackJourney(s, DATE);
  const ai = {
    title: 'The Secrets of Space',
    text: 'Rockets fly to space.\n\nAstronauts live there.',
    questions: [
      { q: 'What flies to space?', options: ['Rockets', 'Bikes', 'Boats'], answerIndex: 0 },
      { q: 'Who lives there?', options: ['Astronauts', 'Cats', 'Fish'], answerIndex: 0 },
      { q: 'Space is big?', options: ['Yes', 'No', 'Maybe'], answerIndex: 0 },
    ],
    words: [{ en: 'rocket', uz: 'raketa' }, { en: 'astronaut', uz: 'astronavt' }],
    interest: 'kosmos',
  };
  const merged = withAiText(base, ai);
  const r = merged.stages.find((st) => st.kind === 'reading');
  ok(!!r?.aiQuiz && r.aiQuiz.length === 3, 'A10a: AI quiz embedded (3 questions)');
  ok(!r?.readingId, 'A10b: catalog id cleared for AI stage');
  ok(r?.title.includes('The Secrets of Space'), 'A10c: AI title used');
  ok(validateJourney(merged, s), 'A10d: merged session passes QC');
}

// ---------------------------------------------------------------------------
// Part B — real store, headless (persistence, idempotency, bonus guard)
// ---------------------------------------------------------------------------
const { ensureJourney, completeJourneyStage, claimJourneyBonus, markJourneyCelebrated, saveJourneyAiText, sessionOf, addJourneyStageXp } = await import('../src/store/journeyActions');
const { getState, setState, defaultState } = await import('../src/store/store');
const { today } = await import('../src/lib/dates');

section('Store — session generation & freezing');
{
  setState(() => ({ ...defaultState(), profile: makeProfile(), journey: null }));
  ensureJourney();
  const j1 = getState().journey!;
  ok(j1.date === today() && !!j1.session && j1.themeId, 'B1a: ensureJourney generates + freezes today\'s session');
  const frozen = JSON.stringify(j1.session);
  ensureJourney();
  ok(JSON.stringify(getState().journey!.session) === frozen, 'B1b: second call returns the SAME frozen content');
  const fromDisk = JSON.parse(mem.get('smartlingo:v1')!);
  ok(!!fromDisk.journey?.session?.stages?.length, 'B1c: session persisted through the repository');
}

section('Store — idempotent stage completion (double-finish safe)');
{
  const j = getState().journey!;
  const stage = j.session!.stages[0];
  const first = completeJourneyStage(stage.id, 4, 5);
  ok(first.completed && first.first, 'B2a: first completion accepted');
  const second = completeJourneyStage(stage.id, 4, 5);
  ok(!second.completed && !second.first, 'B2b: second completion ignored (idempotent)');
  ok(getState().journey!.stages[stage.id]?.done === true, 'B2c: stage marked done');
  addJourneyStageXp(stage.id, 5);
  addJourneyStageXp(stage.id, 3);
  ok(getState().journey!.stages[stage.id]?.xp === 8, 'B2d: stage XP accumulates');
}

section('Store — completion, bonus guard & celebration-once');
{
  const j = getState().journey!;
  for (const st of j.session!.stages) completeJourneyStage(st.id, 5, 5);
  ok(!!getState().journey!.finishedAt, 'B3a: finishedAt set when all stages done');

  const granted = await claimJourneyBonus();
  ok(granted === 0, 'B3b: offline claim -> 0 XP (honest, no local fabrication)');
  ok(!getState().journey!.bonusDone, 'B3c: offline claim does not mark bonus as done (retry allowed)');

  markJourneyCelebrated();
  markJourneyCelebrated();
  ok(getState().journey!.celebrated === true, 'B3d: celebration flag set (once)');
}

section('Store — AI text merge through sessionOf');
{
  saveJourneyAiText({
    title: 'AI Space Story', text: 'Test.\n\nText two.',
    questions: [{ q: 'Q?', options: ['a', 'b', 'c'], answerIndex: 1 }],
    words: [{ en: 'star', uz: 'yulduz' }],
  }, 'kosmos');
  const s = getState();
  const session = sessionOf(s)!;
  const r = session.stages.find((st) => st.kind === 'reading');
  if (r) {
    ok(r.aiText?.title === 'AI Space Story', 'B4a: sessionOf merges cached AI text');
    ok((r.aiQuiz?.length ?? 0) === 1, 'B4b: AI quiz built');
  } else {
    // today's composition chose listening instead of reading — the merge must be a no-op
    ok(session.stages.every((st) => !st.aiQuiz), 'B4ab: no reading stage today -> merge correctly a no-op');
  }
  const fromDisk = JSON.parse(mem.get('smartlingo:v1')!);
  ok(fromDisk.journey.aiText.title === 'AI Space Story', 'B4c: AI text persisted');
}

// ---------------------------------------------------------------------------
console.log(`\n──────────────────────────────`);
console.log(`Journey tests: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILED:');
  failures.forEach((f) => console.error('  ✗ ' + f));
  process.exit(1);
}
