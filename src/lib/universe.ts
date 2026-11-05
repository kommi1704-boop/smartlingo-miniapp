// SmartLingo Learning Universe — the world-map model.
//
// Pure data + derivation only: NO new storage, NO new balances, NO rewards for
// opening the map. Every number below is DERIVED from the existing persisted
// state (XP, lessons, vocab, speaking), so the Universe can never disagree with
// the rest of the app and nothing needs to change in the database.
//
// The 3D scene (pages/universe/Scene.tsx) renders WORLDS; the page (pages/Universe.tsx)
// renders the HUD, the world sheet and the daily missions. All activities launch the
// EXISTING pages (routes below must exist in App.tsx — tests pin them).
import type { PersistedState } from '../types';
import { todaysQuests, type QuestDef } from './shop';
import { xpLevel } from './gamification';

export type WorldId = 'forest' | 'kingdom' | 'ocean' | 'mountain' | 'galaxy';

export interface WorldActivity {
  emoji: string;
  label: string;
  sub: string;
  route: string; // must exist in App.tsx routing
}

export interface WorldDef {
  id: WorldId;
  name: string; // Uzbek display name
  en: string; // English codename
  emoji: string;
  tagline: string; // one-line flavor text (Uzbek)
  color: string; // accent hex (UI + 3D)
  unlockLevel: number; // XP level needed (see xpLevel in gamification.ts)
  /** 3D island position in the scene (x, y, z). */
  pos: [number, number, number];
  /** 2D fallback map position in percent of the map box. */
  map: { x: number; y: number };
  activities: WorldActivity[];
}

export const WORLDS: WorldDef[] = [
  {
    id: 'forest',
    name: 'So‘z o‘rmoni',
    en: 'Vocabulary Forest',
    emoji: '🌱',
    tagline: 'Yorqin daraxtlar orasida yashiringan yangi so‘zlarni toping.',
    color: '#34d399',
    unlockLevel: 1,
    pos: [-5.0, 0.1, 1.7],
    map: { x: 14, y: 58 },
    activities: [
      { emoji: '🃏', label: 'So‘z kartochkalari', sub: 'Yangi so‘zlarni o‘rganish', route: '/vocab' },
      { emoji: '🧠', label: 'Moslashtirish o‘yini', sub: 'So‘z va tarjimani juftlang', route: '/games/memory' },
      { emoji: '🎯', label: 'Kunlik challenge', sub: 'Kunlik so‘z vazifasi', route: '/games' },
    ],
  },
  {
    id: 'kingdom',
    name: 'Grammatika shohligi',
    en: 'Grammar Kingdom',
    emoji: '🏛️',
    tagline: 'Suzib yuruvchi qal’ada qoidalar hukm suradi.',
    color: '#a78bfa',
    unlockLevel: 2,
    pos: [-1.7, 1.25, -4.7],
    map: { x: 30, y: 22 },
    activities: [
      { emoji: '🧩', label: 'Grammatika darslari', sub: 'Qoida + 5 ta savol testi', route: '/grammar' },
      { emoji: '🃏', label: 'Gap tartibi', sub: 'So‘zlardan gap yasang', route: '/games/scramble' },
      { emoji: '🤖', label: 'Lingo bilan mashq', sub: 'AI suhbatda qoidani mustahkamlang', route: '/tutor' },
    ],
  },
  {
    id: 'ocean',
    name: 'Tinglash okeani',
    en: 'Listening Ocean',
    emoji: '🌊',
    tagline: 'To‘lqinlar ostidagi tovushlarni tinglang va tushuning.',
    color: '#38bdf8',
    unlockLevel: 3,
    pos: [2.6, 0.55, -4.2],
    map: { x: 70, y: 26 },
    activities: [
      { emoji: '🎧', label: 'Tinglash mashqlari', sub: 'Dialog + 4 ta savol', route: '/listening' },
      { emoji: '🎮', label: 'Tinglash o‘yini', sub: 'Eshitib juftlikni toping', route: '/games/listen' },
    ],
  },
  {
    id: 'mountain',
    name: 'Gapirish cho‘qqisi',
    en: 'Speaking Mountain',
    emoji: '🏔️',
    tagline: 'Cho‘qqidagi akademiyada ovozingiz kuch topadi.',
    color: '#f472b6',
    unlockLevel: 4,
    pos: [5.0, 1.5, 0.9],
    map: { x: 86, y: 62 },
    activities: [
      { emoji: '🗣️', label: 'Gapirish akademiyasi', sub: 'AI tekshiradigan topshiriqlar', route: '/speaking' },
      { emoji: '💬', label: 'AI suhbat', sub: 'Lingo bilan erkin gaplashing', route: '/tutor' },
    ],
  },
  {
    id: 'galaxy',
    name: 'O‘qish galaktikasi',
    en: 'Reading Galaxy',
    emoji: '🌌',
    tagline: 'Sayyoralar orasida suzib yuruvchi kutubxona.',
    color: '#fbbf24',
    unlockLevel: 5,
    pos: [1.6, -0.15, 4.4],
    map: { x: 48, y: 84 },
    activities: [
      { emoji: '📖', label: 'O‘qish matnlari', sub: 'Matn + savollar', route: '/reading' },
      { emoji: '🎮', label: 'Kunlik o‘yin', sub: 'Tezlik va diqqat challenge', route: '/games' },
    ],
  },
];

