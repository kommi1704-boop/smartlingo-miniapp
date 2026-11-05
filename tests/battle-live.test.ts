// Regression tests for the live PvP duel fixes in api/battle.ts.
// Run with:  npx tsx tests/battle-live.test.ts
//
// Reproduces the exact user report ("savollar boshlanmadan jang tugadi 0:0 durrang -44"):
//  1. the joiner's first sync must NOT forfeit the challenger whose heartbeat went stale
//     while they waited for a joiner (the waiting flow only polls action=get);
//  2. an auto-finish (question clock / stale heartbeat) with ZERO recorded answers must
//     ABORT the battle: winner 0, both Elo deltas 0 — rating untouched;
//  3. the stale-heartbeat forfeit must respect the 3.5s countdown and the 40s window;
//  4. manual forfeits still count as a real loss at any score;
//  5. normal play (first correct answer takes the point) is unaffected.
//
// Everything external is mocked: Supabase runs as an in-memory store behind globalThis.fetch,
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

// =====================================================================
console.log('\n=== Duel fixes: no more 0:0 -44 before question 1 ===\n');

section('1. waiting-phase heartbeat (action=get refreshes seen1)');
{
  resetStore();
  const p1 = makeInitData();
  const id = await openBattle(p1);
  ageSeen(id, 'p1', 120_000); // p1 has been waiting for 2 minutes
  await call('GET', `?action=get&id=${encodeURIComponent(id)}`, undefined, p1.raw);
  ok(Date.now() - row(id).seen1 < 5000, 'get refreshes the challenger heartbeat');
}

section('2. THE BUG: joiner syncs after a long wait -> battle must stay active');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  ageSeen(id, 'p1', 120_000); // p1 waited 2 minutes without a single get/sync (worst case)
  await joinBattle(id, p2);
  ok(row(id).seen1 === null, 'join resets the stale pre-activation heartbeat');
  const s = await sync(id, p2);
  const live = s.body.live as Body;
  ok(live.status === 'active' && live.round === 0, 'first joiner sync does NOT forfeit the challenger');
  const s2 = await sync(id, p1);
  ok((s2.body.live as Body).status === 'active', 'challenger sync also keeps the battle alive');
}

section('3. countdown is a grace period: no forfeit while roundStart is in the future');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  ageSeen(id, 'p2', 45_000); // joiner silent for 45s (worst case)
  const s = await sync(id, p1);
  ok((s.body.live as Body).status === 'active', '45s-silent opponent during countdown does not forfeit');
}

section('4. stale forfeit with ZERO answers -> ABORT (rating untouched)');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  ageSeen(id, 'p2', 45_000);
  // force the countdown to be over (round 0 opened 5s ago)
  row(id).live.roundStart = Date.now() - 5_000;
  const s = await sync(id, p1);
  const live = s.body.live as Body;
  ok(live.status === 'finished', 'stale opponent after the countdown finishes the battle');
  ok(live.aborted === true, 'finish is marked aborted (zero answers)');
  ok(live.winner === 'draw' && (live.myDelta ?? 0) === 0, 'no winner, my delta is 0');
  ok(row(id).p1_delta === 0 && row(id).p2_delta === 0, 'both Elo deltas are 0 in the DB');
}

section('5. stale forfeit WITH answers -> real win, real Elo');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 5_000; // round 0 open
  const a1 = await answer(id, p1, 0, true); // p1 takes the point -> round 1
  ok(((a1.body.live as Body).s1 as number) === 1, 'p1 scores');
  ageSeen(id, 'p2', 45_000); // p2 vanishes mid-battle
  row(id).live.roundStart = Date.now() - 5_000; // the 1.5s reveal pause is over, round 1 is open
  const s = await sync(id, p1);
  const live = s.body.live as Body;
  ok(live.status === 'finished' && live.winner === 'me' && live.aborted === undefined, 'p1 wins by forfeit');
  ok((live.myDelta as number) > 0 && (live.myDelta as number) <= 64, 'p1 gains rating');
  ok(row(id).p2_delta! < 0, 'p2 (quitter) loses rating — cannot escape');
}

section('6. manual forfeit at 0:0 still counts as a real loss');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 5_000;
  const f = await call('POST', '', { action: 'forfeit', id }, p2.raw);
  const live = f.body.live as Body;
  ok(live.status === 'finished' && live.winner === 'opp', 'opponent wins');
  ok(live.aborted === undefined && (live.myDelta as number) < 0, 'manual quit costs rating even at 0:0');
}

section('7. zero-answer CLOCK finish also aborts (both players offline)');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  // both players disappeared right after joining; the clock catch-up runs on the next sync
  row(id).live.roundStart = Date.now() - 7 * 20_000; // older than all 7 questions
  const s = await sync(id, p1);
  const live = s.body.live as Body;
  ok(live.status === 'finished' && live.aborted === true, 'clock-finished battle with zero answers aborts');
  ok(row(id).p1_delta === 0 && row(id).p2_delta === 0, 'rating untouched');
}

section('8. normal play: first correct answer takes the point, battle finishes with Elo');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 5_000;
  let round = 0;
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < 7; i++) {
    const p1Wins = i % 2 === 0;
    const winner = p1Wins ? p1 : p2;
    const a = await answer(id, winner, round, true);
    const live = a.body.live as Body;
    if (live.status === 'finished') {
      s1 = live.s1 as number;
      s2 = live.s2 as number;
      break;
    }
    s1 = live.s1 as number;
    s2 = live.s2 as number;
    round = live.round as number;
    row(id).live.roundStart = Date.now() - 5_000; // reopen the next question for the test
  }
  ok(s1 === 4 && s2 === 3, `scores run 4:3 (got ${s1}:${s2})`);
  ok(row(id).status === 'finished' && row(id).winner === row(id).p1, 'p1 wins 4:3');
  ok(row(id).p1_delta! > 0 && row(id).p2_delta! < 0, 'Elo applied both ways');
  ok(row(id).live.aborted === undefined, 'a played battle is never aborted');
}

globalThis.fetch = installed;

console.log(`\n===== ${passed} passed, ${failures.length} failed =====`);
if (failures.length) {
  failures.forEach((f) => console.error('FAILED:', f));
  process.exit(1);
}
