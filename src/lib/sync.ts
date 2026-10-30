// Optional online backup of progress (Supabase through /api/progress).
// - Works only inside Telegram (the server needs the signed initData to know who the learner is).
// - If the server has no database configured, everything stays local and the UI says so.
// - Chat history and writing texts are never uploaded.
import { useSyncExternalStore } from 'react';
import { BASE } from './api';
import { isTelegram, tgInitData } from './telegram';
import { defaultState, getState, setState, subscribeState } from '../store/store';
import { toast } from '../store/ui';
import type { PersistedState } from '../types';

export type SyncStatus = 'off' | 'unavailable' | 'connecting' | 'synced' | 'saving' | 'error';
interface Snap {
  status: SyncStatus;
  at: number | null;
}

const FLAG = 'smartlingo:sync-off';
let snap: Snap = { status: 'off', at: null };
const subs = new Set<() => void>();
let ready = false;
let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let lastJson = '';

function set(status: SyncStatus, at: number | null = snap.at) {
  snap = { status, at };
  subs.forEach((l) => l());
}
export function useSync(): Snap {
  return useSyncExternalStore(
    (l) => {
      subs.add(l);
      return () => {
        subs.delete(l);
      };
    },
    () => snap,
    () => snap,
  );
}

export const syncUserDisabled = (): boolean => {
  try {
    return window.localStorage.getItem(FLAG) === '1';
  } catch {
    return false;
  }
};

const headers = () => ({ 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() });

function payload(s: PersistedState): string {
  const { conversations: _c, writing: _w, ...rest } = s;
  void _c;
  void _w;
  return JSON.stringify({ state: rest });
}

async function push(): Promise<void> {
  if (!ready || syncUserDisabled()) return;
  const s = getState();
  if (!s.profile) return;
  const body = payload(s);
  if (body === lastJson) return;
  set('saving');
  try {
    const r = await fetch(`${BASE}/api/progress`, { method: 'PUT', headers: headers(), body });
    if (!r.ok) throw new Error(String(r.status));
    lastJson = body;
    set('synced', Date.now());
  } catch {
    set('error');
  }
}

function schedule() {
  if (!ready || syncUserDisabled()) return;
  clearTimeout(timer);
  timer = setTimeout(() => void push(), 4000);
}

/** Merge rule: a fresh device (no profile) takes the online copy; otherwise the copy with more XP wins. */
function adopt(remote: Partial<PersistedState>) {
  const base = defaultState();
  setState((s) => ({
    ...base,
    ...remote,
    settings: { ...base.settings, ...(remote.settings ?? {}) },
    games: { ...base.games, ...(remote.games ?? {}) },
    coins: { ...base.coins, ...(remote.coins ?? {}) },
    shop: { ...base.shop, ...(remote.shop ?? {}) },
    quests: { ...base.quests, ...(remote.quests ?? {}) },
    conversations: s.conversations,
    writing: s.writing,
    battle: { ...base.battle, ...(remote.battle ?? {}) },
  }));
}

export async function initSync(): Promise<void> {
  if (started) return;
  started = true;
  if (!isTelegram()) return set('off');
  if (syncUserDisabled()) return set('off');
  set('connecting');
  try {
    const probe = await fetch(`${BASE}/api/progress`, { headers: { Accept: 'application/json' } });
    const pj = probe.ok ? await probe.json() : null;
    if (!pj?.enabled) return set('unavailable');
    const r = await fetch(`${BASE}/api/progress`, { headers: headers() });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { state: Partial<PersistedState> | null };
    const remote = j.state;
    const local = getState();
    if (remote && typeof remote.xp === 'number' && remote.version === 1) {
      if (!local.profile && remote.profile) {
        adopt(remote);
        toast('Onlayn saqlangan natijangiz tiklandi ✓', 'success');
      } else if (local.profile && remote.xp > local.xp) {
        adopt(remote);
        toast('Boshqa qurilmadagi natijangiz tiklandi ✓', 'success');
      }
    }
    ready = true;
    set('synced', Date.now());
    subscribeState(schedule);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        clearTimeout(timer);
        void push();
      }
    });
    lastJson = '';
    schedule();
  } catch {
    set('error');
  }
}

/** Removes the server copy. Returns true on success. */
export async function deleteOnline(): Promise<boolean> {
  if (!isTelegram()) return true;
  try {
    const r = await fetch(`${BASE}/api/progress`, { method: 'DELETE', headers: headers() });
    lastJson = '';
    return r.ok || r.status === 503;
  } catch {
    return false;
  }
}

/** Settings switch. Turning it off deletes the online copy. */
export async function setSyncEnabled(on: boolean): Promise<void> {
  try {
    if (on) window.localStorage.removeItem(FLAG);
    else window.localStorage.setItem(FLAG, '1');
  } catch {
    /* ignore */
  }
  if (!on) {
    clearTimeout(timer);
    const ok = await deleteOnline();
    set('off');
    toast(ok ? 'Onlayn nusxa o‘chirildi' : 'Onlayn nusxani o‘chirib bo‘lmadi, keyinroq urinib ko‘ring', ok ? 'success' : 'warn');
  } else if (started && snap.status !== 'unavailable') {
    set('connecting');
    if (!ready) {
      started = false;
      await initSync();
    } else {
      lastJson = '';
      await push();
    }
  } else {
    started = false;
    await initSync();
  }
}
