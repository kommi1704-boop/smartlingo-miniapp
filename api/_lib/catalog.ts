// Store 2.0 — server-side catalog mirror (Phase 6).
//
// Every coin purchase is journaled here BEFORE the client keeps its local
// state: the client posts {action:'purchase', itemId} and the server validates
// the id, the price and the unlock condition (champion frame), then records a
// duplicate-safe row in coin_spends. The catalog data must stay in parity with
// src/lib/shop.ts — tests/catalog-parity.test.ts cross-checks ids + prices.
//
// Rarity is cosmetic metadata (no pay-to-win: nothing here affects XP,
// rating or answers — frames/name styles/themes are visual only).

export type CatalogCategory = 'frame' | 'avatar' | 'title' | 'nameColor' | 'nameFx' | 'bg';
export type CatalogRarity = 'oddiy' | 'saralangan' | 'premium' | 'afsonaviy';
export type CatalogKind = 'rental' | 'permanent' | 'unlock';

export interface CatalogItem {
  id: string;
  name: string;
  price: number; // Coins; 0 for unlock-condition items
  kind: CatalogKind; // rental = 7-day, permanent = forever, unlock = earned (never bought)
  category: CatalogCategory;
  rarity: CatalogRarity;
  unlock?: 'champion'; // champion-only item (place 1 of the weekly championship)
}

