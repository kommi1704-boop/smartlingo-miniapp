import { LEVELS, type Level } from '../types';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const pct = (a: number, b: number) => (b <= 0 ? 0 : Math.round((a / b) * 100));

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export const levelIndex = (l: Level): number => LEVELS.indexOf(l);

/** Static class strings so Tailwind can see them. */
export const LEVEL_STYLE: Record<Level, string> = {
  'Pre-A1': 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200',
  A1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  A2: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200',
  B1: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200',
  B2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
  C1: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200',
  C2: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200',
};

export function wordCount(text: string): number {
  const m = text.trim().match(/[A-Za-z’']+(?:-[A-Za-z]+)*/g);
  return m ? m.length : 0;
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Uzbek-friendly plural-free number label */
export function fmt(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}
