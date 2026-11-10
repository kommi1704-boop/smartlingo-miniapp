import { useEffect, useRef, type ReactNode } from 'react';
import { A, usePath } from '../lib/router';
import { Icon, type IconName } from './Icon';
import { cx, fmt } from '../lib/utils';
import { useApp } from '../store/store';
import { isXpBoosted } from '../store/actions';
import { streakOf, xpProgress } from '../lib/gamification';
import { ProgressBar } from './ui';
import { Mascot } from './Mascot';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

/** Every destination in the app — used by the desktop sidebar and the Learn hub. */
export const NAV_ALL: NavItem[] = [
  { path: '/', label: 'Bosh sahifa', icon: 'home' },
  { path: '/universe', label: 'Learning Universe', icon: 'planet' },
  { path: '/learning', label: 'O‘quv markazi', icon: 'grad' },
  { path: '/plan', label: 'Kunlik reja', icon: 'calendar' },
  { path: '/roadmap', label: 'Yo‘l xaritasi', icon: 'map' },
  { path: '/tutor', label: 'Lingo (AI)', icon: 'chat' },
  { path: '/vocab', label: 'So‘zlar', icon: 'cards' },
  { path: '/grammar', label: 'Grammatika', icon: 'bulb' },
  { path: '/reading', label: 'O‘qish', icon: 'book' },
  { path: '/listening', label: 'Tinglash', icon: 'headphones' },
  { path: '/speaking', label: 'Gaplashish', icon: 'mic' },
  { path: '/writing', label: 'Yozish', icon: 'pen' },
  { path: '/games', label: 'O‘yinlar', icon: 'game' },
  { path: '/battle', label: 'Janglar', icon: 'swords' },
  { path: '/leaderboard', label: 'Reyting', icon: 'trophy' },
  { path: '/progress', label: 'Progress', icon: 'chart' },
  { path: '/shop', label: 'Do‘kon', icon: 'cart' },
  { path: '/stars', label: 'Tanga do‘koni', icon: 'coins' },
  { path: '/resources', label: 'Resurslar', icon: 'globe' },
  { path: '/profile', label: 'Profil', icon: 'user' },
  { path: '/settings', label: 'Sozlamalar', icon: 'settings' },
  { path: '/friendquiz', label: 'Do‘st quizi', icon: 'target' },
  { path: '/notify', label: 'Bildirishnomalar', icon: 'bell' },
];

/** Groups for the desktop sidebar / hub pages: label + members. */
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Asosiy',
    items: [NAV_ALL[0], NAV_ALL[1], NAV_ALL[2], NAV_ALL[5]],
  },
  {
    title: 'Ko‘nikmalar',
    items: [NAV_ALL[3], NAV_ALL[4], NAV_ALL[6], NAV_ALL[7], NAV_ALL[8], NAV_ALL[9], NAV_ALL[10], NAV_ALL[18]],
  },
  {
    title: 'O‘yin va raqobat',
    items: [NAV_ALL[12], NAV_ALL[13], NAV_ALL[14], NAV_ALL[21]],
  },
  {
    title: 'Shaxsiy',
    items: [NAV_ALL[15], NAV_ALL[16], NAV_ALL[17], NAV_ALL[19], NAV_ALL[20], NAV_ALL[22]],
  },
];

/** Tab roots never show the Telegram back button. */
export const TAB_ROOTS = ['/', '/universe', '/tutor', '/learning', '/profile'];

const TABS: NavItem[] = [
  { path: '/', label: 'Uy', icon: 'home' },
  { path: '/universe', label: 'Universe', icon: 'planet' },
  { path: '/tutor', label: 'Lingo', icon: 'chat' },
  { path: '/learning', label: 'O‘rganish', icon: 'grad' },
  { path: '/profile', label: 'Profil', icon: 'user' },
];

const isActive = (path: string, item: string) => (item === '/' ? path === '/' : path === item || path.startsWith(`${item}/`));

