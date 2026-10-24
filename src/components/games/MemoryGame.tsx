import { useEffect, useRef, useState } from 'react';
import type { VocabWord } from '../../types';
import { pickWords, shortUz, type GameResult } from '../../lib/games';
import { shuffle, cx } from '../../lib/utils';
import { speak } from '../../lib/tts';
import { playSfx } from '../../lib/sfx';
import { haptic } from '../../lib/telegram';
import { Button, Card } from '../ui';
import { Hud, type GameProps } from './common';

interface Tile {
  key: string;
  wid: string;
  side: 'en' | 'uz';
  text: string;
}

const SIZES = [
  { pairs: 6, label: 'Oson', hint: '6 juft' },
  { pairs: 8, label: 'O‘rta', hint: '8 juft' },
  { pairs: 10, label: 'Qiyin', hint: '10 juft' },
];

export function MemoryGame({ daily, onFinish }: GameProps) {
  const [pairs, setPairs] = useState<number | null>(daily ? 8 : null);
  if (!pairs) {
    return (
      <Card>
        <h3 className="text-lg font-extrabold">Qiyinlik darajasini tanlang</h3>
        <div className="mt-3 grid gap-2">
          {SIZES.map((s) => (
            <Button key={s.pairs} size="lg" variant="secondary" onClick={() => setPairs(s.pairs)}>
              {s.label} <span className="ml-2 text-xs font-normal text-muted">{s.hint}</span>
            </Button>
          ))}
        </div>
      </Card>
    );
  }
  return <Board pairs={pairs} daily={daily} onFinish={onFinish} />;
}

function Board({ pairs, daily, onFinish }: { pairs: number; daily: boolean; onFinish: GameProps['onFinish'] }) {
  const [words] = useState<VocabWord[]>(() => pickWords(pairs, { daily }));
  const [tiles] = useState<Tile[]>(() =>
    shuffle(words.flatMap((w) => [
      { key: `${w.id}-en`, wid: w.id, side: 'en' as const, text: w.en },
      { key: `${w.id}-uz`, wid: w.id, side: 'uz' as const, text: shortUz(w) },
    ])),
  );
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [bad, setBad] = useState<number[]>([]);
  const wrong = useRef<Record<string, number>>({});
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const finish = (m: number) => {
    if (finished.current) return;
    finished.current = true;
    const stars = m <= Math.ceil(pairs * 1.5) ? 3 : m <= Math.ceil(pairs * 2.3) ? 2 : 1;
    const score = Math.max(0, pairs * 100 - Math.max(0, m - pairs) * 15);
    const missed = words.filter((w) => (wrong.current[w.id] ?? 0) >= 2);
    const res: GameResult = { game: 'memory', score, stars: stars as 1 | 2 | 3, correct: pairs, total: pairs, missed, note: `${m} ta harakat bilan topdingiz` };
    later(() => onFinish(res), 700);
  };

  const flip = (i: number) => {
    if (locked || open.includes(i) || done.has(tiles[i].wid)) return;
    const t = tiles[i];
    if (t.side === 'en') speak(t.text);
    else playSfx('pop');
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    const m = moves + 1;
    setMoves(m);
    const [a, b] = next.map((k) => tiles[k]);
    if (a.wid === b.wid) {
      playSfx('correct');
      haptic('success');
      const nd = new Set(done).add(a.wid);
      setDone(nd);
      setOpen([]);
      if (nd.size === pairs) finish(m);
    } else {
      playSfx('wrong');
      haptic('error');
      wrong.current[a.wid] = (wrong.current[a.wid] ?? 0) + 1;
      wrong.current[b.wid] = (wrong.current[b.wid] ?? 0) + 1;
      setLocked(true);
      setBad(next);
      later(() => {
        setOpen([]);
        setBad([]);
        setLocked(false);
      }, 900);
    }
  };

  const cols = pairs <= 6 ? 'grid-cols-3' : 'grid-cols-4';
  return (
    <div>
      <Hud items={[{ label: 'Harakat', value: moves }, { label: 'Topildi', value: `${done.size}/${pairs}`, tone: 'good' }]} />
      <div className={cx('grid gap-2', cols)}>
        {tiles.map((t, i) => {
          const faceUp = open.includes(i) || done.has(t.wid);
          const matched = done.has(t.wid);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => flip(i)}
              aria-label={faceUp ? t.text : 'Yopiq karta'}
              className={cx(
                'flex min-h-[4.5rem] items-center justify-center rounded-2xl border-2 p-1.5 text-center text-sm font-bold leading-tight transition duration-200 sm:min-h-[5.5rem] sm:text-base',
                matched
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-200'
                  : bad.includes(i)
                    ? 'shake-x border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200'
                    : faceUp
                      ? t.side === 'en'
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-100'
                        : 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100'
                      : 'border-transparent bg-gradient-to-br from-fuchsia-500 to-pink-500 text-2xl text-white shadow-sm active:scale-95',
              )}
            >
              {faceUp ? <span className="break-words">{t.text}</span> : '❓'}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted">Ko‘k karta — inglizcha, sariq karta — o‘zbekcha</p>
    </div>
  );
}
