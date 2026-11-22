// Client API hardening — regression tests for the console-noise / blank-screen fixes.
// Run with: npx tsx tests/api-client.test.ts
//
//  1. xpApi never leaks a raw network error: offline / timeout / outside Telegram all become XpUnavailable,
//     so callers take their documented offline branch instead of logging a console warning.
//  2. fetchNotifySettings / fetchLeaderboard turn the server's bare `{ enabled }` probe into a clean error
//     instead of returning a half-empty object that crashed the screen (and blanked the whole app).
let passed = 0;
const failures: string[] = [];
function ok(cond: boolean, name: string): void {
  if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failures.push(name); console.error(`  ✗ ${name}`); }
}

const g = globalThis as unknown as Record<string, unknown>;
const win: Record<string, unknown> = { localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, location: { hash: '' }, addEventListener() {}, removeEventListener() {} };
g.window = win;

let fetchImpl: (url: string) => Promise<Response> = async () => { throw new TypeError('fetch failed'); };
let calls = 0;
g.fetch = (url: string) => { calls++; return fetchImpl(url); };
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const { xpApi, XpUnavailable } = await import('../src/lib/xpApi');
const { fetchNotifySettings } = await import('../src/lib/notifyApi');
const { fetchLeaderboard } = await import('../src/lib/battleApi');

const rejects = async (p: Promise<unknown>): Promise<unknown> => { try { await p; return null; } catch (e) { return e; } };

console.log('\nxpApi outside Telegram');
calls = 0;
let e = await rejects(xpApi.lessonDone('k', 1, 1));
ok(e instanceof XpUnavailable, 'no initData -> XpUnavailable');
ok(calls === 0, 'no request is sent at all (nothing for the console to log)');

console.log('\nxpApi inside Telegram');
win.Telegram = { WebApp: { initData: 'query_id=x&hash=y', initDataUnsafe: {} } };
e = await rejects(xpApi.lessonDone('k', 1, 1));
ok(e instanceof XpUnavailable, 'network failure -> XpUnavailable (offline fallback runs)');
fetchImpl = async () => { const err = new Error('timed out'); err.name = 'TimeoutError'; throw err; };
e = await rejects(xpApi.vocabLearned('w'));
ok(e instanceof XpUnavailable, 'timeout -> XpUnavailable');
fetchImpl = async () => json(503, { error: 'not_configured' });
ok((await rejects(xpApi.me())) instanceof XpUnavailable, '503 -> XpUnavailable');
fetchImpl = async () => json(401, { error: 'unauthorized' });
ok((await rejects(xpApi.me())) instanceof XpUnavailable, '401 -> XpUnavailable');
fetchImpl = async () => json(500, { error: 'boom' });
e = await rejects(xpApi.me());
ok(e instanceof Error && !(e instanceof XpUnavailable) && e.message === 'boom', 'a real server error is still surfaced');
fetchImpl = async () => json(200, { granted: 5 });
ok(((await xpApi.lessonDone('k', 1, 1)) as { granted: number }).granted === 5, 'success path unchanged');

console.log('\nprobe responses never reach the screens');
fetchImpl = async () => json(200, { enabled: false });
e = await rejects(fetchNotifySettings());
ok(e instanceof Error && e.message === 'not_configured', 'notifications: {enabled:false} -> not_configured');
fetchImpl = async () => json(200, { enabled: true });
e = await rejects(fetchNotifySettings());
ok(e instanceof Error && e.message === 'unauthorized', 'notifications: {enabled:true} (no auth) -> unauthorized');
fetchImpl = async () => json(200, { enabled: true, categories: { streak: true }, kinds: [], quietEnabled: false, quietStart: null, quietEnd: null, pausedUntil: null, history: [] });
ok(((await fetchNotifySettings()) as { enabled: boolean }).enabled === true, 'notifications: real payload passes through');
fetchImpl = async () => json(200, { enabled: false });
e = await rejects(fetchLeaderboard());
ok(e instanceof Error && e.message === 'not_configured', 'leaderboard: probe -> not_configured (screen shows the offline card)');
fetchImpl = async () => json(200, { me: '7', list: [{ id: '7' }] });
const lb = await fetchLeaderboard();
ok(lb.list.length === 1 && Array.isArray(lb.weekly) && Array.isArray(lb.monthly), 'leaderboard: missing weekly/monthly default to []');

console.log(`\n${failures.length ? '✗' : '✓'} ${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
