import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { HlColor } from '../types';
import { useApp } from '../store/store';
import { addHighlights, clearHighlights, eraseHighlights, removeHighlight } from '../store/actions';
import { buildAtoms, escapeRegExp, HL_COLORS, overlapsAny, type HlSeg } from '../lib/highlights';
import { cx } from '../lib/utils';
import { Icon } from './Icon';
import { toast } from '../store/ui';

interface Props {
  /** Where the highlights are saved, e.g. "reading:r01". */
  storeKey: string;
  /** The text, one entry per paragraph / line. */
  paragraphs: string[];
  /** Vocabulary terms shown as tappable dotted words (optional). */
  terms?: string[];
  onTerm?: (term: string) => void;
  /** Paragraph currently being read aloud (read-along). */
  activeIndex?: number;
  /** When set, every paragraph gets a small play button that starts reading from there. */
  onPlayLine?: (i: number) => void;
  className?: string;
  paragraphClassName?: string;
  /** Optional per-paragraph prefix (e.g. a speaker name styling is already inside the text). */
  renderPrefix?: (i: number) => ReactNode;
  showList?: boolean;
  showHint?: boolean;
}

function offsetWithin(root: Element, node: Node, offset: number): number {
  const r = document.createRange();
  r.selectNodeContents(root);
  r.setEnd(node, offset);
  return r.toString().length;
}

/**
 * Text that the learner can highlight with a marker: select words (long-press and drag on a phone),
 * then pick a colour. Highlights are saved on the device. Tap a highlight to remove it.
 */
