// Client for /api/roadmap: builds the privacy-safe profile payload, calls the endpoint and
// validates the response again on this side. If anything fails the caller falls back to the
// built-in rule-based roadmap — the screen NEVER breaks because AI was unavailable.
//
// PRIVACY: the payload contains aggregates only (see learnerDigestLines). Chat texts, essays and
// recordings never leave the device. Interest chips are appended ONLY with the learner's explicit
// consent (roadmapConsent(), default OFF), because the Profile page promises they stay on the phone.

import type { AiRoadmap, PersistedState } from '../types';
import { LEVELS } from '../types';
import { aiErrorHint, aiPost, type AiKind } from './aiUsage';
import { learnerDigestLines } from './learner';
import { today } from './dates';

const CONSENT_KEY = 'smartlingo:roadmap-interests';

export function roadmapConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setRoadmapConsent(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(CONSENT_KEY, '1');
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
}

/** FNV-1a hash — detects "the profile changed since the roadmap was generated". */
export function hashInputs(s: PersistedState): string {
  const lpKeys = (s.skills ? Object.entries(s.skills).map(([k, v]) => `${k}:${v?.level ?? '-'}`).sort().join('|') : '');
  const weak = (s.mistakes ?? []).filter((m) => !m.corrected).length;
  const raw = [
    s.profile?.estimatedLevel,
    s.profile?.targetLevel,
    s.profile?.dailyMinutes,
    s.profile?.goal,
    s.profile?.age,
    lpKeys,
    weak,
    today(),
  ].join('~');
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function buildPayload(s: PersistedState): string {
  const p = s.profile;
  if (!p) return '';
  const lines = learnerDigestLines(s);
  lines.push(`Kunlik o‘qish vaqti: ${p.dailyMinutes} daqiqa. Yosh: ${p.age}.`);
  const goalLine = lines.find((l) => l.startsWith('Maqsad:'));
  if (goalLine) {
    // learnerDigestLines already includes target; ensure the target level is explicit for parsing
    const idx = lines.indexOf(goalLine);
    lines[idx] = `Maqsad darajasi: ${p.targetLevel}. ${goalLine}`;
  } else {
    lines.push(`Maqsad darajasi: ${p.targetLevel}.`);
  }
  if (roadmapConsent() && p.interests?.length) lines.push(`Qiziqishlari (ota-ona roziligi bilan): ${p.interests.join(', ')}.`);
  return lines.join('\n');
}

/** Client-side schema validation, mirrors api/roadmap.ts parseRoadmap. */
function validate(j: unknown): { stages: AiRoadmap['stages']; note: string } | null {
  const root = j as { stages?: unknown; note?: unknown } | null;
  if (!root || !Array.isArray(root.stages) || root.stages.length < 2 || root.stages.length > 5) return null;
  const stages: AiRoadmap['stages'] = [];
  for (const st of root.stages.slice(0, 6)) {
    const o = (st ?? {}) as Record<string, unknown>;
    const level = typeof o.level === 'string' && LEVELS.includes(o.level as never) ? (o.level as AiRoadmap['stages'][number]['level']) : null;
    const weeks = Number(o.weeks);
    const okStr = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v.trim() : null;
    const okList = (v: unknown, min: number, max: number) =>
      Array.isArray(v) && v.filter((x) => typeof x === 'string' && x.trim()).length >= min ? v.slice(0, max).map((x) => String(x)) : null;
    const focus = okStr(o.focus, 200);
    const objectives = okList(o.objectives, 2, 4);
    const topics = okList(o.topics, 2, 6);
    const outcomes = okList(o.outcomes, 2, 4);
    const checkpoint = okStr(o.checkpoint, 300);
    const criteria = okStr(o.criteria, 300);
    if (!level || !focus || !objectives || !topics || !outcomes || !checkpoint || !criteria) return null;
    if (!Number.isFinite(weeks) || weeks < 1 || weeks > 52) return null;
    stages.push({ level, focus, weeks: Math.round(weeks), objectives, topics, outcomes, checkpoint, criteria });
  }
  const note = typeof root.note === 'string' ? root.note.slice(0, 240) : '';
  return { stages, note };
}

export const ROADMAP_AI_KIND: AiKind = 'explain-mistake'; // shares the gentlest daily quota bucket

/**
 * Asks the server for an AI roadmap. Throws an AiError on failure — the UI shows
 * aiErrorHint(e) and keeps the rule-based roadmap.
 */
export async function generateAiRoadmap(s: PersistedState): Promise<AiRoadmap> {
  const profile = buildPayload(s);
  if (!profile) throw new Error('no_profile');
  const j = await aiPost<unknown>(ROADMAP_AI_KIND, '/api/roadmap', { profile });
  const ok = validate(j);
  if (!ok) throw new Error('ai_bad_output');
  return {
    stages: ok.stages,
    note: ok.note,
    createdAt: new Date().toISOString(),
    inputsHash: hashInputs(s),
  };
}

export { aiErrorHint };
