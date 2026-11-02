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

// ===== Live duel (real-time rounds) =====

/** Compact per-round state from the server (action=sync / answer / forfeit). */
export interface LiveSync {
  round: number; // current question index
  roundStart: number | null; // server epoch ms when this question opened (future = countdown/reveal)
  serverNow: number;
  s1: number;
  s2: number;
  mine: { c: 0 | 1; t: number } | null; // my answer for the current round
  opp: { c: 0 | 1; t: number } | null; // opponent's answer (c=1 never lingers: a correct answer ends the round)
  status: 'open' | 'active' | 'finished';
  winner: 'me' | 'opp' | 'draw' | null;
  myDelta?: number;
  left: 'me' | 'opp' | null; // who abandoned the battle
}

export type SyncResult = LiveSync | { legacy: true };

export const isLegacySync = (r: SyncResult): r is { legacy: true } => (r as { legacy?: boolean }).legacy === true;

/** Polls the round state (~1.2 s during a duel). Doubles as a presence heartbeat. */
export async function syncPvp(id: string): Promise<SyncResult> {
  const j = await json<{ live: SyncResult }>(
    await fetch(`${BASE}/api/battle?action=sync&id=${encodeURIComponent(id)}`, { headers: headers() }),
  );
  return j.live;
}

/** Sends my answer for the current round; the server decides the point and advances the round. */
export async function answerPvp(id: string, round: number, correct: boolean, t: number): Promise<SyncResult> {
  const j = await json<{ live: SyncResult }>(
    await fetch(`${BASE}/api/battle`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'answer', id, round, correct: correct ? 1 : 0, t }),
    }),
  );
  return j.live;
}

/** Leaves an active battle — counts as a loss, the opponent gets the win. */
export async function forfeitPvp(id: string): Promise<void> {
  await fetch(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'forfeit', id }), keepalive: true }).catch(() => undefined);
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
