import { onTgEvent, setTgColors, tgColorScheme } from './telegram';
import type { BgStyle, Settings } from '../types';

export function isDark(theme: Settings['theme']): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  const t = tgColorScheme();
  if (t) return t === 'dark';
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

/** The selectable app backdrops (Settings → "Orqa fon"). CSS lives in index.css (data-bg). */
export const BACKGROUNDS: { id: BgStyle; name: string; preview: string }[] = [
  { id: 'doodle', name: 'Klassik', preview: 'linear-gradient(135deg,#c7d2fe 0%,#ddd6fe 55%,#fbcfe8 100%)' },
  { id: 'plain', name: 'Minimal', preview: 'linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)' },
  { id: 'mesh', name: 'Modern', preview: 'radial-gradient(circle at 20% 30%,#818cf8 0%,transparent 55%),radial-gradient(circle at 80% 20%,#22d3ee 0%,transparent 55%),radial-gradient(circle at 70% 85%,#f472b6 0%,transparent 55%),linear-gradient(135deg,#eef2ff,#fdf2f8)' },
  { id: 'sunset', name: 'Estetik', preview: 'linear-gradient(160deg,#fed7aa 0%,#fbcfe8 45%,#c4b5fd 100%)' },
  { id: 'mint', name: 'Dengiz', preview: 'linear-gradient(160deg,#99f6e4 0%,#a5f3fc 50%,#bfdbfe 100%)' },
  { id: 'grid', name: 'Daftar', preview: 'repeating-linear-gradient(0deg,#eef2ff 0 5px,#dbeafe 5px 6px),repeating-linear-gradient(90deg,transparent 0 5px,rgba(99,102,241,.25) 5px 6px)' },
];

const BG_IDS = new Set(BACKGROUNDS.map((b) => b.id));

export function applyTheme(theme: Settings['theme'], bg: string = 'doodle'): void {
  const dark = isDark(theme);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.bg = BG_IDS.has(bg as BgStyle) ? bg : 'doodle';
  const color = dark ? '#0b1020' : '#f3f5fc';
  setTgColors(color);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', color);
}

/** Re-applies the theme when the OS / Telegram theme changes (only matters for "auto"). */
export function watchTheme(getSettings: () => Settings): () => void {
  const handler = () => {
    const s = getSettings();
    applyTheme(s.theme, s.bg);
  };
  const off = onTgEvent('themeChanged', handler);
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener?.('change', handler);
  return () => {
    off();
    mq?.removeEventListener?.('change', handler);
  };
}
