import { useEffect, useMemo, useRef, useState } from 'react';
import type { VocabWord } from '../../types';
import { distractors, levelPool, pickWords } from '../../lib/games';
import { shuffle, cx } from '../../lib/utils';
import { speak, stopSpeaking, RATE_SLOW } from '../../lib/tts';
import { playSfx } from '../../lib/sfx';
import { haptic } from '../../lib/telegram';
import { Card, ProgressBar } from '../ui';
import { Icon } from '../Icon';
import { Hud, type GameProps } from './common';

const ROUNDS = 10;

export function ListenGame({ daily, onFinish }: GameProps) {
  const [words] = useState<VocabWord[]>(() => pickWords(ROUNDS, { daily, single: true }));
  const pool = useMemo(() => levelPool(), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const missed = useRef<VocabWord[]>([]);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  const word = words[idx];
  const options = useMemo(() => shuffle([word, ...distractors(word, 3, pool.filter((w) => /^[a-z]+$/i.test(w.en)))]), [word, pool]);

  useEffect(() => {
    const t = window.setTimeout(() => speak(word.en), 350);
    return () => window.clearTimeout(t);
  }, [word]);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      stopSpeaking();
    },
    [],
  );

  const answer = (o: VocabWord) => {
    if (picked) return;
    setPicked(o.id);
    const ok = o.id === word.id;
    let r = right;
    if (ok) {
      r++;
      setRight(r);
      playSfx('correct');
      haptic('success');
    } else {
      missed.current.push(word);
      playSfx('wrong');
      haptic('error');
    }
    timers.current.push(
      window.setTimeout(() => {
        if (idx + 1 >= words.length) {
          if (finished.current) return;
          finished.current = true;
          const stars = r >= 9 ? 3 : r >= 7 ? 2 : r >= 4 ? 1 : 0;
          onFinish({ game: 'listen', score: r * 10, stars: stars as 0 | 1 | 2 | 3, correct: r, total: words.length, missed: missed.current });
          return;
        }
        setPicked(null);
        setIdx(idx + 1);
      }, ok ? 800 : 1500),
    );
  };

  return (
    <div>
      <Hud items={[{ label: 'Savol', value: `${idx + 1}/${words.length}` }, { label: 'To‘g‘ri', value: right, tone: 'good' }]} />
      <ProgressBar value={(idx / words.length) * 100} className="mb-3" label="Jarayon" />
      <Card className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">Eshiting va to‘g‘ri so‘zni tanlang</div>
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => speak(word.en)}
            aria-label="So‘zni eshitish"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 transition active:scale-95"
          >
            <Icon name="volume" className="h-9 w-9" />
          </button>
          <button
            type="button"
            onClick={() => speak(word.en, { rate: RATE_SLOW })}
            aria-label="Sekin eshitish"
            className="self-center rounded-2xl bg-surface2 px-3 py-2 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
          >
            🐢 Sekin
          </button>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {options.map((o) => {
            const isRight = o.id === word.id;
            const isPicked = picked === o.id;
            return (
              <button
                key={o.id}
                type="button"
                disabled={!!picked}
                onClick={() => answer(o)}
                className={cx(
                  'rounded-2xl border-2 px-3 py-3.5 text-lg font-bold transition active:scale-[0.98]',
                  picked && isRight
                    ? 'correct-pop border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                    : isPicked
                      ? 'shake-x border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200'
                      : 'border-line bg-surface hover:border-indigo-300',
                )}
              >
                {o.en}
              </button>
            );
          })}
        </div>
        {picked && <p className="mt-3 text-sm text-muted">{word.en} — {word.uz}</p>}
      </Card>
    </div>
  );
}
