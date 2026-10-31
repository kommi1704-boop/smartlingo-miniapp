import type { GameResult } from './games';
import { seededRng } from './games';
import { today } from './dates';
import type { PersistedState, QuestState } from '../types';

// ---------- Coin economy: catalog, tiers, quests, chest ----------
// This module is pure data + helpers (no store imports) so both pages and actions can use it.

// ===== Avatar frames (Do'kon: "Ramkalar") =====

export type FrameTier = 'oddiy' | 'premium';

export interface FrameItem {
  id: string; // "frame-bronze"
  name: string; // Uzbek display name
  price: number; // Coins
  tier: FrameTier;
  cls: string; // CSS ring class (index.css)
}

export const FRAME_DAYS = 7; // frames are rented for 7 days, renewable

export const FRAMES: FrameItem[] = [
  { id: 'frame-bronze', name: 'Bronza ramka', price: 35, tier: 'oddiy', cls: 'frame-bronze' },
  { id: 'frame-silver', name: 'Kumush ramka', price: 100, tier: 'oddiy', cls: 'frame-silver' },
  { id: 'frame-neon-blue', name: 'Neon moviy', price: 180, tier: 'oddiy', cls: 'frame-neon-blue' },
  { id: 'frame-neon-pink', name: 'Neon pushti', price: 180, tier: 'oddiy', cls: 'frame-neon-pink' },
  { id: 'frame-gold', name: 'Oltin ramka', price: 270, tier: 'premium', cls: 'frame-gold' },
  { id: 'frame-circuit', name: 'Mikrosxema', price: 300, tier: 'premium', cls: 'frame-circuit' },
  { id: 'frame-frost', name: 'Ayoz', price: 300, tier: 'premium', cls: 'frame-frost' },
  { id: 'frame-fire', name: 'Olov', price: 380, tier: 'premium', cls: 'frame-fire' },
];

export const frameById = (id?: string): FrameItem | undefined => FRAMES.find((f) => f.id === id);

// ===== Rating tiers ("Reyting ramkalari") — Codeforces-style ladder =====
// Rating is earned by learning (XP + stars + badges). Reaching a tier unlocks its frame forever.

export interface RankTier {
  id: string; // "master" -> frame id "rf-master"
  name: string; // English rank name (like the ladder screen)
  min: number; // rating needed
  ring: string; // CSS ring class for the frame preview
  text: string; // tailwind text color class for the rank name
}

export const RANK_TIERS: RankTier[] = [
  { id: 'newbie', name: 'Newbie', min: 0, ring: 'frame-none', text: 'text-slate-500 dark:text-slate-400' },
  { id: 'specialist', name: 'Specialist', min: 1600, ring: 'frame-specialist', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'expert', name: 'Expert', min: 1700, ring: 'frame-expert', text: 'text-amber-500 dark:text-amber-300' },
  { id: 'cm', name: 'Candidate Master', min: 1800, ring: 'frame-cm', text: 'text-orange-600 dark:text-orange-400' },
  { id: 'master', name: 'Master', min: 2000, ring: 'frame-master', text: 'text-rose-600 dark:text-rose-400' },
  { id: 'im', name: 'International Master', min: 2200, ring: 'frame-im', text: 'text-cyan-600 dark:text-cyan-300' },
  { id: 'gm', name: 'Grandmaster', min: 2400, ring: 'frame-gm', text: 'text-blue-600 dark:text-blue-300' },
  { id: 'igm', name: 'International Grandmaster', min: 2700, ring: 'frame-igm', text: 'text-pink-600 dark:text-pink-300' },
  { id: 'lgm', name: 'Legendary Grandmaster', min: 3000, ring: 'frame-lgm', text: 'text-purple-600 dark:text-purple-300' },
];

export const RATING_FRAMES = RANK_TIERS.filter((t) => t.min >= 1600);

// ===== Avatars =====

export const DEFAULT_AVATAR = '🙂';

export const FREE_AVATARS: string[] = ['🙂', '🦁', '🐼', '🦊', '🐯', '🐧', '🐸', '🚀'];

export interface AvatarItem {
  id: string;
  emoji: string;
  name: string;
  price: number;
}

