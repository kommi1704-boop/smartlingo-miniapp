// OFFLINE DEMO tutor. It is NOT an AI model: it matches keywords, looks things up in the app's own
// word list and grammar lessons, and runs the rule-based sentence checker. The UI labels it "Demo".

import type { Level } from '../types';
import { LEVELS } from '../types';
import { VOCAB } from '../data/vocab';
import { GRAMMAR } from '../data/grammar';
import { checkText } from './writingCheck';
import { sample } from './utils';

export interface DemoCtx {
  level: Level;
  name: string;
  scriptId?: string;
  scriptStep?: number;
}

export interface DemoReply {
  text: string;
  link?: { label: string; route: string };
  scriptId?: string;
  scriptStep?: number;
}

export const SCRIPTS: Record<string, { title: string; steps: string[] }> = {
  intro: {
    title: 'O‘zingni tanishtir',
    steps: [
      "Hi! I'm Lingo. What's your name?",
      'Nice to meet you! How old are you?',
      'Where are you from?',
      'What do you like to do after school?',
      'Cool! Can you tell me about your best friend?',
    ],
  },
  food: {
    title: 'Sevimli ovqat',
    steps: [
      "Let's talk about food! What is your favourite food?",
      'Why do you like it?',
      'What do you usually have for breakfast?',
      'Can you cook? What can you make?',
      'What food would you like to try in the future?',
    ],
  },
  hobby: {
    title: 'Sevimli mashg‘ulot',
    steps: [
      "Let's talk about hobbies! What do you do in your free time?",
      'How often do you do it?',
      'Who do you do it with?',
      'When did you start this hobby?',
      'Would you like to try a new hobby? Which one?',
    ],
  },
};

export const SUGGESTIONS = [
  'Present Simple nima?',
  '“beautiful” nima degani?',
  'Suhbat mashq qilamiz',
  'Tuzat: He go to school yesterday',
  'Menga misollar ber',
  'Articles (a / an / the) ni tushuntir',
];

