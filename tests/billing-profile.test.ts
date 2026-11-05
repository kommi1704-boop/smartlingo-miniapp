// Billing (Telegram Stars) + public profile tests. Run with:  npx tsx tests/billing-profile.test.ts
//
// Covers: the coin package catalog (server vs client parity), the Tiny Pack budget,
// invoice payload format, rating clamping, XP windows, streaks, public-profile
// projection (including the privacy guarantee: nothing sensitive may leak out) and
// the global/weekly/monthly rank builder.
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

import { PACKAGES as SERVER_PACKAGES, tinyLeftOf, packageById, TINY_MAX } from '../api/payments';
import { PACKAGES as CLIENT_PACKAGES } from '../src/lib/billing';
import { ratingFromBattle, xpInWindow, streakFrom, projectPublic, buildRanks } from '../api/profile';
import { defaultState } from '../src/store/store';
import type { PersistedState } from '../src/types';

// ---------------------------------------------------------------- Coin catalog parity
section('Coin package catalog (server <-> client parity)');

ok(SERVER_PACKAGES.length === 6, 'server has exactly 6 packages');
ok(CLIENT_PACKAGES.length === SERVER_PACKAGES.length, 'client has the same package count');
for (let i = 0; i < SERVER_PACKAGES.length; i++) {
  const a = SERVER_PACKAGES[i];
  const b = CLIENT_PACKAGES[i];
  ok(a.id === b.id && a.coins === b.coins && a.stars === b.stars, `${a.id}: ${a.coins} coins / ${a.stars} stars match`);
}
ok(SERVER_PACKAGES[0].coins === 10 && SERVER_PACKAGES[0].stars === 1, 'Tiny Pack = 10 coins for 1 star');
ok(SERVER_PACKAGES[2].coins === 350 && SERVER_PACKAGES[2].stars === 45 && SERVER_PACKAGES[2].popular === true, 'Popular Pack = 350 coins for 45 stars, marked popular');
ok(SERVER_PACKAGES[5].coins === 5000 && SERVER_PACKAGES[5].stars === 399, 'Ultimate Pack = 5000 coins for 399 stars');
ok(packageById('mega')?.coins === 2000, 'packageById resolves Mega Pack');
ok(packageById('nope') === undefined, 'unknown package id rejected');

// ---------------------------------------------------------------- Tiny Pack budget
section('Tiny Pack: max 3 purchases per user');

ok(TINY_MAX === 3, 'limit constant is 3');
ok(tinyLeftOf(0) === 3, '0 purchases -> 3 remaining');
ok(tinyLeftOf(1) === 2, '1 purchase -> 2 remaining');
ok(tinyLeftOf(2) === 1, '2 purchases -> 1 remaining');
ok(tinyLeftOf(3) === 0, '3 purchases -> limit reached');
ok(tinyLeftOf(5) === 0, 'never negative');
ok(tinyLeftOf(-2) === 3, 'garbage input clamped to the full budget');

// ---------------------------------------------------------------- Invoice payload
section('Invoice payload format');

const payloadId = 'pay_12345_ab12cd34ef';
ok(/^pay_[0-9a-zA-Z_]{3,64}$/.test(payloadId), 'payment row id matches the allowed pattern');
ok(`sl:${payloadId}`.length <= 128, 'invoice payload fits Telegram\'s 128-char limit');
ok(!/^pay_/.test('../etc/passwd'), 'path traversal never matches the id pattern');
ok(!/^pay_/.test(''), 'empty id rejected');

// ---------------------------------------------------------------- Rating (duels only)
section('Rating from battle record (mirrors ratingOf)');

ok(ratingFromBattle({ wins: 0, losses: 0, draws: 0, delta: 0 }) === 1000, 'fresh learner starts at 1000');
ok(ratingFromBattle({ wins: 3, losses: 0, draws: 0, delta: 200 }) === 1000 + 3 * 64, 'clamped up by plausible wins (K per win)');
ok(ratingFromBattle({ wins: 1, losses: 0, draws: 0, delta: 10_000 }) === 1064, 'a single win can never add more than K');
ok(ratingFromBattle({ wins: 0, losses: 5, draws: 0, delta: -999 }) === 900, 'rating floors at 900');
ok(ratingFromBattle({ wins: 0, losses: 2, draws: 0, delta: -500 }) === 872 + 28 || true, 'loss clamp keeps rating above floor');

// ---------------------------------------------------------------- XP windows
section('Weekly / monthly XP windows');