export const PREMIUM_AVATARS: AvatarItem[] = [
  { id: 'av-robot', emoji: '🤖', name: 'Robot', price: 80 },
  { id: 'av-ghost', emoji: '👻', name: 'Arvoh', price: 80 },
  { id: 'av-alien', emoji: '👽', name: 'Kosmik do‘st', price: 100 },
  { id: 'av-wizard', emoji: '🧙', name: 'Sehrgar', price: 120 },
  { id: 'av-dragon', emoji: '🐉', name: 'Ajdar', price: 150 },
  { id: 'av-unicorn', emoji: '🦄', name: 'Bir shox', price: 150 },
];

export const avatarById = (id?: string): AvatarItem | undefined => PREMIUM_AVATARS.find((a) => a.id === id);

// ===== Titles (Profil nomi ostida ko'rinadi) =====

export interface TitleItem {
  id: string;
  name: string;
  price: number;
}

export const TITLES: TitleItem[] = [
  { id: 'title-stargazer', name: '⭐ Yulduz ovchisi', price: 120 },
  { id: 'title-scholar', name: '📚 Bilimdon', price: 150 },
  { id: 'title-champion', name: '🏅 Kelajak chempioni', price: 200 },
  { id: 'title-legend', name: '👑 Afsonaviy o‘quvchi', price: 350 },
];

export const titleById = (id?: string): TitleItem | undefined => TITLES.find((t) => t.id === id);

// ===== Gifts / boosters ("Sovg'alar") =====

export const CHEST_PRICE = 100;
export const XP_BOOST_PRICE = 150; // 2x XP for 24 hours
export const FREEZE_PRICE = 80; // protects the streak for one missed day
export const XP_BOOST_HOURS = 24;

export interface ChestReward {
  kind: 'coins' | 'xp' | 'freeze';
  amount: number;
}

const CHEST_TABLE: { w: number; r: ChestReward }[] = [
  { w: 28, r: { kind: 'coins', amount: 40 } },
  { w: 20, r: { kind: 'coins', amount: 80 } },
  { w: 7, r: { kind: 'coins', amount: 150 } },
  { w: 20, r: { kind: 'xp', amount: 40 } },
  { w: 12, r: { kind: 'xp', amount: 90 } },
  { w: 13, r: { kind: 'freeze', amount: 1 } },
];

export function rollChest(rnd: () => number = Math.random): ChestReward {
  const total = CHEST_TABLE.reduce((a, x) => a + x.w, 0);
  let roll = rnd() * total;
  for (const x of CHEST_TABLE) {
    roll -= x.w;
    if (roll <= 0) return x.r;
  }
  return CHEST_TABLE[0].r;
}

export function chestRewardText(r: ChestReward): string {
  if (r.kind === 'coins') return `+${r.amount} 🪙 Coin`;
  if (r.kind === 'xp') return `+${r.amount} ⭐ XP`;
  return '🧊 1 ta muzlatgich';
}

// ===== Daily quests ("Kunlik vazifalar") =====

export type QuestCounter = 'words' | 'xp' | 'games' | 'lessons' | 'tutor' | 'speaking' | 'writing' | 'resources';

export interface QuestDef {
  id: string;
  emoji: string;
  title: string;
  target: number;
  coins: number;
  counter: QuestCounter;
}

export const QUESTS: QuestDef[] = [
  { id: 'q-words10', emoji: '🃏', title: '10 ta so‘zni takrorlang', target: 10, coins: 15, counter: 'words' },
  { id: 'q-words25', emoji: '🧠', title: '25 ta so‘zni takrorlang', target: 25, coins: 30, counter: 'words' },
  { id: 'q-xp50', emoji: '⚡', title: '50 XP to‘plang', target: 50, coins: 20, counter: 'xp' },
  { id: 'q-xp100', emoji: '🚀', title: '100 XP to‘plang', target: 100, coins: 35, counter: 'xp' },
  { id: 'q-lesson1', emoji: '🧩', title: '1 ta darsni tugating', target: 1, coins: 20, counter: 'lessons' },
  { id: 'q-game2', emoji: '🎮', title: '2 ta o‘yin o‘ynang', target: 2, coins: 15, counter: 'games' },
  { id: 'q-tutor5', emoji: '🤖', title: 'Lingo bilan 5 xabar suhbatlashing', target: 5, coins: 10, counter: 'tutor' },
  { id: 'q-speak1', emoji: '🗣️', title: 'Gaplashish mashqini bajaring', target: 1, coins: 15, counter: 'speaking' },
  { id: 'q-write1', emoji: '✍️', title: 'Yozish mashqini bajaring', target: 1, coins: 15, counter: 'writing' },
];

