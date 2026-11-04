import type { Level, VocabWord } from '../types';
import { LEVELS } from '../types';
import { VOCAB } from '../data/vocab';
import { getState } from '../store/store';
import { dayOfYear, today } from './dates';
import { shuffle } from './utils';

export type GameId = 'memory' | 'runner' | 'scramble' | 'blitz' | 'listen';

export interface GameInfo {
  id: GameId;
  title: string;
  emoji: string;
  tagline: string;
  how: string[];
  color: string; // tailwind gradient classes (full strings so Tailwind sees them)
  needsAudio?: boolean;
}

export const GAMES: GameInfo[] = [
  {
    id: 'memory',
    title: 'Xotira kartalari',
    emoji: '🃏',
    tagline: 'Inglizcha so‘z va tarjimasini juftlang',
    how: ['Kartani bosib oching.', 'Inglizcha so‘z va uning o‘zbekcha tarjimasini toping.', 'Qancha kam harakat qilsangiz, shuncha ko‘p yulduz!'],
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'runner',
    title: 'So‘z yuguruvchi',
    emoji: '🏃',
    tagline: 'To‘g‘ri darvozaga yuguring',
    how: ['Tepada o‘zbekcha so‘z chiqadi.', 'Yo‘lakni bosing (yoki ◀ ▶ tugmalari) va to‘g‘ri inglizcha darvozadan o‘ting.', '3 ta jon bor. Tezlik oshib boradi!'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'scramble',
    title: 'Harflar o‘yini',
    emoji: '🔤',
    tagline: 'Aralashgan harflardan so‘z tuzing',
    how: ['Tarjimaga qarab, harflarni to‘g‘ri tartibda bosing.', 'Adashsangiz, bosilgan harfni qayta bosib olib tashlang.', 'Qiyin bo‘lsa, “Ko‘rsatma” tugmasi bor (ball kamayadi).'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'blitz',
    title: 'Tezkor so‘z',
    emoji: '⚡',
    tagline: '60 soniyada ko‘proq so‘z toping',
    how: ['Inglizcha so‘zning tarjimasini tanlang.', 'Ketma-ket to‘g‘ri javoblar “combo” beradi.', 'Vaqt tugaguncha 60 soniya bor.'],
    color: 'from-sky-500 to-indigo-500',
  },
  {
    id: 'listen',
    title: 'Eshitib top',
    emoji: '🎧',
    tagline: 'Eshiting va to‘g‘ri so‘zni tanlang',
    how: ['So‘z ovoz bilan aytiladi.', 'To‘g‘ri yozilishini 4 ta variantdan tanlang.', '🔊 tugmasi bilan qayta eshitish mumkin.'],
    color: 'from-violet-500 to-purple-500',
    needsAudio: true,
  },
];

export const gameInfo = (id: string): GameInfo | undefined => GAMES.find((g) => g.id === id);

/** The game featured for today's daily challenge (rotates every day, same for everyone). */
export function dailyGameId(date: string = today()): GameId {
  return GAMES[dayOfYear(date) % GAMES.length].id;
}

// ---- seeded random (for the daily challenge: same words all day) ----
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function seededRng(seed: string): () => number {
  let a = hash(seed) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleWith<T>(arr: readonly T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Words that match the student's level (estimated level and one step either side). */
export function levelPool(level?: Level): VocabWord[] {
  const est = level ?? getState().profile?.estimatedLevel ?? 'A1';
  const i = LEVELS.indexOf(est);
  const lo = Math.max(0, i - 1);
  const hi = Math.min(LEVELS.length - 1, i + 1);
  const pool = VOCAB.filter((w) => {
    const k = LEVELS.indexOf(w.level);
    return k >= lo && k <= hi;
  });
  return pool.length >= 40 ? pool : VOCAB;
}

/** Short Uzbek form for cards/buttons: first meaning only ("ona, oyi" -> "ona"). */
export const shortUz = (w: VocabWord): string => w.uz.split(/[,;]/)[0].trim();

/** `count` words for a round. With `daily`, the picks are the same for the whole day. */
export function pickWords(count: number, opts: { daily?: boolean; single?: boolean; maxLen?: number; minLen?: number } = {}): VocabWord[] {
  let pool = levelPool().filter((w) => w.en.trim().length > 0);
  if (opts.single) pool = pool.filter((w) => /^[a-z]+$/i.test(w.en));
  if (opts.maxLen) pool = pool.filter((w) => w.en.length <= opts.maxLen!);
  if (opts.minLen) pool = pool.filter((w) => w.en.length >= opts.minLen!);
  // keep Uzbek short forms distinct so two cards never look identical
  const seen = new Set<string>();
  pool = pool.filter((w) => {
    const k = shortUz(w).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const mixed = opts.daily ? shuffleWith(pool, seededRng(`daily:${today()}`)) : shuffle(pool);
  return mixed.slice(0, count);
}

/** Wrong options for a question (never the same word or the same Uzbek text). */
export function distractors(answer: VocabWord, n: number, pool: VocabWord[]): VocabWord[] {
  const out: VocabWord[] = [];
  for (const w of shuffle(pool)) {
    if (out.length >= n) break;
    if (w.id === answer.id || w.en.toLowerCase() === answer.en.toLowerCase() || shortUz(w).toLowerCase() === shortUz(answer).toLowerCase()) continue;
    out.push(w);
  }
  return out;
}

export interface GameResult {
  game: GameId;
  score: number;
  stars: 0 | 1 | 2 | 3;
  correct: number;
  total: number;
  missed: VocabWord[];
  note?: string;
}

export const DAILY_BONUS_XP = 15;
export const GAME_XP_CAP = 60;

export function xpForResult(r: GameResult): number {
  if (r.stars === 0) return 2;
  return 4 + r.stars * 4; // 8, 12, 16
}
