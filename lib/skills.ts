// Skill-based CEFR estimation.
//
// RULES (important, by design):
//  - A skill that was never measured has level = null. The UI shows "not measured yet",
//    never a guessed value. Placement MCQs alone CANNOT certify listening/writing/speaking.
//  - Placement / probe results are persisted in state.skills. Everyday exercise evidence
//    (usage) is merged on read and can shift an estimate by at most ±1 level, because
//    short quizzes are noisy.
//  - Confidence grows with the amount of independent evidence, and every estimate keeps its
//    source label so the UI can say honestly where a number came from.

import type { Confidence, Level, PersistedState, Skill, SkillAssessment, SkillLevels } from '../types';
import { LEVELS } from '../types';
import { buildLearnerProfile, type LearnerProfile } from './learner';
import { today } from './dates';

const SKILLS: Skill[] = ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing'];

const clampIdx = (i: number) => Math.max(0, Math.min(LEVELS.length - 1, i));

/** Confidence from the number of independent evidence items behind an estimate. */
function confidenceFor(evidenceCount: number): Confidence {
  if (evidenceCount >= 6) return 'high';
  if (evidenceCount >= 3) return 'medium';
  if (evidenceCount >= 1) return 'low';
  return 'none';
}

/**
 * Merges the persisted skill assessment with live exercise evidence.
 * - grammar/vocabulary/reading: base from the placement test; usage accuracy shifts it by -1/0/+1.
 * - listening: probe result, or usage accuracy when a listening probe has not been taken.
 * - writing: probe result, or a conservative usage estimate from writing checks (max medium confidence).
 * - speaking: self-report only (low confidence); the app has no speech analysis and says so.
 */
export function computeSkillLevels(s: PersistedState, lp: LearnerProfile = buildLearnerProfile(s)): Record<Skill, SkillAssessment> {
  const saved: SkillLevels = s.skills ?? {};
  const out = {} as Record<Skill, SkillAssessment>;

  for (const skill of SKILLS) {
    const savedEntry = saved[skill];
    const usage = lp.skills[skill];

    // ---- no saved measurement: try to derive an honest estimate from usage ----
    if (!savedEntry || savedEntry.level === null) {
      if (skill === 'speaking') {
        out[skill] = savedEntry ?? { level: null, confidence: 'none', source: 'self' };
        continue;
      }
      if (skill === 'writing') {
        // Usage-based writing estimate: issue rate per 10 words mapped to rough bands.
        const ip10 = lp.writing.issuesPer10;
        if (ip10 === null) {
          out[skill] = savedEntry ?? { level: null, confidence: 'none', source: 'usage' };
        } else {
          const level = LEVELS[clampIdx(1 + Math.floor(ip10 / 1.6))]; // <1.6 -> A2, <3.2 -> B1, ...
          out[skill] = { level, confidence: 'low', source: 'usage', accuracy: Math.max(0, 1 - ip10 / 6), updatedAt: today() };
        }
        continue;
      }
      const acc = usage.accuracy;
      if (acc === null) {
        out[skill] = { level: null, confidence: 'none', source: 'usage' };
        continue;
      }
      // Center the usage band around A2 (2): 0-45% -> start below, 85%+ -> climb.
      const base = 2 + (acc >= 0.9 ? 2 : acc >= 0.78 ? 1 : acc >= 0.55 ? 0 : acc >= 0.35 ? -1 : -2);
      out[skill] = { level: LEVELS[clampIdx(base)], confidence: 'low', source: 'usage', accuracy: acc, updatedAt: today() };
      continue;
    }

    // ---- saved measurement exists: refine with usage evidence ----
    const savedIdx = LEVELS.indexOf(savedEntry.level);
    const acc = usage.accuracy;
    if (acc === null || savedEntry.source === 'self') {
      out[skill] = { ...savedEntry };
      continue;
    }
    const shift = acc >= 0.9 ? 1 : acc <= 0.4 ? -1 : 0;
    const level = LEVELS[clampIdx(savedIdx + shift)];
    const evidence = (usage.attempts >= 24 ? 2 : usage.attempts >= 12 ? 1 : 0) + (savedEntry.confidence === 'high' ? 3 : savedEntry.confidence === 'medium' ? 2 : 1);
    out[skill] = {
      ...savedEntry,
      level,
      confidence: confidenceFor(evidence),
      accuracy: acc,
      updatedAt: today(),
    };
  }
  return out;
}

/** The learner's overall working level: median of measured skills, falling back to profile.estimatedLevel. */
export function overallLevel(levels: Record<Skill, SkillAssessment>, fallback: Level): Level {
  const measured = SKILLS.map((k) => levels[k]?.level).filter((l): l is Level => !!l);
  if (!measured.length) return fallback;
  const idx = measured.map((l) => LEVELS.indexOf(l)).sort((a, b) => a - b);
  return LEVELS[idx[Math.floor(idx.length / 2)]];
}

const CONF_LABEL: Record<Confidence, string> = {
  high: 'yuqori ishonch',
  medium: 'o‘rtacha ishonch',
  low: 'past ishonch',
  none: 'baholanmagan',
};

const SOURCE_LABEL: Record<SkillAssessment['source'], string> = {
  placement: 'test natijasi',
  probe: 'qo‘shimcha baholash',
  self: 'o‘z bahoingiz',
  usage: 'mashqlar natijasi',
};

export const confidenceLabel = (c: Confidence): string => CONF_LABEL[c];
export const sourceLabel = (src: SkillAssessment['source']): string => SOURCE_LABEL[src];

export const SKILL_LABEL: Record<Skill, string> = {
  vocabulary: 'So‘z boyligi',
  grammar: 'Grammatika',
  reading: 'O‘qish',
  listening: 'Tinglash',
  speaking: 'Gaplashish',
  writing: 'Yozish',
};

export const SKILL_EMOJI: Record<Skill, string> = {
  vocabulary: '🃏',
  grammar: '🧩',
  reading: '📖',
  listening: '🎧',
  speaking: '🗣️',
  writing: '✍️',
};
