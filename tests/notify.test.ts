// Notification system tests. Run with:  npx tsx tests/notify.test.ts
//
// Covers the pure gating/validation logic behind api/notify.ts, api/notifications.ts,
// api/reminders.ts and api/admin-notify.ts:
//   - category gate (opt-out wins)
//   - quiet hours (incl. midnight wrap) computed in Asia/Tashkent
//   - temporary pause
//   - 'achievements' bypasses quiet hours and pause (a reward already earned is delivered)
//   - preference sanitizer (clamps, caps, junk dropping)
//   - deterministic idempotency ids
//   - campaign text + audience helpers + admin fields validation
//   - presence->reminder helper parity with api/progress.ts
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

// The handlers read these at call time — set BEFORE importing the api modules.
process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc_role_key';
process.env.TELEGRAM_BOT_TOKEN = '123456:TEST_TOKEN';
process.env.WEBAPP_URL = 'https://app.test';

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
  NOTIFY_KINDS, KIND_LABELS_UZ, DEFAULT_CATEGORIES, defaultPrefs, sanitizePrefs, gate, inQuietHours,
  uztHour, historyIdOf, type NotifyPrefs,
} from '../server/notify';
import { audienceIds, campaignText, AUDIENCES, runCampaignSend } from '../api/admin-notify';
import { presenceFromState } from '../api/progress';

// Fixed "now": 2026-11-10 12:00 UTC == 17:00 Tashkent
const T = Date.parse('2026-11-10T12:00:00Z');
// 13:00 UTC == 18:00 Tashkent (inside an 18->21 quiet window)
const T18 = Date.parse('2026-11-10T13:00:00Z');
const TASHKENT_HOUR = uztHour(T);
ok(TASHKENT_HOUR === 17, `uztHour: 12:00 UTC == 17:00 Tashkent (got ${TASHKENT_HOUR})`);

const prefs = (p: Partial<NotifyPrefs> = {}): NotifyPrefs => ({ ...defaultPrefs(), ...p });

// ---------- 1) Category gate ----------
section('category gate');
for (const k of NOTIFY_KINDS) ok(gate(prefs(), k, T) === 'ok', `default: ${k} allowed`);
ok(gate(prefs({ categories: { ...DEFAULT_CATEGORIES, streak: false } }), 'streak', T) === 'skipped_pref', 'streak opt-out wins');
ok(gate(prefs({ categories: { ...DEFAULT_CATEGORIES, quiz: false } }), 'quiz', T) === 'skipped_pref', 'quiz opt-out wins');
ok(gate(prefs({ categories: { ...DEFAULT_CATEGORIES, quiz: false } }), 'battle', T) === 'ok', 'other kinds unaffected');

// ---------- 2) Quiet hours ----------
section('quiet hours');
ok(!inQuietHours(17, 22, 7), '17:00 outside 22->7 window');
ok(inQuietHours(23, 22, 7) && inQuietHours(2, 22, 7) && inQuietHours(6, 22, 7), 'midnight wrap window hits 23, 2, 6');
ok(!inQuietHours(7, 22, 7), 'end hour is exclusive');
ok(inQuietHours(12, 9, 18), 'simple window hits');
ok(!inQuietHours(19, 9, 18), 'simple window misses');
ok(!inQuietHours(12, null, 8) && !inQuietHours(12, 22, null) && !inQuietHours(12, 7, 7), 'incomplete/degenerate windows are never quiet');
ok(gate(prefs({ quiet_enabled: true, quiet_start: 18, quiet_end: 21 }), 'streak', T18) === 'skipped_quiet', '18:00 Tashkent inside 18->21 -> streak skipped');
ok(gate(prefs({ quiet_enabled: true, quiet_start: 18, quiet_end: 21 }), 'streak', T) === 'ok', '17:00 Tashkent outside 18->21 -> streak allowed');
ok(gate(prefs({ quiet_enabled: true, quiet_start: 22, quiet_end: 8 }), 'streak', T) === 'ok', '17:00 outside 22->8 -> streak allowed');
ok(gate(prefs({ quiet_enabled: false, quiet_start: 18, quiet_end: 21 }), 'streak', T) === 'ok', 'disabled quiet hours do not block');
ok(gate(prefs({ quiet_enabled: true, quiet_start: 18, quiet_end: 21 }), 'achievements', T) === 'ok', 'achievements bypass quiet hours (rewards always arrive)');

// ---------- 3) Pause ----------
section('temporary pause');
ok(gate(prefs({ paused_until: new Date(T + 3600_000).toISOString() }), 'news', T) === 'skipped_paused', 'active pause blocks news');
ok(gate(prefs({ paused_until: new Date(T - 1000).toISOString() }), 'news', T) === 'ok', 'expired pause does not block');
ok(gate(prefs({ paused_until: new Date(T + 3600_000).toISOString() }), 'achievements', T) === 'ok', 'achievements bypass pause');

