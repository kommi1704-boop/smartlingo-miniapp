import { useMemo, useState } from 'react';
import type { Mistake } from '../types';
import { useApp } from '../store/store';
import { toggleMistake } from '../store/actions';
import { BADGES, streakOf, xpProgress } from '../lib/gamification';
import { lastDays, prettyDateTime, shortDay, today } from '../lib/dates';
import { VOCAB } from '../data/vocab';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';
import { Button, Card, Chip, Empty, PageHeader, Pill, ProgressBar, Section, StatTile } from '../components/ui';
import { PathMap } from '../components/PathMap';
import { BarChart } from '../components/BarChart';
import { cx, fmt, pct } from '../lib/utils';
import { haptic } from '../lib/telegram';

const KIND_LABEL: Record<string, string> = {
  grammar: 'Grammatika', reading: 'O‘qish', listening: 'Tinglash', 'vocab-quiz': 'So‘zlar testi', matching: 'Juftlash', placement: 'Daraja testi',
};

function MistakeCard({ m }: { m: Mistake }) {
  const [retry, setRetry] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === m.correctAnswer;
    haptic(ok ? 'success' : 'error');
    if (ok && !m.corrected) toggleMistake(m.id);
  }

  return (
    <li className={cx('rounded-3xl border p-4', m.corrected ? 'border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-500/5' : 'border-line bg-surface')}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Pill tone="indigo">{KIND_LABEL[m.source] ?? m.source}</Pill>
        <span className="truncate">{m.sourceTitle}</span>
        <span className="ml-auto">{prettyDateTime(m.date)}</span>
      </div>
      <p className="mt-2 font-bold leading-snug">{m.question}</p>

      {!retry ? (
        <div className="mt-2 space-y-1 text-sm">
          <p><span className="text-muted">Sizning javobingiz: </span><span className="font-semibold text-rose-600 dark:text-rose-300">{m.options[m.yourAnswer] ?? '—'}</span></p>
          <p><span className="text-muted">To‘g‘ri javob: </span><span className="font-semibold text-emerald-700 dark:text-emerald-300">{m.options[m.correctAnswer]}</span></p>
          <p className="text-muted">{m.explain}</p>
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {m.options.map((o, i) => (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => choose(i)}
              className={cx(
                'rounded-xl border-2 px-3 py-2 text-left text-sm font-medium',
                picked === null && 'border-line hover:border-indigo-400',
                picked !== null && i === m.correctAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15',
                picked === i && i !== m.correctAnswer && 'border-rose-500 bg-rose-50 dark:bg-rose-500/15',
                picked !== null && i !== m.correctAnswer && picked !== i && 'opacity-50 border-line',
              )}
            >
              {o}
            </button>
          ))}
          {picked !== null && <p className="text-sm">{picked === m.correctAnswer ? '✅ To‘g‘ri! Xato to‘g‘rilandi.' : '❌ Yana urinib ko‘ring.'} <span className="text-muted">{m.explain}</span></p>}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!m.corrected && (
          <Button size="sm" variant="secondary" onClick={() => { setRetry(!retry); setPicked(null); }}>{retry ? 'Yopish' : 'Qayta urinib ko‘rish'}</Button>
        )}
        <Button size="sm" variant={m.corrected ? 'ghost' : 'success'} icon={m.corrected ? 'refresh' : 'check'} onClick={() => toggleMistake(m.id)}>
          {m.corrected ? 'Qayta ochish' : 'To‘g‘rilandi deb belgilash'}
        </Button>
      </div>
    </li>
  );
}

