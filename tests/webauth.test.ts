// Browser sign-in (Telegram Login -> server-signed initData). Run with:  npx tsx tests/webauth.test.ts
import assert from 'node:assert';
import crypto from 'node:crypto';
import { verifyWidgetLogin, signInitData, verifyWebSession, webAuthHandler } from '../api/_lib/webauth.js';

let passed = 0;
const failures: string[] = [];
function ok(cond: boolean, name: string): void {
  if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failures.push(name); console.log(`  ✗ ${name}`); }
}

const TOKEN = '123456:TEST-TOKEN';
const NOW = 1_800_000_000;

// A payload exactly as the Telegram Login Widget would sign it.
function widget(fields: Record<string, string | number>, token = TOKEN): Record<string, string | number> {
  const dcs = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const hash = crypto.createHmac('sha256', crypto.createHash('sha256').update(token).digest()).update(dcs).digest('hex');
  return { ...fields, hash };
}

console.log('Telegram Login Widget verification');
const good = widget({ id: 42, first_name: 'Madina', username: 'madina', auth_date: NOW - 60 });
ok(verifyWidgetLogin(good, TOKEN, NOW)?.id === 42, 'valid widget payload is accepted');
ok(verifyWidgetLogin(good, 'other:token', NOW) === null, 'wrong bot token is rejected');
ok(verifyWidgetLogin({ ...good, id: 43 }, TOKEN, NOW) === null, 'tampered id is rejected');
ok(verifyWidgetLogin({ ...good, hash: 'a'.repeat(64) }, TOKEN, NOW) === null, 'forged hash is rejected');
ok(verifyWidgetLogin(widget({ id: 42, auth_date: NOW - 2 * 86400 }), TOKEN, NOW) === null, 'payload older than 24 h is rejected');
ok(verifyWidgetLogin(widget({ id: 42, auth_date: NOW + 3600 }), TOKEN, NOW) === null, 'payload from the future is rejected');
ok(verifyWidgetLogin(null, TOKEN, NOW) === null && verifyWidgetLogin('x', TOKEN, NOW) === null, 'garbage input is rejected');

console.log('Server-signed session (Mini App initData format)');
const init = signInitData({ id: 42, first_name: 'Madina' }, TOKEN, NOW);
ok(verifyWebSession(init, TOKEN, NOW + 100)?.id === 42, 'issued session verifies');
ok(verifyWebSession(init, 'other:token', NOW + 100) === null, 'session is bound to the bot token');
ok(verifyWebSession(init, TOKEN, NOW + 8 * 86400) === null, 'session expires after 7 days');
ok(verifyWebSession(init.replace('%22id%22%3A42', '%22id%22%3A43'), TOKEN, NOW + 100) === null, 'tampered user is rejected');

// The point of the design: the SAME check every api/*.ts uses for real Mini App data accepts our string.
function miniAppValidate(initData: string, botToken: string): { ok: boolean; userId?: string } {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false };
  params.delete('hash');
  const dcs = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  const a = Buffer.from(calc, 'hex'); const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };
  return { ok: true, userId: String(JSON.parse(params.get('user') ?? '{}').id ?? '') };
}
const v = miniAppValidate(signInitData({ id: 777 }, TOKEN), TOKEN);
ok(v.ok && v.userId === '777', 'existing endpoint validateInitData() accepts the web session unchanged');

console.log('HTTP handler');
function call(body: unknown, method = 'POST', env = true): Promise<{ code: number; json: Record<string, unknown> }> {
  const prev = process.env.TELEGRAM_BOT_TOKEN;
  if (env) process.env.TELEGRAM_BOT_TOKEN = TOKEN; else delete process.env.TELEGRAM_BOT_TOKEN;
  return new Promise((resolve) => {
    let code = 200;
    const res = { status(c: number) { code = c; return res; }, json(b: unknown) { if (prev === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = prev; resolve({ code, json: b as Record<string, unknown> }); } };
    void webAuthHandler({ method, headers: { 'x-forwarded-for': `t${Math.random()}` }, body }, res);
  });
}
const nowSec = Math.floor(Date.now() / 1000);
const login = await call({ action: 'login', user: widget({ id: 5, first_name: 'Ali', auth_date: nowSec }) });
ok(login.code === 200 && typeof login.json.initData === 'string', 'login returns a session');
const refreshed = await call({ action: 'refresh', initData: login.json.initData });
ok(refreshed.code === 200 && typeof refreshed.json.initData === 'string', 'refresh re-issues a session');
ok((await call({ action: 'login', user: { id: 5, auth_date: nowSec, hash: 'x' } })).code === 401, 'bad login -> 401');
ok((await call({ action: 'refresh', initData: 'auth_date=1&hash=00' })).code === 401, 'bad refresh -> 401');
ok((await call({ action: 'nope' })).code === 400, 'unknown action -> 400');
ok((await call({}, 'POST', false)).code === 503, 'no bot token -> 503');
ok((await call(undefined, 'GET')).code === 200, 'GET probe works');

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
void assert;