// ---------- 4) Sanitizer ----------
section('sanitizePrefs');
{
  const s = sanitizePrefs({
    categories: { streak: false, junk: true, battle: 'yes' },
    quiet_enabled: true,
    quiet_start: 99,
    quiet_end: -3,
    paused_until: new Date(T + 400 * 24 * 3600 * 1000).toISOString(),
  });
  ok(s.categories?.streak === false, 'known key kept');
  ok(s.categories?.battle === true && !('junk' in (s.categories as object)), 'unknown/junk keys dropped, defaults filled');
  ok(s.quiet_start === 23 && s.quiet_end === 0, 'quiet hours clamped to 0..23');
  ok(s.paused_until !== null && Date.parse(s.paused_until) <= Date.now() + 30 * 24 * 3600 * 1000 + 2000, 'pause capped at 30 days');
  const junk = sanitizePrefs('nonsense');
  ok(Object.keys(junk).length === 0, 'non-object patch -> nothing applied');
  const nul = sanitizePrefs({ quiet_start: null, paused_until: null });
  ok(nul.quiet_start === null && nul.paused_until === null, 'explicit nulls clear values');
}

// ---------- 5) Idempotency ids ----------
section('history ids (deterministic, sanitized)');
ok(historyIdOf('quiz', 42, 'result:fq_1:42') === historyIdOf('quiz', 42, 'result:fq_1:42'), 'same event -> same id');
ok(historyIdOf('quiz', 42, 'a') !== historyIdOf('quiz', 43, 'a'), 'different user -> different id');
ok(historyIdOf('quiz', 42, 'a') !== historyIdOf('battle', 42, 'a'), 'different kind -> different id');
ok(historyIdOf('streak', 7, 'bad key with spaces/🎉') === historyIdOf('streak', 7, 'bad key with spaces/🎉'), 'sanitization is stable');
ok(!/[^a-zA-Z0-9_.:-]/.test(historyIdOf('streak', 7, 'x y z')), 'id contains only safe characters');

// ---------- 6) Campaigns ----------
section('campaign helpers');
ok(JSON.stringify(AUDIENCES) === JSON.stringify(['all', 'active', 'inactive']), 'audiences: all/active/inactive');
{
  const t = campaignText({ title: 'Yangi funksiya', text: 'Do‘st quizi chiqdi!' });
  ok(t.includes('📢 Yangi funksiya') && t.includes('Do‘st quizi chiqdi!') && t.includes('SmartLingo'), 'campaign text rendering');
}

// ---------- 7) Reminder parity ----------
section('presence snapshot (feeds the streak cron)');
{
  const snap = presenceFromState({
    activity: { '2026-11-09': { xp: 30 }, '2026-11-08': { xp: 10 } },
    shop: { streakFreezes: 2 },
  });
  ok(snap.last_active === '2026-11-09' && snap.freezes === 2, 'last_active + freezes parsed server-side');
  const frozen = presenceFromState({ activity: { '2026-11-09': { xp: 0, frozen: true } }, shop: {} });
  ok(frozen.last_active === '2026-11-09', 'freeze-only day counts as active for the snapshot');
}

// ---------- 8) Wiring guards ----------
section('integration wiring (static checks)');
{
  const reminders = readFileSync(new URL('../api/reminders.ts', import.meta.url), 'utf8');
  ok(reminders.includes("kind: 'streak'") && reminders.includes('eventKey: `streak:${today}`'), 'streak cron goes through the dispatcher with a daily event key');
  ok(reminders.includes('reminded_on: today'), 'streak cron keeps the 1/day presence guard');
  ok(reminders.includes("'skipped_block'"), 'freeze holders get a transparent skip record');

  // weekly.ts was merged into admin-notify.ts (Vercel Hobby 12-function limit);
  // the cron URL /api/weekly still works via a vercel.json rewrite (?k=weekly).
  const weekly = readFileSync(new URL('../api/admin-notify.ts', import.meta.url), 'utf8');
  ok(weekly.includes("'weekly'"), 'weekly cron sends kind weekly');
  ok(weekly.includes("status=eq.scheduled,scheduled_at=lte.") || weekly.includes('scheduled_at=lte.'), 'weekly cron dispatches due scheduled campaigns');
  ok(weekly.includes("status=eq.sending"), 'weekly cron resumes interrupted campaigns');

  const battle = readFileSync(new URL('../api/battle.ts', import.meta.url), 'utf8');
  ok(battle.includes('notifyBattleEnd') && battle.includes("kind: 'battle'"), 'battle finish notifications wired');
  const quiz = readFileSync(new URL('../api/quiz.ts', import.meta.url), 'utf8');
  ok(quiz.includes("kind: 'quiz'") && quiz.includes('eventKey: `result:${quiz.id}:${nuid}`'), 'quiz submit notifies the creator exactly once');

  const bot = readFileSync(new URL('../api/bot.ts', import.meta.url), 'utf8');
  ok(bot.includes('?fq='), 'bot invitation buttons carry ?fq= deep links');

  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as { crons: { path: string; schedule: string }[] };
  const paths = vercel.crons.map((c) => c.path);
  ok(paths.includes('/api/reminders') && vercel.crons.find((c) => c.path === '/api/reminders')!.schedule === '0 13 * * *', 'streak cron schedule unchanged (18:00 Tashkent)');
  ok(paths.includes('/api/weekly'), 'weekly cron registered');
  ok(vercel.crons.length === 2, 'exactly two crons — no duplicates');

  const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  ok(schema.includes("'quiz_refund'") === false, 'no stray schema expectations');
  ok(schema.split('coin_grants').length >= 3, 'refund path reuses the existing coin_grants ledger (schema untouched for it)');
}

