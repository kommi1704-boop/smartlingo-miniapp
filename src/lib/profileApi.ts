// Client helpers for public student profiles (/api/profile).
// The server projects a sanitized view of the selected learner's EXISTING data;
// this module only fetches it and maps errors to diagnosable codes.
import { BASE } from './api';
import { tgInitData } from './telegram';

export interface PublicCollectible {
  kind: 'frame' | 'avatar' | 'title' | 'nameColor' | 'nameFx';
  id: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  frame?: string;
  nameColor?: string;
  nameFx?: string;
  title?: string;
  bg: string;
  xp: number;
  xpLevel: number;
  cefr?: string;
  streak: number;
  words: number;
  lessons: number;
  badges: { id: string; date: string }[];
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  rankGlobal: number | null;
  rankWeek: number | null;
  rankMonth: number | null;
  xpWeek: number;
  xpMonth: number;
  collectibles: PublicCollectible[];
  chestsOpened: number;
  lastActive: string | null;
}

const headers = () => ({ 'X-Telegram-Init-Data': tgInitData() });

export async function fetchPublicProfile(uid: string): Promise<PublicProfile> {
  if (!/^\d{1,15}$/.test(uid)) throw new Error('bad_uid');
  const r = await fetch(`${BASE}/api/profile?uid=${encodeURIComponent(uid)}`, { headers: headers() });
  if (!r.ok) {
    let code = `http_${r.status}`;
    try {
      const j = (await r.json()) as { error?: string };
      if (j?.error) code = String(j.error);
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  const j = (await r.json()) as { profile: PublicProfile | null };
  if (!j.profile) throw new Error('not_found');
  return j.profile;
}

export const profileNotConfigured = (e: unknown): boolean =>
  e instanceof Error && (e.message === 'not_configured' || e.message === 'http_503' || e.message === 'http_404');
