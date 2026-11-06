// SmartLingo Learning Universe — the world map page.
//
// Structure (spec): top HUD (title, level, XP, Coins) → interactive map (real 3D
// when the device can handle it, premium 2D fallback otherwise) → world sheet with
// the world's activities (all of them launch EXISTING pages) → daily missions
// (the existing quest engine) → world statuses + recent activity.
//
// Nothing here awards XP or Coins for opening the map; progress and rewards come
// only from the actual activities, exactly as before.

import { lazy, Suspense, useMemo, useState, Component, type ReactNode } from 'react';
import { useApp } from '../store/store';
import { goBack, navigate } from '../lib/router';
import { Button, Card, ProgressBar, Section } from '../components/ui';
import { Icon } from '../components/Icon';
import { xpProgress } from '../lib/gamification';
import { cx, fmt } from '../lib/utils';
import {
  deviceSupports3D,
  missionsFor,
  recommendedWorld,
  unlockHint,
  universeOverall,
  worldStatuses,
  type MissionView,
  type WorldId,
  type WorldStatus,
} from '../lib/universe';
import { claimQuest } from '../store/actions';

const Scene = lazy(() => import('./universe/Scene'));

// If WebGL dies at runtime (rare drivers), fall back to the 2D map automatically.
class SceneGuard extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function MissionRow({ m }: { m: MissionView }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface2 text-xl">{m.quest.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold">{m.quest.title}</p>
          <span className="shrink-0 text-xs font-bold text-gold">+{m.quest.coins} 🪙</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <ProgressBar value={m.pct} className="flex-1" />
          <span className={cx('shrink-0 text-[11px] font-semibold', m.claimed ? 'text-emerald-500 dark:text-emerald-400' : 'text-muted')}>
            {m.claimed ? 'olingan ✓' : `${m.done}/${m.quest.target}`}
          </span>
        </div>
      </div>
      <Button size="sm" variant={m.claimable ? 'primary' : 'ghost'} disabled={!m.claimable} onClick={() => m.claimable && claimQuest(m.quest.id)}>
        {m.claimed ? '✓' : 'Olish'}
      </Button>
    </div>
  );
}

