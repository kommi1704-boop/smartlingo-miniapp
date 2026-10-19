import { useEffect, useRef, type ReactNode } from 'react';
import { A, usePath } from '../lib/router';
import { Icon, type IconName } from './Icon';
import { cx, fmt } from '../lib/utils';
import { useApp } from '../store/store';
import { streakOf, xpProgress } from '../lib/gamification';
import { ProgressBar } from './ui';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

export const NAV_ALL: NavItem[] = [
  { path: '/', label: 'Bosh sahifa', icon: 'home' },
  { path: '/roadmap', label: 'Yo‘l xaritasi', icon: 'map' },
  { path: '/plan', label: 'Kunlik reja', icon: 'calendar' },
  { path: '/tutor', label: 'Lingo (AI)', icon: 'chat' },
  { path: '/vocab', label: 'So‘zlar', icon: 'cards' },
  { path: '/grammar', label: 'Grammatika', icon: 'bulb' },
  { path: '/reading', label: 'O‘qish', icon: 'book' },
  { path: '/listening', label: 'Tinglash', icon: 'headphones' },
  { path: '/speaking', label: 'Gaplashish', icon: 'mic' },
  { path: '/writing', label: 'Yozish', icon: 'pen' },
  { path: '/resources', label: 'Resurslar', icon: 'globe' },
  { path: '/progress', label: 'Progress', icon: 'chart' },
  { path: '/settings', label: 'Sozlamalar', icon: 'settings' },
];

export const TAB_ROOTS = ['/', '/plan', '/tutor', '/vocab', '/more'];

const TABS: NavItem[] = [
  { path: '/', label: 'Bosh sahifa', icon: 'home' },
  { path: '/plan', label: 'Reja', icon: 'calendar' },
  { path: '/tutor', label: 'Lingo', icon: 'chat' },
  { path: '/vocab', label: 'So‘zlar', icon: 'cards' },
  { path: '/more', label: 'Boshqa', icon: 'grid' },
];

const isActive = (path: string, item: string) => (item === '/' ? path === '/' : path === item || path.startsWith(`${item}/`));

export function Shell({ children }: { children: ReactNode }) {
  const path = usePath();
  const s = useApp();
  const scroller = useRef<HTMLElement>(null);
  const streak = streakOf(s.activity);
  const xp = xpProgress(s.xp);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [path]);

  const inTabs = TABS.some((t) => t.path !== '/more' && isActive(path, t.path));

  return (
    <div className="app-bg mx-auto flex h-dvh max-w-[1200px] md:gap-0">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/80 p-4 backdrop-blur-md md:flex">
        <A to="/" className="mb-5 flex items-center gap-2.5 px-2">
          <img src="./favicon.svg" alt="" className="h-9 w-9" />
          <div>
            <div className="text-base font-extrabold leading-none">SmartLingo AI</div>
            <div className="mt-1 text-[11px] text-muted">Shaxsiy ingliz tili yo‘ldoshi</div>
          </div>
        </A>
        <nav className="flex-1 space-y-0.5 overflow-y-auto" aria-label="Asosiy menyu">
          {NAV_ALL.map((n) => (
            <A
              key={n.path}
              to={n.path}
              aria-current={isActive(path, n.path) ? 'page' : undefined}
              className={cx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive(path, n.path) ? 'bg-indigo-600 text-white' : 'text-ink hover:bg-surface2',
              )}
            >
              <Icon name={n.icon} className="h-[18px] w-[18px]" />
              {n.label}
            </A>
          ))}
        </nav>
        <div className="mt-3 rounded-2xl bg-surface2 p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>🔥 {streak} kun</span>
            <span>⭐ {fmt(s.xp)} XP</span>
          </div>
          <ProgressBar value={xp.pct} className="mt-2" label="Keyingi darajagacha" />
          <div className="mt-1 text-[11px] text-muted">Tajriba darajasi {xp.level}</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="safe-top shrink-0 border-b border-line bg-surface/80 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-4 py-2.5">
            <A to="/" className="flex items-center gap-2">
              <img src="./favicon.svg" alt="" className="h-7 w-7" />
              <span className="text-[15px] font-extrabold">SmartLingo AI</span>
            </A>
            <A to="/progress" className="flex items-center gap-2 text-xs font-bold" aria-label="Progressni ko‘rish">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">🔥 {streak}</span>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">⭐ {fmt(s.xp)}</span>
            </A>
          </div>
        </div>

        <main ref={scroller} className="min-h-0 flex-1 overflow-y-auto" id="main">
          <div className="mx-auto h-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="safe-bottom shrink-0 border-t border-line bg-surface/80 backdrop-blur-md md:hidden" aria-label="Pastki menyu">
          <ul className="flex">
            {TABS.map((t) => {
              const active = t.path === '/more' ? !inTabs : isActive(path, t.path);
              return (
                <li key={t.path} className="flex-1">
                  <A
                    to={t.path}
                    aria-current={active ? 'page' : undefined}
                    className={cx('flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition', active ? 'text-indigo-600 dark:text-indigo-300' : 'text-muted')}
                  >
                    <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition', active && 'bg-indigo-100 dark:bg-indigo-500/20')}>
                      <Icon name={t.icon} className="h-5 w-5" />
                    </span>
                    {t.label}
                  </A>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
