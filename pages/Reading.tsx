import { useEffect, useMemo, useState } from 'react';
import { READING } from '../data/reading';
import { VOCAB } from '../data/vocab';
import { useApp } from '../store/store';
import { markForReview } from '../store/actions';
import { navigate } from '../lib/router';
import { aiErrorHint, aiLeftToday, aiPost, aiUsedToday } from '../lib/aiUsage';
import { today } from '../lib/dates';
import { ContentList, type ListItem } from '../components/ContentList';
import { QuizRunner } from '../components/QuizRunner';
import { Button, Card, Empty, LevelBadge, PageHeader, Pill, Section } from '../components/ui';
import { Highlightable } from '../components/Highlightable';
import { VoicePicker, SpeedChips, useVoices } from '../components/VoicePicker';
import { playLines, setPrefs, stopSpeaking, ttsAvailable } from '../lib/tts';
import { haptic } from '../lib/telegram';
import { toast } from '../store/ui';
import type { Quiz } from '../types';
import { cx, wordCount } from '../lib/utils';

// ===== "Men uchun matn" — AI text about the child's interests (Feature 3) =====

interface AiWordItem {
  en: string;
  uz: string;
}
interface AiQuestionItem {
  q: string;
  options: string[];
  answerIndex: number;
}
interface AiTextData {
  title: string;
  text: string;
  questions: AiQuestionItem[];
  words: AiWordItem[];
}

const genKey = (interest: string) => `sl.gentext:${today()}:${interest}`;

function loadGen(interest: string): AiTextData | null {
  try {
    const raw = window.localStorage.getItem(genKey(interest));
    return raw ? (JSON.parse(raw) as AiTextData) : null;
  } catch {
    return null;
  }
}

function saveGen(interest: string, d: AiTextData): void {
  try {
    window.localStorage.setItem(genKey(interest), JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

function clearGen(interest: string): void {
  try {
    window.localStorage.removeItem(genKey(interest));
  } catch {
    /* ignore */
  }
}

export function AiReadingCard() {
  const s = useApp();
  const interests = s.profile?.interests ?? [];
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState('');
  const [data, setData] = useState<AiTextData | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [quiz, setQuiz] = useState(false);
  const left = aiLeftToday('generate-text');
  const used = aiUsedToday('generate-text');

  function pick(chip: string) {
    if (busy) return;
    setInterest(chip);
    setQuiz(false);
    setNote('');
    setData(loadGen(chip)); // same day + same interest -> no second API call
  }

  async function generate() {
    if (busy || !interest || left <= 0) return;
    setBusy(true);
    setNote('');
    try {
      const j = await aiPost<{ result: AiTextData }>('generate-text', '/api/generate-text', {
        interest,
        level: s.profile?.estimatedLevel ?? 'A1',
      });
      saveGen(interest, j.result);
      setData(j.result);
      setQuiz(false);
      haptic('success');
    } catch (e) {
      setNote(aiErrorHint(e));
    } finally {
      setBusy(false);
    }
  }

  function report() {
    if (interest) clearGen(interest);
    setData(null);
    setQuiz(false);
    setOpen(false);
    toast('Xabaringiz uchun rahmat — matn yashirildi', 'info');
  }

  const paras = useMemo(() => (data ? data.text.split(/\n\n+/) : []), [data]);
  const terms = useMemo(() => (data ? data.words.map((w) => w.en) : []), [data]);
  const questions: Quiz[] = (data?.questions ?? []).map((q, i) => ({ id: `ai-${i}`, q: q.q, options: q.options, answer: q.answerIndex, explain: '' }));

  return (
    <div className="mb-4 overflow-hidden rounded-3xl border-2 border-violet-300/60 bg-violet-50/50 dark:border-violet-400/30 dark:bg-violet-500/10">
      <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-500/20">🎯</span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold">Men uchun matn</span>
          <span className="block truncate text-xs text-muted">AI qiziqishingiz bo‘yicha matn yozadi · bugun {Math.min(used, 3)}/3 ishlatilgan</span>
        </span>
        <span className="shrink-0 text-lg text-muted" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="slide-up px-4 pb-4">
          {interests.length === 0 ? (
            <div className="rounded-2xl bg-surface p-3.5 text-sm">
              <p className="font-semibold">Avval qiziqishlaringizni tanlang</p>
              <p className="mt-1 text-muted">Profil sahifasida «Qiziqishlarim» bo‘limida 5 tagacha mavzu tanlaysiz — AI shular bo‘yicha matn yozadi.</p>
              <Button className="mt-2.5" size="sm" onClick={() => navigate('/profile')}>Profilga o‘tish</Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {interests.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => pick(chip)}
                    aria-pressed={interest === chip}
                    className={cx(
                      'rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition',
                      interest === chip ? 'border-violet-500 bg-violet-500 text-white' : 'border-line bg-surface hover:border-violet-400',
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              {interest && !data && (
                <Button className="mt-3" full icon="sparkles" disabled={busy || left <= 0} onClick={generate}>
                  {busy ? 'AI yozmoqda…' : left > 0 ? 'Matn yaratish' : 'Bugungi limit tugadi (3/3)'}
                </Button>
              )}
              {note && <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">{note}</p>}

              {data && !quiz && (
                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-extrabold leading-snug">{data.title}</p>
                    <Pill tone="amber" className="!px-2 !py-0.5 !text-[10px]">⚠ AI yozgan · tekshirilmagan</Pill>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{wordCount(data.text)} ta so‘z · mavzu: {interest} · daraja: {s.profile?.estimatedLevel ?? 'A1'}</p>
                  <Card className="mt-2">
                    <Highlightable storeKey={`gentext:${today()}:${interest}`} paragraphs={paras} terms={terms} className="space-y-2.5 text-[16px] leading-relaxed" />
                  </Card>
                  <Section title="🔤 So‘zlar yordami">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {data.words.map((w) => {
                        const inVocab = VOCAB.find((v) => v.en.toLowerCase() === w.en.toLowerCase());
                        return (
                          <div key={w.en} className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-sm">
                            <span className="min-w-0"><b className="truncate">{w.en}</b> <span className="text-muted">— {w.uz}</span></span>
                            {inVocab ? (
                              <Button size="sm" variant="secondary" icon="plus" onClick={() => markForReview(inVocab.id)}>Lug‘atga</Button>
                            ) : (
                              <span className="shrink-0 text-[11px] text-muted">lug‘atda yo‘q</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Button icon="play" onClick={() => setQuiz(true)}>Savollarga o‘tish ({questions.length})</Button>
                    <Button variant="ghost" size="sm" onClick={() => setData(null)}>Yangi matn yozish</Button>
                  </div>
                </div>
              )}

              {data && quiz && (
                <div className="mt-3">
                  <QuizRunner
                    title={`Men uchun matn: ${data.title}`}
                    kind="reading"
                    lessonKey={`reading:ai-${interest}`}
                    questions={questions}
                    exitLabel="Matnga qaytish"
                    onExit={() => setQuiz(false)}
                  />
                </div>
              )}

              {data && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[11px] text-muted">Bu matn AI tomonidan yozilgan, inson tekshirmagan va faqat telefoningizda saqlanadi.</p>
                  <button type="button" className="shrink-0 text-xs font-semibold text-muted underline" onClick={report}>Xato bor</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

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
      <AiReadingCard />
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
