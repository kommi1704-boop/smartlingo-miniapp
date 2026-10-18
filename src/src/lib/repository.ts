import type { PersistedState } from '../types';

/**
 * Storage abstraction. The app only talks to this interface.
 *
 *  - LocalRepository (default): browser localStorage — works offline, no setup, no backend.
 *  - A SupabaseRepository can implement the same interface later (see supabase/README.md):
 *    load() from a `progress` table keyed by the verified Telegram user id, save() with upsert.
 *    It must authenticate through a server-side function that validates Telegram `initData`.
 *    Nothing in this demo requires Supabase.
 */
export interface ProgressRepository {
  loadSync(): PersistedState | null;
  save(state: PersistedState): void;
  clear(): void;
}

const KEY = 'smartlingo:v1';

export class LocalRepository implements ProgressRepository {
  loadSync(): PersistedState | null {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    } catch {
      return null; // storage blocked or corrupted -> start fresh
    }
  }

  save(state: PersistedState): void {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: the app keeps working in memory */
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}
