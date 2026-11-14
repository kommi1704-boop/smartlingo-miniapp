// NOT RUN: tests the Friend Quiz API (api/quiz.ts + api/_lib/quizBank.ts) that was
// REMOVED from this duel-only build (see REDESIGN-AND-DUEL-NOTES.md). The file is kept
// so the quiz logic is not lost — move it back together with the quiz API if the feature returns.
// Friend Quiz tests. Run with:  npx tsx tests/quiz.test.ts
//
// Covers the pure logic behind api/quiz.ts + api/quizBank.ts + api/bot.ts:
//   - the verified question bank (integrity, uniqueness, level coverage)
//   - selection (dedup within a quiz, exclusion of recently used questions,
//     difficulty widening for rare level buckets)
//   - per-quiz option shuffling (answer remap correctness)
//   - the bot deep-link parser and invitation text
//   - client/server cost constant parity (50 Coin for 10 questions)
//   - client deep-link helpers (quizDeepLink)
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

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

import {
  BANK_STATS, CATEGORY_IDS, DIFFICULTY_IDS, DIFFICULTY_LEVELS, categoryPool,
  selectQuestions, shuffledQuizOf,
} from '../api/_lib/quizBank';
import { EXTENDED_QUIZ_COINS, CARD_THEME_COINS, MAX_TITLE_LEN, MIN_MS_PER_QUESTION } from '../api/quiz';
import { parseQuizPayload, parseRefPayload, quizInviteText, QUIZ_CATEGORY_LABELS, QUIZ_DIFFICULTY_LABELS } from '../api/bot';
import { quizDeepLink } from '../src/lib/quizApi';

// ---------- 1) Bank integrity ----------
section('question bank integrity');
ok(BANK_STATS.vocab >= 300, `vocab pool large enough (${BANK_STATS.vocab})`);
ok(BANK_STATS.grammar >= 100, `grammar pool large enough (${BANK_STATS.grammar})`);
ok(BANK_STATS.total >= 400, `total pool large enough (${BANK_STATS.total})`);

for (const cat of ['vocab', 'grammar'] as const) {
  const pool = categoryPool(cat);
  const keys = new Set<string>();
  const texts = new Set<string>();
  let valid = true;
  for (const q of pool) {
    if (q.options.length !== 4) valid = false;
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) valid = false;
    if (new Set(q.options).size !== 4) valid = false; // duplicate options would break the answer
    if (!q.q.trim() || !q.explain.trim()) valid = false;
    keys.add(q.key);
    texts.add(q.q.trim().toLowerCase());
  }
  ok(valid, `${cat}: every question has 4 unique options, a valid answer and texts`);
  ok(keys.size === pool.length, `${cat}: keys are unique (${keys.size}/${pool.length})`);
  ok(texts.size === pool.length, `${cat}: question texts are unique (${texts.size}/${pool.length})`);
}

// ---------- 2) Selection ----------
section('selectQuestions');
for (const d of DIFFICULTY_IDS) {
  for (const c of ['vocab', 'grammar', 'mixed', 'random'] as const) {
    const qs = selectQuestions(c, d, 10);
    const uniq = new Set(qs.map((q) => q.q.toLowerCase())).size;
    ok(qs.length === 10 && uniq === 10, `${c}/${d}: 10 unique questions`);
    ok(qs.every((q) => q.options.length === 4), `${c}/${d}: shapes intact`);
  }
}
// exclusions: passing used keys forces different questions
const first = selectQuestions('vocab', 'beginner', 5, []);
const excluded = new Set(first.map((q) => q.key));
const second = selectQuestions('vocab', 'beginner', 5, [...excluded]);
ok(second.every((q) => !excluded.has(q.key)), 'excludeKeys forces fresh questions');
// determinism without shuffling: same inputs -> same selection order
const again = selectQuestions('grammar', 'advanced', 5, []);
const same = selectQuestions('grammar', 'advanced', 5, []);
ok(JSON.stringify(again.map((q) => q.key)) === JSON.stringify(same.map((q) => q.key)), 'selection is deterministic');
// difficulty mapping sanity
ok(DIFFICULTY_LEVELS.beginner.includes('A1') && DIFFICULTY_LEVELS.advanced.includes('B2'), 'difficulty level mapping');
ok(CATEGORY_IDS.length === 4 && DIFFICULTY_IDS.length === 4, '4 categories x 4 difficulties exposed');

