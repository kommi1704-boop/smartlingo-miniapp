import { LEVELS, type Level, type PersistedState, type Profile } from '../types';
import { GOALS } from '../data/options';
import { GRAMMAR } from '../data/grammar';
import { VOCAB } from '../data/vocab';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';

interface Curriculum {
  focus: string;
  grammarExtra: string[];
  vocabThemes: string[];
  vocabGoal: number; // approximate cumulative vocabulary goal
  reading: string;
  listening: string;
  speaking: string;
  writing: string;
  hours: number; // rough study hours to move on to the next level
}

// General, approximate guidance (not an official CEFR syllabus).
export const CURRICULUM: Record<Level, Curriculum> = {
  'Pre-A1': {
    focus: 'Birinchi so‘zlar va eng oddiy gaplar',
    grammarExtra: ['Ko‘plik: cat → cats', 'Buyruq gaplar (Sit down)', 'Savollar: What’s your name?'],
    vocabThemes: ['Salomlashish', 'Oila', 'Ranglar va raqamlar'],
    vocabGoal: 100,
    reading: '2–4 gapli juda qisqa matnlar',
    listening: 'Sekin va aniq aytilgan 1–2 gap',
    speaking: 'O‘zingizni tanishtirish: ism, yosh, shahar',
    writing: '3–5 ta oddiy gap: “My name is …”',
    hours: 30,
  },
  A1: {
    focus: 'Kundalik oddiy gaplar va eng zarur so‘zlar',
    grammarExtra: ['There is / There are', 'Have got', 'So‘roq so‘zlar: what, where, who', 'Like + -ing'],
    vocabThemes: ['Maktab', 'Oziq-ovqat', 'Uy', 'Vaqt va sana'],
    vocabGoal: 600,
    reading: '50–90 so‘zli oddiy matnlar',
    listening: 'Sekin dialoglar: tanishuv, do‘kon',
    speaking: 'Oila, maktab, sevimli narsalar haqida 4–6 gap',
    writing: '25 ta so‘zli qisqa matn: o‘zim, xonam',
    hours: 60,
  },
  A2: {
    focus: 'Oddiy suhbat va qisqa matnlarni erkin tushunish',
    grammarExtra: ['Countable / uncountable (some, any, much, many)', 'Past Continuous', 'Verb + to / -ing', 'Too / enough'],
    vocabThemes: ['Sayohat', 'Sog‘liq', 'Kasblar', 'Kiyim', 'Sport'],
    vocabGoal: 1200,
    reading: '100–150 so‘zli hikoya va xabarlar',
    listening: 'Telefon suhbati, e’lonlar',
    speaking: 'O‘tgan dam olish va rejalar haqida gapirish',
    writing: 'Do‘stga 50 so‘zli xat',
    hours: 80,
  },
  B1: {
    focus: 'Tanish mavzularda fikr bildirish va hikoya qilish',
    grammarExtra: ['Past Continuous vs Past Simple', 'Used to', 'Relative clauses (who, which, that)', 'Reported speech (asoslar)', 'Linkers: although, however'],
    vocabThemes: ['Texnologiya', 'Tabiat', 'Hissiyotlar', 'Kundalik hayot'],
    vocabGoal: 2500,
    reading: '150–250 so‘zli maqola va hikoyalar',
    listening: 'Do‘stlar suhbati, qisqa ma’ruzalar',
    speaking: 'Fikr bildirish: “In my opinion …”, 1 daqiqa to‘xtamay gapirish',
    writing: '80–100 so‘zli fikr-mulohaza matni',
    hours: 100,
  },
  B2: {
    focus: 'Murakkab matnlar va ravon, aniq nutq',
    grammarExtra: ['Third conditional', 'Reported speech (to‘liq)', 'Wish / if only', 'Modal verbs of deduction (must be, can’t be)'],
    vocabThemes: ['Ta’lim va ish', 'Jamiyat', 'Fan va texnologiya'],
    vocabGoal: 4000,
    reading: '250–350 so‘zli maqolalar, fikr va dalillar',
    listening: 'Podkastlar, intervyular',
    speaking: 'Munozara: afzallik va kamchiliklarni solishtirish',
    writing: '120–150 so‘zli esse',
    hours: 120,
  },
  C1: {
    focus: 'Nozik ma’nolarni tushunish, akademik va kasbiy til',
    grammarExtra: ['Inversion (Never have I …)', 'Mixed conditionals', 'Cleft sentences', 'Ilg‘or bog‘lovchilar'],
    vocabThemes: ['Akademik so‘zlar', 'Idiomalar', 'Abstrakt tushunchalar'],
    vocabGoal: 6500,
    reading: 'Uzun maqola va adabiy matnlar',
    listening: 'Ma’ruzalar, tezkor tabiiy nutq',
    speaking: 'Murakkab mavzularda tayyorgarliksiz gapirish',
    writing: '200+ so‘zli tuzilgan esse va hisobot',
    hours: 150,
  },
  C2: {
    focus: 'Ona tili darajasiga yaqin aniqlik va uslub',
    grammarExtra: ['Uslub va rasmiyat darajasi (register)', 'Idiomalar va frazeologiya', 'Ellipsis va almashtirish', 'Akademik yozuv'],
    vocabThemes: ['Nozik sinonimlar', 'Kollokatsiyalar', 'Madaniy havolalar'],
    vocabGoal: 9000,
    reading: 'Murakkab adabiy va ilmiy matnlar',
    listening: 'Tez, sheva va idiomalarga boy nutq',
    speaking: 'Uslubni vaziyatga moslab, nozik ma’no ifodalash',
    writing: 'Turli janrdagi professional matnlar',
    hours: 180,
  },
};

