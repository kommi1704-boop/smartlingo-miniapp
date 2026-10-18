import { useEffect, useMemo, useState } from 'react';
import { READING } from '../data/reading';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { ContentList, type ListItem } from '../components/ContentList';
import { QuizRunner } from '../components/QuizRunner';
import { Button, Card, Empty, LevelBadge, PageHeader, Pill, Section } from '../components/ui';
import { Highlightable } from '../components/Highlightable';
import { VoicePicker, SpeedChips, useVoices } from '../components/VoicePicker';
import { playLines, setPrefs, stopSpeaking, ttsAvailable } from '../lib/tts';
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

export function ReadingPage({ id }: { id: string }) {
  const s = useApp();
  const passage = READING.find((r) => r.id === id);
  const [quiz, setQuiz] = useState(false);
  const [active, setActive] = useState<{ en: string; uz: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const [showVoice, setShowVoice] = useState(false);
  const { prefs } = useVoices();
  const tts = ttsAvailable();

  const paras = useMemo(() => (passage ? passage.text.split(/\n\n+/) : []), [passage]);
  const terms = useMemo(() => (passage ? passage.vocab.map((v) => v.en) : []), [passage]);

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    stopSpeaking();
    setPlaying(false);
    setLine(-1);
  }, [id]);

  function play(from = 0) {
    setPlaying(true);
    setLine(from);
    playLines(paras.map((t) => ({ text: t, role: 0 as const })), {
      startAt: from,
      onLine: setLine,
      onEnd: () => {
        setPlaying(false);
        setLine(-1);
      },
    });
  }
  function togglePlay() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      setLine(-1);
    } else play(0);
  }

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
        <Highlightable
          storeKey={`reading:${passage.id}`}
          paragraphs={paras}
          terms={terms}
          onTerm={(t) => {
            const v = lookup(t);
            if (v) setActive(v);
          }}
          activeIndex={line}
          className="space-y-3 text-[16px] leading-relaxed"
        />
        {tts && (
          <div className="mt-4 rounded-2xl bg-surface2 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" icon={playing ? 'stop' : 'volume'} onClick={togglePlay}>{playing ? 'To‘xtatish' : 'Matnni tinglash'}</Button>
              <SpeedChips rate={prefs.rate} onChange={(r) => { setPrefs({ rate: r }); if (playing) play(Math.max(0, line)); }} />
            </div>
            <button type="button" className="mt-2 text-xs font-semibold text-indigo-600 underline dark:text-indigo-300" onClick={() => setShowVoice(!showVoice)} aria-expanded={showVoice}>
              {showVoice ? 'Ovoz sozlamalarini yopish' : 'Ovozni almashtirish'}
            </button>
            {showVoice && <div className="slide-up mt-2 border-t border-line pt-3"><VoicePicker compact /></div>}
            <p className="mt-2 text-xs text-muted">Qurilma ovozi (TTS) o‘qiydi, yozib olingan audio emas. Ostiga chizilgan so‘zni bosing — ma’nosi chiqadi.</p>
          </div>
        )}
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