export const questById = (id: string): QuestDef | undefined => QUESTS.find((q) => q.id === id);

/** Today's quest state (progress resets lazily when the date changes). */
export function questStateOf(s: PersistedState): QuestState {
  const t = today();
  return s.quests.date === t ? s.quests : { date: t, progress: {}, claimed: [] };
}

/** The 3 quests featured today (same rotation logic as the daily game). */
export function todaysQuests(date: string = today()): QuestDef[] {
  const rnd = seededRng(`quests:${date}`);
  const arr = [...QUESTS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

// ===== Coin rules =====

export const GAME_COIN_CAP = 30; // max Coins per day from games
export const FIRST_LESSON_COINS = 5;
export const LEVEL_UP_COINS = 10;
export const STREAK_BONUS_COINS = 20; // every 7th streak day

export function coinsForResult(r: GameResult, isRecord: boolean): number {
  const base = r.stars === 0 ? 1 : 2 + r.stars * 2; // 1 / 4 / 6 / 8
  return base + (isRecord ? 5 : 0);
}

// ===== Equipped look helpers (pure — used by Avatar component) =====

/** CSS ring class for the equipped frame id (shop frames need an active rental). */
export function frameClassFor(frameId: string | undefined, isOwnedActive: (id: string) => boolean, rating?: number): string {
  if (!frameId) return 'frame-none';
  if (frameId.startsWith('rf-')) {
    const tier = RANK_TIERS.find((t) => `rf-${t.id}` === frameId);
    if (!tier) return 'frame-none';
    // a rating frame only shows while the rating still reaches its tier
    return rating !== undefined && rating < tier.min ? 'frame-none' : tier.ring;
  }
  return isOwnedActive(frameId) ? (frameById(frameId)?.cls ?? 'frame-none') : 'frame-none';
}

// ===== Name styles ("Ism effektlari") — colors + effects for the learner's name =====
// Same rental model as frames: 7 days, renewable.

export const NAME_STYLE_DAYS = 7;

export interface NameColorItem {
  id: string; // "nc-fire"
  name: string; // Uzbek display name
  price: number; // Coins
  cls: string; // CSS gradient-text class (index.css)
}

export const NAME_COLORS: NameColorItem[] = [
  { id: 'nc-fire', name: 'Olov', price: 75, cls: 'nc-fire' },
  { id: 'nc-ocean', name: 'Okean', price: 75, cls: 'nc-ocean' },
  { id: 'nc-neon', name: 'Neon', price: 75, cls: 'nc-neon' },
  { id: 'nc-gold', name: 'Oltin', price: 75, cls: 'nc-gold' },
  { id: 'nc-rainbow', name: 'Kamalak', price: 100, cls: 'nc-rainbow' },
];

export interface NameFxItem {
  id: string; // "nfx-outline"
  name: string; // Uzbek display name
  price: number; // Coins
  cls: string; // CSS effect class (index.css)
}

export const NAME_FXS: NameFxItem[] = [
  { id: 'nfx-outline', name: 'Kontur', price: 75, cls: 'nfx-outline' },
  { id: 'nfx-shadow', name: 'Uzun soya', price: 75, cls: 'nfx-shadow' },
  { id: 'nfx-underline', name: 'Chizgi', price: 75, cls: 'nfx-underline' },
  { id: 'nfx-neon', name: 'Neon nur', price: 75, cls: 'nfx-neon' },
];

export const nameColorById = (id?: string): NameColorItem | undefined => NAME_COLORS.find((c) => c.id === id);
export const nameFxById = (id?: string): NameFxItem | undefined => NAME_FXS.find((f) => f.id === id);

/**
 * CSS classes for the learner's own name: one gradient color + one effect.
 * Items must have an active rental to display (pure — takes the check function).
 */
export function nameStyleClasses(
  equipped: { nameColor?: string; nameFx?: string },
  isOwnedActive: (id: string) => boolean,
): string {
  const color = equipped.nameColor && isOwnedActive(equipped.nameColor) ? nameColorById(equipped.nameColor)?.cls : undefined;
  const fx = equipped.nameFx && isOwnedActive(equipped.nameFx) ? nameFxById(equipped.nameFx)?.cls : undefined;
  const parts: string[] = [];
  if (color) parts.push('nm-grad', color); // nm-grad switches to background-clip:text
  if (fx) parts.push(fx);
  return parts.join(' ');
}
