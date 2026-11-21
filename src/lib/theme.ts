import { onTgEvent, setTgColors, tgColorScheme } from './telegram';
import type { AccentStyle, BgStyle, Settings } from '../types';

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
  { id: 'aurora', name: 'Aurora ✨', preview: 'linear-gradient(135deg,#a5f3fc 0%,#818cf8 45%,#e879f9 100%)' },
  { id: 'nebula', name: 'Nebula ✨', preview: 'linear-gradient(160deg,#c4b5fd 0%,#818cf8 50%,#38bdf8 100%)' },
  { id: 'custom', name: 'Shaxsiy fon 📷', preview: 'linear-gradient(135deg,#a78bfa 0%,#38bdf8 100%)' }, // your own photo (250-coin shop item)
];

const BG_IDS = new Set(BACKGROUNDS.map((b) => b.id));

/** The selectable accent themes (Settings → "Mavzu rangi"). CSS lives in index.css (data-accent). */
export const ACCENTS: { id: AccentStyle; name: string; swatch: string }[] = [
  { id: 'green', name: 'Yashil', swatch: '#58cc83' },
  { id: 'pink', name: 'Pushti', swatch: 'oklch(71.8% 0.202 349.761)' },
  { id: 'red', name: 'Qizil', swatch: 'oklch(70.4% 0.191 22.216)' },
  { id: 'blue', name: 'Ko‘k', swatch: 'oklch(74.6% 0.16 232.661)' },
  { id: 'purple', name: 'Binafsha', swatch: 'oklch(70.2% 0.183 293.541)' },
  { id: 'orange', name: 'To‘q sariq', swatch: 'oklch(75% 0.183 55.934)' },
];

const ACCENT_IDS = new Set(ACCENTS.map((a) => a.id));

/** Applies the accent theme. "green" (default) sets no attribute, so the original
 *  palette in index.css stays pixel-identical. Shades override Tailwind's emerald
 *  and teal vars, so every emerald/teal utility class recolours at once. */
export function applyAccent(accent?: string): void {
  const html = document.documentElement;
  if (accent && ACCENT_IDS.has(accent as AccentStyle) && accent !== 'green') html.dataset.accent = accent;
  else delete html.dataset.accent;
}

export function applyTheme(theme: Settings['theme'], bg: string = 'doodle', accent?: string, customBg?: string | null): void {
  const html = document.documentElement;
  const dark = isDark(theme);
  html.classList.toggle('dark', dark);
  const style = BG_IDS.has(bg as BgStyle) ? bg : 'doodle';
  html.dataset.bg = style;
  // custom backdrop: the data URL is injected as a CSS variable (index.css uses it)
  if (style === 'custom' && customBg) html.style.setProperty('--bg-custom', `url("${customBg}")`);
  else html.style.removeProperty('--bg-custom');
  applyAccent(accent);
  const color = dark ? '#0b1020' : '#f3f5fc';
  setTgColors(color);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', color);
}

/** Re-applies the theme when the OS / Telegram theme changes (only matters for "auto"). */
export function watchTheme(getSettings: () => Settings): () => void {
  const handler = () => {
    const s = getSettings();
    applyTheme(s.theme, s.bg, s.accent, s.customBg);
  };
  const off = onTgEvent('themeChanged', handler);
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener?.('change', handler);
  return () => {
    off();
    mq?.removeEventListener?.('change', handler);
  };
}
