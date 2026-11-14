// End-to-end duel lifecycle tests for the matchmaking + live-battle fixes.
// Run with:  npx tsx tests/battle-e2e.test.ts
//
// Drives the REAL api/battle.ts handler (in-memory Supabase, exact-HMAC initData) through the
// complete lifecycle of a duel, mirroring what the CLIENT code does (including the new
// cross-join waiting poll in src/pages/Battle.tsx):
//   1. two simultaneous searchers match via the waiting poll (the "cannot find opponent" fix)
//   2. both receive the SAME battle id + the SAME questions
//   3. the first syncs are synchronized (same round / roundStart / server clock)
//   4. answers are recorded, first-correct-takes-the-point, both-wrong advances
//   5. a full match finishes with Elo applied EXACTLY ONCE (repeat polls never double-count)
//   6. an answer sent for a stale round is refused and re-sent for the current round records
//      (the contract the new client retry logic relies on)
//   7. an answer sent before the question clock opens is refused
//   8. a mid-battle disconnect (silent heartbeat) forfeits the silent player exactly once
//   9. a ghost challenger (opened a challenge, never showed up) aborts the battle — no Elo
//      even when the joiner answered alone (farming closed)
//  10. joining someone deletes the joiner's own stale open challenges (no ghost rows left)
//  11. a manual forfeit at 0:0 still counts as a real loss (regression)
//  12. the waiting-phase heartbeat keeps a long-waiting challenger joinable (reconnection)
import crypto from 'node:crypto';

process.env.TELEGRAM_BOT_TOKEN = '123456:TEST_TOKEN';
process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc_role_key';

import battleHandler from '../api/battle';

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
let uidCounter = 900000;
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

// ---------- in-memory Supabase (battles only; every other table is empty) ----------
type Row = Record<string, any>;
const store: { battles: Map<string, Row> } = { battles: new Map() };

function resetStore(): void {
  store.battles.clear();
}

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
  return battleHandler({ method, url: `http://local/api/battle${query}`, headers: { 'x-telegram-init-data': initData }, body }, res).then(() => ({
    status,
    body: json,
  }));
}

// ---------- fixtures ----------
const QUESTIONS = Array.from({ length: 7 }, (_, i) => ({
  id: `q${i}`,
  q: `Pick the right word ${i}?`,
  options: ['a', 'b', 'c', 'd'],
  answer: i % 4,
  explain: 'because',
}));
const ME1 = { rating: 1200, name: 'Aziz', avatar: '🙂' };
const ME2 = { rating: 1100, name: 'Dilorom', avatar: '😎' };

interface Me {
  raw: string;
  id: string;
}

async function openBattle(p1: Me): Promise<string> {
  const r = await call('POST', '', { action: 'open', questions: QUESTIONS, ...ME1 }, p1.raw);
  ok(r.status === 200 && Boolean((r.body.battle as Body)?.id), 'open challenge');
  return (r.body.battle as Body)!.id as string;
}

async function joinBattle(id: string, p2: Me): Promise<void> {
  const r = await call('POST', '', { action: 'join', id, ...ME2 }, p2.raw);
  ok(r.status === 200 && (r.body.battle as Body)?.status === 'active', 'join challenge');
}

const listChallenges = async (who: Me) => {
  const r = await call('GET', '?action=list', undefined, who.raw);
  return ((r.body.list as Body[]) ?? []).map((x) => String(x.id));
};
const sync = async (id: string, who: Me) => call('GET', `?action=sync&id=${encodeURIComponent(id)}`, undefined, who.raw);
const getB = async (id: string, who: Me) => call('GET', `?action=get&id=${encodeURIComponent(id)}`, undefined, who.raw);
const answer = async (id: string, who: Me, round: number, choice: number, t = 900) =>
  call('POST', '', { action: 'answer', id, round, correct: 0, choice, t }, who.raw);
const answerRaw = async (id: string, who: Me, body: Body) => call('POST', '', { action: 'answer', id, ...body }, who.raw);

