// Daily Learning Journey — interactive stage activities (Phases 3-5).
//
// Every stage is a small, focused activity with its own completion criteria:
//   discover  — reveal the theme facts, answer the check question (+ completes the
//               server-side Daily Discovery once, so the home card stays in sync)
//   vocab     — flashcards → fill-in-the-blank recall (real recall answers go to
//               the vocab ledger + SRS; XP is server-capped)
//   grammar   — word-order mini task + the lesson's quiz through finishQuiz
//               (full existing pipeline: mistakes notebook, server XP, caps)
//   listening — TTS dialog + comprehension quiz (finishQuiz)
//   reading   — catalog passage or the AI-generated interest text (cached daily)
//               + quiz (finishQuiz, journey lesson key → server XP)
//   game      — one of the five existing games (finishGame: server XP + caps)
//   challenge — speaking self-check / writing with local+AI feedback / mistake repair
//
// Nothing here invents XP: amounts come from the server responses (or the
// legacy local formulas for speaking/writing, as in the rest of the app).
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ContentKind, JourneyAiText, JourneySession, JourneyStage, Quiz } from '../../types';
import { VOCAB } from '../../data/vocab';
import { GRAMMAR } from '../../data/grammar';
import { READING } from '../../data/reading';
import { LISTENING } from '../../data/listening';
import { SPEAKING } from '../../data/speaking';
import { WRITING } from '../../data/writing';
import { GAMES, type GameResult } from '../../lib/games';
import {
  finishQuiz, completeSpeaking, submitWriting, toggleMistake, awardVocabAnswers, reviewWord, finishGame, type QuizOutcome,
} from '../../store/actions';
import { getState } from '../../store/store';
import { completeJourneyStage, addJourneyStageXp } from '../../store/journeyActions';
import { xpApi } from '../../lib/xpApi';
import { aiPost, aiErrorHint, aiLeftToday } from '../../lib/aiUsage';
import { checkText } from '../../lib/writingCheck';
import { speak, stopSpeaking, ttsAvailable, RATE_SLOW } from '../../lib/tts';
import { haptic } from '../../lib/telegram';
import { playSfx } from '../../lib/sfx';
import { Emo } from '../Emo';
import { Mascot } from '../Mascot';
import { Button, Card, Pill, ProgressBar } from '../ui';
import { SpeakButton } from '../SpeakButton';
import { cx } from '../../lib/utils';

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export interface StageProps {
  stage: JourneyStage;
  session: JourneySession;
  onDone: (args: { score: number; total: number; xp: number }) => void;
}

/** Missing-content safety net: never a broken stage, never a silent reward. */
function BrokenStage({ stage, onDone }: { stage: JourneyStage; onDone: StageProps['onDone'] }) {
  return (
    <StageShell stage={stage} step={1} total={1}>
      <Card className="text-center">
        <div className="flex justify-center"><Mascot mood="think" size={80} /></div>
        <h3 className="mt-1 text-lg font-extrabold">Bu bosqich hozircha ishlamaydi</h3>
        <p className="mt-1 text-[13px] font-semibold text-muted">Tarkib yangilanmoqda — bosqichni yakunlab, davom eting.</p>
        <Button className="mt-3" size="lg" full icon="check" onClick={() => { completeJourneyStage(stage.id, 1, 1); onDone({ score: 1, total: 1, xp: 0 }); }}>Bosqichni yakunlash</Button>
      </Card>
    </StageShell>
  );
}

export function StageShell({ stage, step, total, children }: { stage: JourneyStage; step: number; total: number; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2.5 px-1 pb-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/80 shadow-sm dark:bg-white/10"><Emo n={stage.emo as never} size={20} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight">{stage.title}</p>
          <p className="truncate text-[11px] font-semibold text-muted">{stage.desc}</p>
        </div>
        <span className="shrink-0 rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-black text-muted">{step}/{total}</span>
      </div>
      <ProgressBar value={(step / Math.max(1, total)) * 100} className="mb-3" label={stage.title} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">{children}</div>
    </div>
  );
}

interface QuizMeta { quiz: Quiz; picked: number }

