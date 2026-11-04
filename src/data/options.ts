import type { Level } from '../types';

export interface GoalOption {
  id: string;
  emoji: string;
  label: string;
  floor: Level; // minimum sensible target level for this goal
  focusUz: string;
}

export const GOALS: GoalOption[] = [
  { id: 'school', emoji: '🏫', label: 'Maktabda yaxshi baho olish', floor: 'A2', focusUz: 'grammatika va o‘qish' },
  { id: 'friends', emoji: '💬', label: 'Chet ellik do‘stlar bilan gaplashish', floor: 'B1', focusUz: 'gaplashish va tinglash' },
  { id: 'games', emoji: '🎮', label: 'O‘yin, kino va videolarni tushunish', floor: 'A2', focusUz: 'tinglash va so‘z boyligi' },
  { id: 'travel', emoji: '✈️', label: 'Sayohatda erkin muloqot qilish', floor: 'B1', focusUz: 'gaplashish va kundalik iboralar' },
  { id: 'exams', emoji: '📝', label: 'Xalqaro imtihonga tayyorlanish', floor: 'B2', focusUz: 'barcha ko‘nikmalar, ayniqsa yozish' },
  { id: 'abroad', emoji: '🎓', label: 'Chet elda o‘qish', floor: 'B2', focusUz: 'o‘qish, yozish va gaplashish' },
];

export const MINUTES = [5, 10, 15, 20, 30, 45];

export interface ActivityOption {
  id: string;
  emoji: string;
  label: string;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: 'flashcards', emoji: '🃏', label: 'So‘z kartochkalari' },
  { id: 'grammar', emoji: '🧩', label: 'Grammatika' },
  { id: 'reading', emoji: '📖', label: 'O‘qish' },
  { id: 'listening', emoji: '🎧', label: 'Tinglash' },
  { id: 'speaking', emoji: '🗣️', label: 'Gaplashish' },
  { id: 'writing', emoji: '✍️', label: 'Yozish' },
  { id: 'games', emoji: '🎯', label: 'O‘yinlar va testlar' },
  { id: 'tutor', emoji: '🤖', label: 'Lingo bilan suhbat' },
];

export const SELF_LEVELS: { level: Level; label: string }[] = [
  { level: 'Pre-A1', label: 'Deyarli hech narsa bilmayman' },
  { level: 'A1', label: 'Oddiy so‘z va gaplarni bilaman' },
  { level: 'A2', label: 'Kundalik oddiy mavzularda gaplasha olaman' },
  { level: 'B1', label: 'Tanish mavzularda erkin gaplasha olaman' },
  { level: 'B2', label: 'Murakkab matnlarni tushunaman' },
  { level: 'C1', label: 'Deyarli erkin va aniq ifodalayman' },
  { level: 'C2', label: 'Ona tilidek bilaman' },
];

export const LEVEL_DESC: Record<Level, { title: string; desc: string }> = {
  'Pre-A1': { title: 'Boshlang‘ich oldi', desc: 'Birinchi so‘zlar, salomlashish, o‘zingni tanishtirish.' },
  A1: { title: 'Boshlang‘ich', desc: 'Oddiy gaplar, kundalik iboralar va eng kerakli so‘zlar.' },
  A2: { title: 'Elementar', desc: 'Oila, maktab, xarid haqida oddiy suhbat va qisqa matnlar.' },
  B1: { title: 'O‘rta', desc: 'Tanish mavzularda fikr bildirish, sayohatda o‘zini erkin his qilish.' },
  B2: { title: 'O‘rta-yuqori', desc: 'Murakkab matnlarni tushunish va ravon, aniq gapirish.' },
  C1: { title: 'Ilg‘or', desc: 'Nozik ma’nolarni tushunish, akademik va kasbiy til.' },
  C2: { title: 'Mohir', desc: 'Deyarli ona tili darajasidagi erkinlik va aniqlik.' },
};
