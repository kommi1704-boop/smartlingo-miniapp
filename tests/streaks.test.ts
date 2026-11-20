// Streak cron targeting tests (Phase 3).
// Run with:  npx tsx tests/streaks.test.ts
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

import { dayDiff, selectTargets } from '../api/reminders.js';
import { shiftDay } from '../api/_lib/xpcore.js';

const DAY = '2025-11-19'; // cron runs at 18:00 Tashkent of this day

const streak = (uid: number, over: { current?: number; longest?: number; last_day: string | null; freezes?: number }) => ({
  telegram_user_id: uid,
  current: over.current ?? 1,
  longest: over.longest ?? 1,
  last_day: over.last_day,
  freezes: over.freezes ?? 0,
});

section('Evening streak warning (type 2)');
{
  const rows = [
    streak(1, { current: 6, longest: 6, last_day: shiftDay(DAY, -1) }), // practiced yesterday only -> at risk
    streak(2, { current: 10, longest: 12, last_day: DAY }), // practiced TODAY -> never warned
    streak(3, { current: 6, longest: 9, last_day: shiftDay(DAY, -1), freezes: 2 }), // protected
    streak(4, { current: 0, longest: 3, last_day: shiftDay(DAY, -1) }), // zero streak -> not warn material
  ];
  const t = selectTargets(rows, [], DAY);
  ok(t.warn.map((r) => r.telegram_user_id).join(',') === '1', 'warn only yesterday-practiced, no-freeze, positive streak');
  ok(t.protectedByFreeze.includes(3), 'freeze holders are protected (and get a transparent skip row)');
  ok(!t.warn.some((r) => r.telegram_user_id === 2), 'a user who already practiced today is NEVER told their streak is at risk');
}

section('Restart encouragement (type 3)');
{
  const rows = [
    streak(1, { current: 1, longest: 12, last_day: shiftDay(DAY, -3) }), // broken 2 days ago, had a real streak
    streak(2, { current: 1, longest: 1, last_day: shiftDay(DAY, -4) }), // tiny streak — not worth a "restart"
    streak(3, { current: 1, longest: 5, last_day: shiftDay(DAY, -40) }), // long past — still eligible
  ];
  const t = selectTargets(rows, [], DAY);
  ok(t.restart.map((r) => r.telegram_user_id).join(',') === '1,3', 'restart message only for broken streaks >= 3');
}

section('Daily practice reminder (type 1 — users without a streak)');
{
  const rows = [streak(10, { current: 2, longest: 2, last_day: DAY })];
  const presence = [
    { telegram_user_id: 20, last_active: shiftDay(DAY, -2) }, // active 2 days ago, no streak row -> invite
    { telegram_user_id: 21, last_active: shiftDay(DAY, -30) }, // inactive > 7 days -> not invited
    { telegram_user_id: 22, last_active: DAY }, // already active TODAY -> a reminder would be noise
    { telegram_user_id: 10 }, // has a streak row -> excluded from invites
  ];
  const t = selectTargets(rows, presence, DAY);
  ok(t.invite.includes(20), 'no-streak users active within 7 days (but not today) get a gentle invite');
  ok(!t.invite.includes(21), 'users inactive for 30 days are not nagged');
  ok(!t.invite.includes(22), 'users who already practiced today are not invited again');
  ok(!t.invite.includes(10), 'streak holders never get the "start practicing" invite');
}

section('Day math at boundaries');
{
  ok(dayDiff('2025-11-19', '2025-11-18') === 1, 'yesterday is gap 1');
  ok(dayDiff('2025-12-01', '2025-11-30') === 1, 'month boundary is still one day');
  ok(dayDiff('2025-11-19', '2025-11-19') === 0, 'same day gap 0');
  assert(dayDiff('2025-11-19', '2025-11-19') === 0);
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILURES:', failures);
  process.exit(1);
}
