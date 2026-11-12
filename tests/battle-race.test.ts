// Battle concurrency / error-surfacing tests. Run with:  npx tsx tests/battle-race.test.ts
//
// Regression tests for the fixes in api/battle.ts:
//  1. two players answering at the same moment: the second write used to ERASE the first answer
//     (guard on `round` only) -> now guarded by round + answer counter and retried;
//  2. correctness is decided by the server when the client sends `choice` (a forged `correct:1` is ignored);
//  3. a Supabase failure is a 502 storage_error (with a precise log line), not a fake 404 / "battle not found";
//  4. a failing heartbeat write never breaks a poll.
// Telegram initData is generated with the exact HMAC scheme validateInitData checks.
import crypto from 'node:crypto';

// ---- env BEFORE importing the handler ----
process.env.TELEGRAM_BOT_TOKEN = '123456:TEST_TOKEN';
process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc_role_key';

import battleHandler from '../api/battle';

// ---------- tiny test harness ----------
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

// ---------- fake Telegram initData ----------
let uidCounter = 800000;
function makeInitData(): { raw: string; id: string } {
  const id = String(++uidCounter);
  const params = new URLSearchParams();
  params.set('auth_date', String(Math.floor(Date.now() / 1000)));
  params.set('user', JSON.stringify({ id: Number(id), first_name: 'Test' }));
  const dcs = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  const hash = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  params.set('hash', hash);
  return { raw: params.toString(), id };
}

// ---------- in-memory Supabase ----------
type Row = Record<string, any>;
const store: { battles: Map<string, Row> } = { battles: new Map() };

function resetStore(): void {
  store.battles.clear();
}

/** PostgREST filter value "eq.123" -> { op: 'eq', val: '123' }. URLSearchParams already split k=v. */
function parseCond(v: string): { op: string; val: string } {
  const m = v.match(/^(eq|neq|gte|lte|gt|lt)\.(.*)$/);
  return m ? { op: m[1], val: m[2] } : { op: 'eq', val: v };
}

function rowMatches(row: Row, conds: [string, string][]): boolean {
  return conds.every(([k, raw]) => {
    const { op, val } = parseCond(raw);
    if (k.startsWith('live->>')) return op === 'eq' && String(row.live?.[k.slice('live->>'.length)]) === val;
    const cur = row[k];
    if (op === 'eq') return String(cur) === val;
    if (op === 'neq') return String(cur) !== val;
    if (op === 'gte') return String(cur) >= val;
    if (op === 'lt') return String(cur) < val;
    return false;
  });
}

const installed = globalThis.fetch;
async function mockFetch(url: unknown, init?: RequestInit): Promise<Response> {
  const u = String(url);
  const m = u.match(/\/rest\/v1\/([^?]*)(\?.*)?$/);
  if (!m) return new Response('{}', { status: 404 });
  const table = m[1];
  if (table !== 'battles') return new Response('[]', { status: 200 });
  const query = new URLSearchParams((m[2] ?? '').replace(/^\?/, ''));
  const method = (init?.method ?? 'GET').toUpperCase();
  const prefer = String((init?.headers as Record<string, string>)?.prefer ?? '');
  const conds = [...query.entries()].filter(([k]) => k !== 'select' && k !== 'order' && k !== 'limit') as [string, string][];

  if (method === 'POST') {
    const row = JSON.parse(String(init?.body ?? '{}')) as Row;
    if (store.battles.has(row.id)) return new Response('{}', { status: 409 });
    store.battles.set(row.id, structuredClone(row));
    return new Response('[]', { status: 201 });
  }
  if (method === 'PATCH') {
    const body = JSON.parse(String(init?.body ?? '{}')) as Row;
    const out: Row[] = [];
    for (const row of store.battles.values()) {
      if (!rowMatches(row, conds)) continue;
      Object.assign(row, structuredClone(body));
      out.push(row);
    }
    return new Response(JSON.stringify(prefer.includes('return=representation') ? out : []), { status: 200 });
  }
  if (method === 'DELETE') {
    for (const [id, row] of [...store.battles.entries()]) {
      if (rowMatches(row, conds)) store.battles.delete(id);
    }
    return new Response('[]', { status: 200 });
  }
  // GET: rows matching every filter (select=*&id=eq.X lands here too)
  const rows = [...store.battles.values()].filter((row) => rowMatches(row, conds));
  return new Response(JSON.stringify(rows), { status: 200 });
}
globalThis.fetch = mockFetch as typeof fetch;

// ---------- fake req/res ----------
interface FakeRes {
  readonly status: number;
  readonly body: Record<string, unknown>;
}
type Body = Record<string, unknown>;
function call(method: 'GET' | 'POST', query: string, body: Body | undefined, initData: string): Promise<FakeRes> {
  let status = 0;
  let json: Record<string, unknown> = {};
  const res = {
    status(c: number) {
      status = c;
      return res;
    },
    setHeader() {
      return res;
    },
    json(b: unknown) {
      json = b as Record<string, unknown>;
    },
  };
  const url = `http://local/api/battle${query}`;
  return battleHandler({ method, url, headers: { 'x-telegram-init-data': initData }, body }, res).then(() => ({
    status,
    body: json,
  }));
}

// ---------- fixtures ----------
const QUESTIONS = Array.from({ length: 7 }, (_, i) => ({
  id: `q${i}`,
  q: `Pick the right word ${i}?`, // short -> 15s clock on the server
  options: ['a', 'b', 'c', 'd'],
  answer: i % 4,
  explain: 'because',
}));
const ME1 = { rating: 1200, name: 'Aziz', avatar: '🙂' }; // p1 = challenger
const ME2 = { rating: 1063, name: 'Dilorom', avatar: '😎' }; // p2 = joiner (137 lower -> forfeit loss = -44)

