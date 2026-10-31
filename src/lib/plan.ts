import type { DayActivity, Level, PersistedState } from '../types';
import { LEVELS } from '../types';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';
import { GAMES } from './games';
import { RESOURCES } from '../data/resources';
import { questStateOf } from './shop';
import { seededRng } from './games';
import { dayOfYear, lastDays, today } from './dates';

export type PlanType = 'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'game' | 'resource' | 'tutor';

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

const WEIGHT: Record<PlanType, number> = {
  vocab: 1, grammar: 1.4, reading: 1.2, listening: 1, speaking: 0.9, writing: 1.3, tutor: 1, game: 0.8, resource: 0.6,
};

const li = (l: Level) => LEVELS.indexOf(l);

/** Recent accuracy (0..1) for a quiz-measured skill, or null when there is not enough history. */
function skillAccuracy(s: PersistedState, t: 'vocab' | 'grammar' | 'reading' | 'listening'): number | null {
  const kinds: Record<string, string[]> = {
    vocab: ['vocab-quiz', 'matching'], grammar: ['grammar'], reading: ['reading'], listening: ['listening'],
  };
  const want = kinds[t];
  const items = s.quizHistory.filter((q) => want.includes(q.kind)).slice(-20);
  const total = items.reduce((a, b) => a + b.total, 0);
  if (total < 8) return null;
  const score = items.reduce((a, b) => a + b.score, 0);
  return score / total;
}

/**
 * Picks 2 rotating skills for today, randomly but with a bias towards the learner's
 * weaker skills (low quiz accuracy or skills untouched this week). Seeded -> stable all day,
 * different every day.
 */
function adaptiveRotation(s: PersistedState, date: string, rnd: () => number): Array<'reading' | 'listening' | 'speaking' | 'writing'> {
  const pool: Array<'reading' | 'listening' | 'speaking' | 'writing'> = ['reading', 'listening', 'speaking', 'writing'];
  const week = lastDays(7, date);
  const weights = pool.map((t) => {
    if (t === 'reading' || t === 'listening') {
      const acc = skillAccuracy(s, t);
      if (acc !== null) return Math.min(1.35, Math.max(0.45, 1.25 - acc)); // weaker skill -> bigger weight
    }
    const counter = t as 'speaking' | 'writing';
    const didThisWeek = week.some((k) => (s.activity[k]?.[counter] ?? 0) > 0);
    return didThisWeek ? 0.85 : 1.3; // untouched this week -> bigger weight
  });
  const picked: typeof pool = [];
  let left = pool.map((t, i) => ({ t, w: weights[i] }));
  for (let k = 0; k < 2 && left.length; k++) {
    const total = left.reduce((a, x) => a + x.w, 0);
    let roll = rnd() * total;
    let idx = 0;
    for (let i = 0; i < left.length; i++) {
      roll -= left[i].w;
      if (roll <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(left[idx].t);
    left = left.filter((_, i) => i !== idx);
  }
  return picked;
}

function composition(minutes: number, s: PersistedState, date: string, rnd: () => number): PlanType[] {
  const rot = adaptiveRotation(s, date, rnd);
  if (minutes <= 5) return ['vocab'];
  if (minutes <= 10) return ['vocab', 'grammar', rot[0]];
  if (minutes <= 15) return ['vocab', 'grammar', rot[0], rot[1]];
  if (minutes <= 20) return ['vocab', 'grammar', rot[0], rot[1], 'game'];
  if (minutes <= 30) return ['vocab', 'grammar', rot[0], rot[1], 'game', 'resource'];
  return ['vocab', 'grammar', rot[0], rot[1], 'game', 'resource', 'tutor'];
}

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

export function buildPlan(s: PersistedState, date: string = today()): PlanItem[] {
  const p = s.profile;
  if (!p) return [];
  const act = s.activity[date] ?? emptyDay();
  const rnd = seededRng(`plan:${date}:${p.name}`); // stable during the day, fresh tomorrow, per learner
  const types = composition(p.dailyMinutes, s, date, rnd);
  const totalW = types.reduce((a, t) => a + WEIGHT[t], 0);
  const minutesFor = (t: PlanType) => Math.max(3, Math.round((p.dailyMinutes * WEIGHT[t]) / totalW));
  const est = p.estimatedLevel;
  const goal = s.settings.dailyWordGoal;
  const q = questStateOf(s);

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
      case 'game': {
        const g = GAMES[Math.floor(rnd() * GAMES.length)];
        const played = q.progress.games ?? 0;
        return {
          id: 'game', type: t, emoji: g.emoji,
          title: `Interaktiv o‘yin: ${g.title}`,
          desc: g.tagline,
          minutes, route: `/games/${g.id}`,
          done: played >= 1, progress: Math.min(1, played), progressLabel: played >= 1 ? undefined : '1 marta o‘ynang',
        };
      }
      case 'resource': {
        // a verified video/article that matches the learner's level (random every day)
        const fits = RESOURCES.filter((r) => r.level.includes(est) || r.level.includes('Barcha'));
        const poolR = fits.length ? fits : RESOURCES;
        const videos = poolR.filter((r) => r.category === 'youtube');
        const from = rnd() < 0.65 && videos.length ? videos : poolR;
        const r = from[Math.floor(rnd() * from.length)];
        const visited = q.progress.resources ?? 0;
        const isVideo = r.category === 'youtube';
        return {
          id: 'resource', type: t, emoji: isVideo ? '🎬' : '📚',
          title: isVideo ? `Video dars: ${r.title}` : `Foydali resurs: ${r.title}`,
          desc: r.desc.length > 90 ? `${r.desc.slice(0, 90)}…` : r.desc,
          minutes, route: '/resources',
          done: visited >= 1, progress: Math.min(1, visited), progressLabel: visited >= 1 ? undefined : 'Resursni oching',
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
