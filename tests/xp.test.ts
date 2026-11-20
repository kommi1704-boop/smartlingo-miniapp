// XP engine tests (Phase 4) — pure logic mirrors of schema-2.0.sql RPCs.
// Run with:  npx tsx tests/xp.test.ts
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

import {
  MILESTONES, shiftDay, streakStep, tashkentDay, weekMonday, GAME_IDS, gameXpFor, xpForBattle, xpForMatching, XP_RULES, type StreakRow,
} from '../api/_lib/xpcore.js';
import { CATALOG, catalogItem } from '../api/_lib/catalog.js';
import { FRAMES, PREMIUM_AVATARS, TITLES, NAME_COLORS, NAME_FXS, BG_ITEMS, RANK_TIERS } from '../src/lib/shop';

// ---------------------------------------------------------------------------
section('Day math (Asia/Tashkent, mirrors tz_today / week_monday)');
{
  // 2025-11-15 18:59 UTC == 2025-11-15 23:59 Tashkent; +1s -> next day
  const before = tashkentDay(Date.UTC(2025, 10, 15, 18, 59, 59) * 1);
  const after = tashkentDay(Date.UTC(2025, 10, 15, 19, 0, 0) * 1);
  ok(before === '2025-11-15', 'tashkentDay: 18:59 UTC is still the 15th');
  ok(after === '2025-11-16', 'tashkentDay: 19:00 UTC rolls to the 16th (midnight handled)');

  ok(weekMonday('2025-11-19') === '2025-11-17', 'weekMonday: Wednesday -> Monday of same week');
  ok(weekMonday('2025-11-17') === '2025-11-17', 'weekMonday: Monday is its own week start');
  ok(weekMonday('2025-11-23') === '2025-11-17', 'weekMonday: Sunday still belongs to the Monday before');
  ok(weekMonday(shiftDay('2025-11-17', -7)) === '2025-11-10', 'weekMonday: previous week window');
  ok(shiftDay('2025-11-30', 1) === '2025-12-01', 'shiftDay crosses month');
}

// ---------------------------------------------------------------------------
section('Streak engine (mirrors public.streak_touch)');
{
  const row = (over: Partial<StreakRow> = {}): StreakRow => ({ current: 5, longest: 9, last_day: '2025-11-15', freezes: 0, ...over });

  const sameDay = streakStep(row(), '2025-11-15');
  ok(sameDay.current === 5 && !sameDay.extended, 'same day: multiple sessions extend once — no change');
  ok(sameDay.current === streakStep(row(), '2025-11-14').current, 'out-of-order day never moves the streak');

  const next = streakStep(row(), '2025-11-16');
  ok(next.current === 6 && next.extended && !next.freezeUsed, 'consecutive day: +1');

  const gapReset = streakStep(row(), '2025-11-18');
  ok(gapReset.current === 1 && gapReset.extended, 'missing an entire day resets to 1');

  const frozen = streakStep({ ...row(), freezes: 1 }, '2025-11-17');
  ok(frozen.current === 6 && frozen.freezeUsed, '2-day gap + freeze: streak protected');

  const frozenNoStock = streakStep({ ...row(), freezes: 0 }, '2025-11-17');
  ok(frozenNoStock.current === 1 && !frozenNoStock.freezeUsed, '2-day gap without freezes: reset');

  const midnight = streakStep({ current: 0, longest: 0, last_day: null, freezes: 0 }, '2025-11-15');
  ok(midnight.current === 1 && midnight.extended, 'first ever practice: streak = 1');

  const record = streakStep({ current: 3, longest: 3, last_day: '2025-11-15', freezes: 0 }, '2025-11-16');
  ok(record.longest === 4, 'longest updates when the current streak beats it');
}

// ---------------------------------------------------------------------------
section('XP rules (server-authoritative amounts + caps)');
{
  ok(XP_RULES.vocabQuiz.amount === 2 && XP_RULES.vocabQuiz.cap === 30, 'vocab quiz: +2, daily cap 30');
  ok(XP_RULES.vocabLearned.amount === 3, '"O\'rganildi" with evidence: +3');
  ok(XP_RULES.placement.amount === 20 && XP_RULES.placement.cap === 20, 'placement: +20 once/day');
  ok(XP_RULES.discovery.amount === 10, 'discovery completion: +10');
  ok(xpForMatching(0) === 20 && xpForMatching(3) === 14 && xpForMatching(50) === 5, 'matching: 20 - 2*errors, floor 5');
  ok(xpForBattle('win') === 5 && xpForBattle('draw') === 3 && xpForBattle('loss') === 2, 'verified PvP XP: 5/3/2');
  ok(gameXpFor(0) === 2 && gameXpFor(1) === 8 && gameXpFor(2) === 12 && gameXpFor(3) === 16, 'games: mirrors client xpForResult (2/8/12/16 by stars)');
  ok(XP_RULES.game.cap === 60 && XP_RULES.game.source === 'game', 'games: 60 XP/day cap');
  ok(XP_RULES.gameDaily.amount === 15 && XP_RULES.gameDaily.cap === 15, 'daily challenge bonus: +15 once/day');
  ok((GAME_IDS as readonly string[]).join(',') === 'memory,runner,scramble,blitz,listen', 'game whitelist matches the O\'yinlar page');
  ok(MILESTONES.includes(7) && MILESTONES.includes(100), 'milestones include 7 and 100');
}

// ---------------------------------------------------------------------------
section('Catalog parity: server catalog vs client shop (must stay in sync)');
{
  const clientPrices = new Map<string, number>();
  for (const f of FRAMES) clientPrices.set(f.id, f.price);
  for (const a of PREMIUM_AVATARS) clientPrices.set(a.id, a.price);
  for (const t of TITLES) clientPrices.set(t.id, t.price);
  for (const c of NAME_COLORS) clientPrices.set(c.id, c.price);
  for (const f of NAME_FXS) clientPrices.set(f.id, f.price);
  for (const b of BG_ITEMS) clientPrices.set(b.id, b.price);

  let mismatch = 0;
  for (const item of CATALOG) {
    if (item.id === 'frame-champion') continue; // earned, not in the client catalog
    if (clientPrices.get(item.id) !== item.price) {
      mismatch++;
      console.error(`    price mismatch: ${item.id} server=${item.price} client=${clientPrices.get(item.id)}`);
    }
  }
  ok(mismatch === 0, `all ${CATALOG.length - 1} purchasable items match client prices`);
  ok(catalogItem('frame-champion')?.unlock === 'champion', 'champion frame is unlock-condition (never purchasable)');
  ok(catalogItem('frame-champion')?.kind === 'unlock', 'champion frame kind = unlock');
  ok(RANK_TIERS.every((t) => typeof t.min === 'number'), 'rank tiers intact (server RF_MIN mirror used in tests)');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILURES:', failures);
  process.exit(1);
}
