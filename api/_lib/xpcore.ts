// Central XP / streak / championship core — the server-side reward engine.
//
// Everything here is authoritative: the browser never decides how much XP an
// action is worth. XP is written ONLY through the grant_xp RPC (schema-2.0.sql)
// which is idempotent (deterministic event key), per-source daily-capped and
// updates the streak atomically. Notification milestones are returned so the
// caller can send them through the regular dispatcher.
//
// Pure functions (streakStep, weekMonday, tashkentDay, xpForMatching) are
// unit-tested in tests/xp.test.ts — they mirror the SQL in schema-2.0.sql
// (streak_touch / week_monday) and the two must stay in sync.
import type { DbCtx } from './notify.js';

// ---------------------------------------------------------------------------
// Day math — Asia/Tashkent (UTC+5, no DST) is the canonical server day.
// ---------------------------------------------------------------------------

export function tashkentDay(ts: number = Date.now()): string {
  return new Date(ts + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Monday (Tashkent) of the week containing `day` — the championship window. */
export function weekMonday(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  const dow = d.getUTCDay() === 0 ? 7 : d.getUTCDay(); // ISO: Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() - (dow - 1));
  return d.toISOString().slice(0, 10);
}

export function shiftDay(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Streak engine (pure) — mirrors public.streak_touch() in schema-2.0.sql.
// ---------------------------------------------------------------------------

export interface StreakRow {
  current: number;
  longest: number;
  last_day: string | null;
  freezes: number;
}

export interface StreakStep {
  current: number;
  longest: number;
  last_day: string;
  extended: boolean;
  freezeUsed: boolean;
}

/**
 * "Yesterday's status must never be displayed as today's": the streak only
 * advances when a qualifying activity happens ON the new day. Multiple grants
 * on the same day extend it once. A whole missed day resets it, unless a
 * streak freeze covers exactly the one missed day.
 */
export function streakStep(row: StreakRow, day: string): StreakStep {
  const cur = row.current ?? 0;
  const last = row.last_day;
  if (last && last >= day) {
    // already practiced today (or out-of-order day) — nothing changes
    return { current: cur, longest: Math.max(row.longest ?? 0, cur), last_day: last, extended: false, freezeUsed: false };
  }
  let current = 1;
  let freezeUsed = false;
  if (last) {
    const gap = (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / 86_400_000;
    if (gap === 1) current = cur + 1;
    else if (gap === 2 && (row.freezes ?? 0) > 0) {
      current = cur + 1;
      freezeUsed = true;
    } else current = 1; // bigger gap: reset
  }
  const longest = Math.max(row.longest ?? 0, current);
  return { current, longest, last_day: day, extended: true, freezeUsed };
}

/** Streak lengths celebrated with a one-time bonus (idempotent per milestone). */
export const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

// ---------------------------------------------------------------------------
// XP rules — every verified source, its amount and daily cap.
// ---------------------------------------------------------------------------

export const XP_RULES = {
  vocabQuiz: { amount: 2, cap: 30, source: 'vocab' }, // one correct recall answer
  vocabLearned: { amount: 3, cap: 30, source: 'vocab' }, // "O'rganildi" with evidence
  vocabMatch: { cap: 20, source: 'vocab' }, // amount = xpForMatching(errors)
  lessonDay: { amount: 5, cap: 40, source: 'lesson' },
  lessonPerfect: { amount: 5, cap: 40, source: 'lesson' }, // same-day bonus
  lessonFirst: { amount: 20, cap: 40, source: 'lesson' },
  placement: { amount: 20, cap: 20, source: 'placement' },
  discovery: { amount: 10, cap: 10, source: 'discovery' },
  battleWin: { amount: 5, cap: 15, source: 'battle' },
  battleDraw: { amount: 3, cap: 15, source: 'battle' },
  battleLoss: { amount: 2, cap: 15, source: 'battle' },
  milestone: { amount: 25, cap: 999, source: 'milestone' },
  champPrize: { amount: 0, cap: 999, source: 'champ_prize' }, // per-place amounts below
  legacy: { amount: 0, cap: 999, source: 'legacy' },
} as const;

export const CHAMP_PRIZES = [
  { place: 1, coins: 500, xp: 100 },
  { place: 2, coins: 250, xp: 50 },
  { place: 3, coins: 100, xp: 25 },
];

/** Verified PvP battles: winner 5, draw 3, loser 2 (loser still earns for showing up). */
export function xpForBattle(result: 'win' | 'draw' | 'loss'): number {
  return result === 'win' ? XP_RULES.battleWin.amount : result === 'draw' ? XP_RULES.battleDraw.amount : XP_RULES.battleLoss.amount;
}

/** Matching game: fewer mistakes pay more, hard floor of 5. */
export function xpForMatching(errors: number): number {
  const e = Math.max(0, Math.min(20, Math.floor(errors) || 0));
  return Math.max(5, 20 - e * 2);
}

export const LEGACY_SEED_MAX = 100_000;

// ---------------------------------------------------------------------------
// RPC client — every call goes through schema-2.0.sql security-definer RPCs.
// ---------------------------------------------------------------------------

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

async function rpc<T>(db: DbCtx, fn: string, args: Record<string, unknown>): Promise<T | null> {
  try {
    const r = await fetch(`${db.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: sbHeaders(db.key),
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export interface GrantResult {
  granted: number;
  capped?: boolean;
  duplicate?: boolean;
  streak?: { current: number; longest: number; last_day: string; extended: boolean; freeze_used: boolean; freezes: number };
}

export interface Ledger {
  url: string;
  key: string;
}

/** Awards XP and returns how much was actually granted (0 = duplicate/capped/offline). */
export async function grantXp(db: Ledger, uid: number, event: string, source: string, amount: number, cap?: number, touchStreak = true): Promise<GrantResult | null> {
  if (!db?.url || !db?.key || !Number.isInteger(uid) || uid <= 0 || amount <= 0) return null;
  return rpc<GrantResult>(db, 'grant_xp', { p_uid: uid, p_amount: amount, p_event: event, p_source: source, p_day_cap: cap ?? null, p_touch_streak: touchStreak });
}

export interface XpSummary {
  xpTotal: number;
  xpWeek: number;
  weekStart: string;
  streak: { current: number; longest: number; lastDay: string | null; freezes: number };
}

export async function xpSummary(db: Ledger, uid: number): Promise<XpSummary | null> {
  const j = await rpc<Record<string, unknown>>(db, 'xp_summary', { p_uid: uid });
  if (!j) return null;
  const s = (j.streak ?? {}) as Record<string, unknown>;
  return {
    xpTotal: Number(j.xpTotal) || 0,
    xpWeek: Number(j.xpWeek) || 0,
    weekStart: String(j.weekStart ?? ''),
    streak: {
      current: Number(s.current) || 0,
      longest: Number(s.longest) || 0,
      lastDay: (s.lastDay as string | null) ?? null,
      freezes: Number(s.freezes) || 0,
    },
  };
}

export async function champTop(db: Ledger, week: string, limit = 50): Promise<{ uid: number; xp: number }[]> {
  const j = await rpc<{ uid: number; xp: number }[]>(db, 'champ_top', { p_week: week, p_limit: limit });
  return Array.isArray(j) ? j.map((r) => ({ uid: Number(r.uid), xp: Number(r.xp) || 0 })) : [];
}

export interface ChampWinner {
  place: number;
  uid: number;
  xp: number;
  prizes: { coins: number; xp: number; frame: string | null };
}

export async function champSettle(db: Ledger, week: string): Promise<{ settled: boolean; winners: ChampWinner[] } | null> {
  const j = await rpc<{ settled: boolean; winners: ChampWinner[] }>(db, 'champ_settle', { p_week: week });
  if (!j) return null;
  return {
    settled: j.settled === true,
    winners: Array.isArray(j.winners)
      ? j.winners.map((w) => ({
          place: Number(w.place),
          uid: Number(w.uid),
          xp: Number(w.xp) || 0,
          prizes: (w.prizes ?? { coins: 0, xp: 0, frame: null }) as ChampWinner['prizes'],
        }))
      : [],
  };
}

export async function xpTopDays(db: Ledger, from: string, to: string, limit = 100): Promise<Map<number, number>> {
  const j = await rpc<{ uid: number; xp: number }[]>(db, 'xp_top_days', { p_from: from, p_to: to, p_limit: limit });
  const map = new Map<number, number>();
  if (Array.isArray(j)) for (const r of j) map.set(Number(r.uid), Number(r.xp) || 0);
  return map;
}

/** One-time legacy seed: the pre-ledger client XP becomes lifetime display XP (excluded from weekly/championship). */
export async function seedLegacyXp(db: Ledger, uid: number, clientXp: number): Promise<void> {
  const amount = Math.max(0, Math.min(LEGACY_SEED_MAX, Math.floor(Number(clientXp) || 0)));
  if (amount <= 0) return;
  await grantXp(db, uid, `legacy:${uid}`, 'legacy', amount);
}

// ---------------------------------------------------------------------------
// Event keys (sanitized again by grant_xp; kept short — id length limit 120).
// ---------------------------------------------------------------------------

export const events = {
  vocabQuiz: (day: string, word: string) => `vq:${day}:${word.slice(0, 48)}`,
  vocabLearned: (word: string) => `vl:${word.slice(0, 48)}`,
  vocabMatch: (day: string) => `vm:${day}`,
  lessonDay: (lessonKey: string, day: string) => `lesson:${lessonKey.slice(0, 60)}:${day}`,
  lessonPerfect: (lessonKey: string, day: string) => `lesson-perfect:${lessonKey.slice(0, 55)}:${day}`,
  lessonFirst: (lessonKey: string) => `lesson-first:${lessonKey.slice(0, 60)}`,
  placement: (day: string) => `placement:${day}`,
  discovery: (day: string) => `discovery:${day}`,
  battle: (battleId: string, result: 'win' | 'draw' | 'loss') => `bwl:${battleId.slice(0, 40)}:${result[0]}`,
  milestone: (n: number) => `sm:${n}`,
  champPrize: (week: string, place: number) => `cp:${week}:${place}`,
};
