import { useEffect, useMemo, useRef, useState } from 'react';
import type { VocabWord } from '../../types';
import { distractors, levelPool, pickWords, shortUz, type GameResult } from '../../lib/games';
import { shuffle, cx } from '../../lib/utils';
import { playSfx } from '../../lib/sfx';
import { haptic } from '../../lib/telegram';
import { SpeakButton } from '../SpeakButton';
import { Card, ProgressBar } from '../ui';
import { Hud, type GameProps } from './common';

const SECONDS = 60;

export function BlitzGame({ daily, onFinish }: GameProps) {
  const order = useState<VocabWord[]>(() => pickWords(90, { daily }))[0];
  const pool = useMemo(() => levelPool(), []);
  const [qi, setQi] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [wrongN, setWrongN] = useState(0);
  const missed = useRef<Map<string, VocabWord>>(new Map());
  const endAt = useRef(Date.now() + SECONDS * 1000);
  const finished = useRef(false);
  const timers = useRef<number[]>([]);
  const stats = useRef({ right: 0, wrong: 0, score: 0 });

  const word = order[qi % order.length];
  const options = useMemo(() => shuffle([word, ...distractors(word, 3, pool)]), [word, pool]);

  const end = () => {
    if (finished.current) return;
    finished.current = true;
    const { right: r, wrong: w, score: sc } = stats.current;
    const stars = r >= 15 && w <= r / 4 ? 3 : r >= 10 ? 2 : r >= 5 ? 1 : 0;
    onFinish({ game: 'blitz', score: sc, stars: stars as 0 | 1 | 2 | 3, correct: r, total: r + w, missed: [...missed.current.values()], note: `${SECONDS} soniyada ${r} ta to‘g‘ri javob` });
  };

  useEffect(() => {
    const iv = window.setInterval(() => {
      const l = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) {
        window.clearInterval(iv);
        end();
      }
    }, 200);
    return () => {
      window.clearInterval(iv);
      timers.current.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = (o: VocabWord) => {
    if (picked || finished.current) return;
    setPicked(o.id);
    const ok = o.id === word.id;
    if (ok) {
      const gain = 10 + Math.min(combo, 5) * 2;
      stats.current.right++;
      stats.current.score += gain;
      setRight((x) => x + 1);
      setScore((x) => x + gain);
      setCombo((c) => c + 1);
      playSfx('correct');
      haptic('success');
    } else {
      stats.current.wrong++;
      missed.current.set(word.id, word);
      setWrongN((x) => x + 1);
      setCombo(0);
      playSfx('wrong');
      haptic('error');
    }
    timers.current.push(
      window.setTimeout(() => {
        setPicked(null);
        setQi((q) => q + 1);
      }, ok ? 350 : 850),
    );
  };

  return (
    <div>
      <Hud
        items={[
          { label: 'Vaqt', value: `${left}s`, tone: left <= 10 ? 'bad' : 'normal' },
          { label: 'Ball', value: score },
          { label: 'Combo', value: combo >= 2 ? `🔥 ×${combo}` : '—', tone: combo >= 3 ? 'good' : 'normal' },
        ]}
      />
      <ProgressBar value={(left / SECONDS) * 100} className="mb-3" color={left <= 10 ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-500 to-indigo-500'} label="Qolgan vaqt" />
      <Card className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">Tarjimasini toping</div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <h3 className="text-3xl font-extrabold">{word.en}</h3>
          <SpeakButton text={word.en} />
        </div>
        <div className="text-sm text-muted">{word.ipa}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
                  'rounded-2xl border-2 px-3 py-3.5 text-base font-bold transition active:scale-[0.98]',
                  picked && isRight
                    ? 'correct-pop border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                    : isPicked
                      ? 'shake-x border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200'
                      : 'border-line bg-surface hover:border-indigo-300',
                )}
              >
                {shortUz(o)}
              </button>
            );
          })}
        </div>
      </Card>
      <p className="mt-3 text-center text-xs text-muted">To‘g‘ri: {right} · Xato: {wrongN}</p>
    </div>
  );
}
