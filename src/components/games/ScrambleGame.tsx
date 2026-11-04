import { useEffect, useRef, useState } from 'react';
import type { VocabWord } from '../../types';
import { pickWords, type GameResult } from '../../lib/games';
import { shuffle, cx } from '../../lib/utils';
import { speak } from '../../lib/tts';
import { playSfx } from '../../lib/sfx';
import { haptic } from '../../lib/telegram';
import { SpeakButton } from '../SpeakButton';
import { Button, Card, ProgressBar } from '../ui';
import { Hud, type GameProps } from './common';

const ROUNDS = 8;

interface LetterTile {
  id: number;
  ch: string;
}

function scramble(word: string): LetterTile[] {
  const base = word.split('').map((ch, id) => ({ id, ch }));
  if (new Set(word).size === 1) return base;
  let out = shuffle(base);
  for (let n = 0; n < 12 && out.map((t) => t.ch).join('') === word; n++) out = shuffle(base);
  return out;
}

export function ScrambleGame({ daily, onFinish }: GameProps) {
  const [words] = useState<VocabWord[]>(() => pickWords(ROUNDS, { daily, single: true, minLen: 3, maxLen: 8 }));
  const [idx, setIdx] = useState(0);
  const word = words[idx];
  const target = word.en.toLowerCase();
  const [tiles, setTiles] = useState<LetterTile[]>(() => scramble(words[0].en.toLowerCase()));
  const [placed, setPlaced] = useState<number[]>([]);
  const [state, setState] = useState<'play' | 'ok' | 'bad' | 'skip'>('play');
  const issues = useRef(0);
  const points = useRef<number[]>([]);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const next = () => {
    if (idx + 1 >= words.length) {
      if (finished.current) return;
      finished.current = true;
      const pts = points.current;
      const total = pts.reduce((a, b) => a + b, 0);
      const ratio = total / (words.length * 3);
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.25 ? 1 : 0;
      onFinish({
        game: 'scramble',
        score: total * 30,
        stars: stars as 0 | 1 | 2 | 3,
        correct: pts.filter((p) => p > 0).length,
        total: words.length,
        missed: words.filter((_, i) => (pts[i] ?? 0) < 3),
      });
      return;
    }
    const n = idx + 1;
    setIdx(n);
    setTiles(scramble(words[n].en.toLowerCase()));
    setPlaced([]);
    setState('play');
    issues.current = 0;
  };

  const settle = (p: number) => {
    points.current[idx] = p;
    later(next, p > 0 ? 900 : 1500);
  };

  const check = (ids: number[]) => {
    const guess = ids.map((id) => tiles.find((t) => t.id === id)!.ch).join('');
    if (guess === target) {
      setState('ok');
      playSfx('correct');
      haptic('success');
      speak(word.en);
      settle(issues.current === 0 ? 3 : issues.current === 1 ? 2 : 1);
    } else {
      issues.current++;
      setState('bad');
      playSfx('wrong');
      haptic('error');
      later(() => {
        setPlaced([]);
        setState('play');
      }, 650);
    }
  };

  const tap = (id: number) => {
    if (state !== 'play' || placed.includes(id)) return;
    playSfx('pop');
    const ids = [...placed, id];
    setPlaced(ids);
    if (ids.length === target.length) check(ids);
  };

  const untap = (id: number) => {
    if (state !== 'play') return;
    setPlaced((p) => p.filter((x) => x !== id));
  };

  const hint = () => {
    if (state !== 'play') return;
    let k = 0;
    while (k < placed.length && tiles.find((t) => t.id === placed[k])!.ch === target[k]) k++;
    const keep = placed.slice(0, k);
    const tile = tiles.find((t) => !keep.includes(t.id) && t.ch === target[k]);
    if (!tile) return;
    issues.current++;
    const ids = [...keep, tile.id];
    setPlaced(ids);
    if (ids.length === target.length) check(ids);
  };

  const skip = () => {
    if (state !== 'play') return;
    setState('skip');
    settle(0);
  };

  const slots = target.split('');
  const placedChars = placed.map((id) => tiles.find((t) => t.id === id)!.ch);
  const shown = state === 'skip' ? slots : placedChars;

  return (
    <div>
      <Hud items={[{ label: 'So‘z', value: `${idx + 1}/${words.length}` }, { label: 'To‘g‘ri', value: points.current.filter((p) => p > 0).length, tone: 'good' }]} />
      <ProgressBar value={(idx / words.length) * 100} className="mb-3" label="Jarayon" />
      <Card className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">Inglizchasini tuzing</div>
        <div className="mt-1 flex items-center justify-center gap-2">
          <h3 className="text-2xl font-extrabold">{word.uz}</h3>
          <SpeakButton text={word.en} />
        </div>

        <div className={cx('mt-5 flex flex-wrap justify-center gap-1.5', state === 'bad' && 'shake-x')} aria-live="polite">
          {slots.map((_, i) => {
            const ch = shown[i];
            const id = placed[i];
            return (
              <button
                key={i}
                type="button"
                disabled={!ch || state !== 'play'}
                onClick={() => id !== undefined && untap(id)}
                aria-label={ch ? `${i + 1}-harf: ${ch}` : `${i + 1}-bo‘sh joy`}
                className={cx(
                  'flex h-12 w-10 items-center justify-center rounded-xl border-2 text-xl font-extrabold uppercase sm:h-14 sm:w-12',
                  state === 'ok' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                    : state === 'bad' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200'
                    : state === 'skip' ? 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100'
                    : ch ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100'
                    : 'border-dashed border-line bg-surface2',
                )}
              >
                {ch ?? ''}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {tiles.map((t) => {
            const used = placed.includes(t.id) || state === 'skip';
            return (
              <button
                key={t.id}
                type="button"
                disabled={used || state !== 'play'}
                onClick={() => tap(t.id)}
                className={cx(
                  'flex h-12 w-11 items-center justify-center rounded-xl text-xl font-extrabold uppercase shadow-sm transition active:scale-90 sm:h-14 sm:w-12',
                  used ? 'bg-surface2 text-transparent shadow-none' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
                )}
              >
                {t.ch}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={hint} disabled={state !== 'play'}>💡 Ko‘rsatma</Button>
          <Button size="sm" variant="ghost" onClick={skip} disabled={state !== 'play'}>O‘tkazib yuborish</Button>
        </div>
      </Card>
    </div>
  );
}
