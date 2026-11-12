// NOT RUN: describes a "server-owned rating" design (ratings table, settle_battle() RPCs) that does not exist in schema.sql / api/battle.ts.
// Server-owned rating tests. Run with:  npx tsx tests/rating.test.ts
//
// Drives the REAL handlers (api/battle.ts, api/leaderboard.ts, api/progress.ts) against an
// in-memory fake of the Supabase REST API (tables progress / battles / ratings + the three SQL
// functions, mirrored from supabase/schema.sql). What it proves: the rating can only change through
// the server, a battle is settled exactly once, the client cannot report its own rating or
// correctness, and nothing is logged.
// NOT covered here (needs the real services): the SQL itself (tested separately in Postgres) and
// real Telegram clients.
import crypto from 'node:crypto';

process.env.TELEGRAM_BOT_TOKEN = '123456:TEST_TOKEN';
process.env.SUPABASE_URL = 'https://supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc_role_key';

import battle from '../api/battle';
import leaderboard from '../api/leaderboard';
import progress from '../api/progress';

let passed = 0;
const failures: string[] = [];
const out = (m: string) => process.stdout.write(m + '\n'); // the test's own output (console.* is watched below)
function ok(cond: boolean, name: string): void {
  if (cond) { passed++; out(`  ✓ ${name}`); } else { failures.push(name); out(`  ✗ ${name}`); }
}
const section = (n: string) => out(`\n${n}`);

// ---------- no-logging guard ----------
const logged: string[] = [];
for (const k of ['log', 'error', 'warn', 'info', 'debug'] as const) {
  (console as unknown as Record<string, unknown>)[k] = () => { logged.push(k); };
}

// ---------- fake Supabase ----------
type Row = Record<string, any>;
const db: Record<string, Row[]> = { progress: [], battles: [], ratings: [] };
const pk: Record<string, string> = { progress: 'telegram_user_id', ratings: 'telegram_user_id', battles: 'id' };

function pathGet(row: Row, key: string): unknown {
  // supports  col  and  col->>sub  (jsonb text extraction)
  const m = key.match(/^(\w+)->>(\w+)$/);
  if (m) return row[m[1]]?.[m[2]] == null ? null : String(row[m[1]][m[2]]);
  return row[key];
}
function matches(row: Row, params: URLSearchParams): boolean {
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'on_conflict'].includes(k)) continue;
    const dot = v.indexOf('.');
    const op = v.slice(0, dot), val = v.slice(dot + 1);
    const cur = pathGet(row, k);
    if (op === 'eq') { if (String(cur) !== val) return false; }
    else if (op === 'neq') { if (String(cur) === val) return false; }
    else if (op === 'gte') { if (!(String(cur) >= val)) return false; }
    else if (op === 'lt') { if (!(String(cur) < val)) return false; }
    else if (op === 'in') { if (!val.replace(/^\(|\)$/g, '').split(',').includes(String(cur))) return false; }
    else throw new Error('fake: unsupported op ' + op + ' on ' + k);
  }
  return true;
}
function project(row: Row, select: string | null): Row {
  if (!select || select === '*') return structuredClone(row);
  const o: Row = {};
  for (const part of select.split(/,(?![^(]*\))/)) {
    const al = part.match(/^(\w+):(.+)$/);
    const [name, expr] = al ? [al[1], al[2]] : [part, part];
    const segs = expr.split('->');
    if (segs.length === 1) { o[name] = structuredClone(row[expr]); continue; }
    let cur: any = row[segs[0]];
    for (const sg of segs.slice(1)) { const last = sg.startsWith('>'); const key = last ? sg.slice(1) : sg; cur = cur?.[key]; if (last) cur = cur == null ? null : String(cur); }
    o[al ? al[1] : segs[segs.length - 1].replace(/^>/, '')] = structuredClone(cur ?? null);
  }
  return o;
}
function sortRows(rows: Row[], order: string | null): Row[] {
  if (!order) return rows;
  const keys = order.split(',').map((x) => x.split('.'));
  return [...rows].sort((a, b) => { for (const [c, d] of keys) { if (a[c] !== b[c]) return (a[c] < b[c] ? -1 : 1) * (d === 'desc' ? -1 : 1); } return 0; });
}
function ensureRating(uid: number): Row {
  let r = db.ratings.find((x) => x.telegram_user_id === uid);
  if (!r) { r = { telegram_user_id: uid, rating: 1000, wins: 0, losses: 0, draws: 0, ai_day: null, ai_count: 0, ai_open_at: null }; db.ratings.push(r); }
  return r;
}
// JS mirror of settle_battle() in supabase/schema.sql
function settleBattle(id: string): void {
  const b = db.battles.find((x) => x.id === id);
  if (!b || b.status !== 'finished' || b.settled || b.p2 == null) return;
  for (const [uid, delta] of [[b.p1, b.p1_delta], [b.p2, b.p2_delta]] as [number, number][]) {
    const r = ensureRating(uid);
    r.rating = Math.max(900, r.rating + (delta ?? 0));
    if (b.winner === uid) r.wins++; else if (b.winner === 0) r.draws++; else if (b.winner != null) r.losses++;
  }
  b.settled = true;
}
// JS mirror of apply_ai_result()
function applyAi(uid: number, delta: number, result: string): Row {
  const r = ensureRating(uid);
  r.rating = Math.max(900, r.rating + delta);
  if (result === 'win') r.wins++; else if (result === 'loss') r.losses++; else if (result === 'draw') r.draws++;
  return structuredClone(r);
}

