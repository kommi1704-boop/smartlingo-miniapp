// Pure helpers for the text highlighter (no React, easy to test).
// A highlight covers characters [s, e) of paragraph number p. Highlights never overlap inside a paragraph.

import type { Highlight, HlColor } from '../types';

export interface HlSeg {
  p: number;
  s: number;
  e: number;
}

/** Removes the range [s, e) of paragraph p from the list (splitting highlights that stick out). */
export function subtractRange(list: Highlight[], p: number, s: number, e: number, newId: () => string): Highlight[] {
  const out: Highlight[] = [];
  for (const h of list) {
    if (h.p !== p || h.e <= s || h.s >= e) {
      out.push(h);
      continue;
    }
    if (h.s < s) out.push({ ...h, e: s });
    if (h.e > e) out.push({ ...h, id: h.s < s ? newId() : h.id, s: e });
  }
  return out;
}

/** Adds a highlight; whatever it overlaps is replaced. */
export function addRange(list: Highlight[], seg: HlSeg, c: HlColor, newId: () => string): Highlight[] {
  if (seg.e <= seg.s) return list;
  const base = subtractRange(list, seg.p, seg.s, seg.e, newId);
  return [...base, { id: newId(), p: seg.p, s: seg.s, e: seg.e, c }];
}

export function overlapsAny(list: Highlight[], seg: HlSeg): boolean {
  return list.some((h) => h.p === seg.p && h.s < seg.e && h.e > seg.s);
}

export interface Atom {
  s: number;
  e: number;
  text: string;
  hl?: Highlight;
  term?: string;
}

/** Cuts a paragraph into pieces so that every piece is either plain, a highlight, a vocabulary term, or both. */
export function buildAtoms(text: string, hls: Highlight[], termRe: RegExp | null): Atom[] {
  const len = text.length;
  const clamp = (n: number) => Math.max(0, Math.min(len, n));
  const bounds = new Set<number>([0, len]);
  const terms: { s: number; e: number; t: string }[] = [];
  if (termRe) {
    const re = new RegExp(termRe.source, termRe.flags.includes('g') ? termRe.flags : `${termRe.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      terms.push({ s: m.index, e: m.index + m[0].length, t: m[0] });
      bounds.add(m.index);
      bounds.add(m.index + m[0].length);
    }
  }
  for (const h of hls) {
    bounds.add(clamp(h.s));
    bounds.add(clamp(h.e));
  }
  const b = Array.from(bounds).sort((x, y) => x - y);
  const atoms: Atom[] = [];
  for (let i = 0; i < b.length - 1; i++) {
    const s = b[i];
    const e = b[i + 1];
    if (e <= s) continue;
    atoms.push({
      s,
      e,
      text: text.slice(s, e),
      hl: hls.find((h) => h.s <= s && h.e >= e),
      term: terms.find((t) => t.s <= s && t.e >= e)?.t,
    });
  }
  return atoms;
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const HL_COLORS: { id: HlColor; label: string; cls: string; dot: string }[] = [
  { id: 'yellow', label: 'Sariq', cls: 'bg-yellow-200 text-slate-900 dark:bg-yellow-400/35 dark:text-yellow-50', dot: 'bg-yellow-300' },
  { id: 'green', label: 'Yashil', cls: 'bg-emerald-200 text-slate-900 dark:bg-emerald-400/35 dark:text-emerald-50', dot: 'bg-emerald-400' },
  { id: 'pink', label: 'Pushti', cls: 'bg-pink-200 text-slate-900 dark:bg-pink-400/35 dark:text-pink-50', dot: 'bg-pink-400' },
  { id: 'blue', label: 'Ko‘k', cls: 'bg-sky-200 text-slate-900 dark:bg-sky-400/35 dark:text-sky-50', dot: 'bg-sky-400' },
];
