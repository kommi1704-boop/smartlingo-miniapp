import type { DayActivity, Level, PersistedState } from '../types';
import { LEVELS } from '../types';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';
import { dayOfYear, today } from './dates';

export type PlanType = 'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'tutor';

export interface PlanItem {
  id: string;
  type: PlanType;
  emoji: string;
  title: string;
  desc: string;
  minutes: number;
  route: string;
  done: boolean;
  progress: number; // 0..1
  progressLabel?: string;
}

export const emptyDay = (): DayActivity => ({ xp: 0, words: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0, tutor: 0, quizzes: 0 });

const WEIGHT: Record<PlanType, number> = { vocab: 1, grammar: 1.4, reading: 1.2, listening: 1, speaking: 0.9, writing: 1.3, tutor: 1 };

const li = (l: Level) => LEVELS.indexOf(l);

function pickBy<T extends { id: string; level: Level }>(
  items: T[],
  est: Level,
  lessonKey: (id: string) => string,
  s: PersistedState,
): { item: T; revisit: boolean } | null {
  const eligible = items.filter((x) => li(x.level) <= li(est) + 1);
  const pool = eligible.length ? eligible : items;
  const open = pool.filter((x) => !s.lessons[lessonKey(x.id)]?.completed);
  if (open.length) {
    const best = [...open].sort((a, b) => Math.abs(li(a.level) - li(est)) - Math.abs(li(b.level) - li(est)))[0];
    return { item: best, revisit: false };
  }
  if (!pool.length) return null;
  const weakest = [...pool].sort((a, b) => {
    const ra = s.lessons[lessonKey(a.id)];
    const rb = s.lessons[lessonKey(b.id)];
    return (ra ? ra.bestScore / ra.total : 0) - (rb ? rb.bestScore / rb.total : 0);
  })[0];
  return { item: weakest, revisit: true };
}

function rotationPool(activities: string[]): PlanType[] {
  const base: PlanType[] = ['reading', 'listening', 'speaking', 'writing'];
  const pref = base.filter((t) => activities.includes(t));
  return pref.length ? pref : base;
}

function composition(minutes: number, activities: string[], date: string): PlanType[] {
  const pool = rotationPool(activities);
  const d = dayOfYear(date);
  const rot = (k: number) => pool[(d + k) % pool.length];
  if (minutes <= 5) return ['vocab'];
  if (minutes <= 10) return ['vocab', rot(0)];
  if (minutes <= 15) return ['vocab', 'grammar', rot(0)];
  if (minutes <= 20) return ['vocab', 'grammar', 'reading', 'listening'];
  if (minutes <= 30) return ['vocab', 'grammar', 'reading', 'listening', rot(0) === 'reading' || rot(0) === 'listening' ? 'speaking' : rot(0)];
  return ['vocab', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'tutor'];
}