function row(id: string): Row {
  return store.battles.get(id)!;
}

/**
 * Faithful model of the NEW waiting poll in src/pages/Battle.tsx (goSearching step 2):
 * every tick get(my battle); on even ticks also list() + try to join another open challenge.
 * `enter` is called with the battle id once the poll transitions into a duel.
 */
async function waitingPollTick(tick: number, openedId: string, me: Me, enter: (id: string) => void): Promise<void> {
  const g = await getB(openedId, me);
  const b = (g.body.battle as Body | null) ?? null;
  if (b && b.status === 'active') {
    enter(String(b.id));
    return;
  }
  if (b && b.status === 'finished') {
    enter('finished:' + openedId); // the search screen now shows the real result
    return;
  }
  if (tick % 2 === 0) {
    const others = await listChallenges(me);
    for (const cid of others) {
      if (cid === openedId) continue;
      const j = await call('POST', '', { action: 'join', id: cid, ...ME2 }, me.raw);
      if (j.status === 200 && (j.body.battle as Body)?.status === 'active') {
        enter(String((j.body.battle as Body)!.id));
        return;
      }
    }
  }
}

// =====================================================================
console.log('\n=== Duel lifecycle: matchmaking -> sync -> play -> finish -> rating ===\n');

section('1+2. two simultaneous searchers match via the waiting poll; same battle, same questions');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  // both search at the same moment: both see an EMPTY list, both open their own challenge
  const listA = await listChallenges(p1);
  const listB = await listChallenges(p2);
  ok(listA.length === 0 && listB.length === 0, 'both initial searches see an empty list (the deadlock setup)');
  const idA = await openBattle(p1);
  const idB = await openBattle(p2);
  ok(idA !== idB, 'each opened their own challenge');
  // the new waiting polls run (B's poll cross-joins A's challenge)
  let enteredB = '';
  await waitingPollTick(2, idB, p2, (id) => (enteredB = id));
  ok(enteredB === idA, 'B\'s waiting poll cross-joined A\'s challenge');
  // A's get-poll sees the battle go active
  let enteredA = '';
  for (let t = 1; t <= 3 && !enteredA; t++) await waitingPollTick(t, idA, p1, (id) => (enteredA = id));
  ok(enteredA === idA, 'A\'s get-poll entered the same battle');
  // B's own redundant open challenge is gone (join deletes the joiner\'s open rows)
  const afterJoin = await listChallenges(p2);
  ok(!afterJoin.includes(idB), 'B\'s stale open challenge was deleted on join');
  const a = await getB(idA, p1);
  const viewA = a.body.battle as Body;
  const jv = await getB(idA, p2);
  const viewB = jv.body.battle as Body;
  ok(String(viewA.id) === idA && String(viewB.id) === idA, 'both players received the SAME battle id');
  ok(JSON.stringify(viewA.questions) === JSON.stringify(viewB.questions), 'both players received the SAME questions');
  ok(viewA.me === 'p1' && viewB.me === 'p2', 'sides are assigned correctly');
}

section('3. synchronized start: same round + shared clock');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  const s1 = await sync(id, p1);
  const s2 = await sync(id, p2);
  const l1 = s1.body.live as Body;
  const l2 = s2.body.live as Body;
  ok(l1.round === l2.round && l1.roundStart === l2.roundStart, 'same round and same roundStart on both sides');
  ok(Math.abs(Number(l1.serverNow) - Number(l2.serverNow)) < 1000, 'server clocks agree');
  ok(l1.status === 'active' && l1.round === 0, 'battle active at round 0');
}

