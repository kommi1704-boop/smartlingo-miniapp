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
 * If even Pre-A1 is not passed, the estimate is still "Pre-A1" (the starting point).
 * This is a quick placement estimate, NOT an official CEFR result.
 */
export function evaluate(answers: PlacementAnswer[]): PlacementResult {
  const bySection: PlacementResult['bySection'] = {
    vocabulary: { correct: 0, asked: 0 },
    grammar: { correct: 0, asked: 0 },
    reading: { correct: 0, asked: 0 },
  };
  const groups: PlacementResult['groups'] = [];
  let level: Level = 'Pre-A1';
  let stillPassing = true;
  for (const lv of LEVELS) {
    const items = answers.filter((a) => a.q.level === lv);
    if (!items.length) continue;
    const correct = items.filter((a) => a.picked === a.q.answer).length;
    const passed = correct >= PASS_MARK;
    groups.push({ level: lv, correct, asked: items.length, passed });
    if (stillPassing && passed) level = lv;
    else stillPassing = false;
  }
  let total = 0;
  for (const a of answers) {
    const ok = a.picked === a.q.answer;
    bySection[a.q.section].asked++;
    if (ok) {
      bySection[a.q.section].correct++;
      total++;
    }
  }
  return { level, bySection, total, asked: answers.length, groups };
}

export function sectionLabel(s: Section): string {
  return s === 'vocabulary' ? 'So‘z boyligi' : s === 'grammar' ? 'Grammatika' : 'O‘qish';
}