globalThis.fetch = (async (input: any, init: any = {}) => {
  const url = new URL(String(input));
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });
  if (!url.pathname.startsWith('/rest/v1/')) return json({}, 404);
  const target = url.pathname.slice('/rest/v1/'.length);
  const method = (init.method ?? 'GET').toUpperCase();
  const body = init.body ? JSON.parse(init.body) : undefined;
  const prefer: string = (init.headers?.prefer ?? '') as string;

  if (target.startsWith('rpc/')) {
    const fn = target.slice(4);
    if (fn === 'settle_battle') { settleBattle(body.p_id); return json(null); }
    if (fn === 'settle_all_finished') { db.battles.filter((b) => b.status === 'finished' && !b.settled).forEach((b) => settleBattle(b.id)); return json(null); }
    if (fn === 'apply_ai_result') return json(applyAi(body.p_uid, body.p_delta, body.p_result));
    return json({}, 404);
  }
  const table = db[target];
  if (!table) return json({ message: 'no table' }, 404);
  const key = pk[target];
  if (method === 'GET') {
    let rows = table.filter((r) => matches(r, url.searchParams));
    rows = sortRows(rows, url.searchParams.get('order'));
    const lim = Number(url.searchParams.get('limit') ?? 1000);
    return json(rows.slice(0, lim).map((r) => project(r, url.searchParams.get('select'))));
  }
  if (method === 'POST') {
    const row = body as Row;
    const existing = table.find((r) => r[key] === row[key]);
    if (existing) {
      if (prefer.includes('ignore-duplicates')) return json([], 201);
      if (prefer.includes('merge-duplicates')) { Object.assign(existing, row); return json([], 201); }
      return json({ code: '23505' }, 409);
    }
    const full = target === 'ratings' ? { rating: 1000, wins: 0, losses: 0, draws: 0, ai_day: null, ai_count: 0, ai_open_at: null, ...row } : target === 'battles' ? { settled: false, ...row } : row;
    table.push(structuredClone(full));
    return json([], 201);
  }
  if (method === 'PATCH') {
    const hit = table.filter((r) => matches(r, url.searchParams));
    hit.forEach((r) => Object.assign(r, structuredClone(body)));
    return json(prefer.includes('return=representation') ? hit.map((r) => structuredClone(r)) : []);
  }
  if (method === 'DELETE') {
    db[target] = table.filter((r) => !matches(r, url.searchParams));
    return json([]);
  }
  return json({}, 405);
}) as typeof fetch;

// ---------- helpers ----------
function initData(userId: number, name = 'Test'): string {
  const params = new URLSearchParams();
  params.set('auth_date', String(Math.floor(Date.now() / 1000)));
  params.set('user', JSON.stringify({ id: userId, first_name: name }));
  const dcs = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  params.set('hash', crypto.createHmac('sha256', secret).update(dcs).digest('hex'));
  return params.toString();
}
async function call(handler: any, user: number | null, method: string, query: string, body?: unknown): Promise<{ status: number; json: any }> {
  let status = 200, payload: any;
  const res = { status(c: number) { status = c; return res; }, setHeader() { return res; }, json(b: unknown) { payload = b; } };
  await handler({ method, url: '/api/x' + query, headers: user == null ? {} : { 'x-telegram-init-data': initData(user) }, body }, res);
  return { status, json: payload };
}
const post = (u: number, b: unknown) => call(battle, u, 'POST', '', b);
const get = (u: number, q: string) => call(battle, u, 'GET', q);
const QS = Array.from({ length: 7 }, (_, i) => ({ id: `q${i}`, q: `Question ${i}?`, options: ['a', 'b', 'c', 'd'], answer: i % 4, explain: 'because' }));
const A = 111001, B = 111002, C = 111003;

