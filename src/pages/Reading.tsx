import { Fragment, useMemo, useState } from 'react';
import { READING } from '../data/reading';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { ContentList, type ListItem } from '../components/ContentList';
import { QuizRunner } from '../components/QuizRunner';
import { Button, Card, Empty, LevelBadge, PageHeader, Pill, Section } from '../components/ui';
import { SpeakButton } from '../components/SpeakButton';
import { wordCount } from '../lib/utils';

export function ReadingList() {
  const s = useApp();
  const done = READING.filter((r) => s.lessons[`reading:${r.id}`]?.completed).length;
  const items: ListItem[] = READING.map((r) => {
    const res = s.lessons[`reading:${r.id}`];
    return {
      id: r.id,
      title: r.title,
      subtitle: `${wordCount(r.text)} ta so‘z · ${r.questions.length} ta savol`,
      level: r.level,
      emoji: '📖',
      done: !!res?.completed,
      status: res ? { label: `Natija: ${res.bestScore}/${res.total}`, tone: res.completed ? 'green' : 'amber' } : { label: 'Yangi', tone: 'neutral' },
    };
  });
  return (
    <div>
      <PageHeader emoji="📖" title="O‘qish" subtitle={`${READING.length} ta matn · ${done} tasi tugatilgan`} />
      <ContentList items={items} base="/reading" />
    </div>
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function ReadingPage({ id }: { id: string }) {
  const s = useApp();
  const passage = READING.find((r) => r.id === id);
  const [quiz, setQuiz] = useState(false);
  const [active, setActive] = useState<{ en: string; uz: string } | null>(null);

  const parts = useMemo(() => {
    if (!passage) return [] as string[][];
    const terms = passage.vocab.map((v) => v.en).sort((a, b) => b.length - a.length);
    const re = terms.length ? new RegExp(`\\b(${terms.map(escapeRe).join('|')})\\b`, 'gi') : null;
    return passage.text.split(/\n\n+/).map((para) => (re ? para.split(re) : [para]));
  }, [passage]);

  if (!passage) return <Empty emoji="🤔" title="Matn topilmadi" action={<Button onClick={() => navigate('/reading')}>Matnlar ro‘yxati</Button>} />;
  const res = s.lessons[`reading:${passage.id}`];
  const idx = READING.findIndex((r) => r.id === id);
  const next = READING[idx + 1];
  const lookup = (w: string) => passage.vocab.find((v) => v.en.toLowerCase() === w.toLowerCase());

  return (
    <div>
      <PageHeader back="/reading" emoji="📖" title={passage.title} subtitle={`${wordCount(passage.text)} ta so‘z`} right={<LevelBadge level={passage.level} />} />

      <Card>
        {active && (
          <div className="slide-up mb-3 flex items-center justify-between rounded-2xl bg-indigo-50 px-3.5 py-2.5 text-sm dark:bg-indigo-500/15" aria-live="polite">
            <span><b>{active.en}</b> — {active.uz}</span>
            <button type="button" onClick={() => setActive(null)} className="text-xs font-semibold text-muted underline">Yopish</button>
          </div>
        )}
        <div className="space-y-3 text-[16px] leading-relaxed">
          {parts.map((chunks, i) => (
            <p key={i}>
              {chunks.map((c, j) => {
                const v = j % 2 === 1 ? lookup(c) : undefined;
                return v ? (
                  <button key={j} type="button" onClick={() => setActive(v)} className="rounded-md border-b-2 border-dotted border-indigo-400 bg-indigo-50 px-0.5 font-medium text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200">{c}</button>
                ) : (
                  <Fragment key={j}>{c}</Fragment>
                );
              })}
            </p>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <SpeakButton text={passage.text.replace(/\n\n+/g, '. ')} label="Matnni o‘qib berish (qurilma ovozi)" />
          <span>Ostiga chizilgan so‘zni bosing — ma’nosi chiqadi.</span>
        </div>
      </Card>

      {!quiz && (
        <>
          <Section title="🔤 So‘zlar yordami">
            <div className="grid gap-2 sm:grid-cols-2">
              {passage.vocab.map((v) => (
                <div key={v.en} className="flex items-center justify-between rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-sm">
                  <span className="font-semibold">{v.en}</span>
                  <span className="text-muted">{v.uz}</span>
                </div>
              ))}
            </div>
          </Section>
          {res && <Pill tone={res.completed ? 'green' : 'amber'} className="mt-4">Eng yaxshi natija: {res.bestScore}/{res.total}</Pill>}
          <div className="mt-4">
            <Button size="lg" full icon="play" onClick={() => setQuiz(true)}>{res ? 'Savollarni qayta yechish' : 'Savollarga o‘tish'}</Button>
          </div>
        </>
      )}

      {quiz && (
        <div className="mt-4">
          <QuizRunner
            title={`O‘qish: ${passage.title}`}
            kind="reading"
            lessonKey={`reading:${passage.id}`}
            questions={passage.questions}
            exitLabel={next ? 'Keyingi matn' : 'Matnlar ro‘yxati'}
            onExit={() => navigate(next ? `/reading/${next.id}` : '/reading')}
          />
          <div className="mt-3 text-center">
            <button type="button" className="text-sm font-semibold text-muted underline" onClick={() => setQuiz(false)}>← Matnga qaytish</button>
          </div>
        </div>
      )}
    </div>
  );
}