export const worldById = (id: WorldId): WorldDef => WORLDS.find((w) => w.id === id) ?? WORLDS[0];

/**
 * Catalog sizes — how many real items exist per world. These are CONSTANTS so the
 * lazy Universe chunk stays light (no data-file imports); tests/universe.test.ts
 * cross-checks them against the actual catalogs (VOCAB/GRAMMAR/... lengths).
 */
export const WORLD_TOTALS: Record<WorldId, number> = {
  forest: 380, // VOCAB (base + B1 + B2)
  kingdom: 34, // GRAMMAR lessons
  ocean: 5, // LISTENING activities
  mountain: 30, // SPEAKING prompts
  galaxy: 20, // READING passages
};

/** How many items of a world's metric are completed, derived from existing state only. */
export function worldDone(s: PersistedState, id: WorldId): number {
  switch (id) {
    case 'forest':
      return Object.values(s.vocab).filter((v) => v.status === 'learned').length;
    case 'kingdom':
      return Object.entries(s.lessons).filter(([k, v]) => k.startsWith('grammar:') && v.completed).length;
    case 'ocean':
      return Object.entries(s.lessons).filter(([k, v]) => k.startsWith('listening:') && v.completed).length;
    case 'mountain':
      return Object.keys(s.speakingDone).length;
    case 'galaxy':
      return Object.entries(s.lessons).filter(([k, v]) => k.startsWith('reading:') && v.completed).length;
  }
}

/** World completion 0..100 (rounded). */
export function worldProgress(s: PersistedState, id: WorldId): number {
  return Math.min(100, Math.round((worldDone(s, id) / WORLD_TOTALS[id]) * 100));
}

/** XP level needed to open this world. */
export const unlockLevelOf = (id: WorldId): number => worldById(id).unlockLevel;

/** A world is unlocked when the learner's XP level reached the world's threshold. */
export function worldUnlocked(s: PersistedState, id: WorldId): boolean {
  return xpLevel(s.xp) >= unlockLevelOf(id);
}

export interface WorldStatus {
  world: WorldDef;
  unlocked: boolean;
  progress: number; // 0..100
  done: number; // completed items
  total: number;
}

/** All worlds with their current status (used by both the 3D scene and the 2D fallback). */
export function worldStatuses(s: PersistedState): WorldStatus[] {
  return WORLDS.map((world) => ({
    world,
    unlocked: worldUnlocked(s, world.id),
    progress: worldProgress(s, world.id),
    done: worldDone(s, world.id),
    total: WORLD_TOTALS[world.id],
  }));
}

