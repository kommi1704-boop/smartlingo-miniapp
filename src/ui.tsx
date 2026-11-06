import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { Level } from '../types';
import { cx, LEVEL_STYLE } from '../lib/utils';
import { Icon, type IconName } from './Icon';
import { goBack } from '../lib/router';
import { Mascot } from './Mascot';

// ============================================================================
// SmartLingo component system — premium dark EdTech.
// Standards: 8px spacing rhythm · radii 12/16/24 · control heights 32/40/48 ·
// icons 16/20/24 · one accent (#7357FF) with cyan (#50D5F5) and gold (#FFC247)
// as supporting tones. Gradients only on featured surfaces.
// ============================================================================

// ---------- Button ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-sm shadow-accent/30 hover:bg-accent/90 active:scale-[0.98]',
  secondary: 'bg-surface2 text-ink hover:bg-surface2/70 border border-line',
  ghost: 'bg-transparent text-accent hover:bg-surface2',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
  icon?: IconName;
}

export function Button({ variant = 'primary', size = 'md', full, icon, className, children, ...rest }: BtnProps) {
  // consistent control heights: sm 32px · md 40px · lg 48px
  const sz = size === 'sm' ? 'h-8 px-3 text-[13px] gap-1.5' : size === 'lg' ? 'h-12 px-6 text-[15px] gap-2' : 'h-10 px-4 text-sm gap-2';
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        sz,
        VARIANT[variant],
        full && 'w-full',
        className,
      )}
    >
      {icon && <Icon name={icon} className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />}
      {children}
    </button>
  );
}

// ---------- Card ----------
export function Card({ children, className, onClick, as = 'div' }: { children: ReactNode; className?: string; onClick?: () => void; as?: 'div' | 'section' }) {
  const Tag = as;
  return (
    <Tag
      onClick={onClick}
      className={cx(
        'rounded-2xl border border-line bg-surface p-4 shadow-sm shadow-black/5 sm:p-5',
        onClick && 'cursor-pointer transition hover:border-accent/40',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ---------- Badges / chips ----------
export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', LEVEL_STYLE[level], className)}>{level}</span>;
}

export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'indigo' | 'green' | 'amber' | 'rose'; className?: string }) {
  const t = {
    neutral: 'bg-surface2 text-muted',
    indigo: 'bg-accent/15 text-accent dark:bg-accent/20 dark:text-[#b3a4ff]',
    green: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-gold/15 text-amber-700 dark:bg-gold/15 dark:text-[#ffd27d]',
    rose: 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  }[tone];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', t, className)}>{children}</span>;
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink hover:border-accent/40',
      )}
    >
      {children}
    </button>
  );
}

// ---------- Progress ----------
export function ProgressBar({ value, className, color = 'bg-gradient-to-r from-accent to-accent2', label }: { value: number; className?: string; color?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx('h-2 w-full overflow-hidden rounded-full bg-surface2', className)}
    >
      <div className={cx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 84, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(v)} foiz`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface2" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke="url(#ringGrad)" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7357ff" />
            <stop offset="100%" stopColor="#50d5f5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">{children}</div>
    </div>
  );
}

// ---------- Tabs ----------
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-xl bg-surface2 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            'flex shrink-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition',
            value === t.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {t.icon && <Icon name={t.icon} className="h-4 w-4" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Page header ----------
export function PageHeader({ title, subtitle, back, right, emoji }: { title: string; subtitle?: string; back?: string | boolean; right?: ReactNode; emoji?: string }) {
  return (
    <header className="mb-4 flex items-start gap-3">
      {back && (
        <button
          type="button"
          onClick={() => goBack(typeof back === 'string' ? back : '/')}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:bg-surface2"
          aria-label="Orqaga"
        >
          <Icon name="left" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
          {emoji && <span className="mr-1.5">{emoji}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Empty({ emoji = '🌤️', title, text, action }: { emoji?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center">
      <div className="flex justify-center"><Mascot mood="think" size={84} /></div>
      <div className="mt-1 text-3xl">{emoji}</div>
      <p className="mt-2 font-bold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  return (
    <div
      className={cx(
        'flex gap-2.5 rounded-xl border p-3 text-sm',
        tone === 'warn'
          ? 'border-gold/40 bg-gold/10 text-amber-900 dark:text-amber-100'
          : 'border-accent/30 bg-accent/10 text-indigo-900 dark:text-indigo-100',
      )}
    >
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function StatTile({ icon, label, value, hint, tone = 'indigo' }: { icon: IconName; label: string; value: ReactNode; hint?: string; tone?: 'indigo' | 'amber' | 'emerald' | 'violet' }) {
  const t = {
    indigo: 'bg-accent/12 text-accent dark:bg-accent/20 dark:text-[#b3a4ff]',
    amber: 'bg-gold/15 text-amber-600 dark:bg-gold/15 dark:text-[#ffd27d]',
    emerald: 'bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    violet: 'bg-violet-500/12 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300',
  }[tone];
  return (
    <Card className="!p-3.5">
      <div className="flex items-center gap-3">
        <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t)}>
          <Icon name={icon} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-extrabold leading-none">{value}</div>
          <div className="mt-1 truncate text-xs text-muted">{label}</div>
          {hint && <div className="truncate text-[11px] text-muted">{hint}</div>}
        </div>
      </div>
    </Card>
  );
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="pop-in max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl outline-none"
      >
        {title && <h2 className="mb-3 text-lg font-extrabold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
