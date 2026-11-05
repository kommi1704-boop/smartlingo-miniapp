// Viral growth features tests. Run with:  npx tsx tests/viral.test.ts
//
// Covers: the referral payload parser (bot webhook), the reward-constant
// agreement between all three modules, the server-side presence snapshot
// (streak-reminder cron input), the Asia/Tashkent day key, the referral link
// builder and the share-card texts.
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

import { REFERRAL_COINS as BOT_COINS, parseRefPayload } from '../api/bot';
import { REFERRAL_COINS as PROGRESS_COINS, presenceFromState, uztDay } from '../api/progress';
import {
  REFERRAL_COINS as CLIENT_COINS,
  achievementText,
  buildReferralLink,
  inviteText,
} from '../src/lib/referrals';
import { PACKAGES as SERVER_PACKAGES } from '../api/payments';
import { PACKAGES as CLIENT_PACKAGES } from '../src/lib/billing';

// ---------- 1) Referral payload parser ----------
section('parseRefPayload (/start ref<id>)');
ok(parseRefPayload('/start ref123') === 123, 'simple referral payload');
ok(parseRefPayload('/start   ref_123') === null, 'underscore form is rejected (links use ref<id> without underscore)');
ok(parseRefPayload('/start ref007') === 7, 'leading zeros accepted');
ok(parseRefPayload('/start ref0') === null, 'zero referrer rejected');
ok(parseRefPayload('/start ref999999999999999') === 999999999999999, '15-digit ids accepted');
ok(parseRefPayload('/start ref9999999999999999') === null, '16-digit junk rejected');
ok(parseRefPayload('/start') === null, 'plain /start is not a referral');
ok(parseRefPayload('/start extra ref123') === null, 'extra words rejected');
ok(parseRefPayload('/start ref123 ') === 123, 'trailing whitespace tolerated');
ok(parseRefPayload('/start ref-123') === null, 'negative junk rejected');
ok(parseRefPayload('start ref123') === null, 'missing slash rejected');
ok(parseRefPayload('/help ref123') === null, 'other commands are not referrals');

// ---------- 2) Reward constant agreement ----------
section('REFERRAL_COINS agreement across modules');
ok(BOT_COINS === 50 && PROGRESS_COINS === 50 && CLIENT_COINS === 50, 'bot, progress and client all pay 50');
ok(BOT_COINS === PROGRESS_COINS && PROGRESS_COINS === CLIENT_COINS, 'constants are identical');

// ---------- 3) Server-side catalog vs client catalog (regression) ----------
section('coin package catalogs stay in sync');
ok(
  JSON.stringify(SERVER_PACKAGES.map((p) => [p.id, p.coins, p.stars])) ===
    JSON.stringify(CLIENT_PACKAGES.map((p) => [p.id, p.coins, p.stars])),
  'api/payments.ts PACKAGES === src/lib/billing.ts PACKAGES',
);

// ---------- 4) Presence snapshot (cron input) ----------
section('presenceFromState');
ok(JSON.stringify(presenceFromState(null)) === JSON.stringify({ last_active: null, freezes: 0 }), 'null state -> no activity');
ok(JSON.stringify(presenceFromState('junk')) === JSON.stringify({ last_active: null, freezes: 0 }), 'non-object state -> no activity');
ok(JSON.stringify(presenceFromState({})) === JSON.stringify({ last_active: null, freezes: 0 }), 'empty state -> no activity');
const activity = {
  '2026-10-01': { xp: 30 },
  '2026-10-03': { xp: 0, grammar: 1 }, // activity without xp is not "active" (xp>0 rule)
  '2026-10-02': { xp: 10 },
  'bad-key': { xp: 99 }, // malformed key ignored
  '2026-10-05': { xp: 0, frozen: true }, // frozen days count as active
};
ok(presenceFromState({ activity }).last_active === '2026-10-05', 'newest active day wins (incl. frozen days)');
ok(presenceFromState({ activity, shop: { streakFreezes: 2 } }).freezes === 2, 'freezes are read from shop');
ok(presenceFromState({ activity, shop: { streakFreezes: -3 } }).freezes === 0, 'negative freezes clamp to 0');
ok(presenceFromState({ activity, shop: { streakFreezes: 'many' } }).freezes === 0, 'junk freezes clamp to 0');
ok(presenceFromState({ activity: { '2026-09-30': { xp: 1 } } }).last_active === '2026-09-30', 'single day handled');

// ---------- 5) Asia/Tashkent day key ----------
section('uztDay (UTC+5)');
// 2026-06-01T18:59:59Z is still 1 June 23:59:59 in Tashkent (+5).
ok(uztDay(Date.UTC(2026, 5, 1, 18, 59, 59)) === '2026-06-01', '18:59 UTC is the same Tashkent day');
// 2026-06-01T19:00:00Z is already 2 June 00:00:00 in Tashkent.
ok(uztDay(Date.UTC(2026, 5, 1, 19, 0, 0)) === '2026-06-02', '19:00 UTC rolls over to the next Tashkent day');
ok(uztDay(Date.UTC(2026, 5, 1, 0, 0, 0)) === '2026-06-01', 'early UTC morning is the same Tashkent day');
ok(/^\d{4}-\d{2}-\d{2}$/.test(uztDay()), 'default value is a well-formed day key');

// ---------- 6) Referral link builder ----------
section('buildReferralLink');
ok(
  buildReferralLink(12345, 'smartlingo_app_bot', 'https://app.example.com') === 'https://t.me/smartlingo_app_bot?start=ref12345',
  'bot link embeds the referral payload',
);
ok(
  buildReferralLink(12345, null, 'https://app.example.com') === 'https://app.example.com',
  'without a bot username the plain app link is shared (still opens the app)',
);
ok(
  buildReferralLink(12345, undefined, 'https://app.example.com') === 'https://app.example.com',
  'undefined username falls back too',
);
const link = buildReferralLink(42, 'smartlingo_app_bot', 'x');
ok(parseRefPayload(`/start ${new URL(link).searchParams.get('start')}`) === 42, 'round trip: link payload parses back to the referrer id');

// ---------- 7) Share texts ----------
section('share texts');
const t1 = inviteText(link);
assert.ok(typeof t1 === 'string');
ok(t1.includes(link), 'invite text contains the link');
ok(t1.includes('SmartLingo'), 'invite text names the app');
const t2 = achievementText(link, 14, 2530, 9);
ok(t2.includes('14') && t2.includes('2530') && t2.includes('9') && t2.includes(link), 'achievement text embeds streak, xp, level and link');

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error('FAILED:', failures.join(' | '));
  process.exit(1);
}
