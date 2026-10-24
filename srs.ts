import type { VocabProgress, VocabWord, Level } from '../types';
import { LEVELS } from '../types';
import { addDays, today } from './dates';

// Simple Leitner-style spaced repetition.
// Box 0 = new/forgotten, box 5 = well known. A correct answer moves a word one box up and
// schedules the next review further away; a wrong answer sends it back to box 0 for tomorrow.
export const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];

export function freshProgress(): VocabProgress {
  return { status: 'new', box: 0, due: today(), reviews: 0, correct: 0 };
}

export function applyReview(p: VocabProgress | undefined, know: boolean, now: string = today()): VocabProgress {
  const cur = p ?? freshProgress();
  if (know) {
    const box = Math.min(5, cur.box + 1);
    return {
      status: box >= 4 ? 'learned' : 'learning',
      box,
      due: addDays(now, INTERVAL_DAYS[box]),
      reviews: cur.reviews + 1,
      correct: cur.correct + 1,
      lastReviewed: now,
    };
  }
  return {
    status: 'review',
    box: 0,
    due: addDays(now, 1),
    reviews: cur.reviews + 1,
    correct: cur.correct,
    lastReviewed: now,
  };
}

export function markLearnedProgress(p: VocabProgress | undefined, now: string = today()): VocabProgress {
  const cur = p ?? freshProgress();
  return { ...cur, status: 'learned', box: 5, due: addDays(now, INTERVAL_DAYS[5]), lastReviewed: now };
}

export function markReviewProgress(p: VocabProgress | undefined, now: string = today()): VocabProgress {
  const cur = p ?? freshProgress();
  return { ...cur, status: 'review', box: Math.min(cur.box, 1), due: now };
}

export function isDue(p: VocabProgress | undefined, now: string = today()): boolean {
  return !!p && p.reviews > 0 && p.due <= now;
}

/** Words the student should look at today: due reviews first, then new words up to the daily goal. */
export function buildQueue(
  all: readonly VocabWord[],
  progress: Record<string, VocabProgress>,
  estLevel: Level,
  newLimit: number,
  now: string = today(),
): VocabWord[] {
  const due = all
    .filter((w) => isDue(progress[w.id], now) || progress[w.id]?.status === 'review')
    .sort((a, b) => (progress[a.id]?.due ?? '').localeCompare(progress[b.id]?.due ?? ''));
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
