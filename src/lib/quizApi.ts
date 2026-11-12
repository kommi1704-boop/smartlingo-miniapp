// Client helpers for the Friend Quiz (/api/quiz). Everything degrades gracefully:
// when the endpoint is not deployed the UI explains how to enable it, exactly
// like the battle / billing helpers do.
import { BASE } from './api';
import { tgInitData } from './telegram';

const headers = () => ({ 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() });

async function fetchT(url: string, init?: RequestInit, ms = 10_000): Promise<Response> {
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

export const quizNotConfigured = (e: unknown): boolean =>
  e instanceof Error && (e.message === 'not_configured' || e.message === 'http_503' || e.message === 'http_404');

// ===== Probe / meta =====

export interface QuizMeta {
  enabled: boolean;
  botUsername?: string | null;
  categories?: string[];
  difficulties?: string[];
  sizes?: number[];
  costs?: Record<string, number>;
  cardThemeCost?: number;
  bank?: { vocab: number; grammar: number; total: number };
}

export async function quizAvailable(): Promise<boolean> {
  try {
    const r = await fetchT(`${BASE}/api/quiz`, { headers: { Accept: 'application/json' } }, 4000);
    return r.ok ? ((await r.json()) as QuizMeta).enabled === true : false;
  } catch {
    return false;
  }
}

/** Probe + the exact reason when offline (missing env names come from the server's `why` field). */
export interface QuizProbe {
  enabled: boolean;
  botUsername?: string | null;
  /** null = online; otherwise short machine codes / env var names for the banner. */
  missing: string[] | null;
}

export async function quizProbe(): Promise<QuizProbe> {
  try {
    const r = await fetchT(`${BASE}/api/quiz`, { headers: { Accept: 'application/json' } }, 4000);
    if (!r.ok) return { enabled: false, missing: r.status === 404 ? ['deploy_404'] : [`http_${r.status}`] };
    const j = (await r.json()) as QuizMeta & { why?: { missing?: string[] } | null };
    if (j.enabled === true) return { enabled: true, botUsername: j.botUsername ?? null, missing: null };
    return { enabled: false, botUsername: null, missing: j.why?.missing?.length ? j.why.missing : ['enabled_false'] };
  } catch {
    return { enabled: false, missing: ['unreachable'] };
  }
}

/** Uzbek one-liner for the offline banner, from the probe's `missing` list. */
export function quizOfflineHint(missing: string[] | null): string | null {
  if (!missing || missing.length === 0) return null;
  if (missing.includes('deploy_404')) return 'API topilmadi (404): ilova aynan Vercel domeni orqali ochilishi kerak (npm run dev yoki boshqa sayt emas).';
  if (missing.includes('unreachable')) return 'Serverga ulanib bo‘lmadi — internetni yoki domenni tekshiring.';
  if (missing.includes('enabled_false')) return 'Server ishlayapti, lekin o‘yin sozlanmagan (eski deploy?). Redeploy qiling.';
  if (missing.includes('http_503')) return 'Server sozlanmagan (not_configured).';
  const envs = missing.filter((m) => /^[A-Z_]+$/.test(m));
  if (envs.length) return `Serverda yetishmayapti: ${envs.join(', ')} — Vercel → Settings → Environment Variables’ga qo‘shib, keyin Redeploy qiling.`;
  return null;
}

export async function fetchQuizMeta(): Promise<QuizMeta> {
  return json(await fetchT(`${BASE}/api/quiz?action=meta`, { headers: headers() }));
}

// ===== Types (mirror api/quiz.ts responses) =====

export interface QuizSummary {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  size: number;
  costCoins: number;
  status: string;
  createdAt: string;
}

export interface QuizDetail extends QuizSummary {
  creatorId: number;
  creatorName: string;
}

export interface PlayQuestion {
  id: string;
  q: string;
  options: string[];
}

export interface FullQuestion extends PlayQuestion {
  answer: number;
  explain: string;
  level?: string;
}

export interface Participant {
  playerId: number;
  name: string;
  avatar?: string;
  score: number;
  total: number;
  durationMs: number;
  at: string;
}

export interface MyAttempt {
  score: number;
  total: number;
  answers: number[];
  durationMs: number;
  questions: FullQuestion[];
  at: string;
}

export interface QuizGetResponse {
  quiz: QuizDetail;
  questions?: PlayQuestion[];
  participants: Participant[];
  myAttempt?: MyAttempt;
  role: 'creator' | 'player';
  cardThemeCost: number;
}

export interface CreateResponse {
  quiz: QuizSummary;
  existing?: boolean;
}

export interface SubmitResult {
  score: number;
  total: number;
  durationMs: number;
  questions: FullQuestion[];
  answers: number[];
}

// ===== Calls =====

export async function fetchQuiz(id: string): Promise<QuizGetResponse> {
  return json(await fetchT(`${BASE}/api/quiz?action=get&id=${encodeURIComponent(id)}`, { headers: headers() }));
}

export async function fetchMyQuizzes(): Promise<{ created: QuizSummary[]; attempts: { id: string; quizId: string; score: number; total: number; durationMs: number; createdAt: string; title: string; creator: string }[] }> {
  return json(await fetchT(`${BASE}/api/quiz?action=mine`, { headers: headers() }));
}

export interface CreateQuizInput {
  title: string;
  category: string;
  difficulty: string;
  size: 5 | 10;
  spendId?: string;
  creatorName?: string;
}

export async function createQuiz(input: CreateQuizInput): Promise<CreateResponse> {
  return json(
    await fetchT(`${BASE}/api/quiz`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'create', ...input }) }, 15_000),
  );
}

