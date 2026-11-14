// Client helpers for the friendly-battle matchmaking API (/api/battle) and the
// leaderboard (/api/leaderboard). Everything degrades gracefully: if the endpoints are
// not deployed or the server has no database, the UI falls back to Lingo AI battles
// and a local-only leaderboard notice.
import { BASE } from './api';
import { tgInitData } from './telegram';
import type { Quiz } from '../types';

const headers = () => ({ 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() });

/**
 * Fetch with a hard timeout. Without this a hung request on a slow mobile network blocked the
 * sync loop (and thus the heartbeat) for 30s+ — the opponent then "forfeited" us and the duel
 * ended 0:0 before the first question (user report: "ulandi lekin sekin").
 */
async function fetchT(url: string, init?: RequestInit, ms = 8000): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}

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
  oppId?: string; // opponent's user id — opens their public profile
  oppAvatar?: string;
  oppRating?: number;
  meScore?: number;
  oppScore?: number;
  winner: 'me' | 'opp' | 'draw' | null;
  myDelta?: number;
  aborted?: boolean; // finished with zero answers (connection issue) — rating untouched
  createdAt: string;
}

export interface OpenChallenge {
  id: string;
  uid: string; // challenger's user id — opens their public profile
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

let probeCache: { value: boolean; at: number } | null = null;
// A FALSE probe used to be cached for the whole session: one network hiccup at app open
// ("unreachable") disabled the "Raqib topish" button until a full reload. Negative results
// now expire after 15s so the lobby recovers by itself; a positive result stays cached.
const PROBE_NEG_TTL_MS = 15_000;

function cachedProbe(): boolean | null {
  if (!probeCache) return null;
  if (probeCache.value) return true;
  return Date.now() - probeCache.at < PROBE_NEG_TTL_MS ? false : null;
}

/** True when the battle API + database are configured on the server. */
export async function battleAvailable(force = false): Promise<boolean> {
  const cached = cachedProbe();
  if (cached !== null && !force) return cached;
  try {
    const r = await fetchT(`${BASE}/api/battle`, { headers: { Accept: 'application/json' } }, 4000);
    probeCache = { value: r.ok ? (await r.json())?.enabled === true : false, at: Date.now() };
  } catch {
    probeCache = { value: false, at: Date.now() };
  }
  return probeCache.value;
}

/** Probe + the exact reason when offline (missing env names come from the server's `why` field). */
export interface BattleProbe {
  enabled: boolean;
  /** null = online; otherwise short machine codes / env var names for the banner. */
  missing: string[] | null;
}

export async function battleProbe(force = false): Promise<BattleProbe> {
  const cached = cachedProbe();
  if (cached !== null && !force) return { enabled: cached, missing: cached ? null : ['cached_offline'] };
  try {
    const r = await fetchT(`${BASE}/api/battle`, { headers: { Accept: 'application/json' } }, 4000);
    if (!r.ok) {
      const missing = r.status === 404 ? ['deploy_404'] : [`http_${r.status}`];
      probeCache = { value: false, at: Date.now() };
      return { enabled: false, missing };
    }
    const j = (await r.json()) as { enabled?: boolean; why?: { missing?: string[] } | null };
    probeCache = { value: j.enabled === true, at: Date.now() };
    if (probeCache.value) return { enabled: true, missing: null };
    return { enabled: false, missing: j.why?.missing?.length ? j.why.missing : ['enabled_false'] };
  } catch {
    probeCache = { value: false, at: Date.now() };
    return { enabled: false, missing: ['unreachable'] };
  }
}

/** Uzbek one-liner for the offline banner, from the probe's `missing` list. */
export function battleOfflineHint(missing: string[] | null): string | null {
  if (!missing || missing.length === 0) return null;
  if (missing.includes('deploy_404')) return 'API topilmadi (404): ilova aynan Vercel domeni orqali ochilishi kerak (npm run dev yoki boshqa sayt emas).';
  if (missing.includes('unreachable')) return 'Serverga ulanib bo‘lmadi — internetni yoki domenni tekshiring.';
  if (missing.includes('enabled_false')) return 'Server ishlayapti, lekin o‘yin sozlanmagan (eski deploy?). Redeploy qiling.';
  if (missing.includes('http_503')) return 'Server sozlanmagan (not_configured).';
  const envs = missing.filter((m) => /^[A-Z_]+$/.test(m));
  if (envs.length) return `Serverda yetishmayapti: ${envs.join(', ')} — Vercel → Settings → Environment Variables’ga qo‘shib, keyin Redeploy qiling.`;
  return null;
}

export async function listChallenges(): Promise<OpenChallenge[]> {
  const j = await json<{ list: OpenChallenge[] }>(await fetchT(`${BASE}/api/battle?action=list`, { headers: headers() }));
  return j.list ?? [];
}

export async function openChallenge(questions: Quiz[], me: BattleMe): Promise<BattleView> {
  return json<{ battle: BattleView }>(
    await fetchT(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'open', questions, ...me }) }),
  ).then((j) => j.battle);
}

export async function joinChallenge(id: string, me: BattleMe): Promise<BattleView> {
  return json<{ battle: BattleView }>(
    await fetchT(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'join', id, ...me }) }),
  ).then((j) => j.battle);
}

export async function submitScore(id: string, score: number): Promise<BattleView> {
  return json<{ battle: BattleView }>(
    await fetchT(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'submit', id, score }) }),
  ).then((j) => j.battle);
}

export async function getBattle(id: string): Promise<BattleView | null> {
  const j = await json<{ battle: BattleView | null }>(await fetchT(`${BASE}/api/battle?action=get&id=${encodeURIComponent(id)}`, { headers: headers() }));
  return j.battle;
}

export async function cancelChallenge(id: string): Promise<void> {
  await fetchT(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'cancel', id }) }).catch(() => undefined);
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
  aborted?: boolean; // finished with zero answers — rating untouched, UI shows a neutral screen
}

export type SyncResult = LiveSync | { legacy: true };

export const isLegacySync = (r: SyncResult): r is { legacy: true } => (r as { legacy?: boolean }).legacy === true;

/** Polls the round state (~1.2 s during a duel). Doubles as a presence heartbeat. */
export async function syncPvp(id: string): Promise<SyncResult> {
  const j = await json<{ live: SyncResult }>(
    await fetchT(`${BASE}/api/battle?action=sync&id=${encodeURIComponent(id)}`, { headers: headers() }),
  );
  return j.live;
}

/** Sends my answer for the current round; the server decides the point and advances the round. */
export async function answerPvp(id: string, round: number, correct: boolean, t: number, choice?: number): Promise<SyncResult> {
  const j = await json<{ live: SyncResult }>(
    await fetchT(`${BASE}/api/battle`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'answer', id, round, correct: correct ? 1 : 0, choice, t }),
    }),
  );
  return j.live;
}

/** Leaves an active battle — counts as a loss, the opponent gets the win. */
export async function forfeitPvp(id: string): Promise<void> {
  await fetchT(`${BASE}/api/battle`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'forfeit', id }), keepalive: true }).catch(() => undefined);
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
  xp: number;
  xpWeek: number;
  xpMonth: number;
}

export interface Leaderboards {
  me: string;
  /** Rating board (battle Elo) — the classic one. */
  list: LeaderRow[];
  /** XP earned in the last 7 days, best first. */
  weekly: LeaderRow[];
  /** XP earned in the last 30 days, best first. */
  monthly: LeaderRow[];
}

export async function fetchLeaderboard(): Promise<Leaderboards> {
  return json(await fetchT(`${BASE}/api/leaderboard`, { headers: headers() }, 10_000));
}
