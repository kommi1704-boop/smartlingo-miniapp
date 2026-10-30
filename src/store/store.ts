import { useSyncExternalStore } from 'react';
import type { PersistedState } from '../types';
import { LocalRepository } from '../lib/repository';

// A tiny external store (no extra dependency). State lives in memory and is written through a
// "repository". Today the repository is browser localStorage; a Supabase repository can replace it
// later without touching any screen (see src/lib/repository.ts and supabase/README.md).

const repo = new LocalRepository();

export function defaultState(): PersistedState {
  return {
    version: 1,
    profile: null,
    xp: 0,
    vocab: {},
    lessons: {},
    quizHistory: [],
    activity: {},
    mistakes: [],
    badges: {},
    conversations: [],
    writing: [],
    speakingDone: {},
    highlights: {},
    settings: { theme: 'auto', dailyWordGoal: 10, haptics: true, sound: true, showTranslation: false },
    games: { best: {}, plays: 0, daily: { date: '', done: false }, dailyCount: 0, xpToday: { date: '', xp: 0 } },
    coins: { balance: 0, earnedToday: { date: '', amount: 0 }, spentTotal: 0 },
    shop: { owned: {}, equipped: {}, chestsOpened: 0, streakFreezes: 0 },
    quests: { date: '', progress: {}, claimed: [] },
    battle: { ratingDelta: 0, wins: 0, losses: 0, draws: 0, ratedToday: { date: '', count: 0 }, history: [] },
  };
}

function hydrate(): PersistedState {
  const base = defaultState();
  const saved = repo.loadSync();
  if (!saved || saved.version !== 1) return base;
  return {
    ...base,
    ...saved,
    settings: { ...base.settings, ...(saved.settings ?? {}) },
    games: { ...base.games, ...(saved.games ?? {}) },
    coins: { ...base.coins, ...(saved.coins ?? {}) },
    shop: { ...base.shop, ...(saved.shop ?? {}) },
    quests: { ...base.quests, ...(saved.quests ?? {}) },
    battle: { ...base.battle, ...(saved.battle ?? {}) },
  };
}

let state: PersistedState = hydrate();
const listeners = new Set<() => void>();

export function getState(): PersistedState {
  return state;
}

export function setState(fn: (s: PersistedState) => PersistedState): void {
  state = fn(state);
  repo.save(state);
  listeners.forEach((l) => l());
}

export function resetState(): void {
  state = defaultState();
  repo.clear();
  listeners.forEach((l) => l());
}

export function subscribeState(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Subscribes a component to the whole app state. Derive values with useMemo inside components. */
export function useApp(): PersistedState {
  return useSyncExternalStore(subscribe, getState, getState);
}