export async function submitQuiz(id: string, answers: number[], durationMs: number, playerName?: string, playerAvatar?: string): Promise<SubmitResult> {
  const r = await json<{ result: SubmitResult }>(
    await fetchT(
      `${BASE}/api/quiz`,
      {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'submit', id, answers, durationMs, playerName, playerAvatar }),
      },
      15_000,
    ),
  );
  return r.result;
}

export async function closeQuiz(id: string): Promise<void> {
  await fetchT(`${BASE}/api/quiz`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'close', id }) }).catch(() => undefined);
}

export async function journalCardPurchase(id: string, spendId: string): Promise<void> {
  await json(
    await fetchT(`${BASE}/api/quiz`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'card', id, theme: 'gold', spendId }) }),
  );
}

// ===== Deep links (reuse the bot username the server reports) =====

/** t.me/<bot>?start=quiz_<id> — the friend opens the bot, the bot shows the invitation. */
export function quizDeepLink(botUsername: string | null | undefined, quizId: string): string | null {
  if (!botUsername) return null;
  return `https://t.me/${botUsername}?start=quiz_${quizId}`;
}

/**
 * Resolves a quiz deep link from every place Telegram can deliver it:
 *  - a web_app button carrying ?fq=<id> (bot invitation / notification buttons)
 *  - the direct-link start_param (?startapp=quiz_<id>)
 *  - the hash route itself (#/friendquiz/play/<id>)
 * Returns the quiz id (fq_...) or null.
 */
export function resolveQuizDeepLink(): string | null {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('fq');
    if (fromQuery && /^fq_[0-9a-z_]{3,50}$/i.test(fromQuery)) return fromQuery;
    const w = window.Telegram?.WebApp;
    const sp = w?.initDataUnsafe?.start_param;
    if (sp) {
      const m = /^quiz_(fq_[0-9a-z_]{3,50})$/i.exec(sp.trim());
      if (m) return m[1];
      if (/^fq_[0-9a-z_]{3,50}$/i.test(sp.trim())) return sp.trim();
    }
    const h = window.location.hash;
    const m2 = /#\/friendquiz\/(?:play|view)\/(fq_[0-9a-z_]{3,50})/i.exec(h);
    if (m2) return m2[1];
  } catch {
    /* ignore */
  }
  return null;
}

// ===== Local draft (refresh recovery) =====
// Answers are cached on the device while the friend is mid-quiz; a refresh
// restores the exact position instead of restarting the attempt.

const DRAFT_KEY = (quizId: string) => `smartlingo:fq-draft:${quizId}`;

export interface QuizDraft {
  quizId: string;
  idx: number;
  picks: number[];
  startedAt: number;
  savedAt: number;
}

export function saveDraft(d: QuizDraft): void {
  try {
    window.localStorage.setItem(DRAFT_KEY(d.quizId), JSON.stringify({ ...d, savedAt: Date.now() }));
  } catch {
    /* private mode — the attempt still works, just without refresh recovery */
  }
}

export function loadDraft(quizId: string): QuizDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY(quizId));
    if (!raw) return null;
    const d = JSON.parse(raw) as QuizDraft;
    return d && d.quizId === quizId && Array.isArray(d.picks) ? d : null;
  } catch {
    return null;
  }
}

export function clearDraft(quizId: string): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY(quizId));
  } catch {
    /* ignore */
  }
}