section('4. answers: first correct takes the point, both wrong advances, wrong-then-correct');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 4_000; // round 0 open
  const wrong1 = await answer(id, p1, 0, (QUESTIONS[0].answer + 1) % 4);
  const l1 = wrong1.body.live as Body;
  ok(Number(l1.s1) === 0 && l1.mine != null && l1.round === 0, 'wrong answer recorded, no point, round waits');
  const right2 = await answer(id, p2, 0, QUESTIONS[0].answer);
  const l2 = right2.body.live as Body;
  ok(Number(l2.s2) === 1 && Number(l2.round) === 1, 'first CORRECT answer takes the point and advances the round');
  // round 1: p2 answers wrong, then p1 answers wrong -> both wrong -> advance, nobody scores
  row(id).live.roundStart = Date.now() - 4_000;
  const w2 = await answer(id, p2, 1, (QUESTIONS[1].answer + 1) % 4);
  ok(Number((w2.body.live as Body).round) === 1, 'wrong answer waits for the opponent');
  const w1 = await answer(id, p1, 1, (QUESTIONS[1].answer + 2) % 4);
  ok(Number((w1.body.live as Body).round) === 2 && Number((w1.body.live as Body).s1) === 0 && Number((w1.body.live as Body).s2) === 1, 'both wrong -> next question, nobody scores');
}

section('5. full match: Elo applied EXACTLY once, repeat requests never double-count');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  let round = 0;
  for (let i = 0; i < 7; i++) {
    row(id).live.roundStart = Date.now() - 4_000;
    const winner = i % 2 === 0 ? p1 : p2; // p1 wins 4 rounds, p2 wins 3
    const choice = QUESTIONS[round].answer;
    const r = await answer(id, winner, round, choice);
    const live = r.body.live as Body;
    if (live.status === 'finished') break;
    round = Number(live.round);
  }
  ok(row(id).status === 'finished' && row(id).winner === row(id).p1, 'battle finished, p1 won 4:3');
  const d1 = row(id).p1_delta as number;
  const d2 = row(id).p2_delta as number;
  ok(d1 > 0 && d2 < 0 && d1 === -d2, `Elo mirrored (+${d1}/-${-d2})`);
  // repeat everything: syncs, gets, duplicate answers, forfeits — the rating must not move again
  const snap = { d1, d2, w: row(id).winner };
  await sync(id, p1);
  await sync(id, p2);
  await getB(id, p1);
  await answer(id, p1, 6, QUESTIONS[6].answer);
  await call('POST', '', { action: 'forfeit', id }, p2.raw);
  ok(row(id).p1_delta === snap.d1 && row(id).p2_delta === snap.d2 && row(id).winner === snap.w, 'repeat polls/answers/forfeit never double-apply the Elo');
}

section('6. stale-round answer is refused; re-sent for the current round records (retry contract)');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 4_000;
  const stale = await answer(id, p1, 5, QUESTIONS[0].answer); // wrong round entirely
  ok(Number((stale.body.live as Body).round) === 0 && (stale.body.live as Body).mine == null, 'stale-round answer returns the current state unrecorded');
  const good = await answer(id, p1, 0, QUESTIONS[0].answer); // the client retry re-sends with the right round
  ok(Number((good.body.live as Body).s1) === 1, 'the retried answer with the current round records and scores');
}

section('7. answer before the question clock opens is refused');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  ok(Number(row(id).live.roundStart) > Date.now(), 'round 0 is still in the 3.5s countdown');
  const early = await answer(id, p1, 0, QUESTIONS[0].answer);
  ok(Number((early.body.live as Body).round) === 0 && (early.body.live as Body).mine == null, 'a countdown answer is not recorded');
  row(id).live.roundStart = Date.now() - 4_000;
  const ontime = await answer(id, p1, 0, QUESTIONS[0].answer);
  ok(Number((ontime.body.live as Body).s1) === 1, 'the same answer records once the clock is open');
}

