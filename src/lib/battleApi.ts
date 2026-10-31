// Client helpers for the friendly-battle matchmaking API (/api/battle) and the
// leaderboard (/api/leaderboard). Everything degrades gracefully: if the endpoints are
// not deployed or the server has no database, the UI falls back to Lingo AI battles
// and a local-only leaderboard notice.
import { BASE } from './api';
import { tgInitData } from './telegram';
import type { Quiz } from '../types';

const headers = () => ({ 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() });

async function json<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let code = `http_${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) code = String(j.error);
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  return (await r.json()) as T;
}

export const notConfigured = (e: unknown): boolean =>
  e instanceof Error && (e.message === 'not_configured' || e.message === 'http_503' || e.message === 'http_404');

// ===== Battle =====

export interface BattleView {
  id: string;
  status: 'open' | 'active' | 'finished';
  me: 'p1' | 'p2';
  questions?: Quiz[];
  oppName: string;
  oppAvatar?: string;
  oppRating?: number;
  meScore?: number;
  oppScore?: number;
  winner: 'me' | 'opp' | 'draw' | null;
  myDelta?: number;
  createdAt: string;
}

export interface OpenChallenge {
  id: string;
  name: string;
  rating: number;
  avatar?: string;
  createdAt: string;
}

export interface BattleMe {
  rating: number;
  name: string;
  avatar?: string;
}

let probeCache: boolean | null = null;

/** True when the battle API + database are configured on the server. */
export async function battleAvailable(force = false): Promise<boolean> {
  if (probeCache !== null && !force) return probeCache;
  try {
    const r = await fetch(`${BASE}/api/battle`, { headers: { Accept: 'application/json' } });
    probeCache = r.ok ? (await r.json())?.enabled === true : false;
  } catch {
    probeCache = false;
  }
  return probeCache;
}

export async function listChallenges(): Promise<OpenChallenge[]> {
  const j = await json<{ list: OpenChallenge[] }>(await fetch(`${BASE}/api/battle?action=list`, { headers: headers() }));
  return j.list ?? [];
}

export async function openChallenge(questions: Quiz[], me: BattleMe): Promise<BattleView> {
  return json<{ battle: BattleView }>(
    await fetch(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'open', questions, ...me }) }),
  ).then((j) => j.battle);
}

export async function joinChallenge(id: string, me: BattleMe): Promise<BattleView> {
  return json<{ battle: BattleView }>(
    await fetch(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'join', id, ...me }) }),
  ).then((j) => j.battle);
}

export async function submitScore(id: string, score: number): Promise<BattleView> {
  return json<{ battle: BattleView }>(
    await fetch(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'submit', id, score }) }),
  ).then((j) => j.battle);
}

export async function getBattle(id: string): Promise<BattleView | null> {
  const j = await json<{ battle: BattleView | null }>(await fetch(`${BASE}/api/battle?action=get&id=${encodeURIComponent(id)}`, { headers: headers() }));
  return j.battle;
}

export async function cancelChallenge(id: string): Promise<void> {
  await fetch(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'cancel', id }) }).catch(() => undefined);
}

// ===== Leaderboard =====

export interface LeaderRow {
  id: string;
  name: string;
  avatar?: string;
  frame?: string;
  rating: number;
  wins: number;
  draws?: number;
  losses: number;
  delta: number;
}

export async function fetchLeaderboard(): Promise<{ me: string; list: LeaderRow[] }> {
  return json(await fetch(`${BASE}/api/leaderboard`, { headers: headers() }));
}
