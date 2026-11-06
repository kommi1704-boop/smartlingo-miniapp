// Learning Universe model tests. Run with:  npx tsx tests/universe.test.ts
//
// Covers: world catalog integrity (ids, unlock ladder, EXISTING routes only),
// WORLD_TOTALS vs the real content catalogs, progress/unlock derivation from the
// existing state, the overall-percentage formula, recommendations, the mission
// binding (existing quest engine, 3 per day) and the 3D-capability decision.
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

import type { PersistedState } from '../src/types';
import {
  WORLDS,
  WORLD_TOTALS,
  missionsFor,
  recommendedWorld,
  unlockHint,
  universeOverall,
  worldDone,
  worldProgress,
  worldUnlocked,
  supports3DFromMetrics,
  type DeviceMetrics,
  type WorldId,
} from '../src/lib/universe';
import { xpForLevel } from '../src/lib/gamification';
import { VOCAB } from '../src/data/vocab';
import { GRAMMAR } from '../src/data/grammar';
import { READING } from '../src/data/reading';
import { LISTENING } from '../src/data/listening';
import { SPEAKING } from '../src/data/speaking';

/** Minimal PersistedState with only the fields the Universe reads. */
function fakeState(patch: Partial<PersistedState> = {}): PersistedState {
  return {
    vocab: {},
    lessons: {},
    speakingDone: {},
    xp: 0,
    quests: { date: '', progress: {}, claimed: [] },
    ...patch,
  } as unknown as PersistedState;
}

// ---------- 1) Catalog integrity ----------
section('world catalog');
ok(WORLDS.length === 5, 'exactly five worlds');
ok(new Set(WORLDS.map((w) => w.id)).size === 5, 'world ids are unique');
ok(
  JSON.stringify(WORLDS.map((w) => w.unlockLevel)) === JSON.stringify([1, 2, 3, 4, 5]),
  'unlock ladder ascends 1..5 (forest, kingdom, ocean, mountain, galaxy)',
);
ok(new Set(WORLDS.map((w) => w.en)).size === 5, 'English names are unique');
const KNOWN_ROUTES = new Set([
  '/vocab', '/games', '/games/memory', '/games/scramble', '/games/listen', '/games/daily',
  '/grammar', '/reading', '/listening', '/speaking', '/writing', '/tutor',
]);
ok(
  WORLDS.every((w) => w.activities.length >= 2 && w.activities.every((a) => KNOWN_ROUTES.has(a.route))),
  'every activity route launches an EXISTING page',
);
ok(
  WORLDS.every((w) => w.pos.length === 3 && w.map.x >= 0 && w.map.x <= 100 && w.map.y >= 0 && w.map.y <= 100),
  '3D positions and 2D map percentages are well-formed',
);

// ---------- 2) WORLD_TOTALS vs real catalogs (regression) ----------
section('WORLD_TOTALS match real content');
ok(WORLD_TOTALS.forest === VOCAB.length, `forest total = VOCAB.length (${VOCAB.length})`);
ok(WORLD_TOTALS.kingdom === GRAMMAR.length, `kingdom total = GRAMMAR.length (${GRAMMAR.length})`);
ok(WORLD_TOTALS.ocean === LISTENING.length, `ocean total = LISTENING.length (${LISTENING.length})`);
ok(WORLD_TOTALS.mountain === SPEAKING.length, `mountain total = SPEAKING.length (${SPEAKING.length})`);
ok(WORLD_TOTALS.galaxy === READING.length, `galaxy total = READING.length (${READING.length})`);

// ---------- 3) Progress derivation ----------
section('worldDone / worldProgress');
const s1 = fakeState({
  xp: 0,
  vocab: { a: { status: 'learned' } } as PersistedState['vocab'],
  lessons: {
    'grammar:g01': { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: '' },
    'reading:r01': { bestScore: 2, total: 4, attempts: 1, completed: false, lastDate: '' },
    'listening:l01': { bestScore: 4, total: 4, attempts: 1, completed: true, lastDate: '' },
  } as PersistedState['lessons'],
  speakingDone: { s01: [''], s02: [''], s03: [''] },
});
ok(worldDone(s1, 'forest') === 1, 'forest counts learned words only');
ok(worldDone(s1, 'kingdom') === 1, 'kingdom counts COMPLETED grammar lessons only');
ok(worldDone(s1, 'ocean') === 1, 'ocean counts completed listening lessons');
ok(worldDone(s1, 'galaxy') === 0, 'galaxy ignores non-completed reading');
ok(worldDone(s1, 'mountain') === 3, 'mountain counts speaking prompts done');
ok(worldProgress(s1, 'kingdom') === Math.round((1 / WORLD_TOTALS.kingdom) * 100), `kingdom percentage derived from ${WORLD_TOTALS.kingdom} lessons`);
ok(worldProgress(s1, 'ocean') === Math.round((1 / LISTENING.length) * 100), `ocean: 1 of ${LISTENING.length} listening = ${Math.round((1 / LISTENING.length) * 100)}% (dynamic — stays correct when material is added)`);

// ---------- 4) Unlock ladder (real XP thresholds) ----------
section('worldUnlocked (XP-level milestones)');
ok(worldUnlocked(fakeState({ xp: 0 }), 'forest'), 'forest open from the start');
ok(!worldUnlocked(fakeState({ xp: 39 }), 'kingdom') && worldUnlocked(fakeState({ xp: xpForLevel(2) }), 'kingdom'), `kingdom opens at level 2 (${xpForLevel(2)} XP)`);
ok(!worldUnlocked(fakeState({ xp: xpForLevel(3) - 1 }), 'ocean') && worldUnlocked(fakeState({ xp: xpForLevel(3) }), 'ocean'), `ocean opens at level 3 (${xpForLevel(3)} XP)`);
ok(worldUnlocked(fakeState({ xp: xpForLevel(5) }), 'galaxy'), `galaxy opens at level 5 (${xpForLevel(5)} XP)`);
ok(!worldUnlocked(fakeState({ xp: xpForLevel(5) - 1 }), 'galaxy'), 'galaxy locked one XP before level 5');

