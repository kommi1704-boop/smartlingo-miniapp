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

/**
 * Turns an uploaded image file into a small square JPEG data URL (center-cropped),
 * so it comfortably fits into the synced state (a few KB instead of megabytes).
 */
export function fileToAvatarDataUrl(file: File, size = 192): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas'));
        return;
      }
      // cover-crop: scale so the image fills the square, centered
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}