async function playOut(id: string, winnerUid: number, loserUid: number): Promise<any> {
  // winner answers every question correctly (picks the real answer); loser never answers
  let last: any;
  for (let r = 0; r < 7; r++) last = await post(winnerUid, { action: 'answer', id, round: r, pick: QS[r].answer, t: 900 });
  return last.json.live;
}

(async () => {
  section('rating row');
  let r = await get(A, '?action=me');
  ok(r.status === 200 && r.json.me.rating === 1000 && r.json.me.aiLeft === 3, 'first call creates the row at 1000 with 3 rated AI duels');
  ok(db.ratings.length === 1, 'exactly one ratings row');

  section('PvP: rating is read on the server, correctness is decided on the server');
  const o = await post(A, { action: 'open', questions: QS, name: 'Ali', rating: 5000 });
  ok(o.status === 200, 'open ok');
  ok(db.battles[0].p1_rating === 1000, 'client-sent rating 5000 is ignored (row has 1000)');
  const id = o.json.battle.id as string;
  const j = await post(B, { action: 'join', id, name: 'Vali', rating: 99999 });
  ok(j.status === 200 && db.battles[0].p2_rating === 1000, 'joiner rating also read from the server');
  const bad = await post(A, { action: 'answer', id, round: 0, correct: 1, t: 100 });
  ok(bad.status === 400 && bad.json.error === 'bad_pick', 'old "I was correct" message is rejected');
  const wrong = await post(A, { action: 'answer', id, round: 0, pick: (QS[0].answer + 1) % 4, t: 100 });
  ok(wrong.json.live.mine?.c === 0 && wrong.json.live.s1 === 0, 'a wrong option is scored wrong by the server');
  ok(db.ratings.find((x) => x.telegram_user_id === A)!.rating === 1000, 'rating unchanged mid-battle');

  // B answers wrong too -> both wrong -> next round without point; then A wins every other round
  await post(B, { action: 'answer', id, round: 0, pick: (QS[0].answer + 2) % 4, t: 200 });
  let live: any;
  for (let rd = 1; rd < 7; rd++) live = (await post(A, { action: 'answer', id, round: rd, pick: QS[rd].answer, t: 500 })).json.live;
  ok(live.status === 'finished' && live.winner === 'me' && live.s1 === 6 && live.s2 === 0, 'battle finishes 6:0 for A');
  const ra = () => db.ratings.find((x) => x.telegram_user_id === A)!;
  const rb = () => db.ratings.find((x) => x.telegram_user_id === B)!;
  ok(ra().rating === 1032 && rb().rating === 968, 'Elo applied on the server: +32 / -32 between equals (K=64)');
  ok(ra().wins === 1 && rb().losses === 1, 'W/L counters updated by the server');
  ok(db.battles[0].settled === true, 'battle marked settled');
  // idempotence: polling again / duplicate requests never double count
  await get(A, `?action=sync&id=${id}`); await get(B, `?action=sync&id=${id}`); await get(A, `?action=get&id=${id}`);
  await post(A, { action: 'answer', id, round: 6, pick: QS[6].answer, t: 1 });
  await post(B, { action: 'forfeit', id });
  ok(ra().rating === 1032 && rb().rating === 968 && ra().wins === 1, 'repeat requests do not count the battle twice');

  section('forfeit settles once');
  const o2 = await post(A, { action: 'open', questions: QS, name: 'Ali' });
  const id2 = o2.json.battle.id as string;
  await post(C, { action: 'join', id: id2, name: 'Sardor' });
  await post(C, { action: 'forfeit', id: id2 });
  await post(C, { action: 'forfeit', id: id2 });
  ok(rb().rating === 968, 'unrelated player untouched');
  const rc = db.ratings.find((x) => x.telegram_user_id === C)!;
  ok(rc.losses === 1 && rc.rating < 1000 && ra().wins === 2, 'quitter takes the loss, opponent gets the win, once');

  section('rating cannot go below the floor');
  rc.rating = 905;
  const o3 = await post(A, { action: 'open', questions: QS, name: 'Ali' });
  await post(C, { action: 'join', id: o3.json.battle.id, name: 'Sardor' });
  await post(C, { action: 'forfeit', id: o3.json.battle.id });
  ok(rc.rating === 900, 'floored at 900');

  section('Lingo-AI duels');
  const D = 111004;
  const s1 = await post(D, { action: 'ai_start' });
  ok(s1.json.ai.rated === true && s1.json.ai.aiLeft === 2, 'first AI duel is rated, 2 left');
  const rd = () => db.ratings.find((x) => x.telegram_user_id === D)!;
  const fast = await post(D, { action: 'ai_result', result: 'win' });
  ok(fast.json.ai.delta < 0 && rd().losses === 1, 'a "win" reported impossibly fast is counted as a loss');
  const dup = await post(D, { action: 'ai_result', result: 'win' });
  ok(dup.json.ai.rated === false && dup.json.ai.delta === 0 && rd().wins === 0, 'a repeated result is ignored');
  const before = rd().rating;
  await post(D, { action: 'ai_start' });
  rd().ai_open_at = new Date(Date.now() - 60_000).toISOString(); // pretend a minute passed
  const win = await post(D, { action: 'ai_result', result: 'win' });
  ok(win.json.ai.delta === 24 && rd().rating === before + 24 && rd().wins === 1, 'honest win: +24 (K=48, expected 0.5)');
  await post(D, { action: 'ai_start' });
  const ab = rd().rating;
  const s4 = await post(D, { action: 'ai_start' }); // the previous duel was never reported -> loss
  ok(rd().rating < ab && rd().losses === 2, 'a duel that was started and abandoned counts as a loss');
  ok(s4.json.ai.rated === false && s4.json.ai.aiLeft === 0, 'after 3 rated duels the 4th is practice only');
  const prac = await post(D, { action: 'ai_result', result: 'win' });
  ok(prac.json.ai.rated === false && prac.json.ai.delta === 0, 'practice duel changes nothing');
  const bogus = await post(D, { action: 'ai_result', result: 'win' });
  ok(bogus.json.ai.delta === 0, 'result without a started duel changes nothing');

  section('leaderboard + progress');
  db.progress.push({ telegram_user_id: A, state: { version: 1, xp: 5, profile: { name: 'Ali Valiyev' }, shop: { equipped: { avatar: '🦊', frame: 'rf-expert' }, owned: {} }, battle: { ratingDelta: 99999, wins: 500, losses: 0, draws: 0 } } });
  const lb = await call(leaderboard, A, 'GET', '');
  ok(lb.status === 200 && lb.json.list[0].id === String(A) && lb.json.list[0].rating === ra().rating, 'leaderboard rating = server rating, not the synced device copy');
  ok(lb.json.list[0].name === 'Ali' && lb.json.list[0].avatar === '🦊', 'name/avatar come from progress (first name only)');
  ok(lb.json.list[0].frame === undefined, 'rating frame the player has not reached is hidden');
  const pr = await call(progress, A, 'GET', '');
  ok(pr.json.state.battle.ratingDelta === ra().rating - 1000 && pr.json.state.battle.wins === ra().wins, 'progress GET overwrites battle numbers with the server ones');
  const put = await call(progress, 777001, 'PUT', '', { state: { version: 1, xp: 1, profile: { name: 'Yangi' }, battle: { ratingDelta: 5000 } } });
  ok(put.status === 200 && db.ratings.find((x) => x.telegram_user_id === 777001)?.rating === 1000, 'a new synced player gets a base-1000 row (listed on the board)');

  section('privacy');
  ok(logged.length === 0, 'handlers wrote nothing to the console (' + logged.length + ')');
  ok((await get(A, '?action=me')).status === 200, 'still serving');
  const noAuth = await call(battle, null, 'GET', '?action=me');
  ok(noAuth.json.enabled === true && noAuth.json.me === undefined, 'no initData -> no rating leaks');

  out(`\n===== ${passed} passed, ${failures.length} failed =====`);
  if (failures.length) { out('FAILED:\n - ' + failures.join('\n - ')); process.exit(1); }
})();
