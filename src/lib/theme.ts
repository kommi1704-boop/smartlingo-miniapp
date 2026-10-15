import { onTgEvent, setTgColors, tgColorScheme } from './telegram';
import type { Settings } from '../types';

export function isDark(theme: Settings['theme']): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  const t = tgColorScheme();
  if (t) return t === 'dark';
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function applyTheme(theme: Settings['theme']): void {
  const dark = isDark(theme);
  document.documentElement.classList.toggle('dark', dark);
  const color = dark ? '#0e0f21' : '#f3f4ff';
  setTgColors(color);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', color);
}

/** Re-applies the theme when the OS / Telegram theme changes (only matters for "auto"). */
export function watchTheme(getTheme: () => Settings['theme']): () => void {
  const handler = () => applyTheme(getTheme());
  const off = onTgEvent('themeChanged', handler);
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener?.('change', handler);
  return () => {
    off();
    mq?.removeEventListener?.('change', handler);
  };
}