section('8. mid-battle disconnect -> forfeit exactly once, opponent wins');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 4_000;
  const a = await answer(id, p1, 0, QUESTIONS[0].answer); // p1 scored 1 (real play)
  ok(Number((a.body.live as Body).s1) === 1, 'p1 leads 1:0');
  row(id).seen2 = Date.now() - 45_000; // p2's app went silent mid-battle
  row(id).live.roundStart = Date.now() - 4_000;
  const s = await sync(id, p1);
  const live = s.body.live as Body;
  ok(live.status === 'finished' && live.winner === 'me' && live.left === 'opp', 'p1 wins by forfeit, opponent marked as left');
  ok((live.myDelta as number) > 0 && row(id).p2_delta! < 0, 'real Elo applied (quitter cannot escape)');
  const delta = row(id).p1_delta;
  await sync(id, p1);
  await sync(id, p2);
  ok(row(id).p1_delta === delta, 'a second sync after the finish does not re-apply the delta');
}

section('9. ghost challenger: battle aborts with zero Elo even when the joiner answered alone');
{
  resetStore();
  const p1 = makeInitData(); // opens a challenge and NEVER polls (closed the app)
  const p2 = makeInitData();
  const id = await openBattle(p1);
  ok(row(id).seen1 === null, 'the challenger never heartbeated');
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 4_000;
  const a = await answer(id, p2, 0, QUESTIONS[0].answer); // joiner answers alone against a ghost
  ok(Number((a.body.live as Body).s2) === 1, 'the joiner can still play while the ghost battle runs');
  // 75s pass without the challenger EVER syncing -> the ghost rule aborts the battle
  row(id).live.startedAt = Date.now() - 80_000;
  row(id).live.roundStart = Date.now() - 4_000;
  const s = await sync(id, p2);
  const live = s.body.live as Body;
  ok(live.status === 'finished' && live.aborted === true, 'the ghost battle aborted (neutral end)');
  ok(row(id).winner === 0 && row(id).p1_delta === 0 && row(id).p2_delta === 0, 'no winner, zero Elo — answering alone against a ghost pays nothing');
  // the honest case is NOT affected: an opponent who showed up and then went silent still loses
  resetStore();
  const q1 = makeInitData();
  const q2 = makeInitData();
  const id2 = await openBattle(q1);
  await joinBattle(id2, q2);
  row(id2).live.roundStart = Date.now() - 4_000;
  await answer(id2, q2, 0, QUESTIONS[0].answer);
  row(id2).seen1 = Date.now() - 45_000; // the challenger WAS here, then went silent
  row(id2).live.roundStart = Date.now() - 4_000;
  const s2 = await sync(id2, q2);
  const l2 = s2.body.live as Body;
  ok(l2.status === 'finished' && l2.winner === 'me' && l2.aborted === undefined && (l2.myDelta as number) > 0, 'a real disconnect still forfeits with a real win');
}

section('10. waiting-phase heartbeat: a long-waiting challenger stays joinable (reconnection)');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  row(id).seen1 = Date.now() - 120_000; // p1 waited 2 minutes (their get-poll failed meanwhile)
  const g = await getB(id, p1); // the waiting poll's heartbeat refresh
  ok(Date.now() - row(id).seen1 < 5000, 'the get-poll refreshes the waiting challenger\'s heartbeat');
  const j = await call('POST', '', { action: 'join', id, ...ME2 }, p2.raw);
  ok(j.status === 200 && (j.body.battle as Body)?.status === 'active', 'the challenger is still joinable after the long wait');
  const s = await sync(id, p2);
  ok((s.body.live as Body).status === 'active', 'and the first joiner sync does not forfeit them');
}

section('11. manual forfeit at 0:0 counts as a real loss (regression)');
{
  resetStore();
  const p1 = makeInitData();
  const p2 = makeInitData();
  const id = await openBattle(p1);
  await joinBattle(id, p2);
  row(id).live.roundStart = Date.now() - 4_000;
  const f = await call('POST', '', { action: 'forfeit', id }, p2.raw);
  const live = f.body.live as Body;
  ok(live.status === 'finished' && live.winner === 'opp' && (live.myDelta as number) < 0, 'quitting costs rating even at 0:0');
}

globalThis.fetch = installed;

console.log(`\n===== ${passed} passed, ${failures.length} failed =====`);
if (failures.length) {
  failures.forEach((f) => console.error('FAILED:', f));
  process.exit(1);
}