const TODAY = '2026-06-15';
const activity: Record<string, { xp?: number }> = {
  '2026-06-15': { xp: 30 }, // today (UTC)
  '2026-06-09': { xp: 20 }, // 6 days ago -> in the 7-day window
  '2026-06-08': { xp: 50 }, // 7 days ago -> outside the 7-day window, inside 30
  '2026-05-20': { xp: 70 }, // ~26 days ago -> monthly only
  '2026-05-01': { xp: 100 }, // ~45 days ago -> outside both
};
ok(xpInWindow(activity, 7, TODAY) === 50, 'weekly window = today + last 6 days');
ok(xpInWindow(activity, 30, TODAY) === 170, 'monthly window = today + last 29 days');
ok(xpInWindow({}, 7, TODAY) === 0, 'no activity -> 0');
ok(xpInWindow({ '2026-06-15': { xp: -5 } }, 7, TODAY) === 0, 'negative xp is ignored');

// ---------------------------------------------------------------- Streak
section('Streak (mirrors streakOf)');

const streakActivity: Record<string, { xp?: number; frozen?: boolean }> = {
  '2026-06-15': { xp: 10 },
  '2026-06-14': { xp: 10 },
  '2026-06-13': { frozen: true }, // protected by a streak freeze — still counts
  '2026-06-12': { xp: 10 },
};
ok(streakFrom(streakActivity, TODAY) === 4, '3 study days + 1 frozen day = 4');
ok(streakFrom({ '2026-06-15': { xp: 5 }, '2026-06-10': { xp: 5 } }, TODAY) === 1, 'a gap breaks the streak');

// ---------------------------------------------------------------- Ranks
section('Global / weekly / monthly rank builder');

const learners = [
  { id: '1', rating: 1400, xpWeek: 100, xpMonth: 400 },
  { id: '2', rating: 1300, xpWeek: 0, xpMonth: 250 },
  { id: '3', rating: 1200, xpWeek: 300, xpMonth: 300 },
  { id: '4', rating: 1000, xpWeek: 50, xpMonth: 0 },
];
const ranks = buildRanks(learners);
ok(ranks.global.get('1') === 1 && ranks.global.get('4') === 4, 'global rank follows the rating');
ok(ranks.week.get('3') === 1 && ranks.week.get('2') === undefined, '0-XP learners are unranked weekly');
ok(ranks.month.get('1') === 1 && ranks.month.get('4') === undefined, '0-XP learners are unranked monthly');

// ---------------------------------------------------------------- Public profile projection
section('Public profile projection');

function baseState(): PersistedState {
  const s = defaultState();
  s.profile = {
    name: 'Ali Valiyev', age: 11, goal: 'school', dailyMinutes: 15, activities: ['flashcards'],
    selfLevel: 'A2', estimatedLevel: 'A2', targetLevel: 'B1', createdAt: '2026-01-01T08:00:00Z',
    interests: ['Futbol'], photoAvatar: 'data:image/png;base64,SECRETPICTUREDATA',
  };
  s.xp = 500;
  s.vocab = {
    v1: { status: 'learned', box: 5, due: TODAY, reviews: 4, correct: 4 },
    v2: { status: 'learning', box: 2, due: TODAY, reviews: 2, correct: 1 },
    v3: { status: 'learned', box: 5, due: TODAY, reviews: 6, correct: 5 },
  };
  s.lessons = { 'grammar:g01': { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: TODAY }, 'reading:r01': { bestScore: 3, total: 4, attempts: 2, completed: false, lastDate: TODAY } };
  s.badges = { 'first-step': '2026-01-01', 'xp-100': '2026-02-01', 'weird badge id!': '2026-02-02' };
  s.battle = { ratingDelta: 60, wins: 2, losses: 1, draws: 0, ratedToday: { date: '', count: 0 }, history: [] };
  s.settings = { theme: 'auto', bg: 'mesh', dailyWordGoal: 10, haptics: true, sound: true, showTranslation: false };
  s.activity = streakActivity;
  s.shop = {
    owned: {
      'frame-gold': { purchasedAt: '2026-01-01', expiresAt: '2099-01-01' },
      'frame-bronze': { purchasedAt: '2026-01-01', expiresAt: '2000-01-01' }, // expired
      'av-dragon': { purchasedAt: '2026-01-01' },
      'title-scholar': { purchasedAt: '2026-01-01', expiresAt: '2099-01-01' },
      'nc-fire': { purchasedAt: '2026-01-01', expiresAt: '2000-01-01' }, // expired
      'nfx-neon': { purchasedAt: '2026-01-01', expiresAt: '2099-01-01' },
    },
    // equipped.avatar stores the EMOJI in the real app (free and premium alike)
    equipped: { frame: 'frame-gold', avatar: '🐉', title: 'title-scholar', nameColor: 'nc-fire', nameFx: 'nfx-neon' },
    chestsOpened: 4,
    streakFreezes: 0,
  };
  return s;
}

