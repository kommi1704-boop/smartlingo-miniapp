import { useEffect, useRef, useState } from 'react';
import { cx } from '../lib/utils';
import { lastDays, shortDay, today } from '../lib/dates';
import type { DayActivity } from '../types';

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts up from the previous value to `value` (ease-out). Plain text, no layout shift thanks to tabular-nums. */
export function CountUp({ value, ms = 900, className }: { value: number; ms?: number; className?: string }) {
  const [shown, setShown] = useState(() => (reduced() ? value : 0));
  const from = useRef(shown);
  useEffect(() => {
    if (reduced()) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(a + (value - a) * e);
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <span className={cx('tabular-nums', className)}>{shown.toLocaleString('en-US').replace(/,/g, ' ')}</span>;
}

const isActive = (a?: DayActivity) => !!a && ((a.xp ?? 0) > 0 || !!a.frozen);

/** Last 7 days as hexagon badges: lit = studied, orange pulsing = today still open. */
export function StreakWeek({ activity }: { activity: Record<string, DayActivity> }) {
  const t = today();
  const days = lastDays(7);
  return (
    <ul className="flex items-center justify-between gap-1" aria-label="So‘nggi 7 kun faolligi">
      {days.map((k, i) => {
        const on = isActive(activity[k]);
        const isToday = k === t;
        return (
          <li key={k} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={cx('text-[11px] font-bold', isToday ? 'text-ink' : 'text-muted')}>{shortDay(k).slice(0, 2)}</span>
            <span
              className={cx('hex flex h-9 w-9 items-center justify-center text-sm font-black text-white', on ? 'hex-on' : isToday ? 'hex-today' : 'hex-off')}
              style={on ? { animation: `rise-in .45s cubic-bezier(.34,1.56,.64,1) ${i * 70}ms both` } : undefined}
              aria-label={`${k}: ${on ? 'o‘qilgan' : isToday ? 'bugun hali o‘qilmagan' : 'o‘qilmagan'}`}
            >
              {on ? '✓' : isToday ? '!' : ''}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Dot-matrix weekly activity: each column is a day, lit dots = XP relative to the best day. */
export function DotChart({ activity, rows = 6, height = 132 }: { activity: Record<string, DayActivity>; rows?: number; height?: number }) {
  const t = today();
  const days = lastDays(7).map((k) => ({ k, v: activity[k]?.xp ?? 0 }));
  const max = Math.max(20, ...days.map((d) => d.v));
  const total = days.reduce((a, d) => a + d.v, 0);
  const gap = Math.max(4, Math.floor((height - rows * 12) / (rows - 1)));
  return (
    <figure aria-label={`Haftalik faollik, jami ${total} XP`}>
      <div className="flex justify-between gap-1.5">
        {days.map((d, ci) => {
          const lit = d.v <= 0 ? 0 : Math.max(1, Math.round((d.v / max) * rows));
          return (
            <div key={d.k} className="flex flex-1 flex-col items-center">
              <div className="flex flex-col-reverse items-center" style={{ gap, height }} title={`${shortDay(d.k)}: ${d.v} XP`}>
                {Array.from({ length: rows }, (_, ri) => {
                  const on = ri < lit;
                  const top = on && ri === lit - 1;
                  return (
                    <span
                      key={ri}
                      className={cx('block h-3 w-3 rounded-full', on ? (top ? 'dot-top' : 'dot-on') : 'dot-off', on && 'dot-rise')}
                      style={on ? { animationDelay: `${ci * 60 + ri * 45}ms` } : undefined}
                    />
                  );
                })}
              </div>
              <span className={cx('mt-2 text-[11px] font-bold', d.k === t ? 'text-accent dark:text-[#7ee2a8]' : 'text-muted')}>{shortDay(d.k).slice(0, 2)}</span>
              <span className="text-[10px] font-semibold text-muted">{d.v > 0 ? d.v : ''}</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