export function Highlightable({ storeKey, paragraphs, terms, onTerm, activeIndex, onPlayLine, className, paragraphClassName, renderPrefix, showList = true, showHint = true }: Props) {
  const s = useApp();
  const hls = s.highlights?.[storeKey] ?? [];
  const rootRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<HlSeg[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null); // id of a tapped highlight

  const termRe = useMemo(() => {
    const list = (terms ?? []).filter(Boolean).sort((a, b) => b.length - a.length);
    return list.length ? new RegExp(`\\b(?:${list.map(escapeRegExp).join('|')})\\b`, 'gi') : null;
  }, [terms]);

  useEffect(() => {
    let t = 0;
    const read = () => {
      const sel = window.getSelection();
      const root = rootRef.current;
      if (!sel || !root || sel.rangeCount === 0 || sel.isCollapsed) {
        setPending(null);
        return;
      }
      const r = sel.getRangeAt(0);
      if (!root.contains(r.commonAncestorContainer)) {
        setPending(null);
        return;
      }
      const segs: HlSeg[] = [];
      root.querySelectorAll<HTMLElement>('[data-hlp]').forEach((el) => {
        if (!r.intersectsNode(el)) return;
        const full = el.textContent ?? '';
        let a = el.contains(r.startContainer) ? offsetWithin(el, r.startContainer, r.startOffset) : 0;
        let b = el.contains(r.endContainer) ? offsetWithin(el, r.endContainer, r.endOffset) : full.length;
        const sub = full.slice(a, b);
        a += sub.length - sub.trimStart().length;
        b -= sub.length - sub.trimEnd().length;
        if (b > a) segs.push({ p: Number(el.dataset.hlp), s: a, e: b });
      });
      setPending(segs.length ? segs : null);
      if (segs.length) setPicked(null);
    };
    const onSel = () => {
      window.clearTimeout(t);
      t = window.setTimeout(read, 140);
    };
    document.addEventListener('selectionchange', onSel);
    return () => {
      document.removeEventListener('selectionchange', onSel);
      window.clearTimeout(t);
    };
  }, []);

  // keep the line that is being read aloud in view
  useEffect(() => {
    if (activeIndex === undefined || activeIndex < 0) return;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-line="${activeIndex}"]`);
    el?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [activeIndex]);

  function finish() {
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      /* ignore */
    }
    setPending(null);
    setPicked(null);
  }

  function apply(c: HlColor) {
    if (!pending) return;
    addHighlights(storeKey, pending, c);
    toast('Belgilandi ✨', 'success', 1400);
    finish();
  }

  const sorted = useMemo(() => [...hls].sort((a, b) => a.p - b.p || a.s - b.s), [hls]);
  const canErase = !!pending && pending.some((g) => overlapsAny(hls, g));
  const pickedHl = picked ? hls.find((h) => h.id === picked) : undefined;
  const barOpen = !!pending || !!pickedHl;

  const bar = barOpen
    ? createPortal(
        <div
          className="hl-bar pointer-events-none fixed inset-x-0 z-[55] flex justify-center px-3"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="pop-in pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 shadow-xl shadow-indigo-900/20" role="toolbar" aria-label="Belgilash asboblari">
            {pending ? (
              <>
                <Icon name="marker" className="h-4 w-4 text-muted" />
                {HL_COLORS.map((c) => (
                  <button key={c.id} type="button" aria-label={`${c.label} rang bilan belgilash`} onClick={() => apply(c.id)} className={cx('h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-black/10 transition active:scale-90', c.dot)} />
                ))}
                {canErase && (
                  <button type="button" onClick={() => { eraseHighlights(storeKey, pending); finish(); }} className="ml-1 rounded-full bg-surface2 px-3 py-1.5 text-xs font-semibold">
                    Belgini olish
                  </button>
                )}
                <button type="button" aria-label="Yopish" onClick={finish} className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface2">
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </>
            ) : (
              pickedHl && (
                <>
                  <span className="text-sm font-semibold">Belgi</span>
                  <button type="button" onClick={() => { removeHighlight(storeKey, pickedHl.id); setPicked(null); }} className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">
                    <Icon name="trash" className="h-3.5 w-3.5" /> O‘chirish
                  </button>
                  <button type="button" aria-label="Yopish" onClick={() => setPicked(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface2">
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </>
              )
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div>
      <div ref={rootRef} className={className}>
        {paragraphs.map((text, i) => {
          const atoms = buildAtoms(text, hls.filter((h) => h.p === i), termRe);
          const active = activeIndex === i;
          return (
            <div key={i} data-line={i} className={cx('flex items-start gap-2 rounded-xl transition-colors', active && 'bg-indigo-50 ring-2 ring-indigo-300 dark:bg-indigo-500/15 dark:ring-indigo-400/50', onPlayLine || active ? 'px-1.5 py-1' : '')}>
              {onPlayLine && (
                <button type="button" onClick={() => onPlayLine(i)} aria-label={`${i + 1}-qatorni tinglash`} className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <Icon name="play" className="h-3 w-3" />
                </button>
              )}
              {renderPrefix?.(i)}
              <p data-hlp={i} className={cx('min-w-0 flex-1 select-text', paragraphClassName)}>
                {atoms.map((a) => {
                  const hlCls = a.hl ? HL_COLORS.find((c) => c.id === a.hl!.c)?.cls : undefined;
                  const common = cx(hlCls, a.hl && 'rounded-sm box-decoration-clone cursor-pointer');
                  const onClickHl = a.hl
                    ? () => {
                        const sel = window.getSelection();
                        if (!sel || sel.isCollapsed) setPicked(a.hl!.id);
                      }
                    : undefined;
                  if (a.term && onTerm) {
                    return (
                      <button
                        key={a.s}
                        type="button"
                        onClick={() => onTerm(a.term!)}
                        className={cx('border-b-2 border-dotted border-indigo-400 font-medium', hlCls ? common : 'rounded-md bg-indigo-50 px-0.5 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200')}
                      >
                        {a.text}
                      </button>
                    );
                  }
                  return (
                    <span key={a.s} onClick={onClickHl} className={common || undefined}>
                      {a.text}
                    </span>
                  );
                })}
              </p>
            </div>
          );
        })}
      </div>

      {showHint && sorted.length === 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <Icon name="marker" className="h-3.5 w-3.5 shrink-0" />
          Muhim joyni belgilash uchun matnni bosib turib suring, keyin rang tanlang.
        </p>
      )}

      {showList && sorted.length > 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-surface2/60 p-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold"><Icon name="marker" className="h-4 w-4" /> Mening belgilarim ({sorted.length})</p>
            <button type="button" className="text-xs font-semibold text-muted underline" onClick={() => clearHighlights(storeKey)}>Hammasini tozalash</button>
          </div>
          <ul className="mt-2 space-y-1.5">
            {sorted.map((h) => {
              const cls = HL_COLORS.find((c) => c.id === h.c)?.cls;
              const snippet = (paragraphs[h.p] ?? '').slice(h.s, h.e);
              return (
                <li key={h.id} className="flex items-start justify-between gap-2 text-sm">
                  <span className={cx('rounded-md px-1.5 py-0.5 leading-snug', cls)}>{snippet.length > 90 ? `${snippet.slice(0, 90)}…` : snippet}</span>
                  <button type="button" aria-label="Belgini o‘chirish" onClick={() => removeHighlight(storeKey, h.id)} className="shrink-0 rounded-full p-1 text-muted hover:bg-surface2">
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {bar}
    </div>
  );
}
