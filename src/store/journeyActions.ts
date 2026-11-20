// Daily Learning Journey — store slice + idempotent actions (Phase 12).
//
// Progress persistence rules (Phase 3):
//  - The generated SESSION CONTENT is frozen into the state when the day starts
//    (`journey.session`), so regenerating mid-day NEVER moves the goalposts:
//    refresh, offline hours, app restarts — the learner resumes exactly where
//    they stopped.
//  - Stage completion is idempotent locally (`done` flag) AND on the server
//    (every stage routes XP through the existing ledger actions whose grant_xp
//    RPCs dedupe by deterministic event key). Duplicate rewards are impossible.
//  - The session-completion bonus is one daily server key (journey-<date>:done)
//    — once per day even if the celebration replays.
//  - Leaving is always safe: the runner is never modal-trapped; progress is
//    saved on every step, not on "exit".

import { getState, setState } from './store';
import { today } from '../lib/dates';
import { buildJourney, journeyDoneKey, themeById, validateJourney, type BuildOpts } from '../lib/journey';
import { ttsAvailable } from '../lib/tts';
import { xpApi, XpUnavailable } from '../lib/xpApi';
import { record } from './actions';
import { showXp } from './ui';
import type { JourneyAiText, JourneySession, JourneyState, JourneyStageRun, PersistedState } from '../types';

const HISTORY_KEEP = 5;

/** The journey slice for the UI — generates today's session on first touch of the day.
 *  MUST be called from effects/handlers only (it writes state). */
export function ensureJourney(): JourneyState {
  const s0 = getState();
  const date = today();
  const cur = s0.journey;
  if (cur && cur.date === date && cur.themeId && cur.session) return cur;
  const session = buildJourney(s0, date, { tts: ttsAvailable() });
  const next: JourneyState = {
    date,
    themeId: session.themeId,
    session,
    stages: {},
    themeHistory: [...(cur?.themeHistory ?? []), session.themeId].slice(-HISTORY_KEEP),
    aiText: cur && cur.date === date ? cur.aiText ?? null : null,
  };
  setState((s) => ({ ...s, journey: next }));
  return next;
}

/**
 * PURE derivation for render: the frozen session for today with the cached AI
 * text merged in. Never writes state — safe inside components. Falls back to
 * a freshly built (validated) session when the stored one fails QC.
 */
export function sessionOf(s: PersistedState): JourneySession | null {
  const j = s.journey;
  const date = today();
  if (!j || j.date !== date || !j.session) return null;
  let session = j.session;
  if (!validateJourney(session, s) || session.themeId !== j.themeId) {
    session = buildJourney(s, date, { tts: ttsAvailable() });
  }
  return j.aiText ? applyAi(session, j.aiText) : session;
}

/**
 * Imperative variant (effects/handlers): ensures today's session exists and
 * returns it. Re-validated defensively — a corrupted save is rebuilt, never shown.
 */
export function journeySession(): JourneySession {
  ensureJourney();
  const s = getState();
  let session = s.journey?.session;
  if (!session || !validateJourney(session, s) || session.themeId !== s.journey?.themeId) {
    session = buildJourney(s, s.journey?.date ?? today(), { tts: ttsAvailable() });
    setState((st) => ({ ...st, journey: st.journey ? { ...st.journey, session } : st.journey }));
  }
  return s.journey?.aiText ? applyAi(session!, s.journey.aiText) : session!;
}

function applyAi(session: JourneySession, ai: JourneyAiText): JourneySession {
  const stages = session.stages.map((st) => {
    if (st.kind !== 'reading' || st.aiQuiz) return st;
    const quiz = ai.questions.slice(0, 4).map((q, i) => ({
      id: `ai-${session.date}-${i}`,
      q: q.q,
      options: q.options,
      answer: Math.max(0, Math.min(q.options.length - 1, q.answerIndex)),
      explain: 'AI matnga asoslangan savol — javob matnda bor.',
    }));
    return { ...st, title: `O‘qish: ${ai.title}`, desc: 'AI sizning qiziqishingizga mos yozgan matn', readingId: undefined, aiText: ai, aiQuiz: quiz };
  });
  return { ...session, stages };
}