export default function Universe() {
  const s = useApp();
  // ?3d=1 forces the 3D scene (support/debug escape hatch for capable devices
  // that our conservative detector misjudges; the SceneGuard still protects).
  const [mode3d, setMode3d] = useState(() => new URLSearchParams(window.location.search).get('3d') === '1' || deviceSupports3D());
  const [selected, setSelected] = useState<WorldId | null>(null);

  const statuses = useMemo(() => worldStatuses(s), [s]);
  const overall = universeOverall(s);
  const xp = xpProgress(s.xp);
  const recommended = useMemo(() => recommendedWorld(s), [s]);
  const missions = missionsFor(s);
  const recent = s.quizHistory.slice(-3).reverse();
  const lowPerf = useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    return (nav.hardwareConcurrency ?? 8) <= 4 || (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4);
  }, []);

  const sel: WorldStatus | null = selected ? statuses.find((x) => x.world.id === selected) ?? null : null;

  return (
    <div className="pb-2">
      {/* ---------- Top HUD (compact single row — XP/Coin live in the sticky header on phones) ---------- */}
      <div className="flex items-center gap-2">
        <button onClick={() => goBack('/')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:bg-surface2 md:hidden" aria-label="Orqaga">
          <Icon name="left" className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-700 bg-clip-text text-lg font-extrabold text-transparent dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-300 md:text-2xl">
            🪐 Learning Universe
          </h1>
          <p className="hidden truncate text-[11px] text-muted sm:block">Har bir dars — yangi sarguzasgt</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent dark:text-[#b3a4ff]" title="Tajriba darajasi">
            Lv {xp.level}
          </span>
          <span className="hidden rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent dark:text-[#b3a4ff] sm:inline" title="Umumiy XP">
            ⭐ {fmt(s.xp)}
          </span>
          <button
            onClick={() => navigate('/shop')}
            className="hidden rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-[#231a05] shadow-sm shadow-gold/30 sm:block"
            title="Do‘konga o‘tish"
          >
            🪙 {fmt(s.coins.balance)}
          </button>
        </div>
      </div>

      {/* ---------- Interactive map ---------- */}
      <div className="uni-sky relative mt-3 min-h-[320px] overflow-hidden rounded-[2rem] border border-indigo-400/20 sm:h-[54vh] sm:min-h-[420px] md:h-[62vh]" data-testid="universe-map">
        {mode3d ? (
          <SceneGuard onFail={() => setMode3d(false)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="animate-pulse text-center">
                    <div className="text-4xl">🪐</div>
                    <p className="mt-2 text-sm font-semibold text-indigo-200">Koinot yuklanmoqda…</p>
                  </div>
                </div>
              }
            >
              <Scene statuses={statuses} selected={selected} recommended={recommended} lowPerf={lowPerf} onSelect={setSelected} />
            </Suspense>
          </SceneGuard>
        ) : (
          /* --- lightweight 2D fallback (same model, same interactions) --- */
          <>
            {/* phones: stacked world cards — a percentage-positioned map always clips on narrow screens */}
            <div className="space-y-2 p-3 sm:hidden">
              {statuses.map((st) => (
                <button
                  key={st.world.id}
                  onClick={() => setSelected(st.world.id)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98]',
                    selected === st.world.id ? 'border-cyan-300/70 bg-slate-900/90' : 'border-white/10 bg-slate-900/60',
                  )}
                  aria-label={st.world.name}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${st.world.color}22`, border: `1px solid ${st.world.color}55` }}>
                    {st.world.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-white">{st.world.name}</span>
                    <span className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full transition-all" style={{ width: `${st.progress}%`, background: st.world.color }} />
                    </span>
                  </span>
                  <span className={cx('shrink-0 text-[11px] font-bold', st.unlocked ? 'text-cyan-300' : 'text-slate-400')}>
                    {st.unlocked ? `${st.progress}%` : `🔒 ${st.world.unlockLevel}-daraja`}
                  </span>
                </button>
              ))}
            </div>
            {/* sm+: free-form island map (cards centered on their anchor so they never clip at the edges) */}
            <div className="hidden sm:block">
              {statuses.map((st) => (
                <button
                  key={st.world.id}
                  onClick={() => setSelected(st.world.id)}
                  style={{ left: `${st.world.map.x}%`, top: `${st.world.map.y}%` }}
                  className={cx(
                    'uni-float absolute w-[11.5rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-3 text-left transition active:scale-95',
                    selected === st.world.id ? 'border-cyan-300/70 bg-slate-900/90' : 'border-white/10 bg-slate-900/60 hover:border-white/25',
                  )}
                  aria-label={st.world.name}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{st.world.emoji}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-extrabold text-white">{st.world.name}</span>
                      <span className={cx('block text-[10px] font-bold', st.unlocked ? 'text-cyan-300' : 'text-slate-400')}>
                        {st.unlocked ? `${st.progress}%` : `🔒 ${st.world.unlockLevel}-daraja`}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${st.progress}%`, background: st.world.color }} />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* world sheet (both modes) */}
        {sel && (
          <div className="uni-glass absolute inset-x-3 bottom-3 rounded-3xl p-4 text-white shadow-2xl">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Yopish"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${sel.world.color}22`, border: `1px solid ${sel.world.color}55` }}>
                {sel.world.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-extrabold">{sel.world.name}</h2>
                <p className="truncate text-xs text-slate-300">{sel.world.en} · {sel.world.tagline}</p>
              </div>
              {recommended === sel.world.id && (
                <span className="shrink-0 rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">📍 tavsiya</span>
              )}
            </div>

            {sel.unlocked ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={sel.progress} className="flex-1" />
                  <span className="shrink-0 text-xs font-bold text-cyan-200">
                    {sel.done}/{sel.total} · {sel.progress}%
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {sel.world.activities.map((a) => (
                    <button
                      key={a.route + a.label}
                      onClick={() => navigate(a.route)}
                      className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-2.5 text-left transition hover:border-cyan-300/40 hover:bg-white/10 active:scale-[0.98]"
                    >
                      <span className="text-xl">{a.emoji}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold">{a.label}</span>
                        <span className="block truncate text-[10px] text-slate-300">{a.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-semibold text-slate-200">🔒 Bu dunyo hali yopiq</p>
                <p className="mt-1 text-xs text-slate-300">{unlockHint(sel.world.id, xp.level)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={Math.min(100, Math.round((xp.level / sel.world.unlockLevel) * 100))} className="flex-1" />
                  <span className="shrink-0 text-[11px] font-bold text-slate-300">
                    Lv {xp.level}/{sel.world.unlockLevel}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Daily missions ---------- */}
      <Section title="🎯 Kunlik missiyalar">
        <Card>
          {missions.map((m) => (
            <MissionRow key={m.quest.id} m={m} />
          ))}
          <p className="mt-1 text-[11px] text-muted">Missiyalar faqat haqiqiy mashqlardan to‘ladi — xaritani ochish hisobga kirishmaydi.</p>
        </Card>
      </Section>

      {/* ---------- Universe progress ---------- */}
      <Section title="🌌 Koinot progressi">
        <Card>
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="4" className="stroke-surface2" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(overall / 100) * 97.4} 97.4`}
                  className="stroke-accent"
                />
              </svg>
              <span className="absolute text-sm font-extrabold">{overall}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Besh dunyoning umumiy egallanganligi</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {statuses.map((st) => (
                  <button
                    key={st.world.id}
                    onClick={() => setSelected(st.world.id)}
                    className={cx(
                      'rounded-full border px-2.5 py-1 text-[11px] font-bold transition',
                      selected === st.world.id ? 'border-cyan-300/60 bg-cyan-400/10' : 'border-line bg-surface2 hover:border-indigo-300/40',
                    )}
                  >
                    {st.world.emoji} {st.unlocked ? `${st.progress}%` : '🔒'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* ---------- Recent activity ---------- */}
      <Section title="🕒 Yaqinda bajarilgan">
        <Card>
          {recent.length === 0 ? (
            <p className="py-2 text-sm text-muted">Hali mashq bajarilmagan — birinchi dunyonga kirib, boshlang! 🚀</p>
          ) : (
            recent.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{q.title}</p>
                  <p className="text-[11px] text-muted">{new Date(q.date).toLocaleDateString('uz-UZ')}</p>
                </div>
                <span className={cx('shrink-0 text-xs font-extrabold', q.score / Math.max(1, q.total) >= 0.6 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500')}>
                  {q.score}/{q.total}
                </span>
              </div>
            ))
          )}
        </Card>
      </Section>
    </div>
  );
}
