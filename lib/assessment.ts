import { LEVELS, type Level, type PlacementQuestion } from '../types';
import { PLACEMENT } from '../data/placement';

export type Section = 'vocabulary' | 'grammar' | 'reading';

export interface PlacementAnswer {
  q: PlacementQuestion;
  picked: number;
}

export interface PlacementResult {
  level: Level;
  bySection: Record<Section, { correct: number; asked: number }>;
  total: number;
  asked: number;
  groups: { level: Level; correct: number; asked: number; passed: boolean }[];
  /** How much evidence the estimate rests on: 1 group = low, 2 = medium, 3+ = high. */
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Adaptive question order: the test starts ONE group below the learner's
 * self-declared level (calibration), then walks upward until a group is failed.
 * A learner who says "B1" no longer answers nine Pre-A1/A1/A2 questions first —
 * the test is shorter and every question carries real information.
 */
export function placementOrderFor(selfLevel: Level): PlacementQuestion[] {
  const start = Math.max(0, LEVELS.indexOf(selfLevel) - 1);
  return placementOrder().filter((q) => LEVELS.indexOf(q.level) >= start);
}

/** Questions in the order they are asked (easy → hard, three per level). */
export function placementOrder(): PlacementQuestion[] {
  return [...PLACEMENT].sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
}

export const PASS_MARK = 2; // 2 of 3 correct in a level group = level passed

export function levelGroup(level: Level): PlacementQuestion[] {
  return placementOrder().filter((q) => q.level === level);
}

/**
 * Estimated level = the highest level passed without skipping a lower one.
 * If NO group is passed, the estimate drops to one level below the first asked
 * group (never below Pre-A1) — the self-declared level is only a prior, so a
 * failed calibration group still gives the learner credit for the level under it.
 * This is a quick placement estimate, NOT an official CEFR result.
 */
export function evaluate(answers: PlacementAnswer[], startLevel?: Level): PlacementResult {
  const bySection: PlacementResult['bySection'] = {
    vocabulary: { correct: 0, asked: 0 },
    grammar: { correct: 0, asked: 0 },
    reading: { correct: 0, asked: 0 },
  };
  const groups: PlacementResult['groups'] = [];
  let highest: Level | null = null;
  let stillPassing = true;
  for (const lv of LEVELS) {
    const items = answers.filter((a) => a.q.level === lv);
    if (!items.length) continue;
    const correct = items.filter((a) => a.picked === a.q.answer).length;
    const passed = correct >= PASS_MARK;
    groups.push({ level: lv, correct, asked: items.length, passed });
    if (stillPassing && passed) highest = lv;
    else stillPassing = false;
  }
  let level: Level;
  if (highest) {
    level = highest;
  } else {
    const firstAsked = answers[0]?.q.level ?? startLevel ?? 'Pre-A1';
    level = LEVELS[Math.max(0, LEVELS.indexOf(firstAsked) - 1)];
  }
  const confidence: PlacementResult['confidence'] = groups.length >= 3 ? 'high' : groups.length === 2 ? 'medium' : 'low';
  let total = 0;
  for (const a of answers) {
    const ok = a.picked === a.q.answer;
    bySection[a.q.section].asked++;
    if (ok) {
      bySection[a.q.section].correct++;
      total++;
    }
  }
  return { level, bySection, total, asked: answers.length, groups, confidence };
}

export function sectionLabel(s: Section): string {
  return s === 'vocabulary' ? 'So‘z boyligi' : s === 'grammar' ? 'Grammatika' : 'O‘qish';
}
