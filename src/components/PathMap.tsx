// Duolingo-style winding learning path: level sections -> step nodes.
// Every node is a real lesson/task in the app; the highlighted node with the
// mascot shows "where the learner is now", locked nodes wait below.
import { useMemo } from 'react';
import { useApp } from '../store/store';
import { generateRoadmap } from '../lib/roadmap';
import { cx } from '../lib/utils';
import type { Level } from '../types';
import { ProgressBar } from './ui';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
import { navigate } from '../lib/router';

interface PathNode {
  id: string;
  emoji: string;
  route: string;
  done: boolean;
  kind: 'lesson' | 'words' | 'trophy';
  label: string;
}

const LEVEL_ORDER: Array<'grammar' | 'reading' | 'listening' | 'speaking' | 'writing'> = [
  'grammar', 'reading', 'listening', 'speaking', 'writing',
];

const KIND_META: Record<Level, { emoji: string; label: string }> = {
  'Pre-A1': { emoji: '🌱', label: 'Birinchi qadamlar' },
  A1: { emoji: '🎒', label: 'Boshlang\u2018ich' },
  A2: { emoji: '🚲', label: 'Mustaqil boshlanish' },
  B1: { emoji: '🚗', label: 'Ishonchli suhbat' },
  B2: { emoji: '✈️', label: 'Erkin gapirish' },
  C1: { emoji: '🛰️', label: 'Ravon daraja' },
  C2: { emoji: '👑', label: 'Ustoz darajasi' },
};

/** Round-robin interleave of the level's lessons, plus a words checkpoint and a trophy. */
function stageNodes(
  st: ReturnType<typeof generateRoadmap>[number],
): PathNode[] {
  const lists = LEVEL_ORDER.map((k) => st[k]);
  const rounds = Math.max(...lists.map((l) => l.length), 1);
  const nodes: PathNode[] = [];
  const meta: Record<string, { emoji: string }> = {
    grammar: { emoji: '🧩' }, reading: { emoji: '📖' }, listening: { emoji: '🎧' }, speaking: { emoji: '🗣️' }, writing: { emoji: '✍️' },
  };
  for (let r = 0; r < rounds; r++) {
    LEVEL_ORDER.forEach((k) => {
      const it = lists[LEVEL_ORDER.indexOf(k)][r];
      if (it) nodes.push({ id: `${k}-${it.id}`, emoji: meta[k].emoji, route: `/${k}/${it.id}`, done: it.done, kind: 'lesson', label: it.title });
    });
  }
  nodes.push({
    id: 'words-check', emoji: '🃏', route: '/vocab', kind: 'words', label: 'So\u2018zlar checkpoint',
    done: st.vocab.total > 0 && st.vocab.learned / st.vocab.total >= 0.8,
  });
  nodes.push({
    id: 'trophy', emoji: '🏆', route: '/plan', kind: 'trophy',
    done: st.progress !== null && st.progress >= 100, label: `${st.level} darajasi tugadi`,
  });
  return nodes;
}

// horizontal offsets (px) for the winding path — repeat cyclically
const WAVE = [0, 64, 92, 64, 0, -64, -92, -64];

export function PathMap() {
  const s = useApp();
  const stages = useMemo(() => (s.profile ? generateRoadmap(s.profile, s) : []), [s]);

  const sections = useMemo(
    () => stages.map((st) => ({ st, nodes: stageNodes(st) })),
    [stages],
  );

  // first not-done node across the whole path = "you are here"
  let currentKey = '';
  let currentLabel = '';
  outer: for (const { st, nodes } of sections) {
    for (const n of nodes) {
      if (!n.done) {
        currentKey = `${st.level}:${n.id}`;
        currentLabel = n.label;
        break outer;
      }
    }
  }
  let seen = 0;
  const doneCount = sections.reduce((a, sec) => a + sec.nodes.filter((n) => n.done).length, 0);
  const totalCount = sections.reduce((a, sec) => a + sec.nodes.length, 0);

  return (
    <div>
      <div className="relative">
        {/* winding connector behind the nodes */}
        <div className="path-line pointer-events-none absolute left-1/2 top-0 h-full w-1 -translate-x-1/2" aria-hidden="true" />

        {sections.map(({ st, nodes }) => (
          <div key={st.level} className="relative">
            {/* level banner (like "Unit 2 - …") */}
            <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-line bg-gradient-to-r from-indigo-600 to-violet-600 p-3.5 text-white shadow-lg shadow-indigo-500/20">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{KIND_META[st.level].emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    {st.level} · {KIND_META[st.level].label}
                  </p>
                  <p className="truncate text-[11px] text-indigo-100">{st.focus}</p>
                </div>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-extrabold">{st.progress ?? 0}%</span>
              </div>
              <ProgressBar value={st.progress ?? 0} className="mt-2 h-1.5" label={`${st.level} progress`} />
            </div>

            {/* nodes */}
            <ul className="relative z-10 my-2 space-y-1.5">
              {nodes.map((n) => {
                const key = `${st.level}:${n.id}`;
                const isCurrent = key === currentKey;
                const offset = WAVE[seen % WAVE.length];
                seen++;
                const locked = !n.done && !isCurrent;
                return (
                  <li key={key} className="relative flex justify-center" style={{ transform: `translateX(${offset}px)` }}>
                    {isCurrent && (
                      <>
                        <div className="bub-bob absolute -top-2 left-1/2 z-20 -translate-x-[calc(50%+52px)] whitespace-nowrap rounded-xl bg-indigo-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md">
                          Boshlash
                        </div>
                        <div className="absolute top-1/2 left-1/2 z-0 -translate-x-[calc(50%+64px)] -translate-y-1/2 max-md:hidden">
                          <Mascot mood="happy" size={54} />
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => { if (!locked) navigate(n.route); }}
                      aria-label={n.label}
                      title={n.label}
                      className={cx(
                        'node-pop relative flex h-16 w-16 items-center justify-center rounded-full border-b-4 text-2xl shadow-md transition active:scale-95',
                        n.done && 'border-emerald-700 bg-emerald-500 text-white hover:brightness-105',
                        isCurrent && 'bounce-soft border-indigo-700 bg-gradient-to-br from-indigo-500 to-violet-500 text-white ring-4 ring-indigo-300/50 dark:ring-indigo-500/30',
                        locked && 'cursor-not-allowed border-line bg-surface2 text-muted opacity-70 grayscale',
                      )}
                    >
                      {n.done ? (
                        <Icon name="check" className="h-7 w-7" />
                      ) : isCurrent && n.kind === 'trophy' ? (
                        <span>🏆</span>
                      ) : isCurrent ? (
                        <span>{n.emoji}</span>
                      ) : (
                        <Icon name="lock" className="h-5 w-5" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        Yo‘lda {doneCount}/{totalCount} qadam bajarildi{currentLabel ? ` · Navbat: ${currentLabel}` : ''}
      </p>
    </div>
  );
}
