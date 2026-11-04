// Spaced repetition (SM-2-lite) for vocabulary.
//
// The scheduler keeps the old Leitner box (0..5, still shown as stars) but schedules with an
// adaptive ease factor, like a simplified SM-2:
//  - a correct answer grows the interval by the word's ease (easy words -> long intervals);
//  - a wrong answer is a lapse: ease drops, streak resets, the word comes back tomorrow;
//  - words the learner already knows well are shown rarely, hard words come back quickly.
//
// All new fields are optional in VocabProgress, so state saved by older versions keeps loading.

import type { VocabProgress, VocabWord, Level } from '../types';
import { LEVELS } from '../types';
import { addDays, today } from './dates';

export const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16]; // kept for compatibility (box -> fallback interval)

export const EASE_MIN = 1.3;
export const EASE_MAX = 2.8;
export const EASE_START = 2.2;
const INTERVAL_CAP = 180; // half a year: beyond that the word is effectively learned

/** Maps an interval in days onto the 0..5 box used by the UI (stars / status). */
export function boxForInterval(interval: number): number {
  if (interval <= 1) return 0;
  if (interval <= 2) return 1;
  if (interval <= 4) return 2;
  if (interval <= 9) return 3;
  if (interval <= 17) return 4;
  return 5;
}

export function freshProgress(now: string = today()): VocabProgress {
  return { status: 'new', box: 0, due: now, reviews: 0, correct: 0, ease: EASE_START, interval: 0, lapses: 0, streak: 0, firstSeen: now };
}

function normalize(p: VocabProgress): VocabProgress {
  // fill in the scheduling fields for records saved by an older app version
  return {
    ...p,
    ease: p.ease ?? EASE_START,
    interval: p.interval ?? INTERVAL_DAYS[Math.min(5, p.box)] ?? 0,
    lapses: p.lapses ?? Math.max(0, p.reviews - p.correct),
    streak: p.streak ?? p.correct,
    firstSeen: p.firstSeen ?? p.lastReviewed,
  };
}

export function applyReview(p: VocabProgress | undefined, know: boolean, now: string = today()): VocabProgress {
  const cur = normalize(p ?? freshProgress(now));
  if (know) {
    const streak = (cur.streak ?? 0) + 1;
    const ease = Math.min(EASE_MAX, (cur.ease ?? EASE_START) + 0.08);
    const interval =
      streak <= 1 ? 1
      : streak === 2 ? 3
      : Math.min(INTERVAL_CAP, Math.max(2, Math.round((cur.interval || 2) * ease)));
    const box = boxForInterval(interval);
    return {
      ...cur,
      status: box >= 5 ? 'learned' : 'learning',
      box,
      interval,
      ease,
      streak,
      due: addDays(now, interval),
      reviews: cur.reviews + 1,
      correct: cur.correct + 1,
      lastReviewed: now,
    };
  }
  // lapse: forget quickly, come back tomorrow, ease goes down (harder word)
  const ease = Math.max(EASE_MIN, (cur.ease ?? EASE_START) - 0.25);
  return {
    ...cur,
    status: 'review',
    box: 0,
    interval: 0,
    ease,
    streak: 0,
    lapses: (cur.lapses ?? 0) + 1,
    due: addDays(now, 1),
    reviews: cur.reviews + 1,
    correct: cur.correct,
    lastReviewed: now,
  };
}

export function markLearnedProgress(p: VocabProgress | undefined, now: string = today()): VocabProgress {
  const cur = normalize(p ?? freshProgress(now));
  return { ...cur, status: 'learned', box: 5, interval: INTERVAL_DAYS[5], due: addDays(now, INTERVAL_DAYS[5]), lastReviewed: now };
}

export function markReviewProgress(p: VocabProgress | undefined, now: string = today()): VocabProgress {
  const cur = normalize(p ?? freshProgress(now));
  return { ...cur, status: 'review', box: Math.min(cur.box, 1), interval: 0, due: now };
}

export function isDue(p: VocabProgress | undefined, now: string = today()): boolean {
  return !!p && p.reviews > 0 && p.due <= now;
}

/** Words the student should look at today: due reviews first (hardest first), then new words up to the daily goal. */
export function buildQueue(
  all: readonly VocabWord[],
  progress: Record<string, VocabProgress>,
  estLevel: Level,
  newLimit: number,
  now: string = today(),
): VocabWord[] {
  const due = all
    .filter((w) => isDue(progress[w.id], now) || progress[w.id]?.status === 'review')
    .sort((a, b) => {
      // struggling words (low ease, many lapses) jump the queue
      const hard = (progress[b.id]?.lapses ?? 0) - (progress[a.id]?.lapses ?? 0);
      if (hard !== 0) return hard;
      return (progress[a.id]?.due ?? '').localeCompare(progress[b.id]?.due ?? '');
    });
  const est = LEVELS.indexOf(estLevel);
  const fresh = all
    .filter((w) => !progress[w.id] || progress[w.id].reviews === 0 && progress[w.id].status === 'new')
    .map((w, i) => {
      const li = LEVELS.indexOf(w.level);
      const dist = li > est ? (li - est) * 1.5 : est - li;
      return { w, key: dist * 1000 + i };
    })
    .sort((a, b) => a.key - b.key)
    .slice(0, newLimit)
    .map((x) => x.w);
  const seen = new Set<string>();
  return [...due, ...fresh].filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)));
}
