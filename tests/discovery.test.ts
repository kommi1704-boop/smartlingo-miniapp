// Discovery + placement engine tests (Phases 1-2).
// Run with:  npx tsx tests/discovery.test.ts
import assert from 'node:assert';
import {
  adaptiveStep, BANK, bankItem, evaluate, groupQuestions, LEVELS, PASS_MARK, publicOf, sanitizeAnswers, startLevelFor,
  type Answered,
} from '../api/_lib/placement-bank.js';
import {
  DISCOVERY_KINDS, fallbackPick, generateDiscovery, KIND_LABEL_UZ, present, recentKinds, validateDiscovery,
} from '../api/_lib/discover-lib.js';

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
section('Discovery: deterministic fallback + kind rotation');
{
  const a = fallbackPick(12345, [], '2025-11-19', 0);
  const b = fallbackPick(12345, [], '2025-11-19', 0);
  ok(JSON.stringify(a) === JSON.stringify(b), 'same (seed, day) -> same item (cache-friendly)');
  const seenAll = fallbackPick(1, DISCOVERY_KINDS, '2025-11-19', 0);
  ok(DISCOVERY_KINDS.includes(seenAll.kind), 'seen everything -> still returns a valid item');
  const freshPool = [1, 2, 3].map((n) => fallbackPick(n, ['fact', 'quiz', 'riddle', 'word', 'grammar'], '2025-11-19', 0));
  ok(freshPool.every((f) => !['fact', 'quiz', 'riddle', 'word', 'grammar'].includes(f.kind)), 'prefers kinds NOT seen recently (no repeats)');
}

section('Discovery: recent kinds window');
{
  const rows = [
    { kind: 'fact', day: '2025-11-19' },
    { kind: 'word', day: '2025-11-14' },
    { kind: 'quiz', day: '2025-11-01' }, // older than 7 days -> ignored
  ];
  const kinds = recentKinds(rows, 7, '2025-11-19');
  ok(kinds.includes('fact') && kinds.includes('word') && !kinds.includes('quiz'), '7-day window filters old kinds');
}

section('Discovery: AI output validation (strict schema)');
{
  const good = validateDiscovery({ title: 'Kunning so‘zi', text: 'Serendipity — tasodifan chiqqan yoqimli kashfiyot.', cta: 'Sinab ko‘ring' }, 'word');
  ok(!!good && good.kind === 'word' && good.cta === 'Sinab ko‘ring', 'valid word item passes');
  const quiz = validateDiscovery({ title: 'T', text: 'Bir variantni tanlang va tushuntirishni oqing.', quiz: { q: 'Pick', options: ['a', 'b', 'c', 'd'], answer: 2, explain: 'x' } }, 'quiz');
  ok(!!quiz && quiz.quiz?.answer === 2 && quiz.quiz.options.length === 4, 'valid quiz item passes');
  ok(validateDiscovery({ title: 'T', text: 'short' }, 'fact') === null, 'too-short text rejected');
  ok(validateDiscovery({ title: '', text: 'x'.repeat(50) }, 'fact') === null, 'empty title rejected');
  ok(validateDiscovery({ title: 'T', text: 'x'.repeat(50), quiz: { q: 'Q', options: ['a', 'b'], answer: 0 } }, 'quiz') === null, 'wrong option count rejected');
  ok(validateDiscovery({ title: 'T', text: 'x'.repeat(50), quiz: { q: 'Q', options: ['a', 'b', 'c', 'd'], answer: 9 } }, 'quiz') === null, 'out-of-range answer rejected');
  ok(validateDiscovery('just a string', 'fact') === null, 'non-object rejected');
}

section('Discovery: generation without AI keys falls back to the bank');
{
  const savedGemini = process.env.GEMINI_API_KEY;
  const savedGroq = process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    const item = await generateDiscovery({ level: 'B1', interests: ['space'], seenKinds: [], day: '2025-11-19', seed: 42 });
    ok(DISCOVERY_KINDS.includes(item.kind), 'no AI keys -> deterministic bank item');
    ok(typeof KIND_LABEL_UZ[item.kind] === 'string', 'label exists for the kind');
    const shown = present(item);
    ok(shown.emoji.length > 0 && shown.label.length > 0, 'present() decorates with emoji + label');
  } catch {
    ok(false, 'generateDiscovery must never throw');
  }
  if (savedGemini) process.env.GEMINI_API_KEY = savedGemini;
  if (savedGroq) process.env.GROQ_API_KEY = savedGroq;
}