const TOPIC_MAP: { re: RegExp; id: string }[] = [
  { re: /present\s*simple|hozirgi\s*oddiy/i, id: 'g02' },
  { re: /present\s*continuous|present\s*progressive|davomli/i, id: 'g03' },
  { re: /past\s*simple|o['‘’]?tgan\s*(oddiy|zamon)/i, id: 'g07' },
  { re: /present\s*perfect/i, id: 'g10' },
  { re: /second\s*conditional|ikkinchi\s*shart/i, id: 'g14' },
  { re: /first\s*conditional|conditional|shart\s*gap|\bif\b/i, id: 'g12' },
  { re: /future|going\s*to|\bwill\b|kelasi\s*zamon/i, id: 'g08' },
  { re: /article|artikl|\ba\s*\/\s*an\b/i, id: 'g04' },
  { re: /pronoun|olmosh/i, id: 'g05' },
  { re: /preposition|predlog|ko['‘’]?makchi/i, id: 'g06' },
  { re: /comparative|superlative|qiyosiy|orttirma/i, id: 'g09' },
  { re: /modal|\bcan\b|\bmust\b|\bshould\b/i, id: 'g11' },
  { re: /passive|majhul/i, id: 'g13' },
  { re: /verb\s*to\s*be|\bto\s*be\b|am\s*,?\s*is\s*,?\s*are/i, id: 'g01' },
];

const DEMO_NOTE = '\n\n(Demo rejim: bu tayyor javoblar, jonli AI emas.)';

function grammarAnswer(id: string): DemoReply | null {
  const l = GRAMMAR.find((g) => g.id === id);
  if (!l) return null;
  const ex = l.examples.slice(0, 3).map((e) => `• ${e.en} — ${e.uz}`).join('\n');
  const text = `${l.emoji} ${l.title} (${l.titleUz})\n\n${l.summaryUz}\n\n${l.explanationUz.slice(0, 2).join('\n\n')}\n\nMisollar:\n${ex}`;
  return { text, link: { label: `“${l.title}” darsini ochish`, route: `/grammar/${l.id}` } };
}

function vocabLookup(raw: string): DemoReply | null {
  const q = raw.toLowerCase().replace(/[“”"'‘’?!.]/g, '').trim();
  if (!q) return null;
  const w = VOCAB.find((v) => v.en.toLowerCase() === q) ?? VOCAB.find((v) => v.uz.toLowerCase().split(/[,;]\s*/).includes(q));
  if (!w) return null;
  return {
    text: `📘 ${w.en} ${w.ipa}\n\nMa’nosi: ${w.uz}\nDaraja: ${w.level} · Mavzu: ${w.topic}\n\nMisol: ${w.exEn}\n${w.exUz}`,
    link: { label: 'So‘zlar bo‘limiga o‘tish', route: '/vocab' },
  };
}

function correction(text: string): DemoReply {
  const r = checkText(text);
  if (!r.issues.length) {
    return { text: `Gapingiz oddiy qoidalar bo‘yicha to‘g‘ri ko‘rinadi ✅\n\n“${r.corrected}”\n\nEslatma: demo tekshiruv faqat tez-tez uchraydigan xatolarni topadi, ma’noni tushunmaydi.` };
  }
  const lines = r.issues.slice(0, 5).map((i) => (i.suggestion ? `• ${i.found} → ${i.suggestion}: ${i.noteUz}` : `• ${i.noteUz}`)).join('\n');
  return { text: `Tuzatilgan variant:\n“${r.corrected}”\n\nNimalar o‘zgardi:\n${lines}` };
}

function startScript(id: string): DemoReply {
  const s = SCRIPTS[id];
  return {
    text: `Zo‘r! “${s.title}” mavzusida suhbatlashamiz. Inglizcha javob yozing — men kichik tuzatishlar beraman. To‘xtatish uchun “to‘xta” deb yozing.\n\n${s.steps[0]}`,
    scriptId: id,
    scriptStep: 0,
  };
}

function continueScript(input: string, id: string, step: number): DemoReply {
  const s = SCRIPTS[id];
  const r = checkText(input);
  let feedback = 'Yaxshi javob! 👍';
  if (r.issues.length) {
    const first = r.issues.find((i) => i.suggestion) ?? r.issues[0];
    feedback = `Kichik tuzatish: “${r.corrected}”\n${first.noteUz}`;
  } else if (r.words < 3) {
    feedback = 'Javobni biroz kengroq yozishga harakat qiling: kamida bitta to‘liq gap.';
  }
  const next = step + 1;
  if (next >= s.steps.length) {
    return { text: `${feedback}\n\nSuhbat tugadi — barakalla! Yana mashq qilish uchun “suhbat” deb yozing.`, scriptId: undefined, scriptStep: undefined };
  }
  return { text: `${feedback}\n\n${s.steps[next]}`, scriptId: id, scriptStep: next };
}

export function demoReply(inputRaw: string, ctx: DemoCtx): DemoReply {
  const input = inputRaw.trim();
  const low = input.toLowerCase();

  if (ctx.scriptId && SCRIPTS[ctx.scriptId]) {
    if (/^(stop|to['‘’]?xta|tugat|bas|exit)\b/i.test(low)) {
      return { text: 'Xo‘p, suhbatni to‘xtatdik. Istasangiz, grammatika yoki so‘z haqida so‘rang.', scriptId: undefined, scriptStep: undefined };
    }
    return continueScript(input, ctx.scriptId, ctx.scriptStep ?? 0);
  }

  // sentence correction
  const corr = input.match(/^(tuzat|correct|check|fix|tekshir)\s*[:\-]?\s*(.+)$/i);
  if (corr) return correction(corr[2]);

  // greetings
  if (/^(hi|hello|hey|salom|assalomu|good (morning|afternoon|evening))\b/i.test(low)) {
    return { text: `Salom, ${ctx.name}! 👋 Men Lingoman. Grammatika, so‘z ma’nolari yoki inglizcha suhbat bo‘yicha yordam beraman.${DEMO_NOTE}` };
  }

  // conversation practice
  if (/(suhbat|conversation|speak|gaplash|role\s*play|mashq qil)/i.test(low)) {
    if (/(ovqat|food|eat)/i.test(low)) return startScript('food');
    if (/(hobby|mashg['‘’]?ulot|sevimli)/i.test(low)) return startScript('hobby');
    return startScript('intro');
  }

  // examples at the student's level
  if (/(misol|example|namuna)/i.test(low) && !/(present|past|future|conditional|passive)/i.test(low)) {
    const pool = VOCAB.filter((v) => v.level === ctx.level);
    const items = sample(pool.length ? pool : VOCAB.filter((v) => LEVELS.indexOf(v.level) <= LEVELS.indexOf(ctx.level)), 3);
    const lines = items.map((v) => `• ${v.exEn}\n  ${v.exUz}  (${v.en}: ${v.uz})`).join('\n');
    return { text: `Sizning darajangiz (${ctx.level}) uchun 3 ta misol:\n\n${lines}` };
  }

  // grammar topics
  for (const t of TOPIC_MAP) {
    if (t.re.test(low)) {
      const a = grammarAnswer(t.id);
      if (a) return a;
    }
  }

  // vocabulary lookups
  const patterns = [
    /what does (.+?) mean/i,
    /(.+?)\s+(?:nima degani|nima deydi|nima demak|ma['‘’]?nosi nima|ma['‘’]?nosi|tarjimasi|qanday tarjima)/i,
    /^(?:translate|tarjima(?: qil)?)\s*[:\-]?\s*(.+)$/i,
    /^(?:meaning of|define)\s+(.+)$/i,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) {
      const hit = vocabLookup(m[1]);
      if (hit) return hit;
      return { text: `“${m[1].trim()}” so‘zi demo lug‘atimda yo‘q (demo lug‘atda ${VOCAB.length} ta so‘z bor). Jonli AI rejimida istalgan so‘zni so‘rash mumkin bo‘ladi.` };
    }
  }
  if (/^[A-Za-z’'-]+$/.test(input)) {
    const hit = vocabLookup(input);
    if (hit) return hit;
  }

  // looks like an English sentence -> check it
  const asciiWords = input.match(/[A-Za-z’']+/g) ?? [];
  if (asciiWords.length >= 3 && asciiWords.length >= input.split(/\s+/).length * 0.8) {
    return correction(input);
  }

  return {
    text: `Men demo rejimdagi Lingoman. Quyidagilarni qila olaman:\n\n• Grammatika mavzularini tushuntirish (masalan, “Present Simple nima?”)\n• So‘z ma’nosi (“beautiful nima degani?”)\n• Gap tuzatish (“Tuzat: He go to school”)\n• Inglizcha suhbat mashqi (“suhbat”)\n• Darajangizga mos misollar (“menga misollar ber”)\n\nPastdagi tayyor savollardan birini tanlang.`,
  };
}
