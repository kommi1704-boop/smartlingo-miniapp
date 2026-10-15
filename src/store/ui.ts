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

interface UIState {
  toasts: Toast[];
  celebrations: Celebration[];
}

let ui: UIState = { toasts: [], celebrations: [] };
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
