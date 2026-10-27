import type { DayActivity, PersistedState } from '../types';
import { addDays, today } from './dates';
import { buildPlan, planSummary } from './plan';
import type { RankTier } from './shop';
import { RANK_TIERS } from './shop';

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
  const active = (k: string) => (activity[k]?.xp ?? 0) > 0 || !!activity[k]?.frozen;
  let cursor = active(ref) ? ref : addDays(ref, -1);
  let n = 0;
  while (active(cursor) && n < 3650) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

// ---------- Rating (Codeforces-style ladder for the profile) ----------

/**
 * Reyting: 1000 + XP/3 (sekin o‘sishi uchun XP uchdan 1 qismi hisobga olinadi),
 * plus small bonuses from game stars and badges.
 * Pure function of the saved state — the same progress always gives the same rating.
 */
export function ratingOf(s: PersistedState): number {
  const stars = Object.values(s.games.best).reduce((a, b) => a + b.stars, 0);
  const badges = Object.keys(s.badges).length;
  return 1000 + Math.floor(Math.max(0, s.xp) / 3) + stars * 5 + badges * 5;
}

export interface RankInfo {
  tier: RankTier; // current tier
  next: RankTier | null; // next tier (null at the top)
  rating: number;
  into: number; // rating above the current tier start
  need: number; // rating needed for the next tier (0 at the top)
  pct: number;
}

export function rankInfo(rating: number): RankInfo {
  let idx = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) if (rating >= RANK_TIERS[i].min) idx = i;
  const tier = RANK_TIERS[idx];
  const next = RANK_TIERS[idx + 1] ?? null;
  const into = rating - tier.min;
  const need = next ? next.min - tier.min : 0;
  const pct = next ? Math.round((into / need) * 100) : 100;
  return { tier, next, rating, into, need, pct };
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
  { id: 'game-first', emoji: '🎮', title: 'Birinchi o‘yin', desc: 'Birinchi o‘yinni tugatdingiz', check: (s) => s.games.plays >= 1 },
  { id: 'game-3stars', emoji: '🏆', title: 'Uch yulduz', desc: 'Biror o‘yinda 3 yulduz oldingiz', check: (s) => Object.values(s.games.best).some((b) => b.stars >= 3) },
  { id: 'game-all', emoji: '🕹️', title: 'Hamma o‘yinlar', desc: '5 ta o‘yinning har birini o‘ynadingiz', check: (s) => Object.values(s.games.best).filter((b) => b.plays > 0).length >= 5 },
  { id: 'game-stars-10', emoji: '🌠', title: 'Yulduz yig‘uvchi', desc: 'O‘yinlarda jami 10 ta yulduz to‘pladingiz', check: (s) => Object.values(s.games.best).reduce((a, b) => a + b.stars, 0) >= 10 },
  { id: 'game-daily-3', emoji: '📅', title: 'Kunlik chempion', desc: '3 ta kunlik challenge bajardingiz', check: (s) => s.games.dailyCount >= 3 },
  { id: 'streak-3', emoji: '🔥', title: '3 kun ketma-ket', desc: 'Uch kun ketma-ket o‘rgandingiz', check: (s) => streakOf(s.activity) >= 3 },
  { id: 'streak-7', emoji: '🏅', title: 'Haftalik seriya', desc: 'Yetti kun ketma-ket o‘rgandingiz', check: (s) => streakOf(s.activity) >= 7 },
  { id: 'xp-100', emoji: '⭐', title: '100 XP', desc: '100 XP to‘pladingiz', check: (s) => s.xp >= 100 },
  { id: 'xp-500', emoji: '🌟', title: '500 XP', desc: '500 XP to‘pladingiz', check: (s) => s.xp >= 500 },
  { id: 'plan-day', emoji: '🏆', title: 'Kun rejasi bajarildi', desc: 'Bir kunlik rejaning barcha mashqlarini tugatdingiz', check: (s) => planSummary(buildPlan(s)).allDone },
];

export function newBadges(s: PersistedState): Badge[] {
  return BADGES.filter((b) => !s.badges[b.id] && b.check(s));
}