// ---------- 9) runCampaignSend gating smoke (fake fetch) ----------
section('runCampaignSend respects prefs + history (fake transport)');
{
  // Fake global fetch: Supabase audience query returns 3 users; history insert dedupes.
  const origFetch = globalThis.fetch;
  const historyIds = new Set<string>();
  const sentChats: number[] = [];
  let tgCalls = 0;
  // @ts-expect-error test stub
  globalThis.fetch = async (url: string | URL, init?: RequestInit) => {
    const u = String(url);
    if (u.includes('rest/v1/progress') || u.includes('rest/v1/identities')) {
      return new Response(JSON.stringify([{ telegram_user_id: 1 }, { telegram_user_id: 2 }, { telegram_user_id: 3 }]), { status: 200 });
    }
    if (u.includes('rest/v1/presence')) return new Response('[]', { status: 200 });
    if (u.includes('rest/v1/notification_preferences')) return new Response('[]', { status: 200 });
    if (u.includes('rest/v1/notification_history?on_conflict=id')) {
      const body = JSON.parse((init?.body as string) ?? '{}') as { id: string };
      if (historyIds.has(body.id)) return new Response('[]', { status: 200 }); // duplicate -> ignored
      historyIds.add(body.id);
      return new Response(JSON.stringify([{ id: body.id }]), { status: 200 });
    }
    if (u.includes('rest/v1/notification_history?id=eq.')) return new Response('{}', { status: 200 });
    if (u.includes('api.telegram.org')) {
      tgCalls++;
      sentChats.push((JSON.parse((init?.body as string) ?? '{}') as { chat_id: number }).chat_id);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    return new Response('[]', { status: 200 });
  };
  try {
    const db = { url: 'https://supabase.test', key: 'k' };
    const r = await runCampaignSend(
      db,
      'tok',
      'https://app.test',
      {
        id: 'nc_0000000001', admin_id: 9, title: 'T', text: 'Salom!', image_url: null, button_label: null, button_url: null,
        audience: 'all', category: 'news', status: 'sending', scheduled_at: null, sent_at: null,
        sent_count: 0, failed_count: 0, last_uid: null, created_at: new Date().toISOString(),
      },
      null,
    );
    ok(r.sent === 3 && r.more === false, `campaign run marked 3 sent (got ${r.sent})`);
    ok(tgCalls === 3 && JSON.stringify(sentChats.sort()) === '[1,2,3]', 'exactly one Telegram message per recipient');
    // second run (retry) must be a full no-op thanks to the deterministic history ids
    const r2 = await runCampaignSend(db, 'tok', 'https://app.test', {
      id: 'nc_0000000001', admin_id: 9, title: 'T', text: 'Salom!', image_url: null, button_label: null, button_url: null,
      audience: 'all', category: 'news', status: 'sending', scheduled_at: null, sent_at: null,
      sent_count: 3, failed_count: 0, last_uid: null, created_at: new Date().toISOString(),
    }, null);
    ok(r2.sent === 0 && r2.skipped === 3, `retry sends nothing (skipped ${r2.skipped})`);
    ok(tgCalls === 3, 'no extra Telegram messages on retry');
  } finally {
    globalThis.fetch = origFetch;
  }
}

// ---------- 10) audienceIds filtering ----------
section('audienceIds active/inactive filters (fake fetch)');
{
  const origFetch = globalThis.fetch;
  // @ts-expect-error test stub
  globalThis.fetch = async (url: string | URL) => {
    const u = String(url);
    if (u.includes('rest/v1/progress')) return new Response(JSON.stringify([{ telegram_user_id: 1 }, { telegram_user_id: 2 }, { telegram_user_id: 3 }]), { status: 200 });
    if (u.includes('rest/v1/identities')) return new Response(JSON.stringify([{ telegram_user_id: 3 }]), { status: 200 });
    if (u.includes('rest/v1/presence')) {
      const recent = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      return new Response(JSON.stringify([{ telegram_user_id: 1, last_active: recent }, { telegram_user_id: 2, last_active: '2020-01-01' }]), { status: 200 });
    }
    return new Response('[]', { status: 200 });
  };
  try {
    const db = { url: 'https://supabase.test', key: 'k' };
    const all = await audienceIds(db, 'all');
    const active = await audienceIds(db, 'active');
    const inactive = await audienceIds(db, 'inactive');
    ok(JSON.stringify(all) === '[1,2,3]', 'all = progress ∪ identities');
    ok(JSON.stringify(active) === '[1]', 'active = studied in last 7 days');
    ok(JSON.stringify(inactive) === '[2,3]', 'inactive = the rest (stale or never-synced)');
  } finally {
    globalThis.fetch = origFetch;
  }
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILED:', failures.join(' | '));
  process.exit(1);
}
