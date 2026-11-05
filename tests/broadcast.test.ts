// Admin broadcast (/news) + /ref helper tests. Run with:  npx tsx tests/broadcast.test.ts
//
// Covers: admin id parsing (ADMIN_TELEGRAM_IDS), the /news argument parser
// (preview -> confirm -> continuation cursor), the audience merge (progress ∪
// identities), the personalized announcement/invite texts and the referral link
// fallback — the pure logic behind api/bot.ts. Regression guards for the
// referral parser and the reward constant are also re-checked here.
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
  REFERRAL_COINS as BOT_COINS,
  adminIdsFromEnv,
  broadcastText,
  mergeSortedIds,
  parseNewsArgs,
  parseRefPayload,
  refText,
  referralLinkOf,
} from '../api/bot';

// ---------- 1) ADMIN_TELEGRAM_IDS parsing ----------
section('adminIdsFromEnv');
ok(JSON.stringify(adminIdsFromEnv('123')) === JSON.stringify([123]), 'single id');
ok(JSON.stringify(adminIdsFromEnv(' 123 , 456;789\t9 ')) === JSON.stringify([123, 456, 789, 9]), 'mixed separators + whitespace');
ok(adminIdsFromEnv(undefined).length === 0 && adminIdsFromEnv(null).length === 0 && adminIdsFromEnv('').length === 0, 'missing/empty env -> no admins (fail closed)');
ok(JSON.stringify(adminIdsFromEnv('abc,12')) === JSON.stringify([12]), 'junk entries dropped, valid kept');
ok(adminIdsFromEnv('-5,0').length === 0, 'negative/zero ids dropped');
ok(JSON.stringify(adminIdsFromEnv('999999999999999')) === JSON.stringify([999999999999999]), '15-digit ids accepted');

// ---------- 2) /news argument parser ----------
section('parseNewsArgs');
ok(parseNewsArgs('/news') !== null && parseNewsArgs('/news')!.confirm === false && parseNewsArgs('/news')!.cursor === null, 'plain /news = preview, no confirm');
ok(parseNewsArgs('/news ha')!.confirm === true && parseNewsArgs('/news ha')!.cursor === null, '/news ha = confirmed broadcast');
ok(parseNewsArgs('/news HA')!.confirm === true, 'case-insensitive confirm');
ok(parseNewsArgs('/news ha 500')!.confirm === true && parseNewsArgs('/news ha 500')!.cursor === 500, 'continuation cursor with confirm');
ok(parseNewsArgs('/news 500')!.confirm === true && parseNewsArgs('/news 500')!.cursor === 500, 'bare numeric arg acts as a deliberate continuation');
ok(parseNewsArgs('/news@smartlingo_app_bot ha')!.confirm === true, 'bot-mention form accepted');
ok(parseNewsArgs('/news yubor') !== null && parseNewsArgs('/news yubor')!.confirm === false, 'unknown arg falls back to preview (safe)');
ok(parseNewsArgs('/newsman') === null, 'other words starting with /news are not /news');
ok(parseNewsArgs('/ref') === null && parseNewsArgs('/start') === null, 'other commands are not /news');
ok(parseNewsArgs('  /news ha  ') !== null, 'whitespace tolerated');

// ---------- 3) Audience merge ----------
section('mergeSortedIds (progress ∪ identities)');
ok(
  JSON.stringify(mergeSortedIds([{ telegram_user_id: 3 }, { telegram_user_id: 1 }], [{ telegram_user_id: 1 }, { telegram_user_id: 7 }])) ===
    JSON.stringify([1, 3, 7]),
  'union dedupes and sorts',
);
ok(JSON.stringify(mergeSortedIds([], [])) === '[]', 'empty tables -> empty audience');
ok(
  JSON.stringify(mergeSortedIds([{ telegram_user_id: 0 }, { telegram_user_id: -5 }, { telegram_user_id: Number.NaN }, { telegram_user_id: 42 } as unknown as { telegram_user_id: number }])) ===
    JSON.stringify([42]),
  'junk ids dropped',
);

// ---------- 4) Personal links + texts ----------
section('referralLinkOf / broadcastText / refText');
ok(referralLinkOf(42, 'smartlingo_app_bot', 'https://app.example.com') === 'https://t.me/smartlingo_app_bot?start=ref42', 'deep link embeds the referrer id');
ok(referralLinkOf(42, null, 'https://app.example.com') === 'https://app.example.com', 'no bot username -> plain app link fallback');
ok(parseRefPayload(`/start ${new URL(referralLinkOf(42, 'bot_bot', 'x')).searchParams.get('start')}`) === 42, 'round trip: own link parses back to the id');

const b1 = broadcastText(777, 'smartlingo_app_bot');
ok(b1.includes('https://t.me/smartlingo_app_bot?start=ref777'), 'announcement carries the user OWN personal link');
ok(b1.includes('+50'), 'announcement names the reward amount');
ok(!b1.includes('undefined') && !b1.includes('null'), 'no leaked placeholder words');
const b2 = broadcastText(777, null);
ok(!b2.includes('?start=ref'), 'without a username there is no fake personal link');
ok(b2.includes('+50'), 'degraded announcement still explains the reward');
const r1 = refText(123, 'smartlingo_app_bot');
ok(r1.includes('?start=ref123'), '/ref text carries the personal link');
ok(refText(123, null).includes('Profil'), 'username-less /ref still points to the app section');
assert.ok(typeof b1 === 'string' && b1.length < 4096, 'announcement fits Telegram message limit');
assert.ok(r1.length < 4096, '/ref text fits Telegram message limit');

// ---------- 5) Regression: referral constant + parser stay intact ----------
section('referral regression');
ok(BOT_COINS === 50, 'REFERRAL_COINS is still 50');
ok(parseRefPayload('/start ref123') === 123 && parseRefPayload('/start') === null, 'parseRefPayload behavior unchanged');

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error('FAILED:', failures.join(' | '));
  process.exit(1);
}