// NOTE: ids + prices of the legacy items MUST match src/lib/shop.ts.
export const CATALOG: CatalogItem[] = [
  // --- frames (7-day rental) ---
  { id: 'frame-bronze', name: 'Bronza ramka', price: 35, kind: 'rental', category: 'frame', rarity: 'oddiy' },
  { id: 'frame-silver', name: 'Kumush ramka', price: 100, kind: 'rental', category: 'frame', rarity: 'oddiy' },
  { id: 'frame-neon-blue', name: 'Neon moviy', price: 180, kind: 'rental', category: 'frame', rarity: 'saralangan' },
  { id: 'frame-neon-pink', name: 'Neon pushti', price: 180, kind: 'rental', category: 'frame', rarity: 'saralangan' },
  { id: 'frame-gold', name: 'Oltin ramka', price: 270, kind: 'rental', category: 'frame', rarity: 'premium' },
  { id: 'frame-circuit', name: 'Mikrosxema', price: 300, kind: 'rental', category: 'frame', rarity: 'premium' },
  { id: 'frame-frost', name: 'Ayoz', price: 300, kind: 'rental', category: 'frame', rarity: 'premium' },
  { id: 'frame-fire', name: 'Olov', price: 380, kind: 'rental', category: 'frame', rarity: 'premium' },
  { id: 'frame-aurora', name: 'Aurora', price: 420, kind: 'rental', category: 'frame', rarity: 'afsonaviy' },
  { id: 'frame-royal', name: 'Shoh ramka', price: 450, kind: 'rental', category: 'frame', rarity: 'afsonaviy' },
  // --- champion frame: earned only (weekly championship, place 1) ---
  { id: 'frame-champion', name: 'Chempion ramkasi', price: 0, kind: 'unlock', category: 'frame', rarity: 'afsonaviy', unlock: 'champion' },
  // --- avatars (permanent) ---
  { id: 'av-robot', name: 'Robot', price: 80, kind: 'permanent', category: 'avatar', rarity: 'oddiy' },
  { id: 'av-ghost', name: 'Arvoh', price: 80, kind: 'permanent', category: 'avatar', rarity: 'oddiy' },
  { id: 'av-alien', name: 'Kosmik do‘st', price: 100, kind: 'permanent', category: 'avatar', rarity: 'saralangan' },
  { id: 'av-wizard', name: 'Sehrgar', price: 120, kind: 'permanent', category: 'avatar', rarity: 'saralangan' },
  { id: 'av-dragon', name: 'Ajdar', price: 150, kind: 'permanent', category: 'avatar', rarity: 'premium' },
  { id: 'av-unicorn', name: 'Bir shox', price: 150, kind: 'permanent', category: 'avatar', rarity: 'premium' },
  { id: 'av-owl', name: 'Bilim burgasi', price: 120, kind: 'permanent', category: 'avatar', rarity: 'saralangan' },
  { id: 'av-dino', name: 'Dino', price: 180, kind: 'permanent', category: 'avatar', rarity: 'premium' },
  { id: 'av-hero', name: 'Qahramon', price: 200, kind: 'permanent', category: 'avatar', rarity: 'afsonaviy' },
  // --- titles (permanent) ---
  { id: 'title-stargazer', name: '⭐ Yulduz ovchisi', price: 120, kind: 'permanent', category: 'title', rarity: 'oddiy' },
  { id: 'title-scholar', name: '📚 Bilimdon', price: 150, kind: 'permanent', category: 'title', rarity: 'saralangan' },
  { id: 'title-explorer', name: '🧭 Kashfiyotchi', price: 150, kind: 'permanent', category: 'title', rarity: 'saralangan' },
  { id: 'title-sensei', name: '🎓 Sensei ustoz', price: 180, kind: 'permanent', category: 'title', rarity: 'premium' },
  { id: 'title-champion', name: '🏅 Kelajak chempioni', price: 200, kind: 'permanent', category: 'title', rarity: 'premium' },
  { id: 'title-legend', name: '👑 Afsonaviy o‘quvchi', price: 350, kind: 'permanent', category: 'title', rarity: 'afsonaviy' },
  // --- name colors (7-day rental) ---
  { id: 'nc-fire', name: 'Olov', price: 75, kind: 'rental', category: 'nameColor', rarity: 'oddiy' },
  { id: 'nc-ocean', name: 'Okean', price: 75, kind: 'rental', category: 'nameColor', rarity: 'oddiy' },
  { id: 'nc-neon', name: 'Neon', price: 75, kind: 'rental', category: 'nameColor', rarity: 'oddiy' },
  { id: 'nc-gold', name: 'Oltin', price: 75, kind: 'rental', category: 'nameColor', rarity: 'oddiy' },
  { id: 'nc-royal', name: 'Qiroyiy', price: 100, kind: 'rental', category: 'nameColor', rarity: 'saralangan' },
  { id: 'nc-rainbow', name: 'Kamalak', price: 100, kind: 'rental', category: 'nameColor', rarity: 'saralangan' },
  // --- name effects (7-day rental) ---
  { id: 'nfx-outline', name: 'Kontur', price: 75, kind: 'rental', category: 'nameFx', rarity: 'oddiy' },
  { id: 'nfx-shadow', name: 'Uzun soya', price: 75, kind: 'rental', category: 'nameFx', rarity: 'oddiy' },
  { id: 'nfx-underline', name: 'Chizgi', price: 75, kind: 'rental', category: 'nameFx', rarity: 'oddiy' },
  { id: 'nfx-neon', name: 'Neon nur', price: 75, kind: 'rental', category: 'nameFx', rarity: 'saralangan' },
  { id: 'nfx-glow', name: 'Nur halosi', price: 100, kind: 'rental', category: 'nameFx', rarity: 'saralangan' },
  // --- profile backgrounds (permanent unlock of a BgStyle) ---
  { id: 'bg-aurora', name: 'Aurora foni', price: 250, kind: 'permanent', category: 'bg', rarity: 'premium' },
  { id: 'bg-nebula', name: 'Nebula foni', price: 250, kind: 'permanent', category: 'bg', rarity: 'premium' },
];

export const catalogItem = (id: string): CatalogItem | undefined => CATALOG.find((i) => i.id === id);

/** Items visible in the shop (unlock-condition items appear only when earned). */
export const BUYABLE = CATALOG.filter((i) => i.kind !== 'unlock');
