import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { Level } from '../types';
import { cx, LEVEL_STYLE } from '../lib/utils';
import { Icon, type IconName } from './Icon';
import { goBack } from '../lib/router';

// ---------- Button ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]',
  secondary: 'bg-surface2 text-ink hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-line',
  ghost: 'bg-transparent text-indigo-600 dark:text-indigo-300 hover:bg-surface2',
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
  const sz = size === 'sm' ? 'px-3 py-1.5 text-sm gap-1.5' : size === 'lg' ? 'px-6 py-3.5 text-base gap-2' : 'px-4 py-2.5 text-sm gap-2';
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'inline-flex items-center justify-center rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        sz,
        VARIANT[variant],
        full && 'w-full',
        className,
      )}
    >
      {icon && <Icon name={icon} className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />}
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
      className={cx('rounded-3xl border border-line bg-surface p-4 shadow-sm shadow-indigo-900/5 sm:p-5', onClick && 'cursor-pointer transition hover:border-indigo-300', className)}
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
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200',
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
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
        active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-line bg-surface text-ink hover:border-indigo-300',
      )}
    >
      {children}
    </button>
  );
}

// ---------- Progress ----------
export function ProgressBar({ value, className, color = 'bg-gradient-to-r from-indigo-500 to-violet-500', label }: { value: number; className?: string; color?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx('h-2.5 w-full overflow-hidden rounded-full bg-surface2', className)}
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-indigo-100 dark:stroke-indigo-500/20" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke="url(#ringGrad)" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
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
    <div role="tablist" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-2xl bg-surface2 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            'flex shrink-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition',
            value === t.id ? 'bg-surface text-indigo-700 shadow-sm dark:text-indigo-200' : 'text-muted hover:text-ink',
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
    <div className="rounded-3xl border border-dashed border-line p-8 text-center">
      <div className="text-4xl">{emoji}</div>
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
        'flex gap-2.5 rounded-2xl border p-3 text-sm',
        tone === 'warn'
          ? 'border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100'
          : 'border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-100',
      )}
    >
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function StatTile({ icon, label, value, hint, tone = 'indigo' }: { icon: IconName; label: string; value: ReactNode; hint?: string; tone?: 'indigo' | 'amber' | 'emerald' | 'violet' }) {
  const t = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300',
  }[tone];
  return (
    <Card className="!p-3.5">
      <div className="flex items-center gap-3">
        <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', t)}>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="pop-in max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-surface p-5 shadow-2xl outline-none"
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
        <h2 className="text-base font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
