import { useMemo } from 'react';
import { A } from '../lib/router';
import { useApp } from '../store/store';
import { updateProfile } from '../store/actions';
import { buildPlan, planSummary } from '../lib/plan';
import { themeById } from '../lib/journey';
import { useJourneySession } from '../components/journey/useJourney';
import { prettyDate, today } from '../lib/dates';
import { Card, Chip, Notice, PageHeader, Pill, ProgressBar, ProgressRing, Button } from '../components/ui';
import { Icon } from '../components/Icon';
import { Emo } from '../components/Emo';
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
  const jData = useJourneySession();

  return (
    <div>
      <PageHeader emo="cal" title="Kunlik reja" subtitle={`Bugun, ${prettyDate(today())} · reja tanlagan vaqtingizga moslashadi`} />

      {jData && (
        <button
          type="button"
          onClick={() => navigate('/journey')}
          className={cx(
            'rise-in mb-4 flex w-full items-center gap-3 overflow-hidden rounded-[26px] bg-gradient-to-br p-4 text-left text-white shadow-lg transition active:scale-[0.99]',
            themeById(jData.session.themeId).gradient,
          )}
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15"><Emo n={themeById(jData.session.themeId).emo} size={26} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] font-black uppercase tracking-widest text-white/80">AI Daily Learning Journey</span>
            <span className="block truncate text-[15.5px] font-black leading-snug">{jData.session.titleEn}</span>
            <span className="block text-[11.5px] font-bold text-white/85">
              {jData.session.stages.filter((st) => jData.j.stages[st.id]?.done).length === jData.session.stages.length
                ? '✓ Bugungi safar bajarildi'
                : `${jData.session.minutes} daqiqa · ${jData.session.stages.length} bosqich`}
            </span>
          </span>
          <Icon name="right" className="h-5 w-5 shrink-0" />
        </button>
      )}

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
            <A to={i.route} className={cx('block rounded-3xl border p-4 transition hover:border-sky-300', i.done ? 'border-emerald-300/60 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10' : 'border-line bg-surface')}>
              <div className="flex items-center gap-3">
                <span className={cx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl', i.done ? 'bg-emerald-500 text-white' : 'bg-sky-100 dark:bg-sky-500/20')}>
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
              {i.reason && (
                <p className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-surface2 px-2.5 py-1.5 text-[11px] leading-snug text-muted">
                  <span aria-hidden>💡</span>
                  <span>{i.reason}</span>
                </p>
              )}
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
