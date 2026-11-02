import { cx } from '../lib/utils';

export interface Bar {
  label: string;
  value: number;
  highlight?: boolean;
}

/** Minimal accessible bar chart (no chart library needed). */
export function BarChart({ data, unit = 'XP', height = 120 }: { data: Bar[]; unit?: string; height?: number }) {
  const max = Math.max(10, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <figure aria-label={`Faollik grafigi, jami ${total} ${unit}`}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-semibold text-muted">{d.value > 0 ? d.value : ''}</span>
            <div
              title={`${d.label}: ${d.value} ${unit}`}
              className={cx('w-full rounded-t-lg transition-all duration-500', d.highlight ? 'bg-gradient-to-t from-indigo-600 to-violet-500' : 'bg-indigo-200 dark:bg-indigo-500/40')}
              style={{ height: `${Math.max(d.value > 0 ? 6 : 3, (d.value / max) * (height - 28))}px`, opacity: d.value > 0 ? 1 : 0.5 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className={cx('min-w-0 flex-1 truncate text-center text-[10px]', d.highlight ? 'font-bold text-indigo-600 dark:text-indigo-300' : 'text-muted')}>
            {d.label}
          </div>
        ))}
      </div>
    </figure>
  );
}
