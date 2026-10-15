import { useMemo, useState, type ReactNode } from 'react';
import type { Level, Quiz, VocabStatus, VocabWord } from '../types';
import { LEVELS } from '../types';
import { VOCAB } from '../data/vocab';
import { useApp } from '../store/store';
import { markForReview, markLearned, recordMatching, reviewWord, updateSettings } from '../store/actions';
import { buildQueue, isDue } from '../lib/srs';
import { prettyDate, today } from '../lib/dates';
import { Button, Card, Chip, Empty, LevelBadge, PageHeader, Pill, ProgressBar, Tabs } from '../components/ui';
import { Icon } from '../components/Icon';
import { SpeakButton } from '../components/SpeakButton';
import { QuizRunner } from '../components/QuizRunner';
import { cx, sample, shuffle } from '../lib/utils';
import { haptic } from '../lib/telegram';

type Tab = 'cards' | 'list' | 'quiz' | 'match' | 'review';
type Deck = 'today' | 'all' | 'review';

const WORD = new Map(VOCAB.map((w) => [w.id, w]));
const TOPICS = Array.from(new Set(VOCAB.map((w) => w.topic))).sort((a, b) => a.localeCompare(b));
const STATUS_LABEL: Record<VocabStatus, string> = { new: 'Yangi', learning: 'O‘rganilmoqda', learned: 'O‘rganildi', review: 'Takrorlash' };
const STATUS_TONE: Record<VocabStatus, 'neutral' | 'indigo' | 'green' | 'amber'> = { new: 'neutral', learning: 'indigo', learned: 'green', review: 'amber' };

function buildVocabQuiz(pool: VocabWord[], n = 10): Quiz[] {
  const picks = sample(pool, Math.min(n, pool.length));
  return picks.map((w, i) => {
    const toUz = i % 2 === 0;
    const near = VOCAB.filter((x) => x.id !== w.id && x.level === w.level && x.uz !== w.uz && x.en !== w.en);
    const rest = VOCAB.filter((x) => x.id !== w.id && x.uz !== w.uz && x.en !== w.en);
    const distract = (near.length >= 3 ? sample(near, 3) : [...near, ...sample(rest, 3 - near.length)]).slice(0, 3);
    const opts = shuffle([w, ...distract]);
    return {
      id: `vq-${w.id}`,
      q: toUz ? `“${w.en}” so‘zining ma’nosi qaysi?` : `Qaysi inglizcha so‘z “${w.uz}” degani?`,
      options: opts.map((x) => (toUz ? x.uz : x.en)),
      answer: opts.indexOf(w),
      explain: `${w.en} = ${w.uz}. Misol: ${w.exEn}`,
    };
  });
}