/** Compact stat pill used in the sticky mobile header. */
function StatPill({ to, children, className, label }: { to: string; children: ReactNode; className?: string; label: string }) {
  return (
    <A to={to} className={cx('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition active:scale-95', className)} aria-label={label}>
      {children}
    </A>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePath();
  const s = useApp();
  const scroller = useRef<HTMLElement>(null);
  const streak = streakOf(s.activity);
  const xp = xpProgress(s.xp);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [path]);

  return (
    <div className="app-bg mx-auto flex h-dvh max-w-[1200px] md:gap-0">
      {/* Desktop sidebar — grouped navigation */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-app2/70 p-4 backdrop-blur-md md:flex">
        <A to="/" className="mb-5 flex items-center gap-2.5 px-2">
          <img src="./favicon.svg" alt="" className="h-9 w-9" />
          <div>
            <div className="text-base font-extrabold leading-none">SmartLingo AI</div>
            <div className="mt-1 text-[11px] text-muted">Shaxsiy ingliz tili yo‘ldoshi</div>
          </div>
        </A>
        <nav className="flex-1 space-y-4 overflow-y-auto" aria-label="Asosiy menyu">
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-muted">{g.title}</div>
              <div className="space-y-0.5">
                {g.items.map((n) => (
                  <A
                    key={n.path}
                    to={n.path}
                    aria-current={isActive(path, n.path) ? 'page' : undefined}
                    className={cx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition',
                      isActive(path, n.path) ? 'bg-accent text-white shadow-sm shadow-accent/30' : 'text-muted hover:bg-surface2 hover:text-ink',
                    )}
                  >
                    <Icon name={n.icon} className="h-[18px] w-[18px]" />
                    {n.label}
                  </A>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-3 rounded-2xl border border-line bg-surface p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>🔥 {streak} kun</span>
            <span>⭐ {fmt(s.xp)} XP</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-semibold">
            <A to="/shop" className="text-gold hover:underline">🪙 {fmt(s.coins.balance)} Coin</A>
            {isXpBoosted(s) && <span className="text-gold">⚡ 2x XP</span>}
          </div>
          <ProgressBar value={xp.pct} className="mt-2" label="Keyingi darajagacha" />
          <div className="mt-1 text-[11px] text-muted">Tajriba darajasi {xp.level}</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile compact header — sticky, glass, consistent pills */}
        <div className="glass safe-top shrink-0 border-b border-line md:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <A to="/" className="flex items-center gap-2" aria-label="Bosh sahifa">
              <img src="./favicon.svg" alt="" className="h-7 w-7" />
              <span className="text-[15px] font-extrabold tracking-tight">SmartLingo</span>
            </A>
            <div className="flex items-center gap-1.5">
              <StatPill to="/progress" label="Kunlik seriya va progress" className="bg-gold/15 text-gold">
                <span className="flame-dance">🔥</span> {streak}
              </StatPill>
              <StatPill to="/progress" label="XP va daraja" className="bg-accent/15 text-accent dark:text-[#b3a4ff]">
                ⭐ {fmt(s.xp)}
              </StatPill>
              <StatPill to="/shop" label="Coin balansi va do‘kon" className="bg-gold/20 text-gold">
                🪙 {fmt(s.coins.balance)}
              </StatPill>
            </div>
          </div>
        </div>

        <main ref={scroller} className="min-h-0 flex-1 overflow-y-auto" id="main">
          <div className="mx-auto h-full max-w-3xl px-4 py-4 sm:px-6 sm:py-6">{children}</div>
        </main>

        {/* Mobile bottom navigation — floating pill, active tab expands with its label */}
        <nav className="safe-bottom shrink-0 px-3 pb-2 pt-1 md:hidden" aria-label="Pastki menyu">
          <ul className="nav-pill mx-auto flex max-w-md items-center gap-1 rounded-[28px] p-1.5">
            {TABS.map((t) => {
              const active = isActive(path, t.path);
              return (
                <li key={t.path} className={cx('transition-all duration-300', active ? 'flex-[2.1]' : 'flex-1')}>
                  <A
                    to={t.path}
                    aria-current={active ? 'page' : undefined}
                    aria-label={t.label}
                    className={cx('tap flex h-11 items-center justify-center gap-1.5 rounded-full text-[12px] font-extrabold', active ? 'nav-dot nav-bounce text-white' : 'text-muted')}
                  >
                    {t.path === '/tutor' ? <Mascot size={active ? 26 : 28} animate={false} interactive={false} mood={active ? 'cheer' : 'happy'} /> : <Icon name={t.icon} className="h-[22px] w-[22px]" />}
                    {active && <span>{t.label}</span>}
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
