import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { VocabWord } from '../../types';
import { distractors, levelPool, pickWords, shortUz } from '../../lib/games';
import { shuffle, cx } from '../../lib/utils';
import { speak } from '../../lib/tts';
import { playSfx } from '../../lib/sfx';
import { haptic } from '../../lib/telegram';
import { Mascot } from '../Mascot';
import { Button } from '../ui';
import { Hud, type GameProps } from './common';

const ROUNDS = 15;
const GATE_H = 15; // % of the field height
const HIT_Y = 66; // gate top (%) at which the lane is checked
const PLAYER_TOP = 78;

interface Row {
  id: number;
  y: number;
  words: VocabWord[]; // 3 words, one per lane
  correct: number; // lane index
  result?: 'ok' | 'bad';
  picked?: number;
}

export function RunnerGame({ daily, onFinish }: GameProps) {
  const targets = useState<VocabWord[]>(() => pickWords(ROUNDS, { daily }))[0];
  const pool = useMemo(() => levelPool(), []);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [started, setStarted] = useState(false);

  const g = useRef({
    lane: 1,
    lives: 3,
    score: 0,
    combo: 0,
    round: 0,
    right: 0,
    rows: [] as Row[],
    nextId: 1,
    over: false,
    last: 0,
  });
  const missed = useRef<Map<string, VocabWord>>(new Map());
  const raf = useRef(0);
  const doneCalled = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const spawn = useCallback(() => {
    const s = g.current;
    const w = targets[s.round];
    if (!w) return;
    const opts = shuffle([w, ...distractors(w, 2, pool)]);
    s.rows.push({ id: s.nextId++, y: -GATE_H, words: opts, correct: opts.findIndex((o) => o.id === w.id) });
  }, [targets, pool]);

  const finish = useCallback(() => {
    if (doneCalled.current) return;
    doneCalled.current = true;
    const s = g.current;
    s.over = true;
    cancelAnimationFrame(raf.current);
    const stars = s.right >= 12 ? 3 : s.right >= 8 ? 2 : s.right >= 4 ? 1 : 0;
    window.setTimeout(
      () =>
        onFinishRef.current({
          game: 'runner',
          score: s.score,
          stars: stars as 0 | 1 | 2 | 3,
          correct: s.right,
          total: Math.min(ROUNDS, s.round),
          missed: [...missed.current.values()],
          note: s.lives <= 0 ? 'Jonlar tugadi' : 'Barcha darvozalardan o‘tdingiz!',
        }),
      800,
    );
  }, []);

  const move = useCallback((d: number) => {
    const s = g.current;
    s.lane = Math.max(0, Math.min(2, s.lane + d));
    playSfx('pop');
    force();
  }, []);
  const setLane = (i: number) => {
    g.current.lane = i;
    force();
  };

  useEffect(() => {
    if (!started) return;
    const s = g.current;
    spawn();
    const tick = (t: number) => {
      if (s.over) return;
      const dt = s.last ? Math.min(0.05, (t - s.last) / 1000) : 0;
      s.last = t;
      const speed = Math.min(52, 24 + s.round * 2);
      for (const r of s.rows) r.y += speed * dt;
      // resolve the current (front-most unresolved) row
      const cur = s.rows.find((r) => !r.result);
      if (cur && cur.y >= HIT_Y) {
        cur.picked = s.lane;
        const w = cur.words[cur.correct];
        if (s.lane === cur.correct) {
          cur.result = 'ok';
          s.right++;
          s.combo++;
          s.score += 10 + Math.min(s.combo - 1, 5) * 2;
          playSfx('correct');
          haptic('success');
          speak(w.en);
        } else {
          cur.result = 'bad';
          s.combo = 0;
          s.lives--;
          missed.current.set(w.id, w);
          playSfx('wrong');
          haptic('error');
        }
        s.round++;
        if (s.lives <= 0 || s.round >= ROUNDS) {
          finish();
        } else {
          spawn();
        }
      }
      s.rows = s.rows.filter((r) => r.y < 108);
      force();
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const onVis = () => {
      s.last = 0;
    };
    document.addEventListener('visibilitychange', onVis);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf.current);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKey);
    };
  }, [started, spawn, finish, move]);

  const s = g.current;
  const front = s.rows.find((r) => !r.result);
  const prompt = front ? targets[s.round] : targets[Math.max(0, s.round - 1)];
  const laneX = ['16.66%', '50%', '83.33%'];

  if (!started) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <Mascot mood="cheer" size={90} />
        <p className="mt-2 text-sm text-muted">Tayyormisiz? Yo‘lakni bosing va to‘g‘ri darvozadan o‘ting.</p>
        <Button size="lg" className="mt-4" onClick={() => setStarted(true)}>Yugurish! 🏃</Button>
      </div>
    );
  }

  return (
    <div>
      <Hud
        items={[
          { label: 'Jon', value: '❤️'.repeat(Math.max(0, s.lives)) || '💔', tone: s.lives <= 1 ? 'bad' : 'normal' },
          { label: 'Ball', value: s.score },
          { label: 'Darvoza', value: `${Math.min(s.round + 1, ROUNDS)}/${ROUNDS}` },
        ]}
      />
      <div className="mb-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-center text-white shadow">
        <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">Inglizchasi qaysi?</div>
        <div className="text-2xl font-extrabold">{prompt ? shortUz(prompt) : ''}</div>
      </div>

      <div className="relative h-[26rem] touch-none select-none overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-slate-800 dark:to-emerald-950 sm:h-[30rem]">
        {/* lane dividers */}
        <div className="pointer-events-none absolute inset-y-0 left-1/3 border-l-2 border-dashed border-white/70 dark:border-white/15" />
        <div className="pointer-events-none absolute inset-y-0 left-2/3 border-l-2 border-dashed border-white/70 dark:border-white/15" />

        {/* tap zones */}
        {[0, 1, 2].map((i) => (
          <button key={i} type="button" aria-label={`${i + 1}-yo‘lak`} onPointerDown={() => setLane(i)} className="absolute inset-y-0 z-10 w-1/3" style={{ left: `${i * 33.333}%` }} />
        ))}

        {/* gates */}
        {s.rows.map((r) =>
          r.words.map((w, i) => (
            <div
              key={`${r.id}-${i}`}
              className={cx(
                'pointer-events-none absolute flex w-[29%] -translate-x-1/2 items-center justify-center rounded-2xl border-2 px-1 text-center text-sm font-extrabold leading-tight shadow-md',
                r.result && i === r.correct ? 'border-emerald-500 bg-emerald-400 text-white' : r.result === 'bad' && i === r.picked ? 'border-rose-500 bg-rose-400 text-white' : 'border-indigo-300 bg-white text-indigo-800 dark:border-indigo-400/50 dark:bg-slate-700 dark:text-indigo-100',
                r.result && i !== r.correct && i !== r.picked && 'opacity-40',
              )}
              style={{ left: laneX[i], top: `${r.y}%`, height: `${GATE_H}%` }}
            >
              <span className="break-words">{w.en}</span>
            </div>
          )),
        )}

        {/* player */}
        <div className="pointer-events-none absolute z-0 -translate-x-1/2 transition-[left] duration-150 ease-out" style={{ left: laneX[s.lane], top: `${PLAYER_TOP}%` }}>
          <Mascot mood={s.combo >= 3 ? 'cheer' : 'happy'} size={64} animate={false} />
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-3">
        <Button variant="secondary" size="lg" aria-label="Chapga" onClick={() => move(-1)}>◀</Button>
        <Button variant="secondary" size="lg" aria-label="O‘ngga" onClick={() => move(1)}>▶</Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Yo‘lakni bosing yoki ◀ ▶ tugmalarini ishlating</p>
    </div>
  );
}
