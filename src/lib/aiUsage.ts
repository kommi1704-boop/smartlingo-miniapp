// Client helpers for the AI endpoints (/api/writing-check, /api/explain-mistake, /api/generate-text).
// - attaches the verified Telegram initData header (the server checks the HMAC; no secret lives here)
// - keeps a LOCAL daily counter per feature so buttons can grey out early — the SERVER quota
//   (Supabase ai_usage) stays the source of truth and is enforced on every request
// - maps server error codes to short friendly Uzbek messages
import { BASE } from './api';
import { tgInitData } from './telegram';
import { today } from './dates';

/** Must mirror the DAILY_* limits inside the api/*.ts handlers. */
export const AI_LIMITS: Record<AiKind, number> = { 'writing-check': 5, 'explain-mistake': 10, 'generate-text': 3 };
export type AiKind = 'writing-check' | 'explain-mistake' | 'generate-text';

const usedKey = (kind: AiKind) => `sl.ai:${kind}:${today()}`;

function readUsed(kind: AiKind): number {
  try {
    return Number(window.localStorage.getItem(usedKey(kind)) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function aiUsedToday(kind: AiKind): number {
  return readUsed(kind);
}

export function aiLeftToday(kind: AiKind): number {
  return Math.max(0, AI_LIMITS[kind] - readUsed(kind));
}

function bumpLocal(kind: AiKind): void {
  try {
    window.localStorage.setItem(usedKey(kind), String(readUsed(kind) + 1));
  } catch {
    /* ignore */
  }
}

export class AiError extends Error {
  constructor(public code: string, public resetAt?: string) {
    super(code);
  }
}

/** POSTs to one of the AI endpoints. Throws AiError with the server's error code on failure. */
export async function aiPost<T>(kind: AiKind, path: string, body: unknown, opts: { countUsage?: boolean } = {}): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiError('net');
  }
  if (!r.ok) {
    let code = `http_${r.status}`;
    let resetAt: string | undefined;
    try {
      const j = (await r.json()) as { error?: string; resetAt?: string };
      if (j?.error) code = String(j.error);
      resetAt = j?.resetAt;
    } catch {
      /* ignore */
    }
    throw new AiError(code, resetAt);
  }
  const j = (await r.json()) as T;
  if (opts.countUsage !== false) bumpLocal(kind);
  return j;
}

/** Short Uzbek hint for any AI-endpoint failure (shown in toasts/notices). */
export function aiErrorHint(e: unknown): string {
  const code = e instanceof AiError ? e.code : e instanceof Error ? e.message : '';
  if (code === 'unauthorized') return 'Ilovani Telegram ichida oching — brauzerda ishlamaydi';
  if (code === 'not_configured') return 'Serverda AI kaliti (GROQ_API_KEY) sozlanmagan';
  if (code === 'daily_limit') return 'Bugungi limit tugadi — ertaga qayta urinib ko‘ring!';
  if (code === 'too_many_requests') return 'Juda tez so‘rov yuborildi — bir daqiqa kutib turing';
  if (code.startsWith('http_5') || code === 'ai_bad_output' || code.startsWith('upstream')) return 'AI hozir javob bermadi — keyinroq urinib ko‘ring';
  return 'Ulanish xatosi — internetni tekshirib ko‘ring';
}

// ---- XP gate: the writing AI check awards XP only for the FIRST check of a prompt per day ----
const xpKey = (promptId: string) => `sl.aiwxp:${promptId}`;

export function aiWritingXpAvailable(promptId: string): boolean {
  try {
    return window.localStorage.getItem(xpKey(promptId)) !== today();
  } catch {
    return true;
  }
}

export function markAiWritingXp(promptId: string): void {
  try {
    window.localStorage.setItem(xpKey(promptId), today());
  } catch {
    /* ignore */
  }
}

// ---- Interest chips (Feature: AI reading texts). The SAME list is enforced server-side in
// api/generate-text.ts. Max 5 chips per child; stored on the DEVICE only (never synced). ----
export const INTEREST_CHIPS = ['futbol', 'o\u2018yinlar', 'hayvonlar', 'kosmos', 'multfilmlar', 'texnologiya', 'musiqa', 'sayohat', 'ovqat', 'tabiat', 'sport', 'ilm-fan'] as const;
export const MAX_INTERESTS = 5;

/** Server normalizes apostrophe variants; we send the chip as-is (the server accepts both). */
export const interestLabel = (chip: string): string => chip;