export function defaultTarget(goalId: string, est: Level): Level {
  const goal = GOALS.find((g) => g.id === goalId);
  const floor = goal ? LEVELS.indexOf(goal.floor) : 2;
  const idx = Math.min(LEVELS.length - 1, Math.max(LEVELS.indexOf(est) + 1, floor));
  return LEVELS[idx];
}

export interface RoadmapStage {
  level: Level;
  consolidate: boolean; // first stage = strengthen the current level
  status: 'current' | 'next';
  weeks: number;
  focus: string;
  grammar: { id: string; title: string; done: boolean }[];
  grammarExtra: string[];
  vocab: { learned: number; total: number; themes: string[]; goal: number };
  reading: { id: string; title: string; done: boolean }[];
  listening: { id: string; title: string; done: boolean }[];
  speaking: { id: string; title: string; done: boolean }[];
  writing: { id: string; title: string; done: boolean }[];
  skillText: { reading: string; listening: string; speaking: string; writing: string };
  progress: number | null; // 0..100 or null when there is no demo content for this level
}

export function generateRoadmap(profile: Profile, s: PersistedState): RoadmapStage[] {
  const from = LEVELS.indexOf(profile.estimatedLevel);
  const to = Math.max(from, LEVELS.indexOf(profile.targetLevel));
  const weeklyHours = (profile.dailyMinutes * 6) / 60; // 6 study days a week
  const stages: RoadmapStage[] = [];

  for (let i = from; i <= to; i++) {
    const level = LEVELS[i];
    const cur = CURRICULUM[level];
    const consolidate = i === from;
    const grammar = GRAMMAR.filter((g) => g.level === level).map((g) => ({ id: g.id, title: g.title, done: !!s.lessons[`grammar:${g.id}`]?.completed }));
    const reading = READING.filter((r) => r.level === level).map((r) => ({ id: r.id, title: r.title, done: !!s.lessons[`reading:${r.id}`]?.completed }));
    const listening = LISTENING.filter((l) => l.level === level).map((l) => ({ id: l.id, title: l.title, done: !!s.lessons[`listening:${l.id}`]?.completed }));
    const speaking = SPEAKING.filter((x) => x.level === level).map((x) => ({ id: x.id, title: x.title, done: !!s.speakingDone[x.id]?.length }));
    const writing = WRITING.filter((x) => x.level === level).map((x) => ({ id: x.id, title: x.title, done: s.writing.some((w) => w.promptId === x.id) }));
    const words = VOCAB.filter((w) => w.level === level);
    const learned = words.filter((w) => s.vocab[w.id]?.status === 'learned').length;

    const parts: number[] = [];
    const add = (done: number, total: number) => total > 0 && parts.push(done / total);
    add(grammar.filter((x) => x.done).length, grammar.length);
    add(reading.filter((x) => x.done).length, reading.length);
    add(listening.filter((x) => x.done).length, listening.length);
    add(speaking.filter((x) => x.done).length, speaking.length);
    add(writing.filter((x) => x.done).length, writing.length);
    add(learned, words.length);
    const progress = parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) : null;

    const hours = consolidate && from !== to ? cur.hours * 0.3 : cur.hours;
    stages.push({
      level,
      consolidate,
      status: consolidate ? 'current' : 'next',
      weeks: Math.max(1, Math.ceil(hours / weeklyHours)),
      focus: cur.focus,
      grammar,
      grammarExtra: cur.grammarExtra,
      vocab: { learned, total: words.length, themes: cur.vocabThemes, goal: cur.vocabGoal },
      reading,
      listening,
      speaking,
      writing,
      skillText: { reading: cur.reading, listening: cur.listening, speaking: cur.speaking, writing: cur.writing },
      progress,
    });
  }
  return stages;
}

/** Short, personal summary lines shown above the roadmap. */
export function profileSummary(profile: Profile): string[] {
  const goal = GOALS.find((g) => g.id === profile.goal);
  const lines: string[] = [];
  if (goal) lines.push(`Maqsad: ${goal.label}. Asosiy e’tibor: ${goal.focusUz}.`);
  lines.push(`Kuniga ${profile.dailyMinutes} daqiqa · haftasiga taxminan ${((profile.dailyMinutes * 6) / 60).toFixed(1)} soat o‘qish.`);
  lines.push(`Boshlang‘ich taxminiy daraja: ${profile.estimatedLevel} → Maqsad: ${profile.targetLevel}.`);
  return lines;
}