export function buildPlan(s: PersistedState, date: string = today()): PlanItem[] {
  const p = s.profile;
  if (!p) return [];
  const act = s.activity[date] ?? emptyDay();
  const types = composition(p.dailyMinutes, p.activities, date);
  const totalW = types.reduce((a, t) => a + WEIGHT[t], 0);
  const minutesFor = (t: PlanType) => Math.max(3, Math.round((p.dailyMinutes * WEIGHT[t]) / totalW));
  const est = p.estimatedLevel;
  const goal = s.settings.dailyWordGoal;

  return types.map((t): PlanItem => {
    const minutes = minutesFor(t);
    switch (t) {
      case 'vocab': {
        const progress = Math.min(1, act.words / goal);
        return {
          id: 'vocab', type: t, emoji: '🃏', title: 'So‘zlarni takrorlash',
          desc: `Bugungi ${goal} ta so‘z: kartochkalar va takrorlash`, minutes, route: '/vocab',
          done: act.words >= goal, progress, progressLabel: `${Math.min(act.words, goal)}/${goal}`,
        };
      }
      case 'grammar': {
        const pick = pickBy(GRAMMAR, est, (id) => `grammar:${id}`, s);
        return {
          id: 'grammar', type: t, emoji: '🧩',
          title: pick ? `Grammatika: ${pick.item.title}` : 'Grammatika',
          desc: pick ? (pick.revisit ? 'Takrorlash: natijani yaxshilang' : pick.item.summaryUz) : 'Darslar ro‘yxatini oching',
          minutes, route: pick ? `/grammar/${pick.item.id}` : '/grammar', done: act.grammar >= 1, progress: act.grammar >= 1 ? 1 : 0,
        };
      }
      case 'reading': {
        const pick = pickBy(READING, est, (id) => `reading:${id}`, s);
        return {
          id: 'reading', type: t, emoji: '📖',
          title: pick ? `O‘qish: ${pick.item.title}` : 'O‘qish',
          desc: pick ? `Daraja ${pick.item.level} · 4 ta savol` : 'Matnlar ro‘yxatini oching',
          minutes, route: pick ? `/reading/${pick.item.id}` : '/reading', done: act.reading >= 1, progress: act.reading >= 1 ? 1 : 0,
        };
      }
      case 'listening': {
        const pick = pickBy(LISTENING, est, (id) => `listening:${id}`, s);
        return {
          id: 'listening', type: t, emoji: '🎧',
          title: pick ? `Tinglash: ${pick.item.title}` : 'Tinglash',
          desc: pick ? `Daraja ${pick.item.level} · transkript va savollar` : 'Mashqlar ro‘yxatini oching',
          minutes, route: pick ? `/listening/${pick.item.id}` : '/listening', done: act.listening >= 1, progress: act.listening >= 1 ? 1 : 0,
        };
      }
      case 'speaking': {
        const pool = SPEAKING.filter((x) => li(x.level) <= li(est) + 1 && (x.kind === 'conversation' || li(est) >= 3));
        const list = pool.length ? pool : SPEAKING;
        const open = list.filter((x) => !(s.speakingDone[x.id]?.length));
        const pick = open[0] ?? list[dayOfYear(date) % list.length];
        return {
          id: 'speaking', type: t, emoji: '🗣️', title: `Gaplashish: ${pick.title}`,
          desc: 'Ovoz chiqarib ayting va o‘zingizni baholang', minutes, route: `/speaking/${pick.id}`,
          done: act.speaking >= 1, progress: act.speaking >= 1 ? 1 : 0,
        };
      }
      case 'writing': {
        const pool = WRITING.filter((x) => li(x.level) <= li(est) + 1);
        const list = pool.length ? pool : WRITING;
        const open = list.filter((x) => !s.writing.some((w) => w.promptId === x.id));
        const pick = open[0] ?? list[dayOfYear(date) % list.length];
        return {
          id: 'writing', type: t, emoji: '✍️', title: `Yozish: ${pick.title}`,
          desc: `Kamida ${pick.minWords} ta so‘z`, minutes, route: `/writing/${pick.id}`,
          done: act.writing >= 1, progress: act.writing >= 1 ? 1 : 0,
        };
      }
      case 'tutor':
      default:
        return {
          id: 'tutor', type: 'tutor', emoji: '🤖', title: 'Lingo bilan suhbat',
          desc: 'Kamida 2 ta xabar yozing', minutes, route: '/tutor',
          done: act.tutor >= 2, progress: Math.min(1, act.tutor / 2), progressLabel: `${Math.min(act.tutor, 2)}/2`,
        };
    }
  });
}

export function planSummary(items: PlanItem[]) {
  const total = items.reduce((a, i) => a + i.minutes, 0);
  const doneMin = items.filter((i) => i.done).reduce((a, i) => a + i.minutes, 0);
  const doneCount = items.filter((i) => i.done).length;
  const partial = items.reduce((a, i) => a + (i.done ? 0 : i.progress * i.minutes), 0);
  const pct = total ? Math.min(100, Math.round(((doneMin + partial) / total) * 100)) : 0;
  return { total, doneMin, doneCount, count: items.length, pct, allDone: items.length > 0 && doneCount === items.length };
}