export function Progress() {
  const s = useApp();
  const t = today();
  const streak = streakOf(s.activity);
  const xp = xpProgress(s.xp);
  const [filter, setFilter] = useState<'open' | 'done'>('open');

  const learned = Object.values(s.vocab).filter((v) => v.status === 'learned').length;
  const reviewed = Object.values(s.vocab).filter((v) => v.reviews > 0).length;
  const completed = (k: string) => Object.entries(s.lessons).filter(([key, v]) => key.startsWith(`${k}:`) && v.completed).length;
  const lessonsDone = completed('grammar') + completed('reading') + completed('listening');

  const skills = useMemo(
    () => [
      { label: 'So‘z boyligi', emoji: '🃏', done: learned, total: VOCAB.length },
      { label: 'Grammatika', emoji: '🧩', done: completed('grammar'), total: GRAMMAR.length },
      { label: 'O‘qish', emoji: '📖', done: completed('reading'), total: READING.length },
      { label: 'Tinglash', emoji: '🎧', done: completed('listening'), total: LISTENING.length },
      { label: 'Gaplashish', emoji: '🗣️', done: Object.keys(s.speakingDone).length, total: SPEAKING.length },
      { label: 'Yozish', emoji: '✍️', done: new Set(s.writing.map((w) => w.promptId)).size, total: WRITING.length },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.vocab, s.lessons, s.speakingDone, s.writing],
  );

  const days14 = lastDays(14).map((k) => ({ label: shortDay(k).slice(0, 2), value: s.activity[k]?.xp ?? 0, highlight: k === t }));
  const activeDays = Object.values(s.activity).filter((a) => a.xp > 0).length;
  const quizzes = [...s.quizHistory].reverse().slice(0, 10);
  const openM = s.mistakes.filter((m) => !m.corrected);
  const doneM = s.mistakes.filter((m) => m.corrected);
  const list = filter === 'open' ? openM : doneM;

  return (
    <div>
      <PageHeader emoji="📊" title="Progress" subtitle={`Tajriba darajasi ${xp.level} · ${fmt(s.xp)} XP`} />

      <div className="grid grid-cols-3 gap-2">
        <StatTile icon="flame" tone="amber" label="Seriya" value={`${streak} 🔥`} />
        <StatTile icon="star" tone="violet" label="XP" value={fmt(s.xp)} />
        <StatTile icon="trophy" tone="emerald" label="Darslar" value={lessonsDone} />
      </div>

      <Section title="🗺️ O‘quv yo‘li" action={<Pill tone="indigo">Qadam-baqadam</Pill>}>
        <PathMap />
      </Section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatTile icon="cards" tone="indigo" label="So‘zlar" value={`${learned}/${VOCAB.length}`} hint={`${reviewed} tasi ko‘rilgan`} />
        <StatTile icon="trophy" tone="violet" label="Nishonlar" value={`${Object.keys(s.badges).length}/${BADGES.length}`} />
      </div>

      <Section title="Ko‘nikmalar bo‘yicha">
        <Card className="space-y-3.5">
          {skills.map((k) => (
            <div key={k.label}>
              <div className="flex justify-between text-sm"><span className="font-semibold">{k.emoji} {k.label}</span><span className="text-muted">{k.done}/{k.total} · {pct(k.done, k.total)}%</span></div>
              <ProgressBar value={pct(k.done, k.total)} className="mt-1.5" label={k.label} />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Kunlik faollik (14 kun)">
        <Card><BarChart data={days14} /></Card>
      </Section>

      <Section title="So‘nggi test natijalari">
        {quizzes.length === 0 ? (
          <Empty emoji="📝" title="Hali test topshirilmagan" text="Grammatika yoki o‘qish bo‘limida birinchi testni bajaring." />
        ) : (
          <ul className="space-y-2">
            {quizzes.map((q) => {
              const r = pct(q.score, q.total);
              return (
                <li key={q.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{q.title}</p>
                    <p className="text-xs text-muted">{KIND_LABEL[q.kind] ?? q.kind} · {prettyDateTime(q.date)}</p>
                  </div>
                  <Pill tone={r >= 80 ? 'green' : r >= 60 ? 'indigo' : 'amber'}>{q.score}/{q.total}</Pill>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="🏅 Nishonlar">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {BADGES.map((b) => {
            const got = !!s.badges[b.id];
            return (
              <div key={b.id} className={cx('rounded-2xl border p-3 text-center', got ? 'border-amber-300/70 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-500/10' : 'border-line bg-surface opacity-60')}>
                <div className={cx('text-3xl', !got && 'grayscale')}>{b.emoji}</div>
                <p className="mt-1 text-sm font-bold leading-tight">{b.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="🔧 Xatolar daftari">
        <div className="mb-3 flex gap-2">
          <Chip active={filter === 'open'} onClick={() => setFilter('open')}>Ochiq ({openM.length})</Chip>
          <Chip active={filter === 'done'} onClick={() => setFilter('done')}>To‘g‘rilangan ({doneM.length})</Chip>
        </div>
        {list.length === 0 ? (
          <Empty
            emoji={filter === 'open' ? '🌟' : '📭'}
            title={filter === 'open' ? 'Ochiq xatolar yo‘q' : 'Hali to‘g‘rilangan xato yo‘q'}
            text={filter === 'open' ? 'Testlarda xato qilgan savollaringiz shu yerda saqlanadi.' : 'Xatolarni qayta yechib, shu yerga o‘tkazing.'}
          />
        ) : (
          <ul className="space-y-3">{list.map((m) => <MistakeCard key={m.id} m={m} />)}</ul>
        )}
      </Section>
    </div>
  );
}