/** Saves the AI reading text for today (called after a successful generate-text call). */
export function saveJourneyAiText(ai: JourneyAiText, interest: string): void {
  setState((s) => (s.journey && s.journey.date === today()
    ? { ...s, journey: { ...s.journey, aiText: { ...ai, interest } } }
    : s));
}

export function startJourney(): void {
  setState((s) => (s.journey && !s.journey.startedAt ? { ...s, journey: { ...s.journey, startedAt: new Date().toISOString() } } : s));
}

function patchStage(s: PersistedState, stageId: string, patch: Partial<JourneyStageRun>): PersistedState | null {
  if (!s.journey) return null;
  const cur: JourneyStageRun = s.journey.stages[stageId] ?? { done: false, score: 0, total: 0, xp: 0 };
  const stages = { ...s.journey.stages, [stageId]: { ...cur, ...patch } };
  const j: JourneyState = { ...s.journey, stages };
  const session = j.session;
  if (session && !j.finishedAt && session.stages.every((st) => stages[st.id]?.done)) {
    j.finishedAt = new Date().toISOString();
  }
  return { ...s, journey: j };
}

/**
 * Marks a stage completed — LOCAL progress only. Rewards flow through the
 * existing server paths; this never grants anything by itself.
 * Idempotent: a completed stage is silently ignored (double finish-safe).
 */
export function completeJourneyStage(stageId: string, score: number, total: number): { completed: boolean; first: boolean } {
  const s = getState();
  const cur = s.journey?.stages[stageId];
  if (cur?.done) return { completed: false, first: false };
  setState((st) => patchStage(st, stageId, { done: true, score: Math.max(0, score), total: Math.max(0, total), at: new Date().toISOString() }) ?? st);
  return { completed: true, first: true };
}

/** Records the XP the server actually granted for a stage (display + summary only). */
export function addJourneyStageXp(stageId: string, xp: number): void {
  if (xp <= 0) return;
  setState((st) => patchStage(st, stageId, { xp: (st.journey?.stages[stageId]?.xp ?? 0) + xp }) ?? st);
}

/** Marks a stage failed-but-seen? Not needed: stages may be retried; nothing is marked. */

/**
 * The once-per-day session-completion bonus. Server-keyed (journey-<date>:done),
 * so even a double click / stale tab cannot pay twice. Returns the granted XP
 * (0 when already claimed, capped, or offline).
 */
export async function claimJourneyBonus(): Promise<number> {
  const j = getState().journey;
  if (!j || j.bonusDone) return 0;
  const session = j.session;
  if (!session || !session.stages.every((st) => j.stages[st.id]?.done)) return 0;
  // a perfect session (every quiz-like stage fully correct) earns the +5 perfect bonus server-side
  const stageRuns = session.stages.map((st) => j.stages[st.id]).filter(Boolean) as JourneyStageRun[];
  const scored = stageRuns.filter((r) => r.total > 0);
  const allPerfect = scored.length > 0 && scored.every((r) => r.score === r.total);
  const score = allPerfect ? 5 : 4;
  try {
    const r = await xpApi.lessonDone(journeyDoneKey(j.date), score, 5);
    setState((st) => (st.journey && st.journey.date === j.date ? { ...st, journey: { ...st.journey, bonusDone: true } } : st));
    if (r.granted > 0) {
      record({ xp: r.granted });
      showXp(r.granted);
    }
    return r.granted;
  } catch (e) {
    if (!(e instanceof XpUnavailable)) console.warn('journey bonus failed', e);
    return 0; // offline: the learner can claim later — nothing is lost
  }
}

/** Celebration must play exactly once per completed session. */
export function markJourneyCelebrated(): void {
  setState((s) => (s.journey && !s.journey.celebrated ? { ...s, journey: { ...s.journey, celebrated: true } } : s));
}

/** UI helper: how many stages are done today. */
export function journeyDoneCount(j: JourneyState | null | undefined, session: JourneySession | null | undefined): number {
  if (!j || !session) return 0;
  return session.stages.filter((st) => j.stages[st.id]?.done).length;
}

/** The theme record for the current session (gradient + facts). */
export function journeyTheme() {
  const j = getState().journey;
  return themeById(j?.themeId ?? '');
}