// ---------- 5) Overall + recommendation ----------
section('universeOverall / recommendedWorld');
const s2 = fakeState({
  lessons: Object.fromEntries(
    [...Array(Math.ceil(GRAMMAR.length / 2)).keys()].map((i) => [`grammar:g${String(i + 1).padStart(2, '0')}`, { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: '' }]),
  ) as PersistedState['lessons'],
});
const expectedOverall = Math.round(Math.round((Math.ceil(GRAMMAR.length / 2) / GRAMMAR.length) * 100) / 5);
ok(universeOverall(s2) === expectedOverall, `half of grammar = ${Math.round((Math.ceil(GRAMMAR.length / 2) / GRAMMAR.length) * 100)}% of one world = ${expectedOverall}% overall (equal world weights)`);
ok(universeOverall(fakeState()) === 0, 'fresh learner = 0%');
ok(recommendedWorld(fakeState()) === 'forest', 'fresh learner is pointed at the forest');
const s3 = fakeState({ xp: xpForLevel(2), lessons: Object.fromEntries(['grammar:g01', 'grammar:g02'].map((k) => [k, { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: '' }])) as PersistedState['lessons'] });
ok(recommendedWorld(s3) === 'kingdom', 'with forest untouched, the newest unlocked world with progress is recommended');
const s4 = fakeState({ xp: xpForLevel(5), vocab: Object.fromEntries(VOCAB.slice(0, 380).map((w) => [w.id, { status: 'learned' }])) as PersistedState['vocab'] });
ok(recommendedWorld(s4) === 'kingdom', 'forest complete -> the learner is pointed at the next unfinished world');
const sAll = fakeState({
  xp: xpForLevel(5),
  vocab: Object.fromEntries(VOCAB.map((w) => [w.id, { status: 'learned' }])) as PersistedState['vocab'],
  lessons: Object.fromEntries([
    ...[...Array(WORLD_TOTALS.kingdom).keys()].map((i) => [`grammar:x${i}`, { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: '' }]),
    ...[...Array(WORLD_TOTALS.galaxy).keys()].map((i) => [`reading:x${i}`, { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: '' }]),
    ...[...Array(WORLD_TOTALS.ocean).keys()].map((i) => [`listening:x${i}`, { bestScore: 5, total: 5, attempts: 1, completed: true, lastDate: '' }]),
  ]) as PersistedState['lessons'],
  speakingDone: Object.fromEntries([...Array(WORLD_TOTALS.mountain).keys()].map((i) => [`s${i}`, ['']])),
});
ok(universeOverall(sAll) === 100, 'everything complete = 100% overall');
ok(recommendedWorld(sAll) === null, 'all worlds complete -> no recommendation (null)');

// ---------- 6) Missions = the existing quest engine (3/day, real counters) ----------
section('missionsFor (daily missions)');
const ms = missionsFor(fakeState());
ok(ms.length === 3, 'exactly three missions per day');
ok(ms.every((m) => m.quest.coins > 0 && m.quest.target > 0), 'missions carry real coin rewards and targets');
ok(
  missionsFor(fakeState({ quests: { date: '', progress: { words: 7, xp: 100, games: 2, lessons: 1, tutor: 3, speaking: 1, writing: 1, resources: 1 }, claimed: [] } })).every((m) => m.done > 0),
  'progress binds to the existing quest counters',
);
const done = missionsFor(fakeState({ quests: { date: '', progress: { [ms[0].quest.counter]: ms[0].quest.target }, claimed: [] } }));
ok(done[0].claimable && done[0].pct === 100, 'reaching the target makes the mission claimable');
const claimed = missionsFor(fakeState({ quests: { date: '', progress: { [ms[0].quest.counter]: ms[0].quest.target }, claimed: [ms[0].quest.id] } }));
ok(claimed[0].claimed && !claimed[0].claimable, 'claimed missions cannot be claimed twice');

// ---------- 7) Unlock hint ----------
section('unlockHint');
ok(unlockHint('kingdom', 1).includes('2-daraja'), 'locked hint names the required level');
ok(unlockHint('kingdom', 3) === 'Bu dunyo siz uchun ochiq!', 'unlocked worlds get a positive hint');

// ---------- 8) 3D capability decision ----------
section('supports3DFromMetrics');
const good: DeviceMetrics = { cores: 8, memoryGb: 4, hasWebGL: true, reduceMotion: false };
ok(supports3DFromMetrics(good), 'capable device gets the 3D universe');
ok(!supports3DFromMetrics({ ...good, hasWebGL: false }), 'no WebGL -> 2D fallback');
ok(!supports3DFromMetrics({ ...good, reduceMotion: true }), 'reduced-motion users get the 2D fallback');
ok(!supports3DFromMetrics({ ...good, cores: 2 }), 'very weak CPU -> 2D fallback');
ok(!supports3DFromMetrics({ ...good, memoryGb: 2 }), 'very low memory -> 2D fallback');
ok(supports3DFromMetrics({ cores: 0, memoryGb: null, hasWebGL: true, reduceMotion: false }), 'unknown hardware gets the benefit of the doubt');

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.error('FAILED:', failures.join(' | '));
  process.exit(1);
}