// ---------- 3) Per-quiz shuffling ----------
section('shuffledQuizOf (option order randomization)');
{
  const pool = categoryPool('grammar');
  let remapOk = true;
  let permuted = 0;
  for (let i = 0; i < 50; i++) {
    const bq = pool[i % pool.length];
    const rnd = ((): (() => number) => {
      let s = i * 7919 + 13;
      return () => {
        s = (s * 1103515245 + 12345) % 0x80000000;
        return s / 0x80000000;
      };
    })();
    const sq = shuffledQuizOf(bq, rnd);
    const sortedOpts = [...sq.options].sort().join('|');
    const sortedOrig = [...bq.options].sort().join('|');
    if (sortedOpts !== sortedOrig) remapOk = false; // options must be a permutation
    if (sq.options[sq.answer] !== bq.options[bq.answer]) remapOk = false; // answer remap
    if (JSON.stringify(sq.options) !== JSON.stringify(bq.options)) permuted++;
  }
  ok(remapOk, 'options stay a permutation and the answer index maps correctly');
  ok(permuted > 10, 'shuffling actually reorders options (got ' + permuted + '/50)');
}

// ---------- 4) Costs ----------
section('coin costs (server is the authority)');
ok(EXTENDED_QUIZ_COINS === 50, 'server: 10-question quiz costs 50 Coins');
ok(CARD_THEME_COINS === 20, 'server: premium card costs 20 Coins');
{
  const client = readFileSync(new URL('../src/pages/QuizFriends.tsx', import.meta.url), 'utf8');
  ok(/export const EXTENDED_COST = 50;/.test(client), 'client: QuizFriends EXTENDED_COST stays 50 (parity with server)');
}
ok(MIN_MS_PER_QUESTION >= 500, 'anti-cheat minimum per question exists');
ok(MAX_TITLE_LEN === 60, 'title cap is 60 chars');

// ---------- 5) Bot deep links ----------
section('bot quiz payload parser');
ok(parseQuizPayload('/start quiz_fq_42_ab12cd') === 'fq_42_ab12cd', 'valid quiz payload -> quiz id');
ok(parseQuizPayload('/start quiz_fq_1_abcdef0123') === 'fq_1_abcdef0123', 'long ids accepted');
ok(parseQuizPayload('/start@mybot quiz_fq_9_deadbeef') === 'fq_9_deadbeef', 'bot-mention form accepted');
ok(parseQuizPayload('/start ref123') === null, 'referral payload is NOT a quiz');
ok(parseQuizPayload('/start') === null, 'plain /start is not a quiz');
ok(parseQuizPayload('/start quiz_fq_..bad') === null, 'junk ids rejected');
ok(parseRefPayload('/start quiz_fq_42_x') === null, 'referral parser ignores quiz payloads (no overlap)');

section('invitation text');
{
  const t = quizInviteText('Alisa', 'Present Simple', 10, 'grammar', 'intermediate');
  ok(t.includes('Alisa') && t.includes('«Present Simple»'), 'creator name + quoted title present');
  ok(t.includes('10 ta savol'), 'question count present');
  ok(t.includes(QUIZ_CATEGORY_LABELS.grammar) && t.includes(QUIZ_DIFFICULTY_LABELS.intermediate), 'labels are Uzbek');
}

// ---------- 6) Client helpers ----------
section('client deep-link builder');
ok(quizDeepLink('smartlingo_bot', 'fq_7_abc') === 'https://t.me/smartlingo_bot?start=quiz_fq_7_abc', 't.me link format');
ok(quizDeepLink(null, 'fq_7_abc') === null && quizDeepLink(undefined, 'fq_7_abc') === null, 'no bot username -> no link (share hidden)');

// ---------- 7) Schema contains the new tables ----------
section('schema');
{
  const sql = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  for (const t of ['friend_quizzes', 'friend_quiz_attempts', 'coin_spends', 'notification_preferences', 'notification_history', 'notification_campaigns']) {
    ok(sql.includes(`create table if not exists public.${t}`), `table ${t} exists`);
    ok(new RegExp(`alter table public\\.${t} enable row level security`).test(sql), `table ${t} has RLS on`);
  }
  ok(sql.includes('unique index if not exists friend_quiz_attempts_unique'), 'duplicate-submission unique index present');
  ok(sql.includes('friend_quiz_attempts_unique\n  on public.friend_quiz_attempts (quiz_id, player_id)'), 'unique index covers (quiz_id, player_id)');
}

// ---------- 8) Server API surface guards ----------
section('api/quiz response stripping (static check)');
{
  const src = readFileSync(new URL('../api/quiz.ts', import.meta.url), 'utf8');
  ok(src.includes('function stripAnswer'), 'stripAnswer helper exists');
  ok(
    src.includes("questions: mine || isCreator || quiz.status !== 'active' ? undefined : (quiz.questions ?? []).map(stripAnswer),"),
    'get endpoint ships questions only via stripAnswer (playable state only)',
  );
  const strip = /function stripAnswer\([\s\S]*?\n\}/.exec(src)?.[0] ?? '';
  ok(strip.length > 0 && strip.includes('options: q.options'), 'stripAnswer projects id/q/options');
  ok(!/answer|explain/i.test(strip.replace('stripAnswer', '')), 'stripAnswer removes answer AND explain');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILED:', failures.join(' | '));
  process.exit(1);
}
