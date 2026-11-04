// Adaptive Daily Plan engine.
//
// The plan is built from the learner's ACTUAL evidence (see learner.ts):
//  - skills with low recent accuracy get bigger weights; untouched skills get a slot too;
//  - the vocabulary task becomes a spaced-repetition session sized by the words actually due;
//  - when the mistake notebook has open items, a targeted "repair your mistakes" task appears;
//  - the writing task targets the learner's last checked submission when it was weak;
//  - every task carries a short Uzbek `reason` so the learner sees WHY it was assigned.
//
// Two different learners therefore get two different plans, even with the same available time.
// The plan is still seeded (stable during the day, fresh tomorrow) and fits the daily minutes.

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
import { buildLearnerProfile, type LearnerProfile } from './learner';

export type PlanType = 'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'game' | 'resource' | 'tutor' | 'mistakes';

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
  /** Short Uzbek explanation of why this task was assigned (shown in the plan UI). */
  reason?: string;
}

export const emptyDay = (): DayActivity => ({ xp: 0, words: 0, grammar: 0, reading: 0, listening: 0, speaking: 0, writing: 0, tutor: 0, quizzes: 0 });

const WEIGHT: Record<PlanType, number> = {
  vocab: 1, grammar: 1.4, reading: 1.2, listening: 1, speaking: 0.9, writing: 1.3, tutor: 1, game: 0.8, resource: 0.6, mistakes: 0.9,
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

/** Weight of one rotating skill: weaker evidence -> bigger weight; untouched this week -> bigger too. */
function skillWeight(lp: LearnerProfile, s: PersistedState, t: 'reading' | 'listening' | 'speaking' | 'writing', date: string): number {
  if (t === 'reading' || t === 'listening') {
    const acc = skillAccuracy(s, t);
    if (acc !== null) return Math.min(1.35, Math.max(0.45, 1.25 - acc));
  }
  if (t === 'writing' && lp.writing.issuesPer10 !== null) {
    // more issues per 10 words -> more practice (1.5 /10w -> 1.35, 5 /10w -> 1.05)
    return Math.min(1.35, Math.max(0.9, 1.5 - lp.writing.issuesPer10 * 0.09));
  }
  const week = lastDays(7, date);
  const counter = t as 'speaking' | 'writing';
  const didThisWeek = week.some((k) => (s.activity[k]?.[counter] ?? 0) > 0);
  return didThisWeek ? 0.85 : 1.3;
}

/**
 * Picks 2 rotating skills for today, randomly but biased towards the learner's
 * weaker skills. Seeded -> stable all day, different every day, different per learner.
 */
function adaptiveRotation(lp: LearnerProfile, s: PersistedState, date: string, rnd: () => number): Array<'reading' | 'listening' | 'speaking' | 'writing'> {
  const pool: Array<'reading' | 'listening' | 'speaking' | 'writing'> = ['reading', 'listening', 'speaking', 'writing'];
  const weights = pool.map((t) => skillWeight(lp, s, t, date));
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

function composition(minutes: number, lp: LearnerProfile, s: PersistedState, date: string, rnd: () => number): PlanType[] {
  const rot = adaptiveRotation(lp, s, date, rnd);
  const types: PlanType[] = ['vocab', 'grammar'];
  // a learner with several open mistakes gets a targeted repair task with HIGH priority
  // (right after grammar, before the rotating skills) so it survives the minutes budget cut
  if (lp.mistakes.open >= 3) types.push('mistakes');
  types.push(...rot);
  if (minutes <= 5) return types.slice(0, 1);
  if (minutes <= 10) return types.slice(0, 3);
  if (minutes <= 15) return types.slice(0, 4);
  if (minutes <= 20) return [...types.slice(0, 4), 'game'];
  if (minutes <= 30) return [...types.slice(0, 4), 'game', 'resource'];
  return [...types.slice(0, 4), 'game', 'resource', 'tutor'];
}

function pickBy<T extends { id: string; level: Level }>(
  items: T[],
  est: Level,
  lessonKey: (id: string) => string,
  s: PersistedState,
  stretch: boolean, // allow one level above the estimate when the learner is doing well
): { item: T; revisit: boolean } | null {
  const maxIdx = li(est) + (stretch ? 1 : 0);
  const eligible = items.filter((x) => li(x.level) <= maxIdx);
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
  const rnd = seededRng(`plan:${date}:${p.name}:${p.estimatedLevel}`); // stable during the day, fresh tomorrow, per learner
  const lp = buildLearnerProfile(s, date);
  const types = composition(p.dailyMinutes, lp, s, date, rnd);
  const totalW = types.reduce((a, t) => a + WEIGHT[t], 0);
  const minutesFor = (t: PlanType) => Math.max(3, Math.round((p.dailyMinutes * WEIGHT[t]) / totalW));
  const est = p.estimatedLevel;
  const goal = s.settings.dailyWordGoal;
  const q = questStateOf(s);
  // stretch: a learner with high recent accuracy gets one-level-higher content
  const accuracies = [lp.skills.grammar.accuracy, lp.skills.reading.accuracy, lp.skills.listening.accuracy].filter((a): a is number => a !== null);
  const stretch = accuracies.length >= 2 && accuracies.every((a) => a >= 0.85);

  return types.map((t): PlanItem => {
    const minutes = minutesFor(t);
    switch (t) {
      case 'vocab': {
        const due = lp.vocab.dueToday;
        const progress = Math.min(1, act.words / goal);
        const target = Math.max(goal, Math.min(due, 15));
        return {
          id: 'vocab', type: t, emoji: '🃏', title: 'So‘zlarni takrorlash',
          desc: due > 0
            ? `${target} ta so‘z: ${due} tasi takrorlash muddati kelgan (eski so‘zlar birinchi)`
            : `Bugungi ${goal} ta so‘z: kartochkalar va takrorlash`,
          minutes, route: '/vocab',
          done: act.words >= goal, progress, progressLabel: `${Math.min(act.words, goal)}/${goal}`,
          reason: due > 0
            ? `Ilm-fan bo‘yicha: ${due} ta so‘zni bugun takrorlash kerak — ertaga kechiksa unutish ehtimoli oshadi.`
            : 'Yangi so‘zlar har kuni qo‘shilib boradi — kichik qadam muntazam bo‘lsa yetarli.',
        };
      }
      case 'mistakes': {
        const doneNow = lp.mistakes.open === 0;
        const target = Math.min(5, Math.max(1, lp.mistakes.open));
        return {
          id: 'mistakes', type: t, emoji: '🩹', title: `Xatolarni tuzatish (${lp.mistakes.open} ta)`,
          desc: `Xatolar daftaridagi ${target} ta savolni qayta ishlash`,
          minutes, route: '/progress',
          done: doneNow, progress: doneNow ? 1 : 0,
          reason: 'Sizda tuzatilmagan xatolar bor — ularni tuzatish eng tez natija beruvchi mashq hisoblanadi.',
        };
      }
      case 'grammar': {
        const pick = pickBy(GRAMMAR, est, (id) => `grammar:${id}`, s, stretch);
        const weak = lp.grammar.find((g) => g.status === 'weak');
        const chosen = weak && pick && pick.item.id === weak.id ? 'weak' : pick?.revisit ? 'revisit' : 'next';
        return {
          id: 'grammar', type: t, emoji: '🧩',
          title: pick ? `Grammatika: ${pick.item.title}` : 'Grammatika',
          desc: pick ? (pick.revisit ? 'Takrorlash: natijani yaxshilang' : pick.item.summaryUz) : 'Darslar ro‘yxatini oching',
          minutes, route: pick ? `/grammar/${pick.item.id}` : '/grammar', done: act.grammar >= 1, progress: act.grammar >= 1 ? 1 : 0,
          reason: chosen === 'weak'
            ? 'Bu mavzuda sizning test natijangiz past — bugun aynan uni mustahkamlash rejalashtirildi.'
            : chosen === 'revisit'
              ? 'Bu darsda eng past natija qolgan — qayta ishlash uni mustahkamlaydi.'
              : 'Grammatika ketma-ketligi bo‘yicha keyingi mavzu shu — oldingisi bilan bog‘liq.',
        };
      }
      case 'reading': {
        const pick = pickBy(READING, est, (id) => `reading:${id}`, s, stretch);
        return {
          id: 'reading', type: t, emoji: '📖',
          title: pick ? `O‘qish: ${pick.item.title}` : 'O‘qish',
          desc: pick ? `Daraja ${pick.item.level} · 4 ta savol` : 'Matnlar ro‘yxatini oching',
          minutes, route: pick ? `/reading/${pick.item.id}` : '/reading', done: act.reading >= 1, progress: act.reading >= 1 ? 1 : 0,
          reason: 'O‘qish tushunish — lug‘at va grammatikani birga mustahkamlaydigan mashq.',
        };
      }
      case 'listening': {
        const pick = pickBy(LISTENING, est, (id) => `listening:${id}`, s, stretch);
        const acc = skillAccuracy(s, 'listening');
        return {
          id: 'listening', type: t, emoji: '🎧',
          title: pick ? `Tinglash: ${pick.item.title}` : 'Tinglash',
          desc: pick ? `Daraja ${pick.item.level} · transkript va savollar` : 'Mashqlar ro‘yxatini oching',
          minutes, route: pick ? `/listening/${pick.item.id}` : '/listening', done: act.listening >= 1, progress: act.listening >= 1 ? 1 : 0,
          reason: acc !== null && acc < 0.7
            ? `So‘nggi tinglash natijangiz ${Math.round(acc * 100)}% — bugun qo‘shimcha tinglash mashqi rejalashtirildi.`
            : 'Tinglash ko‘nikmasi haftada kamida bir marta mashq qilinsa tez o‘sadi.',
        };
      }
      case 'speaking': {
        const pool = SPEAKING.filter((x) => li(x.level) <= li(est) + 1 && (x.kind === 'conversation' || li(est) >= 3));
        const list = pool.length ? pool : SPEAKING;
        const open = list.filter((x) => !(s.speakingDone[x.id]?.length));
        const pick = open[0] ?? list[dayOfYear(date) % list.length];
        const didThisWeek = lastDays(7, date).some((k) => (s.activity[k]?.speaking ?? 0) > 0);
        return {
          id: 'speaking', type: t, emoji: '🗣️', title: `Gaplashish: ${pick.title}`,
          desc: 'Ovoz chiqarib ayting va o‘zingizni baholang', minutes, route: `/speaking/${pick.id}`,
          done: act.speaking >= 1, progress: act.speaking >= 1 ? 1 : 0,
          reason: didThisWeek ? 'Gaplashish haftada kamida 1-2 marta — ravonlikni shu beradi.' : 'Bu hafta hali gapirilmagan — ovoz chiqarib mashq eng samarali ko‘nikma mashqidir.',
        };
      }
      case 'writing': {
        const pool = WRITING.filter((x) => li(x.level) <= li(est) + 1);
        const list = pool.length ? pool : WRITING;
        const open = list.filter((x) => !s.writing.some((w) => w.promptId === x.id));
        const pick = open[0] ?? list[dayOfYear(date) % list.length];
        const ip10 = lp.writing.issuesPer10;
        return {
          id: 'writing', type: t, emoji: '✍️', title: `Yozish: ${pick.title}`,
          desc: `Kamida ${pick.minWords} ta so‘z`, minutes, route: `/writing/${pick.id}`,
          done: act.writing >= 1, progress: act.writing >= 1 ? 1 : 0,
          reason: ip10 !== null && ip10 > 2.8
            ? `Yozuvlarida har 10 so‘zga ${ip10.toFixed(1)} xato tushmoqda — qisqa-yozish mashqlari buni kamaytiradi.`
            : 'Yozish — grammatika va lug‘atni birga sinashning eng aniq yo‘li.',
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
          reason: 'O‘yin shaklidagi takrorlash — bugungi rejaning dam olish qismi.',
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
          reason: 'Darajangizga mos tashqi resurs — ilovadan tashqari ham o‘rganishni davom ettiring.',
        };
      }
      case 'tutor':
      default:
        return {
          id: 'tutor', type: 'tutor', emoji: '🤖', title: 'Lingo bilan suhbat',
          desc: 'Kamida 2 ta xabar yozing', minutes, route: '/tutor',
          done: act.tutor >= 2, progress: Math.min(1, act.tutor / 2), progressLabel: `${Math.min(act.tutor, 2)}/2`,
          reason: 'Suhbat — grammatikani erkin qo‘llash mashqi; Lingo sizning darajangizni biladi.',
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
