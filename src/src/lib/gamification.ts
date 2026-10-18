import type { DayActivity, PersistedState } from '../types';
import { addDays, today } from './dates';
import { buildPlan, planSummary } from './plan';

// XP "tajriba darajasi" (experience level) is separate from the CEFR English level.
export function xpLevel(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 40)) + 1;
}
export function xpForLevel(level: number): number {
  return 40 * (level - 1) * (level - 1);
}
export function xpProgress(xp: number): { level: number; into: number; need: number; pct: number } {
  const level = xpLevel(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: xp - base, need: next - base, pct: Math.round(((xp - base) / (next - base)) * 100) };
}

export function streakOf(activity: Record<string, DayActivity>, ref: string = today()): number {
  const active = (k: string) => (activity[k]?.xp ?? 0) > 0;
  let cursor = active(ref) ? ref : addDays(ref, -1);
  let n = 0;
  while (active(cursor) && n < 3650) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  check: (s: PersistedState) => boolean;
}

const learned = (s: PersistedState) => Object.values(s.vocab).filter((v) => v.status === 'learned').length;
const reviews = (s: PersistedState) => Object.values(s.vocab).reduce((a, v) => a + v.reviews, 0);
const completed = (s: PersistedState, kind: string) => Object.entries(s.lessons).filter(([k, v]) => k.startsWith(`${kind}:`) && v.completed).length;

export const BADGES: Badge[] = [
  { id: 'first-step', emoji: '🌱', title: 'Birinchi qadam', desc: 'Birinchi mashqni bajardingiz', check: (s) => s.xp > 0 },
  { id: 'words-20', emoji: '🃏', title: 'So‘z yig‘uvchi', desc: '20 ta so‘z takrorlandi', check: (s) => reviews(s) >= 20 },
  { id: 'words-learned-10', emoji: '🧠', title: 'Xotira ustasi', desc: '10 ta so‘z “o‘rganildi” bo‘ldi', check: (s) => learned(s) >= 10 },
  { id: 'grammar-1', emoji: '🧩', title: 'Grammatika boshlandi', desc: 'Birinchi grammatika darsini tugatdingiz', check: (s) => completed(s, 'grammar') >= 1 },
  { id: 'grammar-5', emoji: '📐', title: 'Qoidalar do‘sti', desc: '5 ta grammatika darsini tugatdingiz', check: (s) => completed(s, 'grammar') >= 5 },
  { id: 'reader', emoji: '📖', title: 'Kitobxon', desc: 'Birinchi matnni o‘qib, savollarga javob berdingiz', check: (s) => completed(s, 'reading') >= 1 },
  { id: 'listener', emoji: '🎧', title: 'Zukko quloq', desc: 'Birinchi tinglash mashqini bajardingiz', check: (s) => completed(s, 'listening') >= 1 },
  { id: 'speaker', emoji: '🗣️', title: 'Gapdon', desc: 'Birinchi gaplashish mashqini tugatdingiz', check: (s) => Object.keys(s.speakingDone).length >= 1 },
  { id: 'writer', emoji: '✍️', title: 'Yozuvchi', desc: 'Birinchi matningizni yubordingiz', check: (s) => s.writing.length >= 1 },
  { id: 'chat', emoji: '🤖', title: 'Lingo do‘sti', desc: 'Lingo bilan suhbat qildingiz', check: (s) => s.conversations.some((c) => c.messages.some((m) => m.role === 'user')) },
  { id: 'perfect', emoji: '🎯', title: 'Aniq nishon', desc: 'Testda barcha javoblar to‘g‘ri', check: (s) => s.quizHistory.some((q) => q.total >= 3 && q.score === q.total && q.kind !== 'placement') },
  { id: 'fixer', emoji: '🔧', title: 'Xatolar ustasi', desc: 'Xatolar daftaridagi 3 ta xatoni to‘g‘riladingiz', check: (s) => s.mistakes.filter((m) => m.corrected).length >= 3 },
  { id: 'streak-3', emoji: '🔥', title: '3 kun ketma-ket', desc: 'Uch kun ketma-ket o‘rgandingiz', check: (s) => streakOf(s.activity) >= 3 },
  { id: 'streak-7', emoji: '🏅', title: 'Haftalik seriya', desc: 'Yetti kun ketma-ket o‘rgandingiz', check: (s) => streakOf(s.activity) >= 7 },
  { id: 'xp-100', emoji: '⭐', title: '100 XP', desc: '100 XP to‘pladingiz', check: (s) => s.xp >= 100 },
  { id: 'xp-500', emoji: '🌟', title: '500 XP', desc: '500 XP to‘pladingiz', check: (s) => s.xp >= 500 },
  { id: 'plan-day', emoji: '🏆', title: 'Kun rejasi bajarildi', desc: 'Bir kunlik rejaning barcha mashqlarini tugatdingiz', check: (s) => planSummary(buildPlan(s)).allDone },
];

export function newBadges(s: PersistedState): Badge[] {
  return BADGES.filter((b) => !s.badges[b.id] && b.check(s));
}
