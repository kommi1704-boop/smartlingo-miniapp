import { useEffect, useState } from 'react';
import { LISTENING } from '../data/listening';
import { useApp } from '../store/store';
import { navigate } from '../lib/router';
import { ContentList, type ListItem } from '../components/ContentList';
import { QuizRunner } from '../components/QuizRunner';
import { Button, Card, Chip, Empty, LevelBadge, Notice, PageHeader, Pill } from '../components/ui';
import { speakTranscript, stopSpeaking, ttsAvailable } from '../lib/tts';

export function ListeningList() {
  const s = useApp();
  const done = LISTENING.filter((l) => s.lessons[`listening:${l.id}`]?.completed).length;
  const tts = ttsAvailable();
  const items: ListItem[] = LISTENING.map((l) => {
    const res = s.lessons[`listening:${l.id}`];
    return {
      id: l.id,
      title: l.title,
      subtitle: l.audioUrl ? 'Audio + transkript' : tts ? 'Qurilma ovozi (TTS) + transkript' : 'Transkript asosidagi mashq',
      level: l.level,
      emoji: '🎧',
      done: !!res?.completed,
      status: res ? { label: `Natija: ${res.bestScore}/${res.total}`, tone: res.completed ? 'green' : 'amber' } : { label: 'Yangi', tone: 'neutral' },
    };
  });
  return (
    <div>
      <PageHeader emoji="🎧" title="Tinglash" subtitle={`${LISTENING.length} ta mashq · ${done} tasi tugatilgan`} />
      <div className="mb-3">
        <Notice>
          {tts
            ? 'Bu mashqlarda yozib olingan audio yo‘q: matnni qurilmangizning sintez qilingan ovozi (TTS) o‘qib beradi. Transkript ham mavjud.'
            : 'Qurilmangiz matnni ovoz chiqarib o‘qishni qo‘llamaydi, shuning uchun mashqlar transkript asosida bajariladi (audio yo‘q).'}
        </Notice>
      </div>
      <ContentList items={items} base="/listening" />
    </div>
  );
}

export function ListeningPage({ id }: { id: string }) {
  const s = useApp();
  const act = LISTENING.find((l) => l.id === id);
  const tts = ttsAvailable();
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [showText, setShowText] = useState(!tts);
  const [quiz, setQuiz] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  if (!act) return <Empty emoji="🤔" title="Mashq topilmadi" action={<Button onClick={() => navigate('/listening')}>Mashqlar ro‘yxati</Button>} />;
  const res = s.lessons[`listening:${act.id}`];
  const idx = LISTENING.findIndex((l) => l.id === id);
  const next = LISTENING[idx + 1];

  function play() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakTranscript(act!.transcript, rate, () => setPlaying(false));
  }

  return (
    <div>
      <PageHeader back="/listening" emoji="🎧" title={act.title} subtitle="Tinglash mashqi" right={<LevelBadge level={act.level} />} />
      <Card>
        <p className="text-sm font-semibold text-muted">Vaziyat</p>
        <p className="mt-1">{act.situationUz}</p>

        <div className="mt-4 rounded-2xl bg-surface2 p-3.5">
          {tts ? (
            <>
              <p className="text-xs text-muted">Qurilma ovozi (TTS) — yozib olingan audio emas</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button icon={playing ? 'stop' : 'play'} onClick={play}>{playing ? 'To‘xtatish' : 'Tinglash'}</Button>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  Tezlik:
                  {[0.7, 0.9, 1.1].map((r) => (
                    <Chip key={r} active={rate === r} onClick={() => { stopSpeaking(); setPlaying(false); setRate(r); }}>{r === 0.7 ? 'Sekin' : r === 0.9 ? 'Oddiy' : 'Tez'}</Chip>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm">🔇 Bu qurilmada ovoz mavjud emas. Mashq transkript asosida bajariladi.</p>
          )}
        </div>

        <div className="mt-3">
          <button type="button" className="text-sm font-semibold text-indigo-600 underline dark:text-indigo-300" onClick={() => setShowText(!showText)} aria-expanded={showText}>
            {showText ? 'Transkriptni yashirish' : 'Transkriptni ko‘rsatish'}
          </button>
          {showText && (
            <div className="slide-up mt-2 space-y-1.5 rounded-2xl border border-line p-3.5 text-[15px] leading-relaxed">
              {act.transcript.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}
        </div>
        {res && <Pill tone={res.completed ? 'green' : 'amber'} className="mt-3">Eng yaxshi natija: {res.bestScore}/{res.total}</Pill>}
      </Card>

      <div className="mt-4">
        {!quiz ? (
          <Button size="lg" full icon="play" onClick={() => { stopSpeaking(); setPlaying(false); setQuiz(true); }}>{res ? 'Savollarni qayta yechish' : 'Savollarga o‘tish'}</Button>
        ) : (
          <>
            <QuizRunner
              title={`Tinglash: ${act.title}`}
              kind="listening"
              lessonKey={`listening:${act.id}`}
              questions={act.questions}
              exitLabel={next ? 'Keyingi mashq' : 'Mashqlar ro‘yxati'}
              onExit={() => navigate(next ? `/listening/${next.id}` : '/listening')}
            />
            <div className="mt-3 text-center">
              <button type="button" className="text-sm font-semibold text-muted underline" onClick={() => setQuiz(false)}>← Mashqqa qaytish</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
