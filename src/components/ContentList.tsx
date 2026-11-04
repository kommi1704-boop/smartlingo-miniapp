import { useState } from 'react';
import type { Level } from '../types';
import { LEVELS } from '../types';
import { A } from '../lib/router';
import { Chip, LevelBadge, Pill } from './ui';
import { Icon } from './Icon';
import { cx } from '../lib/utils';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  level: Level;
  emoji?: string;
  status?: { label: string; tone: 'neutral' | 'green' | 'amber' | 'indigo' };
  done?: boolean;
}

export function ContentList({ items, base, filter = true }: { items: ListItem[]; base: string; filter?: boolean }) {
  const [level, setLevel] = useState<Level | 'all'>('all');
  const levels = LEVELS.filter((l) => items.some((i) => i.level === l));
  const shown = items.filter((i) => level === 'all' || i.level === level);
  return (
    <div>
      {filter && levels.length > 2 && (
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={level === 'all'} onClick={() => setLevel('all')}>Barchasi</Chip>
          {levels.map((l) => <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Chip>)}
        </div>
      )}
      <ul className="space-y-2.5">
        {shown.map((i) => (
          <li key={i.id}>
            <A to={`${base}/${i.id}`} className={cx('flex items-center gap-3 rounded-3xl border bg-surface p-4 transition hover:border-indigo-300', i.done ? 'border-emerald-300/60' : 'border-line')}>
              <span className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl', i.done ? 'bg-emerald-500 text-white' : 'bg-indigo-100 dark:bg-indigo-500/20')}>
                {i.done ? <Icon name="check" /> : i.emoji ?? '📘'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{i.title}</p>
                {i.subtitle && <p className="truncate text-sm text-muted">{i.subtitle}</p>}
                {i.status && <Pill tone={i.status.tone} className="mt-1">{i.status.label}</Pill>}
              </div>
              <LevelBadge level={i.level} />
              <Icon name="right" className="h-4 w-4 shrink-0 text-muted" />
            </A>
          </li>
        ))}
      </ul>
    </div>
  );
}