/**
 * Overall Universe completion: the MEAN of the five world percentages — every
 * world weighs the same, so finishing the small Listening Ocean counts as much
 * as a slice of the 380-word Vocabulary Forest. Locked worlds count as 0.
 */
export function universeOverall(s: PersistedState): number {
  const pct = WORLDS.map((w) => worldProgress(s, w.id));
  return Math.round(pct.reduce((a, b) => a + b, 0) / WORLDS.length);
}

/**
 * The world the learner should visit next: an unlocked world that is not finished,
 * with the highest progress (closest to the next win). Falls back to the first
 * unlocked world; null when everything is locked or complete.
 */
export function recommendedWorld(s: PersistedState): WorldId | null {
  const open = WORLDS.filter((w) => worldUnlocked(s, w.id) && worldProgress(s, w.id) < 100);
  if (!open.length) return null;
  return open.reduce((best, w) => (worldProgress(s, w.id) > worldProgress(s, best) ? w.id : best), open[0].id);
}

/** Short Uzbek hint shown on locked islands/sheets. */
export function unlockHint(id: WorldId, currentLevel: number): string {
  const lv = unlockLevelOf(id);
  return currentLevel >= lv
    ? 'Bu dunyo siz uchun ochiq!'
    : `${lv}-daraja kerak (hozir ${currentLevel}). Mashqlarni bajarib XP to‘plang — yangi dunyo ochiladi!`;
}

// ---------- Daily missions (reuse the existing quest engine — no new system) ----------

export interface MissionView {
  quest: QuestDef;
  done: number; // progress today
  claimable: boolean; // target reached, coins not yet claimed
  claimed: boolean; // coins already claimed today
  pct: number;
}

/**
 * Today's 3 missions, bound to the existing daily-quest state (s.quests).
 * Progress comes from real activity counters only (words reviewed, XP earned,
 * lessons completed, games played) — verified exactly like in the Shop page.
 */
export function missionsFor(s: PersistedState): MissionView[] {
  return todaysQuests().map((quest) => {
    const done = Math.min(quest.target, s.quests.progress[quest.counter] ?? 0);
    const claimed = s.quests.claimed.includes(quest.id);
    return {
      quest,
      done,
      claimed,
      claimable: !claimed && done >= quest.target,
      pct: Math.round((done / quest.target) * 100),
    };
  });
}

// ---------- Device capability (3D vs lightweight 2D fallback) ----------

export interface DeviceMetrics {
  cores: number; // navigator.hardwareConcurrency (0 = unknown)
  memoryGb: number | null; // navigator.deviceMemory when exposed
  hasWebGL: boolean;
  reduceMotion: boolean; // prefers-reduced-motion
}

/**
 * Pure decision used by tests. Low-end devices and reduced-motion users get the
 * beautiful 2D map instead of real-time 3D (performance requirement).
 */
export function supports3DFromMetrics(m: DeviceMetrics): boolean {
  if (!m.hasWebGL) return false;
  if (m.reduceMotion) return false;
  if (m.cores > 0 && m.cores <= 2) return false;
  if (m.memoryGb !== null && m.memoryGb > 0 && m.memoryGb < 3) return false;
  return true;
}

/** Browser-side capability probe (SSR/harness safe). */
export function deviceSupports3D(): boolean {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    let hasWebGL = false;
    try {
      const c = document.createElement('canvas');
      hasWebGL = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
    } catch {
      hasWebGL = false;
    }
    let reduceMotion = false;
    try {
      reduceMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduceMotion = false;
    }
    return supports3DFromMetrics({
      cores: nav.hardwareConcurrency ?? 0,
      memoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
      hasWebGL,
      reduceMotion,
    });
  } catch {
    return false;
  }
}