export function Vocab() {
  const s = useApp();
  const p = s.profile!;
  const goal = s.settings.dailyWordGoal;
  const wordsToday = s.activity[today()]?.words ?? 0;
  const [tab, setTab] = useState<Tab>('cards');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [topic, setTopic] = useState<string>('all');
  const [deck, setDeck] = useState<Deck>('today');

  const filtered = useMemo(
    () => VOCAB.filter((w) => (level === 'all' || w.level === level) && (topic === 'all' || w.topic === topic)),
    [level, topic],
  );

  const reviewList = useMemo(
    () => VOCAB.filter((w) => s.vocab[w.id]?.status === 'review' || isDue(s.vocab[w.id])),
    [s.vocab],
  );

  function makeQueue(d: Deck): string[] {
    if (d === 'today') return buildQueue(VOCAB, s.vocab, p.estimatedLevel, goal).map((w) => w.id);
    if (d === 'review') return reviewList.map((w) => w.id);
    return filtered.map((w) => w.id);
  }

  const [queue, setQueue] = useState<string[]>(() => makeQueue('today'));
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(s.settings.showTranslation);

  function startDeck(d: Deck) {
    setDeck(d);
    setQueue(makeQueue(d));
    setPos(0);
    setRevealed(s.settings.showTranslation);
    setTab('cards');
  }

  const stats = useMemo(() => {
    const vals = Object.values(s.vocab);
    return {
      learned: vals.filter((v) => v.status === 'learned').length,
      learning: vals.filter((v) => v.status === 'learning').length,
      review: reviewList.length,
    };
  }, [s.vocab, reviewList]);

  return (
    <div>
      <PageHeader emoji="🃏" title="So‘zlar" subtitle={`${VOCAB.length} ta so‘z · ${stats.learned} ta o‘rganildi · ${stats.review} ta takrorlash kerak`} />

      <Card className="!p-3.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Bugungi maqsad</span>
          <span className="font-bold">{Math.min(wordsToday, goal)}/{goal} so‘z</span>
        </div>
        <ProgressBar value={(wordsToday / goal) * 100} className="mt-2" label="Kunlik so‘z maqsadi" />
        <div className="mt-2.5 flex items-center gap-2 text-xs text-muted">
          Maqsad:
          {[5, 10, 15, 20].map((g) => (
            <Chip key={g} active={goal === g} onClick={() => updateSettings({ dailyWordGoal: g })}>{g}</Chip>
          ))}
        </div>
      </Card>

      <div className="mt-4">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'cards', label: 'Kartochka' },
            { id: 'list', label: 'Ro‘yxat' },
            { id: 'quiz', label: 'Test' },
            { id: 'match', label: 'Juftlash' },
            { id: 'review', label: `Takrorlash${stats.review ? ` (${stats.review})` : ''}` },
          ]}
        />
      </div>

      <div className="mt-4">
        {tab === 'cards' && (
          <Cards
            deck={deck}
            queue={queue}
            pos={pos}
            revealed={revealed}
            setRevealed={setRevealed}
            next={() => {
              setPos((x) => x + 1);
              setRevealed(s.settings.showTranslation);
            }}
            startDeck={startDeck}
            filtersNode={
              <Filters level={level} setLevel={setLevel} topic={topic} setTopic={setTopic} onChange={() => deck === 'all' && setTimeout(() => startDeck('all'), 0)} />
            }
            reviewCount={reviewList.length}
          />
        )}
        {tab === 'list' && <WordList words={filtered} level={level} setLevel={setLevel} topic={topic} setTopic={setTopic} />}
        {tab === 'quiz' && <VocabQuiz pool={filtered} />}
        {tab === 'match' && <Matching pool={filtered} />}
        {tab === 'review' && (
          <div>
            {reviewList.length === 0 ? (
              <Empty emoji="✨" title="Takrorlash ro‘yxati bo‘sh" text="Kartochkalarda “Bilmayman” yoki “Takrorlashga” tugmasini bossangiz, so‘z shu yerga tushadi." />
            ) : (
              <>
                <Button full icon="refresh" onClick={() => startDeck('review')}>Takrorlashni boshlash ({reviewList.length})</Button>
                <ul className="mt-3 space-y-2">
                  {reviewList.map((w) => (
                    <WordRow key={w.id} w={w} />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Filters({ level, setLevel, topic, setTopic, onChange }: { level: Level | 'all'; setLevel: (l: Level | 'all') => void; topic: string; setTopic: (t: string) => void; onChange?: () => void }) {
  return (
    <div className="space-y-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Daraja filtri">
        <Chip active={level === 'all'} onClick={() => { setLevel('all'); onChange?.(); }}>Barcha daraja</Chip>
        {LEVELS.filter((l) => VOCAB.some((w) => w.level === l)).map((l) => (
          <Chip key={l} active={level === l} onClick={() => { setLevel(l); onChange?.(); }}>{l}</Chip>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">Mavzu</span>
        <select
          value={topic}
          onChange={(e) => { setTopic(e.target.value); onChange?.(); }}
          className="w-full rounded-2xl border border-line bg-surface px-3 py-2.5 text-sm"
        >
          <option value="all">Barcha mavzular</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------- Flashcards
function Cards({
  deck, queue, pos, revealed, setRevealed, next, startDeck, filtersNode, reviewCount,
}: {
  deck: Deck; queue: string[]; pos: number; revealed: boolean; setRevealed: (v: boolean) => void; next: () => void;
  startDeck: (d: Deck) => void; filtersNode: ReactNode; reviewCount: number;
}) {
  const s = useApp();
  const w = WORD.get(queue[pos]);
  const decks: { id: Deck; label: string }[] = [
    { id: 'today', label: 'Bugungi navbat' },
    { id: 'all', label: 'Tanlangan so‘zlar' },
    { id: 'review', label: `Takrorlash (${reviewCount})` },
  ];

  const header = (
    <div className="mb-3 space-y-3">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {decks.map((d) => <Chip key={d.id} active={deck === d.id} onClick={() => startDeck(d.id)}>{d.label}</Chip>)}
      </div>
      {deck === 'all' && filtersNode}
    </div>
  );

  if (!w) {
    return (
      <div>
        {header}
        <Card className="text-center">
          <div className="text-5xl">{queue.length ? '🎉' : '🌤️'}</div>
          <p className="mt-2 text-lg font-bold">{queue.length ? 'Navbat tugadi — barakalla!' : 'Bu yerda hozircha so‘z yo‘q'}</p>
          <p className="mt-1 text-sm text-muted">
            {queue.length ? 'Endi test yoki juftlash o‘yini bilan bilimingizni sinab ko‘ring.' : deck === 'review' ? 'Takrorlash kerak bo‘lgan so‘z yo‘q.' : 'Boshqa navbat yoki filtrni tanlang.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {queue.length > 0 && <Button variant="secondary" icon="refresh" onClick={() => startDeck(deck)}>Qayta boshlash</Button>}
            <Button onClick={() => startDeck('all')}>Barcha so‘zlar</Button>
          </div>
        </Card>
      </div>
    );
  }

  const prog = s.vocab[w.id];
  const act = (fn: () => void) => {
    fn();
    next();
  };

  return (
    <div>
      {header}
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>{pos + 1} / {queue.length}</span>
        {prog && <Pill tone={STATUS_TONE[prog.status]}>{STATUS_LABEL[prog.status]}</Pill>}
      </div>
      <Card key={w.id} className="pop-in min-h-[17rem] text-center">
        <div className="flex items-center justify-between">
          <LevelBadge level={w.level} />
          <span className="text-xs text-muted">{w.topic}</span>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <h2 className="text-4xl font-extrabold tracking-tight">{w.en}</h2>
          <SpeakButton text={w.en} />
        </div>
        <p className="mt-1 text-sm text-muted">{w.ipa}</p>

        {revealed ? (
          <div className="slide-up mt-5">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{w.uz}</p>
            <div className="mt-3 rounded-2xl bg-surface2 p-3 text-left text-sm">
              <div className="flex items-start gap-2">
                <p className="flex-1 font-medium">{w.exEn}</p>
                <SpeakButton text={w.exEn} className="!h-8 !w-8" />
              </div>
              <p className="mt-1 text-muted">{w.exUz}</p>
            </div>
            <button type="button" className="mt-3 text-xs font-semibold text-muted underline" onClick={() => setRevealed(false)}>Tarjimani yashirish</button>
          </div>
        ) : (
          <div className="mt-8">
            <Button variant="secondary" icon="eye" onClick={() => setRevealed(true)}>Tarjimani ko‘rsatish</Button>
          </div>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" className="!border-rose-300 !text-rose-600 dark:!text-rose-300" onClick={() => { haptic('warning'); act(() => reviewWord(w.id, false)); }}>
          <Icon name="x" className="h-5 w-5" /> Bilmayman
        </Button>
        <Button variant="success" onClick={() => { haptic('success'); act(() => reviewWord(w.id, true)); }}>
          <Icon name="check" className="h-5 w-5" /> Bilaman
        </Button>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <Button variant="ghost" size="sm" onClick={() => act(() => markForReview(w.id))}>🔖 Takrorlashga</Button>
        <Button variant="ghost" size="sm" onClick={() => act(() => markLearned(w.id))}>✅ O‘rganildi</Button>
      </div>
      <p className="mt-3 text-center text-xs text-muted">“Bilaman” — so‘z keyinroq (1, 2, 4, 8, 16 kundan so‘ng) qayta so‘raladi. “Bilmayman” — ertaga.</p>
    </div>
  );
}

// ---------------------------------------------------------------- List
function WordRow({ w }: { w: VocabWord }) {
  const s = useApp();
  const [open, setOpen] = useState(false);
  const pr = s.vocab[w.id];
  const status: VocabStatus = pr?.status ?? 'new';
  return (
    <li className="rounded-2xl border border-line bg-surface">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{w.en}</span>
            <span className="text-xs text-muted">{w.ipa}</span>
          </div>
          <div className="truncate text-sm text-muted">{w.uz}</div>
        </div>
        <LevelBadge level={w.level} />
        <Pill tone={STATUS_TONE[status]} className="hidden sm:inline-flex">{STATUS_LABEL[status]}</Pill>
      </button>
      {open && (
        <div className="slide-up border-t border-line px-3.5 py-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium">{w.exEn}</p>
              <p className="text-muted">{w.exUz}</p>
              <p className="mt-1 text-xs text-muted">Mavzu: {w.topic}{pr?.due && pr.reviews > 0 ? ` · keyingi takrorlash: ${prettyDate(pr.due)}` : ''}</p>
            </div>
            <SpeakButton text={w.en} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => markForReview(w.id)}>🔖 Takrorlashga</Button>
            <Button size="sm" variant="secondary" onClick={() => markLearned(w.id)}>✅ O‘rganildi</Button>
          </div>
        </div>
      )}
    </li>
  );
}

function WordList({ words, level, setLevel, topic, setTopic }: { words: VocabWord[]; level: Level | 'all'; setLevel: (l: Level | 'all') => void; topic: string; setTopic: (t: string) => void }) {
  const s = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<VocabStatus | 'all'>('all');
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return words.filter((w) => {
      const st: VocabStatus = s.vocab[w.id]?.status ?? 'new';
      if (status !== 'all' && st !== status) return false;
      return !t || w.en.toLowerCase().includes(t) || w.uz.toLowerCase().includes(t);
    });
  }, [words, q, status, s.vocab]);

  return (
    <div>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="So‘z qidirish (English yoki o‘zbekcha)"
          aria-label="So‘z qidirish"
          className="w-full rounded-2xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
        />
      </div>
      <div className="mt-3"><Filters level={level} setLevel={setLevel} topic={topic} setTopic={setTopic} /></div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
        {(['all', 'new', 'learning', 'review', 'learned'] as const).map((st) => (
          <Chip key={st} active={status === st} onClick={() => setStatus(st)}>{st === 'all' ? 'Barcha holat' : STATUS_LABEL[st]}</Chip>
        ))}
      </div>
      <p className="my-2 text-xs text-muted">{shown.length} ta so‘z</p>
      {shown.length === 0 ? <Empty emoji="🔍" title="Hech narsa topilmadi" text="Qidiruv yoki filtrni o‘zgartiring." /> : <ul className="space-y-2">{shown.map((w) => <WordRow key={w.id} w={w} />)}</ul>}
    </div>
  );
}

// ---------------------------------------------------------------- Quiz
function VocabQuiz({ pool }: { pool: VocabWord[] }) {
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const questions = useMemo(() => buildVocabQuiz(pool.length >= 4 ? pool : VOCAB), [pool, round]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!started) {
    return (
      <Card className="text-center">
        <div className="text-5xl">📝</div>
        <p className="mt-2 text-lg font-bold">So‘zlar testi</p>
        <p className="mt-1 text-sm text-muted">{questions.length} ta savol · tanlangan daraja va mavzu bo‘yicha. Javoblaringiz takrorlash jadvaliga ta’sir qiladi.</p>
        <Button className="mt-4" onClick={() => setStarted(true)}>Testni boshlash</Button>
      </Card>
    );
  }
  return (
    <QuizRunner
      key={round}
      title="So‘zlar testi"
      kind="vocab-quiz"
      questions={questions}
      onAnswer={(q, ok) => reviewWord(q.id.replace('vq-', ''), ok, { silent: true })}
      onExit={() => {
        setRound((r) => r + 1);
        setStarted(false);
      }}
      exitLabel="Yana test"
    />
  );
}

// ---------------------------------------------------------------- Matching game
function Matching({ pool }: { pool: VocabWord[] }) {
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => sample(pool.length >= 6 ? pool : VOCAB, 6), [pool, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<[string, string] | null>(null);
  const [errors, setErrors] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [xp, setXp] = useState<number | null>(null);

  function reset() {
    setRound((r) => r + 1);
    setSelL(null); setSelR(null); setDone([]); setWrong(null); setErrors(0); setMissed([]); setXp(null);
  }

  function pick(side: 'l' | 'r', id: string) {
    if (wrong || done.includes(id)) return;
    const l = side === 'l' ? id : selL;
    const r = side === 'r' ? id : selR;
    if (side === 'l') setSelL(id); else setSelR(id);
    if (l && r) {
      if (l === r) {
        haptic('success');
        const nd = [...done, l];
        setDone(nd);
        setSelL(null); setSelR(null);
        if (!missed.includes(l)) reviewWord(l, true, { silent: true });
        if (nd.length === pairs.length) setXp(recordMatching(errors, 'Juftlash o‘yini', pairs.length));
      } else {
        haptic('error');
        setErrors((e) => e + 1);
        setMissed((m) => Array.from(new Set([...m, l, r])));
        setWrong([l, r]);
        setTimeout(() => { setWrong(null); setSelL(null); setSelR(null); }, 600);
      }
    }
  }

  const cell = (id: string, text: string, side: 'l' | 'r') => {
    const isDone = done.includes(id);
    const isSel = (side === 'l' ? selL : selR) === id;
    const isWrong = wrong && (side === 'l' ? wrong[0] : wrong[1]) === id;
    return (
      <button
        key={`${side}-${id}`}
        type="button"
        disabled={isDone}
        onClick={() => pick(side, id)}
        aria-pressed={isSel}
        className={cx(
          'min-h-[3.25rem] w-full rounded-2xl border-2 px-2 py-2 text-sm font-semibold transition',
          isDone && 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-70 dark:bg-emerald-500/15 dark:text-emerald-100',
          !isDone && isSel && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15',
          !isDone && !isSel && !isWrong && 'border-line bg-surface hover:border-indigo-300',
          isWrong && 'border-rose-500 bg-rose-50 dark:bg-rose-500/15',
        )}
      >
        {text}
      </button>
    );
  };

  return (
    <div>
      <p className="mb-3 text-sm text-muted">Inglizcha so‘zni o‘zbekcha ma’nosi bilan juftlang. Xatolar: <b>{errors}</b> · Juftlangan: <b>{done.length}/{pairs.length}</b></p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">{left.map((w) => cell(w.id, w.en, 'l'))}</div>
        <div className="space-y-2.5">{right.map((w) => cell(w.id, w.uz, 'r'))}</div>
      </div>
      {xp !== null && (
        <Card className="pop-in mt-4 text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-1 font-bold">Hammasi juftlandi! {errors === 0 ? 'Xatosiz!' : `${errors} ta xato bilan.`}</p>
          <p className="text-sm text-muted">+{xp} XP</p>
          <Button className="mt-3" icon="refresh" onClick={reset}>Yana o‘ynash</Button>
        </Card>
      )}
    </div>
  );
}
