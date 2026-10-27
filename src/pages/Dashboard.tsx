import { Mascot, Sparkles } from '../components/Mascot';
import { useMemo } from 'react';
import { A, navigate } from '../lib/router';
import { useApp } from '../store/store';
import { buildPlan, planSummary } from '../lib/plan';
import { streakOf, xpProgress } from '../lib/gamification';
import { lastDays, shortDay, today } from '../lib/dates';
import { Button, Card, LevelBadge, PageHeader, ProgressBar, ProgressRing, Section, StatTile } from '../components/ui';
import { Icon } from '../components/Icon';
import { BarChart } from '../components/BarChart';
import { Avatar } from '../components/Avatar';
import { NAV_ALL } from '../components/Shell';
import { cx, fmt } from '../lib/utils';
import { LEVEL_DESC } from '../data/options';
import { dailyGameId, gameInfo, DAILY_BONUS_XP } from '../lib/games';

export function Dashboard() {
  const s = useApp();
  const p = s.profile!;
  const plan = useMemo(() => buildPlan(s), [s]);
  const sum = planSummary(plan);
  const streak = streakOf(s.activity);
  const xp = xpProgress(s.xp);
  const t = today();
  const day = s.activity[t];
  const totalLessons = Object.values(s.lessons).filter((l) => l.completed).length;
  const totalReviews = Object.values(s.vocab).reduce((a, v) => a + v.reviews, 0);
  const learned = Object.values(s.vocab).filter((v) => v.status === 'learned').length;
  const goal = s.settings.dailyWordGoal;
  const next = plan.find((i) => !i.done);
  const chart = lastDays(7).map((k) => ({ label: shortDay(k), value: s.activity[k]?.xp ?? 0, highlight: k === t }));

  return (
    <div>
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-500/25">
        <Sparkles />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-3xl bg-white/15 p-1.5">
              {s.shop.equipped.avatar ? <Avatar emoji={s.shop.equipped.avatar} size={62} /> : <Mascot mood={sum.allDone ? 'cheer' : streak > 0 ? 'happy' : 'wow'} size={62} />}
            </div>
            <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">Salom, {p.name}! 👋</h1>
            <p className="mt-1 text-sm text-indigo-100">
              {sum.allDone ? 'Bugungi reja to‘liq bajarildi. Barakalla!' : streak > 0 ? `${streak} kunlik seriya — davom eting!` : 'Bugun birinchi qadamni qo‘ying.'}
            </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">{p.estimatedLevel}</span>
            <div className="mt-1 text-[11px] text-indigo-100">taxminiy daraja</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-100">
            <span>Tajriba darajasi {xp.level}</span>
            <span>{fmt(s.xp)} XP</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuenow={xp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Keyingi tajriba darajasigacha">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${xp.pct}%` }} />
          </div>
        </div>
      </section>

      {/* Today's plan */}
      <A
        to="/games/daily"
        className="mt-4 flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 shadow-sm transition hover:border-indigo-300"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-2xl">{gameInfo(dailyGameId())?.emoji ?? '🎮'}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold uppercase tracking-wide text-muted">📅 Kunlik o‘yin</span>
          <span className="block font-extrabold">{gameInfo(dailyGameId())?.title}</span>
          <span className="block text-xs text-muted">{s.games.daily.date === t && s.games.daily.done ? 'Bugun bajarildi ✓' : `Hozir o‘ynang: +${DAILY_BONUS_XP} XP bonus`}</span>
        </span>
        <Icon name="right" className="h-4 w-4 text-muted" />
      </A>

      {/* Robocoin shop promo */}
      <A
        to="/shop"
        className="mt-4 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-white shadow-lg shadow-amber-500/25 transition active:scale-[0.99]"
      >
        <span className="text-4xl">🪙</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold uppercase tracking-wide text-amber-100">Do‘kon · Robocoin</span>
          <span className="block font-extrabold">{fmt(s.coins.balance)} ta coin yig‘dingiz</span>
          <span className="block text-xs text-amber-100">Kunlik vazifalar → ramkalar, avatrlar va sirli qutilar</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0" />
      </A>

      <Section title="Bugungi reja" action={<A to="/plan" className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Hammasi →</A>}>
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing value={sum.pct}>
              <span className="text-lg font-extrabold">{sum.pct}%</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Kunlik maqsad: {p.dailyMinutes} daqiqa</p>
              <p className="text-sm text-muted">{sum.doneCount}/{sum.count} mashq bajarildi · {sum.doneMin}/{sum.total} daqiqa</p>
              <p className="mt-1 text-xs text-muted">So‘zlar: {Math.min(day?.words ?? 0, goal)}/{goal}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {plan.map((i) => (
              <li key={i.id}>
                <A to={i.route} className={cx('flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition hover:border-indigo-300', i.done ? 'border-emerald-300/60 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10' : 'border-line bg-surface')}>
                  <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base', i.done ? 'bg-emerald-500 text-white' : 'bg-surface2')}>
                    {i.done ? <Icon name="check" className="h-4 w-4" /> : i.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx('block truncate text-sm font-semibold', i.done && 'line-through opacity-70')}>{i.title}</span>
                    <span className="block text-xs text-muted">{i.minutes} daq{i.progressLabel && !i.done ? ` · ${i.progressLabel}` : ''}</span>
                  </span>
                  <Icon name="right" className="h-4 w-4 text-muted" />
                </A>
              </li>
            ))}
          </ul>
          <Button className="mt-4" size="lg" full icon="play" onClick={() => navigate(next ? next.route : '/vocab')}>
            {next ? 'O‘rganishni davom ettirish' : 'Qo‘shimcha mashq qilish'}
          </Button>
        </Card>
      </Section>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatTile icon="flame" tone="amber" label="Kunlik seriya" value={`${streak} kun`} />
        <StatTile icon="star" tone="violet" label="Jami XP" value={fmt(s.xp)} />
        <StatTile icon="check" tone="emerald" label="Tugatilgan darslar" value={totalLessons} hint="grammatika, o‘qish, tinglash" />
        <StatTile icon="cards" tone="indigo" label="Takrorlangan so‘zlar" value={totalReviews} hint={`${learned} ta o‘rganildi`} />
      </div>

      {/* Chart */}
      <Section title="So‘nggi 7 kun faolligi">
        <Card>
          <BarChart data={chart} />
          <p className="mt-3 text-xs text-muted">{LEVEL_DESC[p.estimatedLevel].title} · <LevelBadge level={p.estimatedLevel} /> → maqsad <LevelBadge level={p.targetLevel} /></p>
          <div className="mt-2"><ProgressBar value={xp.pct} label="XP progress" /></div>
        </Card>
      </Section>

      {/* Quick access */}
      <Section title="Tezkor kirish">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {NAV_ALL.filter((n) => n.path !== '/').map((n) => (
            <A key={n.path} to={n.path} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center text-xs font-semibold transition hover:border-indigo-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                <Icon name={n.icon} />
              </span>
              {n.label}
            </A>
          ))}
        </div>
      </Section>
    </div>
  );
}
