import { useMemo } from 'react';
import { A } from '../lib/router';
import { useApp } from '../store/store';
import { updateProfile } from '../store/actions';
import { buildPlan, planSummary } from '../lib/plan';
import { prettyDate, today } from '../lib/dates';
import { Card, Chip, Notice, PageHeader, Pill, ProgressBar, ProgressRing, Button } from '../components/ui';
import { Icon } from '../components/Icon';
import { MINUTES } from '../data/options';
import { cx } from '../lib/utils';
import { navigate } from '../lib/router';

export function Plan() {
  const s = useApp();
  const p = s.profile!;
  const plan = useMemo(() => buildPlan(s), [s]);
  const sum = planSummary(plan);
  const day = s.activity[today()];
  const next = plan.find((i) => !i.done);

  return (
    <div>
      <PageHeader emoji="📅" title="Kunlik reja" subtitle={`Bugun, ${prettyDate(today())} · reja tanlagan vaqtingizga moslashadi`} />

      <Card>
        <div className="flex items-center gap-4">
          <ProgressRing value={sum.pct} size={96} stroke={10}>
            <span className="text-xl font-extrabold">{sum.pct}%</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{sum.doneCount} / {sum.count} mashq bajarildi</p>
            <p className="text-sm text-muted">{sum.doneMin} / {sum.total} daqiqa · bugun +{day?.xp ?? 0} XP</p>
            {sum.allDone && <Pill tone="green" className="mt-2">Bugungi reja tugadi 🎉</Pill>}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">Kuniga necha daqiqa?</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {MINUTES.map((m) => (
              <Chip key={m} active={p.dailyMinutes === m} onClick={() => updateProfile({ dailyMinutes: m })}>{m} daq</Chip>
            ))}
          </div>
        </div>
      </Card>

      <ul className="mt-4 space-y-3">
        {plan.map((i, n) => (
          <li key={i.id}>
            <A to={i.route} className={cx('block rounded-3xl border p-4 transition hover:border-indigo-300', i.done ? 'border-emerald-300/60 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10' : 'border-line bg-surface')}>
              <div className="flex items-center gap-3">
                <span className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl', i.done ? 'bg-emerald-500 text-white' : 'bg-indigo-100 dark:bg-indigo-500/20')}>
                  {i.done ? <Icon name="check" /> : i.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{n + 1}-qadam</span>
                    <span>·</span>
                    <span>~{i.minutes} daqiqa</span>
                    {i.done && <Pill tone="green">Bajarildi</Pill>}
                  </div>
                  <p className="truncate font-bold">{i.title}</p>
                  <p className="truncate text-sm text-muted">{i.desc}</p>
                </div>
                <Icon name="right" className="h-5 w-5 shrink-0 text-muted" />
              </div>
              {i.type === 'vocab' || i.type === 'tutor' ? <ProgressBar value={i.progress * 100} className="mt-3" label={i.title} /> : null}
            </A>
          </li>
        ))}
      </ul>

      {next && (
        <Button className="mt-5" size="lg" full icon="play" onClick={() => navigate(next.route)}>
          Keyingi mashq: {next.title.split(':')[0]}
        </Button>
      )}

      <div className="mt-4">
        <Notice>Mashq tugagach, u avtomatik “bajarildi” bo‘ladi: so‘zlar maqsadga yetganda, testlar yakunlanganda, yozish va gaplashish topshirilganda.</Notice>
      </div>
    </div>
  );
}