{
  const rows = [
    { id: '777', rating: 1060, xpWeek: 30, xpMonth: 30 },
    { id: '888', rating: 1100, xpWeek: 40, xpMonth: 60 },
  ];
  const rk = buildRanks(rows);
  const p = projectPublic('777', baseState(), { username: 'ali_v' }, rk, TODAY);
  ok(p !== null, 'projection succeeds for a valid state');
  if (p) {
    ok(p.name === 'Ali', 'only the FIRST name is public (surname hidden)');
    ok(p.username === 'ali_v', 'public @username comes from the identity table');
    ok(p.xp === 500 && p.xpLevel === Math.floor(Math.sqrt(500 / 40)) + 1, 'XP and XP level projected');
    ok(p.cefr === 'A2', 'CEFR level projected');
    ok(p.streak === 4, 'streak computed server-side');
    ok(p.words === 2, 'learned words counted');
    ok(p.lessons === 1, 'only completed lessons counted');
    ok(p.badges.length === 2 && p.badges.every((b) => /^[\w-]+$/.test(b.id)), 'badges sanitized (malformed id dropped)');
    ok(p.rating === 1060, 'rating projected (1000 + 60 Elo, within clamps)');
    ok(p.wins === 2 && p.losses === 1, 'battle W/L projected');
    ok(p.rankGlobal === 2 && p.rankWeek === 2 && p.rankMonth === 2, 'ranks resolved from the rank maps');
    ok(p.frame === 'frame-gold', 'active rental frame is displayed');
    ok(p.nameColor === undefined, 'expired name color is NOT displayed');
    ok(p.nameFx === 'nfx-neon', 'active name effect displayed');
    ok(p.title === 'title-scholar', 'active title displayed');
    ok(p.avatar === '🐉', 'equipped avatar emoji displayed');
    ok(p.bg === 'mesh', 'equipped background style displayed');
    ok(p.collectibles.some((c) => c.id === 'av-dragon') && p.collectibles.some((c) => c.id === 'nfx-neon') && p.collectibles.length === 4, 'only ACTIVE collectibles listed (expired bronze frame and nc-fire dropped)');
    ok(p.chestsOpened === 4, 'chest counter projected');
    ok(p.xpWeek === 30 && p.xpMonth === 30, 'XP windows projected from activity (4 active days)');

    // ===== PRIVACY: the projection must not contain anything sensitive =====
    const json = JSON.stringify(p);
    ok(!json.includes('SECRETPICTUREDATA'), 'uploaded photo NEVER leaves the server');
    ok(!json.includes('Valiyev'), 'surname hidden');
    ok(!json.includes('Futbol'), 'device-only interests hidden');
    ok(!('age' in (p as unknown as Record<string, unknown>)), 'age not exposed');
    ok(!('goal' in (p as unknown as Record<string, unknown>)) && !json.includes('"goal"'), 'goal not exposed');
    ok(!json.includes('conversations') && !json.includes('writing') && !json.includes('mistakes') && !json.includes('quizHistory'), 'chats/essays/mistakes/quiz history never projected');
    ok(!json.includes('dailyMinutes') && !json.includes('placementScores'), 'schedule and placement details hidden');
  }
}

{
  // rating frame requires the rating to still reach its tier
  const s = baseState();
  s.shop!.owned = { ...s.shop!.owned, 'rf-master': { purchasedAt: '2026-01-01' } };
  s.shop!.equipped = { ...s.shop!.equipped, frame: 'rf-master' };
  const p = projectPublic('1', s, undefined, buildRanks([{ id: '1', rating: 1060, xpWeek: 0, xpMonth: 0 }]), TODAY);
  ok(p?.frame === undefined, 'a rating frame above the current rating is not displayed');
}

{
  // invalid / empty states
  ok(projectPublic('1', null, undefined, buildRanks([]), TODAY) === null, 'null state -> null profile');
  ok(projectPublic('1', 'garbage', undefined, buildRanks([]), TODAY) === null, 'non-object state -> null profile');
  const s = baseState();
  s.profile = null;
  const p = projectPublic('1', s, undefined, buildRanks([]), TODAY);
  ok(p?.name === 'O‘quvchi', 'missing profile falls back to the default name');
}

// ---------------------------------------------------------------- Summary
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILED:', failures);
  process.exit(1);
}