async function openBattle(p1: { raw: string }): Promise<string> {
  const r = await call('POST', '', { action: 'open', questions: QUESTIONS, ...ME1 }, p1.raw);
  ok(r.status === 200 && Boolean((r.body.battle as Body)?.id), 'open challenge');
  return (r.body.battle as Body)!.id as string;
}

async function joinBattle(id: string, p2: { raw: string }): Promise<void> {
  const r = await call('POST', '', { action: 'join', id, ...ME2 }, p2.raw);
  ok(r.status === 200 && (r.body.battle as Body)?.status === 'active', 'join challenge');
}

const sync = async (id: string, who: { raw: string }) => call('GET', `?action=sync&id=${encodeURIComponent(id)}`, undefined, who.raw);
const answer = async (id: string, who: { raw: string }, round: number, correct: boolean) =>
  call('POST', '', { action: 'answer', id, round, correct: correct ? 1 : 0, t: 1200 }, who.raw);

/** Ages one player's heartbeat inside the fake DB (simulates a silent app). */
function ageSeen(id: string, side: 'p1' | 'p2', agoMs: number): void {
  store.battles.get(id)![side === 'p1' ? 'seen1' : 'seen2'] = Date.now() - agoMs;
}
function row(id: string): Row {
  return store.battles.get(id)!;
}


// ---------- fault injection on top of the in-memory Supabase ----------
const baseFetch = globalThis.fetch;
let injectBeforeGuardedPatch: (() => void) | null = null; // runs ONCE, right before a PATCH guarded by live->>n
let failBattleReads = false;
let failHeartbeat = false;
globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
  const u = String(url);
  const method = (init?.method ?? 'GET').toUpperCase();
  if (injectBeforeGuardedPatch && method === 'PATCH' && u.includes('live->>n=eq.')) {
    const f = injectBeforeGuardedPatch;
    injectBeforeGuardedPatch = null;
    f();
  }
  if (failBattleReads && method === 'GET' && u.includes('/rest/v1/battles')) {
    return new Response(JSON.stringify({ code: 'PGRST205', message: 'Could not find the table' }), { status: 404 });
  }
  if (failHeartbeat && method === 'PATCH' && !u.includes('live->>') && !(init?.headers as Record<string, string> | undefined)?.prefer) {
    throw new Error('network down');
  }
  return baseFetch(url as string, init);
}) as typeof fetch;

async function startedBattle(): Promise<{ p1: { raw: string }; p2: { raw: string }; id: string }> {
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 5_000; // round 0 is open
  return { p1, p2, id };
}

const realErr = console.error;

section('1. simultaneous WRONG answers: the first answer must not be erased');
{
  const { p1, id } = await startedBattle();
  injectBeforeGuardedPatch = () => {
    // the opponent's wrong answer lands between p1's read and p1's write
    row(id).live.a2 = { c: 0, t: 900 };
    row(id).live.n = 1;
  };
  const r = await answer(id, p1, 0, false); // p1 answers wrong too
  ok(r.status === 200, 'answer accepted');
  ok(row(id).live.n === 2, `both answers were counted (n=${row(id).live.n})`);
  ok(row(id).live.round === 1, `both wrong -> round advanced (round=${row(id).live.round})`);
  ok(row(id).live.s1 === 0 && row(id).live.s2 === 0, 'nobody scored');
}

section('2. server decides correctness from `choice` (forged correct:1 is ignored)');
{
  const { p1, p2, id } = await startedBattle();
  // question 0: right option is index 0. p1 forges correct:1 but picks option 3.
  const forged = await call('POST', '', { action: 'answer', id, round: 0, correct: 1, choice: 3, t: 800 }, p1.raw);
  ok(forged.status === 200 && row(id).live.s1 === 0, 'forged correct:1 with a wrong choice scores nothing');
  const honest = await call('POST', '', { action: 'answer', id, round: 0, choice: 0, t: 900 }, p2.raw);
  ok(honest.status === 200 && row(id).live.s2 === 1, 'a really-correct choice scores for p2 (server-checked)');
  const legacy = await startedBattle();
  await call('POST', '', { action: 'answer', id: legacy.id, round: 0, correct: 1, t: 700 }, legacy.p1.raw);
  ok(row(legacy.id).live.s1 === 1, 'old clients (no `choice`) still work via the legacy flag');
}

section('3. Supabase failure is a 502 storage_error, not "not_found"');
{
  const { p1, id } = await startedBattle();
  console.error = () => undefined; // the handler logs the failure; keep test output clean
  failBattleReads = true;
  const s = await sync(id, p1);
  failBattleReads = false;
  console.error = realErr;
  ok(s.status === 502 && s.body.error === 'storage_error', `sync during an outage -> 502 (got ${s.status})`);
  const s2 = await sync(id, p1);
  ok(s2.status === 200, 'and it recovers as soon as Supabase is back');
}

section('4. a failing heartbeat write never breaks a poll');
{
  const { p1, id } = await startedBattle();
  failHeartbeat = true;
  const s = await sync(id, p1);
  failHeartbeat = false;
  ok(s.status === 200 && (s.body.live as Body).status === 'active', 'sync still answers 200 when the heartbeat PATCH throws');
}

globalThis.fetch = installed;

console.log(`\n===== ${passed} passed, ${failures.length} failed =====`);
if (failures.length) {
  failures.forEach((f) => console.error('FAILED:', f));
  process.exit(1);
}
