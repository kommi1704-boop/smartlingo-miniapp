// Smoke test: serverless handlers must degrade gracefully when env is missing and
// must reject unauthenticated calls. Run with:  npx tsx tests/handlers-smoke.test.ts
// (runs WITHOUT env vars — no network calls can happen except Telegram API, which is
// only reachable on paid flows that we do not trigger here).
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

type Req = { method?: string; headers: Record<string, string>; url?: string; body?: unknown };
interface Captured {
  status: number;
  body: unknown;
}
function mockRes(): { res: unknown; captured: Captured } {
  const captured: Captured = { status: 0, body: null };
  const res = {
    status(code: number) {
      captured.status = code;
      return res as never;
    },
    setHeader() {
      return res as never;
    },
    json(b: unknown) {
      captured.body = b;
    },
  };
  return { res, captured };
}

async function call(handler: (req: Req, res: never) => Promise<void>, req: Req): Promise<Captured> {
  const { res, captured } = mockRes();
  await handler(req, res as never);
  return captured;
}

// Ensure the handlers see a MISCONFIGURED environment (no Supabase, no bot token).
delete (process.env as Record<string, string | undefined>).TELEGRAM_BOT_TOKEN;
delete (process.env as Record<string, string | undefined>).SUPABASE_URL;
delete (process.env as Record<string, string | undefined>).SUPABASE_SERVICE_ROLE_KEY;

const payments = (await import('../api/payments')).default;
const profile = (await import('../api/profile')).default;
const leaderboard = (await import('../api/leaderboard')).default;
const bot = (await import('../api/bot')).default;
const progress = (await import('../api/progress')).default;

// probes without auth always answer with {enabled:false}
const c1 = await call(payments, { method: 'GET', headers: {} });
ok(c1.status === 200 && c1.body.enabled === false, 'GET /api/payments probe -> {enabled:false}');

const c2 = await call(profile, { method: 'GET', headers: {} });
ok(c2.status === 200 && c2.body.enabled === false, 'GET /api/profile probe -> {enabled:false}');

const c3 = await call(leaderboard, { method: 'GET', headers: {} });
ok(c3.status === 200 && c3.body.enabled === false, 'GET /api/leaderboard probe -> {enabled:false}');

// authenticated calls without config -> 503 not_configured
const AUTH = { 'x-telegram-init-data': 'hash=abc' };
const c4 = await call(payments, { method: 'GET', headers: AUTH });
ok(c4.status === 503 && c4.body.error === 'not_configured', 'GET /api/payments without config -> 503');

const c5 = await call(profile, { method: 'GET', url: 'https://x/api/profile?uid=123', headers: AUTH });
ok(c5.status === 503, 'GET /api/profile without config -> 503');

const c6 = await call(progress, { method: 'PUT', headers: AUTH, body: { state: {} } });
ok(c6.status === 503, 'PUT /api/progress without config -> 503');

// webhook: no bot token -> 500 (deployment misconfig), not a crash
const c7 = await call(bot, { method: 'POST', headers: {}, body: {} });
ok(c7.status === 500 && c7.body.error === 'not_configured', 'POST /api/bot without token -> 500 not_configured');

// webhook GET (health) -> 200 (with a token configured the endpoint serves health checks)
(process.env as Record<string, string | undefined>).TELEGRAM_BOT_TOKEN = '123:dummy';
(process.env as Record<string, string | undefined>).WEBAPP_URL = 'https://smartlingo.example';
const c8 = await call(bot, { method: 'GET', headers: {} });
ok(c8.status === 200, 'GET /api/bot health -> 200');
delete (process.env as Record<string, string | undefined>).TELEGRAM_BOT_TOKEN;
delete (process.env as Record<string, string | undefined>).WEBAPP_URL;

// payments POST with a nonsense body but valid-looking auth -> 503 (config check comes first)
const c9 = await call(payments, { method: 'POST', headers: { 'content-type': 'application/json', ...AUTH }, body: JSON.stringify({ action: 'open', packageId: 'tiny' }) });
ok(c9.status === 503, 'POST /api/payments without config -> 503 (never reaches invoice logic)');

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('FAILED:', failures);
  process.exit(1);
}