// ---------------------------------------------------------------------------
section('Placement bank integrity (63 calibrated items)');
{
  const ids = new Set(BANK.map((q) => q.id));
  ok(BANK.length === 63, `bank has 63 items (got ${BANK.length})`);
  ok(ids.size === BANK.length, 'question ids are unique');
  ok(BANK.every((q) => q.options.length === 4), 'every question has exactly 4 options');
  ok(BANK.every((q) => q.answer >= 0 && q.answer < q.options.length), 'answer index always in range');
  ok(BANK.every((q) => LEVELS.includes(q.level)), 'levels are valid CEFR');
  ok(BANK.every((q) => ['vocabulary', 'grammar', 'reading'].includes(q.section)), 'sections valid');
  ok(LEVELS.every((lv) => BANK.filter((q) => q.level === lv).length === 9), '9 items per level (3 sections × 3)');
  ok(BANK.every((q) => typeof q.explain === 'string' && q.explain.length > 5), 'every item has an explanation');
  const leaked = publicOf(bankItem('p-B1-grammar')!) as unknown as Record<string, unknown>;
  ok(!('answer' in leaked) && !('explain' in leaked), 'publicOf strips the answer key — the key never leaves the server');
}

section('Placement: adaptive walk');
{
  ok(startLevelFor('B1') === 'A2', 'calibration: starts ONE group below the self-declared level');
  ok(startLevelFor('Pre-A1') === 'Pre-A1', 'floor: Pre-A1 stays Pre-A1');
  const first = adaptiveStep('A1', []);
  ok(!first.done && first.questions.length === 3 && first.group === 'Pre-A1', 'A1 self-level -> first group is Pre-A1');

  const correctPick = (id: string): number => BANK.find((x) => x.id === id)!.answer;
  const correct = (lv: (typeof LEVELS)[number]) => groupQuestions(lv).map((q) => ({ id: q.id, picked: correctPick(q.id) }));
  let answers: Answered[] = [];
  for (const lv of ['Pre-A1', 'A1', 'A2', 'B1'] as const) answers = [...answers, ...correct(lv)];
  const nextB2 = adaptiveStep('A1', answers);
  ok(!nextB2.done && nextB2.group === 'B2', 'passing groups climb upward');

  const wrongB2 = groupQuestions('B2').map((q) => ({ id: q.id, picked: (correctPick(q.id) + 1) % 4 }));
  const done = adaptiveStep('A1', [...answers, ...wrongB2]);
  ok(done.done && done.result.level === 'B1', 'failing B2 stops the walk at B1 (highest contiguous pass)');

  const partial = adaptiveStep('A1', answers.slice(0, 5));
  ok(!partial.done && partial.questions.length === 1, 'partial group -> only the remaining question is served');
}

section('Placement: scoring scenarios (Phase 8 test plan)');
{
  const levels = (list: string[]) => BANK.filter((q) => list.includes(q.level));
  // beginner: fails A1 after passing Pre-A1
  const beginner = evaluate([...levels(['Pre-A1']).map((q) => ({ id: q.id, picked: q.answer })), ...levels(['A1']).map((q) => ({ id: q.id, picked: (q.answer + 1) % 4 }))], 'A1');
  ok(beginner.level === 'Pre-A1', 'beginner student -> Pre-A1');

  // intermediate: passes through A2/B1, fails B2
  const inter = evaluate(
    [...levels(['Pre-A1', 'A1', 'A2', 'B1']).map((q) => ({ id: q.id, picked: q.answer })), ...levels(['B2']).map((q) => ({ id: q.id, picked: (q.answer + 1) % 4 }))],
    'B1',
  );
  ok(inter.level === 'B1' && inter.confidence === 'high', 'intermediate student -> B1 with high confidence');

  // advanced: everything correct
  const advanced = evaluate(BANK.map((q) => ({ id: q.id, picked: q.answer })), 'B2');
  ok(advanced.level === 'C2', 'advanced student -> C2');
  ok(advanced.strengths.length >= 1, 'advanced report has strengths');

  // random guessing: same option index everywhere
  const guess = evaluate(BANK.slice(0, 9).map((q) => ({ id: q.id, picked: 1 })), 'A2');
  ok(guess.flags.includes('pattern'), 'random guessing flagged by answer-position pattern');

  // inconsistent: fails A2 but passes C1/C2 (non-contiguous evidence)
  const passAll = BANK.filter((q) => !['A2'].includes(q.level)).map((q) => ({ id: q.id, picked: q.answer }));
  const failA2 = BANK.filter((q) => q.level === 'A2').map((q) => ({ id: q.id, picked: (q.answer + 1) % 4 }));
  const inconsistent = evaluate([...passAll, ...failA2], 'C1');
  ok(inconsistent.flags.includes('inconsistent'), 'inconsistent answers flagged');

  // repeated questions: duplicates collapse
  const once = BANK.slice(0, 3).map((q) => ({ id: q.id, picked: q.answer }));
  const dup = sanitizeAnswers([...once, ...once]);
  ok(dup.length === 3, 'duplicate answers dropped');

  // unknown ids and bad picks rejected
  const dirty = sanitizeAnswers([{ id: 'nonexistent', picked: 0 }, { id: once[0].id, picked: 99 }, { id: once[1].id, picked: -1 }]);
  ok(dirty.length === 2 && dirty.every((d) => d.picked === -1), 'unknown ids dropped; out-of-range picks clamped to "Bilmayman"');

  ok(PASS_MARK === 2, 'pass mark: 2 of 3 per level');
  ok(evaluate([], 'B1').asked === 0, 'empty answers -> empty evaluation (no crash)');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILURES:', failures);
  process.exit(1);
}
