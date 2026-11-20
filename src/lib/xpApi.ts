// Client for the server-authoritative reward engine (/api/xp).
//
// The server decides every XP amount; this module only reports actions and
// applies what the server granted. When the API is unreachable or not
// configured (no Supabase env), callers fall back to the legacy offline
// behavior — XpUnavailable makes that explicit instead of hiding errors.
import { tg } from './telegram';

const BASE = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE ?? '';

export class XpUnavailable extends Error {}

export interface XpSummaryDto {
  xpTotal: number;
  xpWeek: number;
  weekStart: string;
  streak: { current: number; longest: number; lastDay: string | null; freezes: number };
}

export interface GrantResponse {
  granted: number;
  summary?: XpSummaryDto;
  milestone?: { milestone: number; record: boolean } | null;
  capped?: boolean;
  duplicate?: boolean;
  ok?: boolean;
  reason?: string;
  correct?: number;
}

export interface PlacementResultDto {
  level: string;
  confidence: 'low' | 'medium' | 'high';
  total: number;
  asked: number;
  groups: { level: string; correct: number; asked: number; passed: boolean }[];
  skills: { section: string; correct: number; asked: number; accuracy: number; verdict: string }[];
  strengths: string[];
  weaknesses: string[];
  flags: string[];
  advice: Record<string, string>;
  bySection: Record<string, { correct: number; asked: number }>;
}

export interface DiscoveryItemDto {
  kind: string;
  title: string;
  text: string;
  emoji: string;
  label: string;
  cta?: string;
  quiz?: { q: string; options: string[]; answer: number; explain?: string };
}

function headers(): Record<string, string> {
  return { 'content-type': 'application/json', 'X-Telegram-Init-Data': tg()?.initData ?? '' };
}

async function post<T>(body: Record<string, unknown>, timeoutMs = 20_000): Promise<T> {
  const r = await fetch(`${BASE}/api/xp`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    if (r.status === 503 || j.error === 'not_configured') throw new XpUnavailable('xp_not_configured');
    if (r.status === 401) throw new XpUnavailable('unauthorized');
    throw new Error(j.error ?? `http_${r.status}`);
  }
  return (await r.json()) as T;
}

async function get<T>(k: string, timeoutMs = 20_000): Promise<T> {
  const r = await fetch(`${BASE}/api/xp?k=${encodeURIComponent(k)}`, { headers: headers(), signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    if (r.status === 503 || j.error === 'not_configured') throw new XpUnavailable('xp_not_configured');
    if (r.status === 401) throw new XpUnavailable('unauthorized');
    throw new Error(j.error ?? `http_${r.status}`);
  }
  return (await r.json()) as T;
}

let availableCache: { value: boolean; until: number } | null = null;

/** Cheap probe with a 10-min negative cache (the settings screen uses this). */
export async function xpAvailable(): Promise<boolean> {
  if (availableCache && availableCache.until > Date.now()) return availableCache.value;
  try {
    const r = await fetch(`${BASE}/api/xp`, { signal: AbortSignal.timeout(6000) });
    const j = (await r.json().catch(() => ({}))) as { enabled?: boolean };
    const ok = j.enabled === true;
    availableCache = { value: ok, until: Date.now() + 10 * 60_000 };
    return ok;
  } catch {
    availableCache = { value: false, until: Date.now() + 60_000 };
    return false;
  }
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export interface VocabAnswerItem {
  id: string;
  known: boolean;
  ctx: 'quiz' | 'match' | 'cards';
}

export const xpApi = {
  me: () => get<{ summary: XpSummaryDto; week: { start: string; end: string; daysLeft: number }; isChampion: boolean }>('me'),
  championship: () =>
    get<{
      week: { start: string; end: string; daysLeft: number };
      standings: { rank: number; uid: number; xp: number; name: string; me: boolean }[];
      me: { uid: number; xp: number; rank: number | null; provisional: boolean };
      champions: { week: string; winners: { rank: number; uid: number; xp: number; name: string }[] }[];
      isChampion: boolean;
    }>('championship'),

  vocabAnswers: (items: VocabAnswerItem[]) => post<GrantResponse & { evidence?: { id: string; correct: number; wrong: number }[] }>({ action: 'vocab_answers', items }),
  vocabLearned: (word: string) => post<GrantResponse>({ action: 'vocab_learned', word }),
  matching: (errors: number, items: VocabAnswerItem[]) => post<GrantResponse>({ action: 'matching', errors, items }),
  lessonDone: (lessonKey: string, score: number, total: number) => post<GrantResponse>({ action: 'lesson_done', lessonKey, score, total }),

  placementNext: (selfLevel: string, answers: { id: string; picked: number }[]) =>
    post<{ done: false; questions: { id: string; level: string; section: string; passage?: string; q: string; options: string[] }[]; group: string; answeredCount: number } | { done: true; result: PlacementResultDto; granted: number; summary?: XpSummaryDto; milestone?: { milestone: number; record: boolean } | null }>(
      { action: 'placement_next', selfLevel, answers },
      25_000,
    ),

  discoveryGet: (level: string, interests: string[]) =>
    post<{ day: string; item: DiscoveryItemDto; completed: boolean }>({ action: 'discovery_get', level, interests }),
  discoveryDone: (day: string) => post<GrantResponse & { ok: boolean }>({ action: 'discovery_done', day }),

  purchase: (itemId: string) => post<{ ok: boolean; journal: boolean }>({ action: 'purchase', itemId }),
};

// ---------------------------------------------------------------------------
// In-memory session stats (Dashboard header/preview) — refreshed on demand.
// ---------------------------------------------------------------------------

export interface ServerStats {
  summary: XpSummaryDto;
  week: { start: string; end: string; daysLeft: number };
  isChampion: boolean;
  at: number;
}

let statsCache: ServerStats | null = null;
const listeners = new Set<() => void>();

export function cachedServerStats(): ServerStats | null {
  return statsCache && Date.now() - statsCache.at < 5 * 60_000 ? statsCache : null;
}

export function subscribeServerStats(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Fetches (or reuses) the verified stats for this session. Silent on failure. */
export async function refreshServerStats(): Promise<ServerStats | null> {
  try {
    const data = await xpApi.me();
    statsCache = { summary: data.summary, week: data.week, isChampion: data.isChampion, at: Date.now() };
    listeners.forEach((fn) => fn());
    return statsCache;
  } catch {
    return null;
  }
}
