// Premium avatar art — AI-generated character portraits (Pixar-style, brand
// indigo/violet), bundled as tiny 256px WebP files (~5-15KB each).
//
// The equipped avatar value stays a STRING (the emoji char) everywhere — the
// server leaderboard rows, the shop and saved states do not change. This map
// just upgrades the RENDERING: wherever an avatar emoji has premium art, the
// image is shown instead of the platform emoji. Works for every user in
// leaderboards too, because the synced value is still the same emoji char.
import robot from '../assets/avatars/robot.webp';
import ghost from '../assets/avatars/ghost.webp';
import alien from '../assets/avatars/alien.webp';
import wizard from '../assets/avatars/wizard.webp';
import dragon from '../assets/avatars/dragon.webp';
import unicorn from '../assets/avatars/unicorn.webp';
import owl from '../assets/avatars/owl.webp';
import dino from '../assets/avatars/dino.webp';
import hero from '../assets/avatars/hero.webp';
import { PREMIUM_AVATARS } from './shop';

// keyed by the avatar's emoji char (unique per premium avatar)
const BY_ID: Record<string, string> = {
  'av-robot': robot, 'av-ghost': ghost, 'av-alien': alien, 'av-wizard': wizard,
  'av-dragon': dragon, 'av-unicorn': unicorn, 'av-owl': owl, 'av-dino': dino, 'av-hero': hero,
};

const EMOJI_TO_ART = new Map<string, string>(
  PREMIUM_AVATARS.map((a) => [a.emoji, BY_ID[a.id]] as const).filter(([, art]) => !!art),
);

/** Art for an avatar value (emoji char), or undefined for plain emoji avatars. */
export function avatarArtFor(emoji: string | undefined | null): string | undefined {
  if (!emoji) return undefined;
  return EMOJI_TO_ART.get(emoji);
}
