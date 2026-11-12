import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { Level } from '../types';
import { cx, LEVEL_STYLE } from '../lib/utils';
import { Icon, type IconName } from './Icon';
import { goBack } from '../lib/router';
import { Mascot } from './Mascot';

// ============================================================================
// SmartLingo component system — "LEARNING PLAYGROUND".
// Fresh Green #58CC83 (learning) · Sky #48B8F5 (AI) · Sun #FFD84D (rewards) ·
// Lavender #B9A0F7 (special) · Coral #FF8978 (challenges).
// 8px spacing rhythm · radii 12/16/24 · control heights 32/40/48 ·
// signature 3D press: buttons sit on a darker bottom edge that compresses.
// ============================================================================

// ---------- Button ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const VARIANT: Record<Variant, string> = {
  primary:
    'bg-[linear-gradient(180deg,#5fd695,#58cc83)] text-white shadow-[0_3px_0_0_#3fae68] hover:brightness-[1.04] active:translate-y-[2px] active:shadow-[0_1px_0_0_#3fae68]',
  secondary:
    'bg-surface text-ink border-2 border-line shadow-[0_2px_0_0_var(--c-line)] hover:border-accent2/60 active:translate-y-[2px] active:shadow-none',
  ghost: 'bg-transparent text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400',
  danger:
    'bg-[linear-gradient(180deg,#ff9d8e,#ff8978)] text-white shadow-[0_3px_0_0_#e06a58] hover:brightness-[1.04] active:translate-y-[2px] active:shadow-[0_1px_0_0_#e06a58]',
  success:
    'bg-[linear-gradient(180deg,#4ec489,#3fae68)] text-white shadow-[0_3px_0_0_#2e8a50] hover:brightness-[1.04] active:translate-y-[2px] active:shadow-[0_1px_0_0_#2e8a50]',
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
        'tap inline-flex items-center justify-center rounded-2xl font-bold transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-y-0',
        variant === 'primary' && size === 'lg' && 'btn-shine',
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
        'rounded-3xl border-2 border-line/70 bg-surface p-4 shadow-[0_4px_18px_-10px_rgba(36,51,74,0.18)] sm:p-5',
        onClick && 'cursor-pointer transition hover:border-accent/50 hover:shadow-[0_10px_26px_-12px_rgba(88,204,131,0.35)]',
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

export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'indigo' | 'green' | 'amber' | 'rose' | 'violet'; className?: string }) {
  const t = {
    neutral: 'bg-surface2 text-muted',
    indigo: 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    green: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-sun/25 text-amber-700 dark:bg-sun/15 dark:text-[#ffd27d]',
    rose: 'bg-coral/25 text-rose-600 dark:bg-coral/15 dark:text-[#ffb3a6]',
    violet: 'bg-lav/25 text-violet-700 dark:bg-lav/15 dark:text-violet-300',
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
        'shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition',
        active
          ? 'border-transparent bg-[linear-gradient(180deg,#5fd695,#58cc83)] text-white shadow-[0_2px_0_0_#3fae68]'
          : 'border-line bg-surface text-ink hover:border-leaf/60',
      )}
    >
      {children}
    </button>
  );
}

// ---------- Progress ----------
export function ProgressBar({ value, className, color = 'xp-fill', label }: { value: number; className?: string; color?: string; label?: string }) {
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
      <div className={cx('h-full rounded-full transition-all duration-700', color)} style={{ width: `${v}%` }} />
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
          stroke="url(#ringGrad)" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} className="ring-draw transition-all duration-700" style={{ ['--ring-full' as string]: c }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#58cc83" />
            <stop offset="100%" stopColor="#48b8f5" />
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
            'flex shrink-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition',
            value === t.id ? 'bg-surface text-ink shadow-[0_2px_8px_rgba(36,51,74,0.14)]' : 'text-muted hover:text-ink',
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
const HEADER_TONES: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  purple: 'bg-lav/25 text-violet-600 dark:text-violet-300',
  yellow: 'bg-sun/25 text-amber-600 dark:text-[#ffd27d]',
  coral: 'bg-coral/25 text-rose-500 dark:text-[#ffb3a6]',
};

export function PageHeader({ title, subtitle, back, right, emoji, tone }: { title: string; subtitle?: string; back?: string | boolean; right?: ReactNode; emoji?: string; tone?: keyof typeof HEADER_TONES }) {
  return (
    <header className="mb-4 flex items-start gap-3">
      {back && (
        <button
          type="button"
          onClick={() => goBack(typeof back === 'string' ? back : '/')}
          className="tap mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border-2 border-line bg-surface text-ink hover:border-accent2/60"
          aria-label="Orqaga"
        >
          <Icon name="left" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="flex items-center gap-2 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
          {emoji && tone && <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl', HEADER_TONES[tone])}>{emoji}</span>}
          {emoji && !tone && <span className="text-2xl">{emoji}</span>}
          <span className="min-w-0">{title}</span>
        </h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Empty({ emoji = '🌤️', title, text, action }: { emoji?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-line p-8 text-center">
      <div className="flex justify-center"><Mascot mood="think" size={84} /></div>
      <div className="float-y mt-1 text-3xl">{emoji}</div>
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
        'flex gap-2.5 rounded-2xl border-2 p-3 text-sm',
        tone === 'warn'
          ? 'border-sun/60 bg-sun/15 text-amber-900 dark:border-sun/30 dark:bg-sun/10 dark:text-amber-100'
          : 'border-sky-300/70 bg-sky-500/10 text-sky-900 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-100',
      )}
    >
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function StatTile({ icon, label, value, hint, tone = 'indigo' }: { icon: IconName; label: string; value: ReactNode; hint?: string; tone?: 'indigo' | 'amber' | 'emerald' | 'violet' }) {
  const t = {
    indigo: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    amber: 'bg-sun/25 text-amber-600 dark:bg-sun/15 dark:text-[#ffd27d]',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    violet: 'bg-lav/25 text-violet-600 dark:bg-lav/15 dark:text-violet-300',
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="pop-in max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border-2 border-line bg-surface p-5 shadow-2xl outline-none"
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
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
          <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,#58cc83,#48b8f5)]" aria-hidden />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
