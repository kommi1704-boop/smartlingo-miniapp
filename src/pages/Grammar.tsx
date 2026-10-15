import { useState } from 'react';
import { GRAMMAR } from '../data/grammar';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { ContentList, type ListItem } from '../components/ContentList';
import { QuizRunner } from '../components/QuizRunner';
import { Button, Card, Empty, LevelBadge, PageHeader, Pill, Section } from '../components/ui';
import { SpeakButton } from '../components/SpeakButton';
import { Icon } from '../components/Icon';

export function GrammarList() {
  const s = useApp();
  const done = GRAMMAR.filter((g) => s.lessons[`grammar:${g.id}`]?.completed).length;
  const items: ListItem[] = GRAMMAR.map((g) => {
    const r = s.lessons[`grammar:${g.id}`];
    return {
      id: g.id,
      title: g.title,
      subtitle: g.titleUz,
      level: g.level,
      emoji: g.emoji,
      done: !!r?.completed,
      status: r ? { label: `Eng yaxshi natija: ${r.bestScore}/${r.total}`, tone: r.completed ? 'green' : 'amber' } : { label: 'Yangi', tone: 'neutral' },
    };
  });
  return (
    <div>
      <PageHeader emoji="🧩" title="Grammatika" subtitle={`${GRAMMAR.length} ta dars · ${done} tasi tugatilgan`} />
      <ContentList items={items} base="/grammar" />
    </div>
  );
}

export function GrammarLessonPage({ id }: { id: string }) {
  const s = useApp();
  const lesson = GRAMMAR.find((g) => g.id === id);
  const [quiz, setQuiz] = useState(false);
  if (!lesson) return <Empty emoji="🤔" title="Dars topilmadi" action={<Button onClick={() => navigate('/grammar')}>Darslar ro‘yxati</Button>} />;
  const r = s.lessons[`grammar:${lesson.id}`];
  const idx = GRAMMAR.findIndex((g) => g.id === id);
  const nextLesson = GRAMMAR[idx + 1];

  return (
    <div>
      <PageHeader back="/grammar" emoji={lesson.emoji} title={lesson.title} subtitle={lesson.titleUz} right={<LevelBadge level={lesson.level} />} />

      {!quiz && (
        <>
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10">
            <p className="font-semibold">{lesson.summaryUz}</p>
            {r && <Pill tone={r.completed ? 'green' : 'amber'} className="mt-2">Eng yaxshi natija: {r.bestScore}/{r.total} · {r.attempts} urinish</Pill>}
          </Card>

          <Section title="📘 Tushuntirish">
            <Card className="space-y-3 text-[15px] leading-relaxed">
              {lesson.explanationUz.map((p, i) => <p key={i}>{p}</p>)}
            </Card>
          </Section>

          <Section title="✍️ Misollar">
            <ul className="space-y-2">
              {lesson.examples.map((e, i) => (
                <li key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{e.en}</p>
                    <p className="text-sm text-muted">{e.uz}</p>
                  </div>
                  <SpeakButton text={e.en} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="⚠️ Keng tarqalgan xatolar">
            <ul className="space-y-2.5">
              {lesson.mistakes.map((m, i) => (
                <li key={i} className="rounded-2xl border border-line bg-surface p-3.5">
                  <p className="flex items-center gap-2 text-sm"><Icon name="x" className="h-4 w-4 shrink-0 text-rose-500" /><span className="text-rose-600 line-through decoration-rose-400 dark:text-rose-300">{m.wrong}</span></p>
                  <p className="mt-1 flex items-center gap-2 text-sm"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /><span className="font-semibold text-emerald-700 dark:text-emerald-300">{m.right}</span></p>
                  <p className="mt-1.5 text-sm text-muted">{m.noteUz}</p>
                </li>
              ))}
            </ul>
          </Section>

          <div className="mt-6">
            <Button size="lg" full icon="play" onClick={() => setQuiz(true)}>{r ? 'Testni qayta topshirish' : 'Testni boshlash'} ({lesson.quiz.length} savol)</Button>
          </div>
        </>
      )}

      {quiz && (
        <QuizRunner
          title={`Grammatika: ${lesson.title}`}
          kind="grammar"
          lessonKey={`grammar:${lesson.id}`}
          questions={lesson.quiz}
          exitLabel={nextLesson ? 'Keyingi dars' : 'Darslar ro‘yxati'}
          onExit={() => navigate(nextLesson ? `/grammar/${nextLesson.id}` : '/grammar')}
        />
      )}
      {quiz && (
        <div className="mt-3 text-center">
          <button type="button" className="text-sm font-semibold text-muted underline" onClick={() => setQuiz(false)}>← Darsga qaytish</button>
        </div>
      )}
    </div>
  );
}
