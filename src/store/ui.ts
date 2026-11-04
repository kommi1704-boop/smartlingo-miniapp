import { useSyncExternalStore } from 'react';

// Non-persisted UI events: toasts and celebration dialogs.

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'success' | 'warn';
}

export interface Celebration {
  emoji: string;
  title: string;
  text: string;
}

export interface XpPop {
  id: number;
  amount: number;
}

export interface CoinPop {
  id: number;
  amount: number;
}

interface UIState {
  toasts: Toast[];
  celebrations: Celebration[];
  xpPop: XpPop | null;
  coinPop: CoinPop | null;
}

let ui: UIState = { toasts: [], celebrations: [], xpPop: null, coinPop: null };
const listeners = new Set<() => void>();
let nextId = 1;

function emit(next: UIState) {
  ui = next;
  listeners.forEach((l) => l());
}

export function toast(text: string, kind: Toast['kind'] = 'info', ms = 2600): void {
  const id = nextId++;
  emit({ ...ui, toasts: [...ui.toasts, { id, text, kind }] });
  setTimeout(() => emit({ ...ui, toasts: ui.toasts.filter((t) => t.id !== id) }), ms);
}

/** Shows a small floating "+N XP" bubble for a moment. */
export function showXp(amount: number): void {
  if (amount <= 0) return;
  const id = nextId++;
  emit({ ...ui, xpPop: { id, amount } });
  setTimeout(() => {
    if (ui.xpPop?.id === id) emit({ ...ui, xpPop: null });
  }, 1800);
}

/** Shows a small floating "+N 🪙" bubble for a moment. */
export function showCoins(amount: number): void {
  if (amount <= 0) return;
  const id = nextId++;
  emit({ ...ui, coinPop: { id, amount } });
  setTimeout(() => {
    if (ui.coinPop?.id === id) emit({ ...ui, coinPop: null });
  }, 1800);
}

export function celebrate(c: Celebration): void {
  emit({ ...ui, celebrations: [...ui.celebrations, c] });
}

export function dismissCelebration(): void {
  emit({ ...ui, celebrations: ui.celebrations.slice(1) });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useUI(): UIState {
  return useSyncExternalStore(subscribe, () => ui, () => ui);
}