/** Compact quiz runner with full control of the outcome — routes through finishQuiz. */
function StageQuiz({ title, questions, kind, lessonKey, onDone }: {
  title: string;
  questions: Quiz[];
  kind: ContentKind;
  lessonKey?: string;
  onDone: (outcome: QuizOutcome) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const results = useRef<QuizMeta[]>([]);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const doneRef = useRef(false);
  const q = questions[idx];

  function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answer;
    results.current = [...results.current.filter((x) => x.quiz.id !== q.id), { quiz: q, picked: i }];
    haptic(ok ? 'success' : 'error');
    playSfx(ok ? 'correct' : 'wrong');
  }

  async function next() {
    if (!q) return;
    if (idx + 1 >= questions.length) {
      if (doneRef.current) return;
      doneRef.current = true;
      const r = await finishQuiz({ kind, title, items: results.current, lessonKey });
      setOutcome(r);
      onDone(r);
    } else {
      setPicked(null);
      setIdx(idx + 1);
    }
  }

  if (outcome) return null; // parent shows the interstitial
  if (!q) return null;

  const revealed = picked !== null;
  const correct = revealed && picked === q.answer;
  return (
    <Card className="pop-in">
      <p className="text-sm font-extrabold text-muted">{idx + 1}/{questions.length}</p>
      <h3 className="mt-1 text-[17px] font-extrabold leading-snug">{q.q}</h3>
      <div className="mt-3 space-y-2" role="radiogroup" aria-label={title}>
        {q.options.map((o, i) => {
          const show = revealed && (i === q.answer || i === picked);
          return (
            <button
              key={i} type="button" role="radio" aria-checked={picked === i} disabled={revealed}
              onClick={() => choose(i)}
              className={cx(
                'block w-full rounded-2xl border-2 px-4 py-3 text-left text-[14.5px] font-bold transition active:scale-[0.99]',
                show ? (i === q.answer ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15' : 'border-rose-300 bg-rose-50 dark:bg-rose-500/15') : 'border-line bg-surface hover:border-sky-300',
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className={cx('mt-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold leading-snug', correct ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200')}>
          <span className="font-black">{correct ? 'To‘g‘ri! ' : `To‘g‘ri javob: ${q.options[q.answer]}. `}</span>{q.explain}
        </div>
      )}
      {revealed && (
        <Button className="mt-3" size="lg" full icon="right" onClick={() => void next()}>{idx + 1 >= questions.length ? 'Yakunlash' : 'Keyingi savol'}</Button>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 01 DISCOVER
// ---------------------------------------------------------------------------

export function DiscoverStage({ stage, onDone }: StageProps) {
  const s = getState();
  const [opened, setOpened] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState<QuizOutcome | null>(null);
  const [discoveryXp, setDiscoveryXp] = useState(0);
  const facts = stage.facts ?? [];
  const allOpen = facts.length > 0 && opened.length >= facts.length;
  const check = stage.check;

  // the Daily Discovery is the same hook — completing the stage completes it server-side once
  useEffect(() => {
    let live = true;
    xpApi
      .discoveryGet(s.profile?.estimatedLevel ?? 'A2', s.profile?.interests ?? [])
      .then((r) => {
        if (!live || r.completed) return;
        return xpApi
          .discoveryDone(r.day)
          .then((res) => {
            if (!live || res.granted <= 0) return;
            setDiscoveryXp(res.granted);
            addJourneyStageXp(stage.id, res.granted);
          })
          .catch(() => undefined);
      })
      .catch(() => undefined);
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (!quizDone) return;
    completeJourneyStage(stage.id, quizDone.score, quizDone.total);
    addJourneyStageXp(stage.id, quizDone.xp);
    onDone({ score: quizDone.score, total: quizDone.total, xp: quizDone.xp + discoveryXp });
  }

  if (!check) return <BrokenStage stage={stage} onDone={onDone} />;

  return (
    <StageShell stage={stage} step={opened.length + (quizDone ? 1 : 0)} total={facts.length + 1}>
      <p className="px-1 text-[13px] font-semibold text-muted">Kartochkalarni ochib ko‘ring — har birida qiziqarli fakt:</p>
      <div className="mt-2 space-y-2">
        {facts.map((f, i) => {
          const open = opened.includes(i);
          return (
            <button
              key={i} type="button"
              onClick={() => { if (!open) { setOpened((o) => [...o, i]); haptic('light'); playSfx('pop'); } }}
              className={cx('block w-full rounded-3xl border-2 p-4 text-left transition active:scale-[0.99]', open ? 'border-sky-300 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10' : 'border-dashed border-line bg-surface')}
            >
              <span className="flex items-center gap-2 text-[13px] font-black text-muted">
                <Emo n="sparkle" size={14} /> Fakt {i + 1}
              </span>
              {open ? (
                <>
                  <p className="mt-1.5 text-[15px] font-extrabold leading-snug">{f.en}</p>
                  <p className="mt-1 text-[13px] font-semibold text-muted">{f.uz}</p>
                  <span className="mt-2 inline-flex"><SpeakButton text={f.en} /></span>
                </>
              ) : (
                <p className="mt-1.5 text-[14px] font-bold text-muted">Bosing va oching 👆</p>
              )}
            </button>
          );
        })}
      </div>
      {allOpen && !quizDone && (
        <div className="mt-4">
          <p className="mb-2 px-1 text-[13px] font-black">Tekshiruv savoli:</p>
          <StageQuiz title="Kashfiyot tekshiruvi" questions={[check]} kind="reading" onDone={(o) => setQuizDone(o)} />
        </div>
      )}
      {quizDone && <Button className="mt-4" size="lg" full icon="check" onClick={finish}>Bosqichni yakunlash</Button>}
    </StageShell>
  );
}

// ---------------------------------------------------------------------------
// 02 VOCABULARY — flashcards then fill-in-the-blank recall
// ---------------------------------------------------------------------------

function blankSentence(sentence: string, word: string): string {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*\\b`, 'i');
  return re.test(sentence) ? sentence.replace(re, '_____') : sentence;
}

export function VocabStage({ stage, onDone }: StageProps) {
  const words = useMemo(() => (stage.words ?? []).map((id) => VOCAB.find((w) => w.id === id)).filter(Boolean) as typeof VOCAB, [stage.words]);
  const [phase, setPhase] = useState<'cards' | 'quiz'>('cards');
  const [ci, setCi] = useState(0);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const answers = useRef<{ id: string; ok: boolean }[]>([]);
  const finishedRef = useRef(false);

  const items = useMemo(() => {
    // one fill-in-the-blank per word: sentence = example, options = 4 candidate words
    return words.map((w, i) => {
      const others = words.filter((_, j) => j !== i).map((x) => x.en);
      const filler = VOCAB.filter((x) => x.level === w.level && !words.includes(x)).map((x) => x.en);
      const pool = [...others, ...filler].filter((v) => v && v !== w.en);
      const opts = [w.en, ...pool.slice(0, 3)];
      const rot = i % Math.max(1, opts.length);
      const options = [...opts.slice(rot), ...opts.slice(0, rot)];
      return { word: w, sentence: blankSentence(w.exEn, w.en), options };
    });
  }, [words]);

  if (words.length < 3) return <BrokenStage stage={stage} onDone={onDone} />;

  async function submitRecall() {
    const batch = answers.current.map((a) => ({ id: a.id, known: a.ok, ctx: 'quiz' as const }));
    try {
      const granted = await awardVocabAnswers(batch);
      if (granted > 0) addJourneyStageXp(stage.id, granted);
    } catch {
      /* offline: SRS progress is still saved locally */
    }
  }

  function answer(wordId: string, en: string, ok: boolean) {
    setPicked(en);
    if (!answers.current.some((a) => a.id === wordId)) answers.current.push({ id: wordId, ok });
    reviewWord(wordId, ok);
    haptic(ok ? 'success' : 'error');
    playSfx(ok ? 'correct' : 'wrong');
  }

  async function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    await submitRecall();
    const total = items.length;
    const score = answers.current.filter((a) => a.ok).length;
    completeJourneyStage(stage.id, score, total);
    onDone({ score, total, xp: 0 });
  }

  if (phase === 'cards') {
    const w = words[ci];
    return (
      <StageShell stage={stage} step={ci + 1} total={words.length}>
        {w && (
          <Card className="text-center">
            <div className="flex justify-center"><Emo n="cards" size={44} /></div>
            <h2 className="mt-2 text-3xl font-black">{w.en}</h2>
            <p className="text-sm font-bold text-muted">{w.ipa}</p>
            <p className="mt-2 text-lg font-extrabold text-[#2fa763]">{w.uz}</p>
            <div className="mt-3 flex justify-center"><SpeakButton text={w.en} /></div>
            <div className="mt-3 rounded-2xl bg-surface2 p-3 text-left">
              <p className="text-[14.5px] font-bold leading-snug">{w.exEn}</p>
              <p className="mt-1 text-[12.5px] font-semibold text-muted">{w.exUz}</p>
              <div className="mt-1.5"><SpeakButton text={w.exEn} label="Mashqni tinglash" /></div>
            </div>
            <Button className="mt-4" size="lg" full icon="right" onClick={() => { playSfx('pop'); if (ci + 1 >= words.length) setPhase('quiz'); else setCi(ci + 1); }}>
              {ci + 1 >= words.length ? 'Mashqlarga o‘tish' : 'Keyingi so‘z'}
            </Button>
          </Card>
        )}
      </StageShell>
    );
  }

  const item = items[qi];
  if (!item) {
    void finish();
    return null;
  }
  const revealed = picked !== null;
  const ok = picked === item.word.en;
  return (
    <StageShell stage={stage} step={qi + 1} total={items.length}>
      <Card>
        <p className="text-sm font-extrabold text-muted">Bo‘sh joyni to‘ldiring:</p>
        <h3 className="mt-1 text-[17px] font-extrabold leading-snug">{item.sentence}</h3>
        <div className="mt-3 space-y-2">
          {item.options.map((o) => (
            <button key={o} type="button" disabled={revealed}
              onClick={() => answer(item.word.id, o, o === item.word.en)}
              className={cx(
                'block w-full rounded-2xl border-2 px-4 py-3 text-left text-[14.5px] font-bold transition',
                revealed && o === item.word.en ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15'
                  : revealed && o === picked ? 'border-rose-300 bg-rose-50 dark:bg-rose-500/15' : 'border-line bg-surface hover:border-sky-300',
              )}
            >{o}</button>
          ))}
        </div>
        {revealed && (
          <>
            <p className="mt-3 rounded-2xl bg-surface2 px-3.5 py-2.5 text-[13px] font-semibold"><span className="font-black">{item.word.en}</span> — {item.word.uz}</p>
            {qi + 1 >= items.length
              ? <Button className="mt-3" size="lg" full icon="check" onClick={() => void finish()}>Yakunlash</Button>
              : <Button className="mt-3" size="lg" full icon="right" onClick={() => { setPicked(null); setQi(qi + 1); }}>Keyingi</Button>}
          </>
        )}
      </Card>
    </StageShell>
  );
}

// ---------------------------------------------------------------------------
// 03 GRAMMAR — word-order mini task + the lesson quiz (existing pipeline)
// ---------------------------------------------------------------------------

function WordOrder({ sentence, uz, onSolved }: { sentence: string; uz: string; onSolved: (ok: boolean) => void }) {
  const target = useMemo(() => sentence.replace(/[.!?]$/, '').split(/\s+/).filter(Boolean), [sentence]);
  const [tiles, setTiles] = useState<{ t: string; k: string }[]>([]);
  const [built, setBuilt] = useState<{ t: string; k: string }[]>([]);
  useEffect(() => {
    const arr = [...target];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setTiles(arr.map((t, i) => ({ t, k: `${i}-${t}` })));
    setBuilt([]);
  }, [target]);
  const solved = built.map((b) => b.t).join(' ').toLowerCase() === target.join(' ').toLowerCase();
  const tried = built.length === target.length && target.length > 0;
  return (
    <Card>
      <p className="text-sm font-extrabold text-muted">So‘zlarni joyiga qo‘yib gapni tuzing:</p>
      <p className="mt-1 text-[13px] font-semibold text-muted">{uz}</p>
      <div className="mt-3 min-h-12 rounded-2xl border-2 border-dashed border-line bg-surface2 p-2">
        <div className="flex flex-wrap gap-1.5">
          {built.map((b, i) => (
            <button key={`${b.k}-b${i}`} type="button" className="rounded-xl bg-sky-100 px-2.5 py-1.5 text-[13.5px] font-bold dark:bg-sky-500/20" onClick={() => { setBuilt((bs) => bs.filter((_, k) => k !== i)); setTiles((ts) => [...ts, b]); }}>{b.t}</button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tiles.map((tile) => (
          <button key={tile.k} type="button" className="rounded-xl border-2 border-line bg-surface px-2.5 py-1.5 text-[13.5px] font-bold transition hover:border-sky-300" onClick={() => { setBuilt((b) => [...b, tile]); setTiles((ts) => ts.filter((x) => x.k !== tile.k)); }}>{tile.t}</button>
        ))}
      </div>
      {tried && (
        <div className={cx('mt-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold', solved ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10')}>
          <span className="font-black">{solved ? 'To‘g‘ri! ' : `To‘g‘ri javob: ${target.join(' ')}. `}</span>{solved ? 'Inglizchada so‘z tartibi qat’iy — shu tartibda ishlatiladi.' : 'Mashqni qayta bosib, boshqacha tartibni sinab ko‘ring.'}
        </div>
      )}
      <Button className="mt-3" size="lg" full icon="right" disabled={!tried} onClick={() => onSolved(solved)}>Davom etish</Button>
    </Card>
  );
}

export function GrammarStage({ stage, session, onDone }: StageProps) {
  const lesson = GRAMMAR.find((g) => g.id === stage.grammarId);
  const [phase, setPhase] = useState<'learn' | 'order' | 'quiz'>('learn');
  if (!lesson) return <BrokenStage stage={stage} onDone={onDone} />;
  void session;

  return (
    <StageShell stage={stage} step={phase === 'learn' ? 1 : phase === 'order' ? 2 : 3} total={3}>
      {phase === 'learn' && (
        <Card>
          <div className="flex items-center gap-2"><Emo n="puzzle" size={22} /><h3 className="text-lg font-extrabold">{lesson.title}</h3></div>
          <p className="text-[13px] font-bold text-muted">{lesson.titleUz} · {lesson.level}</p>
          <div className="mt-2 space-y-2">
            {lesson.explanationUz.slice(0, 3).map((p, i) => <p key={i} className="text-[13.5px] font-semibold leading-relaxed">{p}</p>)}
          </div>
          <div className="mt-3 space-y-1.5">
            {lesson.examples.slice(0, 3).map((ex, i) => (
              <div key={i} className="rounded-2xl bg-surface2 p-2.5">
                <p className="text-[14px] font-bold">{ex.en}</p>
                <p className="text-[12px] font-semibold text-muted">{ex.uz}</p>
              </div>
            ))}
          </div>
          <Button className="mt-4" size="lg" full icon="right" onClick={() => setPhase('order')}>Mashqlarga o‘tish</Button>
        </Card>
      )}
      {phase === 'order' && (
        <WordOrder sentence={lesson.examples[0]?.en ?? ''} uz={lesson.examples[0]?.uz ?? ''} onSolved={() => setPhase('quiz')} />
      )}
      {phase === 'quiz' && (
        <StageQuiz
          title={`Grammatika: ${lesson.title}`}
          questions={lesson.quiz}
          kind="grammar"
          lessonKey={`grammar:${lesson.id}`}
          onDone={(o) => {
            completeJourneyStage(stage.id, o.score, o.total);
            addJourneyStageXp(stage.id, o.xp);
            onDone({ score: o.score, total: o.total, xp: o.xp });
          }}
        />
      )}
    </StageShell>
  );
}

// ---------------------------------------------------------------------------
// 04 LISTENING — TTS dialog + comprehension quiz
// ---------------------------------------------------------------------------

export function ListeningStage({ stage, onDone }: StageProps) {
  const activity = LISTENING.find((l) => l.id === stage.listeningId);
  const [phase, setPhase] = useState<'listen' | 'quiz'>('listen');
  const [lineIdx, setLineIdx] = useState(0);
  const canTts = ttsAvailable();

  if (!activity) return <BrokenStage stage={stage} onDone={onDone} />;
  const lines = activity.transcript.split('\n').filter(Boolean);

  function playUpTo(i: number) {
    setLineIdx(i);
    stopSpeaking();
    speak(lines.slice(0, i + 1).join(' '), { rate: RATE_SLOW });
  }

  return (
    <StageShell stage={stage} step={phase === 'listen' ? 1 : 2} total={2}>
      {phase === 'listen' && (
        <Card>
          <div className="flex items-center gap-2"><Emo n="headset" size={22} /><h3 className="text-lg font-extrabold">{activity.title}</h3></div>
          <p className="mt-1 text-[13px] font-bold text-muted">{activity.situationUz}</p>
          <div className="mt-3 space-y-1.5">
            {lines.map((ln, i) => (
              <div key={i} className={cx('rounded-2xl p-2.5', i <= lineIdx ? 'bg-surface2' : 'bg-surface2/40')}>
                <p className={cx('text-[14px] font-bold', i > lineIdx && 'select-none opacity-35 blur-[3px]')}>{ln}</p>
              </div>
            ))}
          </div>
          {canTts ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="md" icon="volume" onClick={() => playUpTo(Math.min(lineIdx + 1, lines.length - 1))}>{lineIdx + 1 >= lines.length ? 'Qayta eshitish' : 'Keyingi qatorni tinglash'}</Button>
              {lineIdx + 1 >= lines.length && <Button size="md" variant="secondary" onClick={() => { stopSpeaking(); setPhase('quiz'); }}>Savollarga o‘tish</Button>}
            </div>
          ) : (
            <>
              <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-[12.5px] font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">Ovoz qo‘llab-quvvatlanmaydi — transkriptni o‘qib chiqing va savollarga o‘ting.</p>
              <Button className="mt-2" size="lg" full icon="right" onClick={() => setPhase('quiz')}>Savollarga o‘tish</Button>
            </>
          )}
        </Card>
      )}
      {phase === 'quiz' && (
        <StageQuiz
          title={activity.title}
          questions={activity.questions}
          kind="listening"
          lessonKey={`listening:${activity.id}`}
          onDone={(o) => {
            stopSpeaking();
            completeJourneyStage(stage.id, o.score, o.total);
            addJourneyStageXp(stage.id, o.xp);
            onDone({ score: o.score, total: o.total, xp: o.xp });
          }}
        />
      )}
    </StageShell>
  );
}

// ---------------------------------------------------------------------------
// 05 READING — catalog passage or the cached AI text
// ---------------------------------------------------------------------------

export function ReadingStage({ stage, session, onDone }: StageProps) {
  const passage = READING.find((r) => r.id === stage.readingId);
  const ai: JourneyAiText | null = stage.aiText ?? null;
  const quiz: Quiz[] = stage.aiQuiz ?? passage?.questions ?? [];
  const [phase, setPhase] = useState<'read' | 'quiz'>('read');
  const lessonKey = ai ? `journey-${session.date.replace(/-/g, '')}:read` : passage ? `reading:${passage.id}` : undefined;

  if (!passage && !ai) return <BrokenStage stage={stage} onDone={onDone} />;

  return (
    <StageShell stage={stage} step={phase === 'read' ? 1 : 2} total={2}>
      {phase === 'read' && (
        <Card>
          <div className="flex items-center gap-2">
            <Emo n="book" size={22} />
            <h3 className="text-lg font-extrabold">{ai ? ai.title : passage!.title}</h3>
            {ai && <Pill tone="violet">AI matn</Pill>}
          </div>
          {!ai && <p className="text-[13px] font-bold text-muted">{passage!.level}</p>}
          <div className="mt-2 space-y-2.5">
            {(ai ? ai.text : passage!.text).split('\n\n').map((p, i) => <p key={i} className="text-[14.5px] font-semibold leading-relaxed">{p}</p>)}
          </div>
          {!ai && passage!.vocab.length > 0 && (
            <div className="mt-3 rounded-2xl bg-surface2 p-3">
              <p className="text-[12px] font-black uppercase tracking-wide text-muted">Lug‘at yordami</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {passage!.vocab.map((v) => <Pill key={v.en} tone="neutral">{v.en} — {v.uz}</Pill>)}
              </div>
            </div>
          )}
          <Button className="mt-4" size="lg" full icon="right" onClick={() => setPhase('quiz')}>Savollarga o‘tish</Button>
        </Card>
      )}
      {phase === 'quiz' && quiz.length > 0 && (
        <StageQuiz
          title={ai ? ai.title : passage!.title}
          questions={quiz}
          kind="reading"
          lessonKey={lessonKey}
          onDone={(o) => {
            completeJourneyStage(stage.id, o.score, o.total);
            addJourneyStageXp(stage.id, o.xp);
            onDone({ score: o.score, total: o.total, xp: o.xp });
          }}
        />
      )}
      {phase === 'quiz' && quiz.length === 0 && (
        <Card className="text-center">
          <p className="font-bold">Bu matn uchun savollar topilmadi.</p>
          <Button className="mt-3" onClick={() => { completeJourneyStage(stage.id, 1, 1); onDone({ score: 1, total: 1, xp: 0 }); }}>Bosqichni yakunlash</Button>
        </Card>
      )}
    </StageShell>
  );
}

// ---------------------------------------------------------------------------
// 06 MINI GAME — one of the five existing games, wired to finishGame
// ---------------------------------------------------------------------------

import { MemoryGame } from '../games/MemoryGame';
import { RunnerGame } from '../games/RunnerGame';
import { ScrambleGame } from '../games/ScrambleGame';
import { BlitzGame } from '../games/BlitzGame';
import { ListenGame } from '../games/ListenGame';

const GAME_COMPONENTS: Record<string, (props: { daily: boolean; onFinish: (r: GameResult) => void }) => ReactNode> = {
  memory: MemoryGame, runner: RunnerGame, scramble: ScrambleGame, blitz: BlitzGame, listen: ListenGame,
};

export function GameStage({ stage, onDone }: StageProps) {
  const info = GAMES.find((g) => g.id === stage.gameId);
  const Comp = info ? GAME_COMPONENTS[info.id] : undefined;
  const busyRef = useRef(false);
  const [needsTts, setNeedsTts] = useState(false);

  useEffect(() => {
    if (info?.needsAudio && !ttsAvailable()) setNeedsTts(true);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!info || !Comp) return <BrokenStage stage={stage} onDone={onDone} />;

  async function handleFinish(r: GameResult) {
    if (busyRef.current) return;
    busyRef.current = true;
    const o = await finishGame(r, false);
    addJourneyStageXp(stage.id, o.xp);
    if (r.stars >= 1) completeJourneyStage(stage.id, r.score, Math.max(1, r.stars));
    onDone({ score: r.score, total: 3, xp: o.xp });
  }

  return (
    <StageShell stage={stage} step={1} total={1}>
      <Card>
        <div className="flex items-center gap-2"><Emo n={info.emo as never} size={20} /><h3 className="text-lg font-extrabold">{info.title}</h3></div>
        <p className="mt-1 text-[13px] font-semibold text-muted">{info.tagline}</p>
        {needsTts ? (
          <>
            <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-[12.5px] font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">Bu o‘yin ovozni talab qiladi — bu qurilmada ovoz yo‘q. Bosqichni yakunlab davom eting.</p>
            <Button className="mt-3" size="lg" full icon="check" onClick={() => { completeJourneyStage(stage.id, 1, 1); onDone({ score: 1, total: 1, xp: 0 }); }}>Bosqichni yakunlash</Button>
          </>
        ) : (
          <div className="mt-3"><Comp daily={false} onFinish={(r) => void handleFinish(r)} /></div>
        )}
      </Card>
    </StageShell>
  );
}

// ---------------------------------------------------------------------------
// 07 FINAL CHALLENGE — speaking / writing (AI-checked) / mistake repair
// ---------------------------------------------------------------------------

export function ChallengeStage({ stage, onDone }: StageProps) {
  const ch = stage.challenge;
  if (!ch) return <BrokenStage stage={stage} onDone={onDone} />;
  const forward: ChallengeDone = (score, total, xp) => onDone({ score, total, xp });
  if (ch.type === 'speaking') return <SpeakingChallenge stage={stage} onDone={forward} />;
  if (ch.type === 'writing') return <WritingChallenge stage={stage} onDone={forward} />;
  return <MistakesChallenge stage={stage} onDone={forward} count={ch.count ?? 5} />;
}

type ChallengeDone = (score: number, total: number, xp: number) => void;

function SpeakingChallenge({ stage, onDone }: { stage: JourneyStage; onDone: ChallengeDone }) {
  const prompt = SPEAKING.find((p) => p.id === stage.challenge?.promptId) ?? SPEAKING[0];
  const CHECKS = ['Ovoz chiqarib gapirdim', 'Namuna iboralarni ishlatdim', 'Kamida 2 ta gap aytdim'];
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [doneXp, setDoneXp] = useState<number | null>(null);
  const count = checks.filter(Boolean).length;

  function finish() {
    const xp = completeSpeaking(prompt.id, count, CHECKS.length);
    completeJourneyStage(stage.id, count, CHECKS.length);
    addJourneyStageXp(stage.id, xp);
    setDoneXp(xp);
    onDone(count, CHECKS.length, xp);
  }

  return (
    <StageShell stage={stage} step={count} total={CHECKS.length}>
      <Card>
        <div className="flex items-center gap-2"><Emo n="mic" size={22} /><h3 className="text-lg font-extrabold">{prompt.title}</h3></div>
        <p className="mt-2 rounded-2xl bg-surface2 p-3 text-[15px] font-extrabold leading-snug">{prompt.prompt}</p>
        <p className="mt-1 text-[12.5px] font-semibold text-muted">{prompt.promptUz}</p>
        <div className="mt-2"><SpeakButton text={prompt.sample} label="Namuna javobni tinglash" /></div>
        <div className="mt-3 rounded-2xl bg-surface2 p-3">
          <p className="text-[12px] font-black uppercase tracking-wide text-muted">Foydali iboralar</p>
          <div className="mt-1.5 space-y-1.5">
            {prompt.expressions.slice(0, 4).map((e) => (
              <div key={e.en} className="flex items-center justify-between gap-2">
                <p className="min-w-0 text-[13.5px] font-bold">{e.en} <span className="font-semibold text-muted">— {e.uz}</span></p>
                <SpeakButton text={e.en} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {CHECKS.map((c, i) => (
            <button key={i} type="button" onClick={() => setChecks((arr) => arr.map((v, k) => (k === i ? !v : v)))}
              className={cx('flex w-full items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 text-left text-[14px] font-bold transition', checks[i] ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15' : 'border-line bg-surface')}>
              <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', checks[i] ? 'bg-emerald-500 text-white' : 'bg-surface2 text-muted')}>{checks[i] ? '✓' : i + 1}</span>
              {c}
            </button>
          ))}
        </div>
        <Button className="mt-3" size="lg" full icon="check" disabled={count === 0 || doneXp !== null} onClick={finish}>Bosqichni yakunlash</Button>
      </Card>
    </StageShell>
  );
}

function WritingChallenge({ stage, onDone }: { stage: JourneyStage; onDone: ChallengeDone }) {
  const prompt = WRITING.find((w) => w.id === stage.challenge?.promptId) ?? WRITING[0];
  const [text, setText] = useState('');
  const [local, setLocal] = useState<ReturnType<typeof checkText> | null>(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');
  const [doneXp, setDoneXp] = useState<number | null>(null);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const enough = words >= prompt.minWords;

  function finish() {
    const check = checkText(text);
    setLocal(check);
    const xp = submitWriting(prompt.id, text, words, check.issues.length, prompt.minWords);
    completeJourneyStage(stage.id, enough ? 5 : 3, 5);
    addJourneyStageXp(stage.id, xp);
    setDoneXp(xp);
    onDone(enough ? 5 : 3, 5, xp);
  }

  async function aiCheck() {
    setAiBusy(true);
    setAiErr('');
    try {
      const r = await aiPost<{ result: { summary_uz: string; praise_uz: string; corrected_text: string; next_tip_uz: string } }>('writing-check', '/api/writing-check', { text, prompt: prompt.promptEn });
      setAiFeedback(`✅ ${r.result.summary_uz}${r.result.praise_uz ? ` · ${r.result.praise_uz}` : ''}${r.result.next_tip_uz ? ` · ${r.result.next_tip_uz}` : ''}`);
    } catch (e) {
      setAiErr(aiErrorHint(e));
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <StageShell stage={stage} step={doneXp !== null ? 2 : 1} total={2}>
      <Card>
        <div className="flex items-center gap-2"><Emo n="pen" size={22} /><h3 className="text-lg font-extrabold">{prompt.title}</h3></div>
        <p className="mt-2 rounded-2xl bg-surface2 p-3 text-[14.5px] font-extrabold leading-snug">{prompt.promptEn}</p>
        <p className="mt-1 text-[12.5px] font-semibold text-muted">{prompt.hintUz} · kamida {prompt.minWords} so‘z</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="mt-3 w-full rounded-2xl border-2 border-line bg-surface p-3 text-[14px] font-semibold leading-relaxed outline-none focus:border-sky-300"
          placeholder="Write your answer here…"
        />
        <p className={cx('mt-1 text-[12px] font-bold', enough ? 'text-emerald-600' : 'text-muted')}>{words} / {prompt.minWords} so‘z</p>
        {local && (
          <div className="mt-2 rounded-2xl bg-surface2 p-3 text-[13px] font-semibold leading-snug">
            <p className="font-black">Tezkor tahlil: {local.issues.length === 0 ? 'juda toza matn!' : `${local.issues.length} ta kichik xato topildi`}</p>
          </div>
        )}
        {aiFeedback && <p className="mt-2 rounded-2xl bg-emerald-50 px-3 py-2 text-[13px] font-semibold dark:bg-emerald-500/10">{aiFeedback}</p>}
        {aiErr && <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-[12.5px] font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{aiErr}</p>}
        <div className="mt-3 space-y-2">
          <Button size="lg" full icon="check" disabled={!enough || doneXp !== null} onClick={finish}>Yuborish va yakunlash</Button>
          {enough && doneXp === null && aiLeftToday('writing-check') > 0 && (
            <Button variant="secondary" full icon="sparkles" onClick={() => void aiCheck()} disabled={aiBusy}>{aiBusy ? 'AI tekshirmoqda…' : 'AI bilan tekshiritish'}</Button>
          )}
        </div>
      </Card>
    </StageShell>
  );
}

function MistakesChallenge({ stage, onDone, count }: { stage: JourneyStage; onDone: ChallengeDone; count: number }) {
  const [items, setItems] = useState(() => getState().mistakes.filter((m) => !m.corrected).slice(0, Math.max(1, Math.min(8, count))));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const doneRef = useRef(false);

  function answer(i: number) {
    if (picked !== null || !items[idx]) return;
    const it = items[idx];
    const ok = i === it.correctAnswer;
    setPicked(i);
    if (ok) {
      setCorrect((c) => c + 1);
      toggleMistake(it.id);
    }
    haptic(ok ? 'success' : 'error');
    playSfx(ok ? 'correct' : 'wrong');
  }

  function next() {
    setPicked(null);
    if (idx + 1 >= items.length) {
      if (doneRef.current) return;
      doneRef.current = true;
      const total = items.length;
      completeJourneyStage(stage.id, correct, total);
      addJourneyStageXp(stage.id, correct * 3);
      onDone(correct, total, correct * 3);
    } else setIdx(idx + 1);
  }

  if (!items.length) {
    return (
      <StageShell stage={stage} step={1} total={1}>
        <Card className="text-center">
          <div className="flex justify-center"><Mascot mood="wow" size={80} /></div>
          <h3 className="mt-1 text-lg font-extrabold">Xatolar daftari toza!</h3>
          <p className="mt-1 text-[13px] font-semibold text-muted">Tuzatiladigan xato yo‘q — bu bosqich avtomatik bajarildi. Zo‘r ketyapsiz!</p>
          <Button className="mt-3" size="lg" full icon="check" onClick={() => { completeJourneyStage(stage.id, 1, 1); onDone(1, 1, 0); }}>Bosqichni yakunlash</Button>
        </Card>
      </StageShell>
    );
  }
  const it = items[idx];
  const revealed = picked !== null;
  return (
    <StageShell stage={stage} step={idx + 1} total={items.length}>
      <Card>
        <p className="text-sm font-extrabold text-muted">Xatolarni tuzatish · {idx + 1}/{items.length}</p>
        <h3 className="mt-1 text-[16.5px] font-extrabold leading-snug">{it.question}</h3>
        <div className="mt-3 space-y-2">
          {it.options.map((o, i) => (
            <button key={i} type="button" disabled={revealed} onClick={() => answer(i)}
              className={cx(
                'block w-full rounded-2xl border-2 px-4 py-3 text-left text-[14.5px] font-bold transition',
                revealed && i === it.correctAnswer ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15'
                  : revealed && i === picked ? 'border-rose-300 bg-rose-50 dark:bg-rose-500/15' : 'border-line bg-surface hover:border-sky-300',
              )}
            >{o}</button>
          ))}
        </div>
        {revealed && <Button className="mt-3" size="lg" full icon="right" onClick={next}>{idx + 1 >= items.length ? 'Yakunlash' : 'Keyingi'}</Button>}
      </Card>
    </StageShell>
  );
}
