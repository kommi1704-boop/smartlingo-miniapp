// SmartLingo Daily Learning Journey — the personalized session engine (Phase 1).
//
// Every learner gets ONE generated session per day with 4-7 adaptive stages.
// The engine is a deterministic personalization layer ("the AI that never
// hallucinates"): it analyses the learner's real evidence (levels, skill
// accuracy, SRS state, mistakes, interests, history — via learner.ts) and
// composes stages from the VALIDATED content catalogs. Optional AI-generated
// reading texts (api/generate-text, 3/day, strictly sanitized server-side)
// are merged in at runtime and cached; when the AI is unavailable the catalog
// fallback keeps the session complete — a learner never sees an empty stage.
//
// Everything here is PURE (no React, no store): seeded, testable, and stable
// during the day. The store slice and the idempotent reward wiring live in
// journeyActions.ts; stage XP flows through the EXISTING server-authoritative
// paths (vocab_answers / lesson_done / game_done / discovery_done), so no
// reward ever depends on a frontend flag and nothing can be farmed.

import type { Level, PersistedState, Quiz, JourneyAiText, JourneyChallenge, JourneyFact, JourneySession, JourneyStage, JourneyStageKind } from '../types';
import { LEVELS } from '../types';
import { VOCAB } from '../data/vocab';
import { GRAMMAR } from '../data/grammar';
import { READING } from '../data/reading';
import { LISTENING } from '../data/listening';
import { SPEAKING } from '../data/speaking';
import { WRITING } from '../data/writing';
import { GAMES, seededRng, type GameId } from './games';
import { dayOfYear, lastDays, today } from './dates';
import { buildLearnerProfile, type LearnerProfile } from './learner';
import { isKnownVideoId, videoForTheme } from '../data/videos';
import type { EmoName } from '../components/Emo';

const li = (l: Level) => LEVELS.indexOf(l);

// ---------------------------------------------------------------------------
// Theme shape — one theme per daily session (the daily variety)
// ---------------------------------------------------------------------------

export interface JourneyTheme {
  id: string;
  titleEn: string;
  titleUz: string;
  hookUz: string;
  emo: EmoName;
  gradient: string; // full tailwind classes (Tailwind must see them)
  interests: string[]; // INTEREST_CHIPS that boost this theme
  skills: Array<'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing'>; // skill flavour
  keywords: string[]; // matched against vocab/reading/listening content
  facts: JourneyFact[];
  /** Real comprehension question about the theme facts (asked in the DISCOVER stage). */
  check: Quiz;
}

// ---------------------------------------------------------------------------
// Theme pool — the daily variety. Facts are curated, factual and safe.
// ---------------------------------------------------------------------------

export const JOURNEY_THEMES: JourneyTheme[] = [
  {
    id: 'communication',
    titleEn: 'The Power of Communication',
    titleUz: 'Muloqot kuchi',
    hookUz: 'Odamlar qanday fikr uzatadi, his-tuyg‘uni qanday ifodalaydi? Bugun buni inglizcha o‘rganamiz.',
    emo: 'mic',
    gradient: 'from-[#4f46e5] to-[#38bdf8]',
    interests: ['multfilmlar', 'musiqa', "o'yinlar"],
    skills: ['speaking', 'listening'],
    keywords: ['talk', 'speak', 'word', 'langua', 'voice', 'message', 'phone', 'gesture', 'say', 'tell', 'muloqot', 'gapir', 'so‘z', 'ovoz', 'xabar', 'ayt'],
    facts: [
      { en: 'People send about 100,000 words every day when you count all talking, reading and messages.', uz: 'Bir odam sutkasida gapirish, o‘qish va xabarlar bilan o‘rtacha 100 000 so‘z «ishlatadi».' },
      { en: 'Over half of face-to-face meaning comes from tone of voice and body language, not from words.', uz: 'Yuzma-yuz muloqotda ma‘noning yarmidan ko‘pini so‘zlar emas, ohang va tana harakatlari beradi.' },
      { en: 'There are about 7,000 living languages in the world today.', uz: 'Bugun dunyoda taxminan 7 000 tirik til bor — har biri o‘zining «so‘z dunyosi».' },
    ],
    check: { id: 'jc-communication', q: 'How many living languages are there in the world today?', options: ['About 700', 'About 7,000', 'About 70,000', 'About 700,000'], answer: 1, explain: 'Faktlarda: dunyoda bugun taxminan 7 000 tirik til bor.' },
  },
  {
    id: 'animals',
    titleEn: 'Exploring the Animal Kingdom',
    titleUz: 'Hayvonlar olami',
    hookUz: 'Eng tez, eng katta va eng aqlli hayvonlar haqida so‘zlar — bugungi safar tabiatga olib boradi.',
    emo: 'flame',
    gradient: 'from-[#059669] to-[#84cc16]',
    interests: ['hayvonlar', 'tabiat'],
    skills: ['vocabulary', 'reading'],
    keywords: ['animal', 'dog', 'cat', 'bird', 'fish', 'lion', 'tiger', 'horse', 'cow', 'sheep', 'wild', 'zoo', 'elephant', 'monkey', 'hayvon', 'it', 'mushuk', 'qush', 'baliq', 'sher', 'ot', 'sigir', 'qo‘y'],
    facts: [
      { en: 'A blue whale’s heart is about the size of a small car — the largest heart on Earth.', uz: 'Ko‘k kitning yurigi kichik avtomobilChalik — Yer yuzidagi eng katta yurak.' },
      { en: 'Dogs can learn more than 1,000 words and understand simple grammar in tests.', uz: 'Itlar testlarda 1 000 dan ortiq so‘zni o‘rganib, oddiy grammatikani ham tushunadi.' },
      { en: 'Octopuses have three hearts and blue blood.', uz: 'Axtofodalarda uchta yurak va ko‘kimtir qon bor.' },
    ],
    check: { id: 'jc-animals', q: 'How many hearts does an octopus have?', options: ['One', 'Two', 'Three', 'Eight'], answer: 2, explain: 'Faktlarda: axtofodalarda uchta yurak va ko‘kimtir qon bor.' },
  },
  {
    id: 'history',
    titleEn: 'The Mystery of Ancient Civilizations',
    titleUz: 'Qadimiy sivilizatsiyalar siri',
    hookUz: 'Piramidalar, yozuvlar va qadimiy shaharlar — tarix o‘z so‘zlarini ham qoldiradi.',
    emo: 'gem',
    gradient: 'from-[#b45309] to-[#f59e0b]',
    interests: ['sayohat', 'multfilmlar'],
    skills: ['reading', 'grammar'],
    keywords: ['ancient', 'history', 'castle', 'king', 'queen', 'empire', 'pyramid', 'temple', 'ruin', 'museum', 'old', 'tarix', 'qadimiy', 'shoh', 'ibodatxona', 'qal‘a', 'muzey'],
    facts: [
      { en: 'The Great Pyramid of Giza was the tallest building on Earth for about 3,800 years.', uz: 'Giza piramidasi taxminan 3 800 yil davomida Yerdagi eng baland inshoot bo‘lib kelgan.' },
      { en: 'People started writing about 5,000 years ago in Mesopotamia.', uz: 'Yozuv taxminan 5 000 yil oldin Mesopotamiyada paydo bo‘lgan.' },
      { en: 'Samarkand’s Registan has been a centre of learning for centuries.', uz: 'Samarqanddagi Registon asrlar davomida ilm-fan markazi bo‘lgan.' },
    ],
    check: { id: 'jc-history', q: 'The Great Pyramid of Giza was the tallest building on Earth for about…', options: ['38 years', '380 years', '3,800 years', '38,000 years'], answer: 2, explain: 'Faktlarda: piramida taxminan 3 800 yil davomida eng baland bo‘lgan.' },
  },
  {
    id: 'technology',
    titleEn: 'Technology That Changes Our Future',
    titleUz: 'Kelajakni o‘zgartiruvchi texnologiya',
    hookUz: 'Robotlar, ilova va sun’iy intellekt — texnologiya tili ham inglizchada gapiradi.',
    emo: 'bolt',
    gradient: 'from-[#4338ca] to-[#a21caf]',
    interests: ['texnologiya', 'ilm-fan', "o'yinlar"],
    skills: ['vocabulary', 'reading'],
    keywords: ['computer', 'robot', 'internet', 'digital', 'app', 'machine', 'innovat', 'technology', 'online', 'screen', 'kompyuter', 'texnologiya', 'kelajak', 'mashina', 'dastur', 'telefon'],
    facts: [
      { en: 'The first computer “bug” was a real moth found inside a machine in 1947.', uz: 'Birinchi kompyuter «xatosi» 1947-yilda mashina ichidan topilgan haqiqiy kapalak edi.' },
      { en: 'Modern chips can be smaller than a grain of rice yet hold billions of parts.', uz: 'Zamonaviy chiplar guruch donidan kichik bo‘lib, milliardlab elementni sig‘diradi.' },
      { en: 'About 5 billion people use the internet today.', uz: 'Bugun internetdan taxminan 5 milliard odam foydalanadi.' },
    ],
    check: { id: 'jc-technology', q: 'The first computer “bug” in 1947 was…', options: ['a real moth', 'a virus', 'a broken cable', 'a wrong number'], answer: 0, explain: 'Faktlarda: birinchi «bug» — mashina ichidan topilgan haqiqiy kapalak.' },
  },
  {
    id: 'success',
    titleEn: 'The Psychology of Success',
    titleUz: 'Muvaffaqiyat psixologiyasi',
    hookUz: 'Kichik qadamlar katta natijalarga olib keladi — bugun odatlar va maqsadlar haqida gaplashamiz.',
    emo: 'trophy',
    gradient: 'from-[#d97706] to-[#fbbf24]',
    interests: ['sport', 'o\'yinlar'],
    skills: ['grammar', 'speaking'],
    keywords: ['goal', 'dream', 'success', 'habit', 'practice', 'effort', 'confident', 'plan', 'future', 'maqsad', 'orzu', 'muvaffaqiyat', 'odat', 'mashq', 'mehnat', 'ishonch'],
    facts: [
      { en: 'Studies suggest a new daily habit takes about two months to feel automatic.', uz: 'Tadqiqotlarga ko‘ra, yangi kundalik odat avtomatik his qilinishi uchun taxminan ikki oy ketadi.' },
      { en: 'Writing down your goals makes you noticeably more likely to reach them.', uz: 'Maqsadlaringizni yozib qo‘yish ularga erish ehtimolini sezilarli oshiradi.' },
      { en: 'Practice in short, regular sessions works better than one long session a week.', uz: 'Qisqa-qaqsa, muntazam mashqlar haftada bir marta uzun mashq qilishdan samaraliroq.' },
    ],
    check: { id: 'jc-success', q: 'How long does a new daily habit take to feel automatic?', options: ['About 2 days', 'About 2 weeks', 'About two months', 'About two years'], answer: 2, explain: 'Faktlarda: yangi odat avtomatik bo‘lishi uchun taxminan ikki oy ketadi.' },
  },
  {
    id: 'cultures',
    titleEn: 'Exploring Different Cultures',
    titleUz: 'Turli madaniyatlar dunyosi',
    hookUz: 'Bayramlar, odatlar va salomlashish usullari — har mamlakatda har xil.',
    emo: 'globe',
    gradient: 'from-[#7c3aed] to-[#ec4899]',
    interests: ['sayohat', 'musiqa', 'ovqat'],
    skills: ['listening', 'reading'],
    keywords: ['culture', 'tradition', 'festival', 'custom', 'country', 'travel', 'holiday', 'celebrate', 'world', 'madaniyat', 'an’ana', 'bayram', 'mamlakat', 'sayohat', 'dunyo'],
    facts: [
      { en: 'New Zealand’s “hongi” greeting means two people share the same breath.', uz: 'Yangi Zelandiyadagi «hongi» salomi — ikki kishi bir nafasni bo‘lishishi degan ma‘noni beradi.' },
      { en: 'In Japan, slurping noodles loudly shows the cook respect.', uz: 'Yaponiyada lapshani shovqin chiqarib ichish oshpazga hurmat belgisi hisoblanadi.' },
      { en: 'Navruz — the spring new year — is celebrated in many countries across Central Asia.', uz: 'Navruz — bahor yangi yili — Markaziy Osiyoning ko‘plab mamlakatlarida nishonlanadi.' },
    ],
    check: { id: 'jc-cultures', q: 'In Japan, slurping noodles loudly shows…', options: ['you are rude', 'respect to the cook', 'you are finished', 'you are hungry'], answer: 1, explain: 'Faktlarda: Yaponiyada lapshani shovqin bilan ichish oshpazga hurmat belgisi.' },
  },
  {
    id: 'everyday',
    titleEn: 'Everyday English Conversations',
    titleUz: 'Kundalik inglizcha suhbatlar',
    hookUz: 'Do‘kon, do‘stlar va maktab — real hayotdagi gaplashish jumlalari bugungi mavzu.',
    emo: 'game',
    gradient: 'from-[#0ea5e9] to-[#22d3ee]',
    interests: ["o'yinlar", 'multfilmlar'],
    skills: ['speaking', 'vocabulary'],
    keywords: ['greet', 'shop', 'family', 'friend', 'school', 'daily', 'routine', 'market', 'weather', 'name', 'salom', 'do‘st', 'oila', 'maktab', 'bozor', 'kundalik', 'ob-havo', 'ism'],
    facts: [
      { en: 'The 100 most common English words make up about half of everyday conversation.', uz: 'Eng ko‘p ishlatiladigan 100 ta inglizcha so‘z kundalik suhbatning yarmidan ko‘pini tashkil etadi.' },
      { en: '“How are you?” is often just a greeting — the usual answer is short: “Fine, thanks!”', uz: '«How are you?» ko‘pincha oddiy salomlashish — odatiy javobi ham qisqa: «Fine, thanks!»' },
      { en: 'Small talk about weather is popular in Britain because it is a safe topic for everyone.', uz: 'Buyuk Britaniyada ob-havo haqida «small talk» mashhur — bu hamma uchun xavfsiz mavzu.' },
    ],
    check: { id: 'jc-everyday', q: 'What is the usual short answer to “How are you?”', options: ['Fine, thanks!', 'My name is Ali.', 'I am twelve.', 'Goodbye!'], answer: 0, explain: 'Faktlarda: «How are you?» ko‘pincha oddiy salom — javobi qisqa: «Fine, thanks!»' },
  },
  {
    id: 'space',
    titleEn: 'Space and the Universe',
    titleUz: 'Kosmos va koinot',
    hookUz: 'Sayyoralardan galaktikalargacha — koinotning umuman tinchamaydigan tillari bor.',
    emo: 'rocket',
    gradient: 'from-[#1e1b4b] to-[#6366f1]',
    interests: ['kosmos', 'ilm-fan', 'texnologiya'],
    skills: ['reading', 'listening'],
    keywords: ['space', 'planet', 'star', 'moon', 'mars', 'galaxy', 'rocket', 'astronaut', 'universe', 'earth', 'sky', 'kosmos', 'sayyora', 'yulduz', 'oy', 'raketa', 'koinot', 'yer'],
    facts: [
      { en: 'A day on Venus is longer than its year — Venus spins very slowly.', uz: 'Venerada bir sutka uning yilidan uzoqroq — Venera juda sekin aylanadi.' },
      { en: 'Neutron stars can spin about 700 times per second.', uz: 'Neytron yulduzlari soniyasiga taxminan 700 marta aylanishi mumkin.' },
      { en: 'The first human in space, Yuri Gagarin, flew in 1961 — the flight lasted 108 minutes.', uz: 'Kosmosga birinchi uchgan odam Yuriy Gagarin — 1961-yil, parvoz 108 daqiqa davom etgan.' },
    ],
    check: { id: 'jc-space', q: 'Who was the first human in space?', options: ['Neil Armstrong', 'Yuri Gagarin', 'Alexei Leonov', 'Buzz Aldrin'], answer: 1, explain: 'Faktlarda: birinchi odam — Yuriy Gagarin, 1961-yil, 108 daqiqalik parvoz.' },
  },
  {
    id: 'business',
    titleEn: 'The World of Business',
    titleUz: 'Biznes olami',
    hookUz: 'Pul, ish va mijozlar haqidagi so‘zlar — kelajakdagi kasbingiz uchun foydali.',
    emo: 'coin',
    gradient: 'from-[#065f46] to-[#10b981]',
    interests: ['sport', 'texnologiya'],
    skills: ['vocabulary', 'writing'],
    keywords: ['business', 'money', 'job', 'work', 'company', 'customer', 'sell', 'buy', 'market', 'shop', 'pay', 'bisnes', 'pul', 'ish', 'kompaniya', 'mijoz', 'sotish', 'bozor', 'do‘kon'],
    facts: [
      { en: 'Many famous companies started in garages — including Apple and Google.', uz: 'Mashhur kompaniyalarning ko‘pi garajda boshlangan — Apple va Google ham shu jumladan.' },
      { en: 'The word “salary” comes from “salt” — Roman soldiers were once paid in it.', uz: '«Salary» (maosh) so‘zi «tuz»dan chiqqan — rimlik askarlarga maosh tuz bilan berilgan.' },
      { en: 'A simple, clear name helps new shops grow faster than clever long names.', uz: 'Yangi do‘konlar uchun sodda va aniq nom aqlli-uzun nomlarga qaraganda tezroq o‘sishga yordam beradi.' },
    ],
    check: { id: 'jc-business', q: 'The word “salary” comes from the word for…', options: ['sand', 'salt', 'silver', 'sale'], answer: 1, explain: 'Faktlarda: rimlik askarlarga maosh tuz bilan berilgan — «salary» «salt»dan.' },
  },
  {
    id: 'environment',
    titleEn: 'Environmental Challenges',
    titleUz: 'Ekologik muammolar',
    hookUz: 'Suv, energiya va o‘rmonlar — sayorani saqlash ham inglizcha so‘zlarni talab qiladi.',
    emo: 'sparkle',
    gradient: 'from-[#15803d] to-[#a3e635]',
    interests: ['tabiat', 'ilm-fan'],
    skills: ['reading', 'grammar'],
    keywords: ['environment', 'climate', 'nature', 'pollution', 'recycle', 'forest', 'ocean', 'plastic', 'energy', 'water', 'tree', 'ekologiya', 'tabiat', 'iflos', 'o‘rmon', 'okean', 'energiya', 'iqlim', 'suv', 'daraxt'],
    facts: [
      { en: 'Recycling one aluminium can saves enough energy to power a TV for three hours.', uz: 'Bitta alyuminiy bankani qayta ishlash uch soat televizor ishlatadigan energiya tejaydi.' },
      { en: 'About 71% of the Earth’s surface is ocean.', uz: 'Yer yuzining taxminan 71 foizi okean.' },
      { en: 'One large tree can give a day’s oxygen for up to four people.', uz: 'Bitta katta daraxt to‘rt kishiga bir kunlik kislorod berishi mumkin.' },
    ],
    check: { id: 'jc-environment', q: 'About what part of the Earth’s surface is ocean?', options: ['31%', '51%', '71%', '91%'], answer: 2, explain: 'Faktlarda: Yer yuzining taxminan 71 foizi okean.' },
  },
  {
    id: 'food',
    titleEn: 'Food Around the World',
    titleUz: 'Dunyo oshxonalari',
    hookUz: 'Ovqatlar, ta‘mlar va retseptlar — bir marta ham charchamaydigan mavzu.',
    emo: 'gift',
    gradient: 'from-[#c2410c] to-[#fb923c]',
    interests: ['ovqat', 'sayohat'],
    skills: ['vocabulary', 'listening'],
    keywords: ['food', 'fruit', 'vegetable', 'cook', 'meal', 'breakfast', 'taste', 'recipe', 'eat', 'kitchen', 'ovqat', 'meva', 'sabzavot', 'nonushta', 'ta‘m', 'retsept', 'oshxona'],
    facts: [
      { en: 'Apples float in water because about a quarter of an apple is air.', uz: 'Olma suvda suzadi — chunki olmaning to‘rtdan bir qismi havo.' },
      { en: 'Honey found in ancient tombs is still safe to eat after thousands of years.', uz: 'Qadimiy maqbaralardan topilgan asal ming yillardan keyin ham yeyishga yaroqli.' },
      { en: 'Osh — Central Asia’s famous dish — has many regional recipes, each family keeps its own.', uz: 'Markaziy Osiyoning mashhur taami — osh — har xil hududiy retseptga ega; har oila o‘zinikini saqlaydi.' },
    ],
    check: { id: 'jc-food', q: 'Why do apples float in water?', options: ['They are very light', 'About a quarter of an apple is air', 'Their skin is oily', 'They grow near water'], answer: 1, explain: 'Faktlarda: olmaning to‘rtdan bir qismi havo — shuning uchun suzadi.' },
  },
  {
    id: 'sport',
    titleEn: 'Sport and a Healthy Mind',
    titleUz: 'Sport va sog‘lom fikrlash',
    hookUz: 'Jamoa, g‘alaba va mashg‘ulotlar — sport inglizchada ham eng jonli mavzulardan.',
    emo: 'target',
    gradient: 'from-[#be123c] to-[#fb7185]',
    interests: ['futbol', 'sport'],
    skills: ['listening', 'speaking'],
    keywords: ['sport', 'health', 'exercise', 'team', 'game', 'win', 'train', 'body', 'ball', 'run', 'play', 'sport', 'salomatlik', 'mashq', 'jamoa', 'g‘alaba', 'yugur', 'o‘yin'],
    facts: [
      { en: 'The Olympic Games began in ancient Greece about 2,800 years ago.', uz: 'Olimpiya o‘yinlari taxminan 2 800 yil oldin qadimgi Yunonistonda boshlangan.' },
      { en: 'Regular exercise improves memory and focus — not just muscles.', uz: 'Muntazam mashq faqat mushkellarni emas, xotira va diqqatni ham yaxshilaydi.' },
      { en: 'A football player runs about 10 kilometres in one match.', uz: 'Futbolchi bitta o‘yinda taxminan 10 kilometr yuguradi.' },
    ],
    check: { id: 'jc-sport', q: 'About how far does a football player run in one match?', options: ['1 kilometre', '5 kilometres', '10 kilometres', '20 kilometres'], answer: 2, explain: 'Faktlarda: futbolchi bitta o‘yinda taxminan 10 km yuguradi.' },
  },
];

export const themeById = (id: string): JourneyTheme => JOURNEY_THEMES.find((t) => t.id === id) ?? JOURNEY_THEMES[6]; // fallback: everyday

// ---------------------------------------------------------------------------
// Content pickers — real catalog items, level-filtered, never invented
// ---------------------------------------------------------------------------

const matches = (haystack: string, keywords: string[]): boolean => {
  const h = haystack.toLowerCase();
  return keywords.some((k) => h.includes(k));
};

const wordHits = (keywords: string[]) =>
  VOCAB.filter((w) => matches(`${w.en} ${w.uz} ${w.topic} ${w.exEn}`, keywords));

const levelOk = (level: Level, est: Level) => li(level) <= li(est) + 1;

/** 4-6 theme words at the learner's level, unlearned first, best-scored last. */
function pickVocabWords(theme: JourneyTheme, est: Level, s: PersistedState, rnd: () => number): string[] {
  const maxIdx = li(est) + 1;
  const thematic = wordHits(theme.keywords).filter((w) => li(w.level) <= maxIdx);
  const pool = thematic.length >= 4
    ? thematic
    : [...thematic, ...VOCAB.filter((w) => li(w.level) <= maxIdx && !thematic.includes(w))];
  const scored = pool
    .map((w) => {
      const p = s.vocab[w.id];
      const seen = p ? 1 : 0;
      const learned = p?.status === 'learned' ? 2 : 0;
      // prefer unseen words; learned words only fill the tail
      return { id: w.id, rank: learned * 10 + seen + rnd() * 1.5 };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.id);
  const uniq = [...new Set(scored)];
  const n = Math.min(5, Math.max(4, uniq.length));
  return uniq.slice(0, n);
}

/** Weakest grammar topic first, then the closest fresh lesson, else a revisit. */
function pickGrammar(est: Level, lp: LearnerProfile, s: PersistedState, rnd: () => number): string | null {
  const weak = lp.grammar.filter((g) => g.status === 'weak' && levelOk(g.level, est));
  if (weak.length && rnd() < 0.75) return weak[Math.floor(rnd() * weak.length)].id;
  const maxIdx = li(est) + 1;
  const fresh = GRAMMAR.filter((g) => li(g.level) <= maxIdx && !s.lessons[`grammar:${g.id}`]?.completed);
  if (fresh.length) {
    return [...fresh].sort((a, b) => Math.abs(li(a.level) - li(est)) - Math.abs(li(b.level) - li(est)))[0].id;
  }
  const pool = GRAMMAR.filter((g) => li(g.level) <= maxIdx);
  if (!pool.length) return null;
  const weakest = [...pool].sort((a, b) => {
    const ra = s.lessons[`grammar:${a.id}`];
    const rb = s.lessons[`grammar:${b.id}`];
    return (ra ? ra.bestScore / ra.total : 0) - (rb ? rb.bestScore / rb.total : 0);
  })[0];
  return weakest.id;
}

/** Theme-matched reading at the learner's level; falls back to the next unfinished passage. */
function pickReading(theme: JourneyTheme, est: Level, s: PersistedState): string | null {
  const maxIdx = li(est) + 1;
  const pool = READING.filter((r) => li(r.level) <= maxIdx);
  const thematic = pool.filter((r) => matches(`${r.title} ${r.text.slice(0, 400)}`, theme.keywords));
  const open = (list: typeof READING) => list.filter((r) => !s.lessons[`reading:${r.id}`]?.completed);
  const list = open(thematic).length ? open(thematic) : open(pool).length ? open(pool) : pool;
  if (!list.length) return null;
  return list[dayOfYear(today()) % list.length].id;
}

function pickListening(theme: JourneyTheme, est: Level, s: PersistedState): string | null {
  const maxIdx = li(est) + 1;
  const pool = LISTENING.filter((r) => li(r.level) <= maxIdx);
  const thematic = pool.filter((r) => matches(`${r.title} ${r.situationUz} ${r.transcript.slice(0, 300)}`, theme.keywords));
  const open = (list: typeof LISTENING) => list.filter((r) => !s.lessons[`listening:${r.id}`]?.completed);
  const list = open(thematic).length ? open(thematic) : open(pool).length ? open(pool) : pool;
  if (!list.length) return null;
  return list[(dayOfYear(today()) + 2) % list.length].id;
}

function pickGame(theme: JourneyTheme, est: Level, s: PersistedState, rnd: () => number, opts: { tts?: boolean }): GameId {
  const playable = GAMES.filter((g) => !g.needsAudio || opts.tts === true);
  const pool = playable.length ? playable : GAMES;
  // skill flavour: listening theme -> listen game when playable; vocab themes -> memory
  const bySkill: Partial<Record<GameId, string[]>> = {
    listen: ['listening'],
    memory: ['vocabulary'],
    scramble: ['grammar'],
    blitz: ['vocabulary', 'reading'],
    runner: ['reading'],
  };
  const wanted = pool.filter((g) => (bySkill[g.id] ?? []).some((sk) => theme.skills.includes(sk as never)));
  const from = wanted.length && rnd() < 0.6 ? wanted : pool;
  const leastPlayed = [...from].sort((a, b) => (s.games.best[a.id]?.plays ?? 0) - (s.games.best[b.id]?.plays ?? 0));
  return leastPlayed[Math.floor(rnd() * Math.min(2, leastPlayed.length))].id;
}

function pickChallenge(lp: LearnerProfile, s: PersistedState, est: Level, date: string, rnd: () => number): JourneyChallenge {
  if (lp.mistakes.open >= 4) return { type: 'mistakes', count: Math.min(5, lp.mistakes.open) };
  const spokeThisWeek = lastDays(7, date).some((k) => (s.activity[k]?.speaking ?? 0) > 0);
  if (!spokeThisWeek && (lp.speaking.completions === 0 || rnd() < 0.55)) {
    const pool = SPEAKING.filter((x) => li(x.level) <= li(est) + 1 && x.kind === 'conversation');
    const list = pool.length ? pool : SPEAKING;
    const open = list.filter((x) => !(s.speakingDone[x.id]?.length));
    const pick = open[0] ?? list[dayOfYear(date) % list.length];
    return { type: 'speaking', promptId: pick.id };
  }
  const wpool = WRITING.filter((x) => li(x.level) <= li(est) + 1);
  const wlist = wpool.length ? wpool : WRITING;
  const wopen = wlist.filter((x) => !s.writing.some((w) => w.promptId === x.id));
  const wpick = wopen[0] ?? wlist[dayOfYear(date) % wlist.length];
  return { type: 'writing', promptId: wpick.id };
}

// ---------------------------------------------------------------------------
// Theme selection — interests and weak skills boost a theme; recent themes repeat less
// ---------------------------------------------------------------------------

export function pickTheme(s: PersistedState, date: string, history: string[], rnd: () => number): JourneyTheme {
  const lp = buildLearnerProfile(s, date);
  const interests = s.profile?.interests ?? [];
  const weakest = (Object.keys(lp.skills) as (keyof typeof lp.skills)[])
    .filter((k) => lp.skills[k].accuracy !== null)
    .sort((a, b) => (lp.skills[a].accuracy ?? 1) - (lp.skills[b].accuracy ?? 1))
    .slice(0, 2);
  const recent = new Set(history.slice(-4));
  const weighted = JOURNEY_THEMES.map((t) => {
    let w = 1;
    if (interests.some((i) => t.interests.includes(i))) w *= 2.6;
    if (t.skills.some((sk) => weakest.includes(sk))) w *= 1.5;
    if (recent.has(t.id)) w *= 0.15; // strong push away from yesterday's themes
    return { t, w };
  });
  const total = weighted.reduce((a, x) => a + x.w, 0);
  let roll = rnd() * total;
  for (const x of weighted) {
    roll -= x.w;
    if (roll <= 0) return x.t;
  }
  return weighted[weighted.length - 1].t;
}

// ---------------------------------------------------------------------------
// Composition — how many stages today, sized by the learner's daily minutes
// ---------------------------------------------------------------------------

function composition(minutes: number, lp: LearnerProfile, date: string, rnd: () => number): JourneyStageKind[] {
  const target = Math.min(25, Math.max(15, minutes));
  const kinds: JourneyStageKind[] = ['discover', 'vocab', 'grammar'];
  const rot = rnd() < 0.5 ? 'reading' : 'listening'; // one rotating skill slot
  if (target >= 18) kinds.push(rot);
  if (target >= 21) kinds.push('game');
  if (target >= 24) {
    const other = rot === 'reading' ? 'listening' : 'reading';
    if (!kinds.includes(other)) kinds.splice(3, 0, other); // keep discover,vocab,grammar first
  }
  kinds.push('challenge');
  // a learner with many open mistakes practices them INSTEAD of the extra game when short on time
  if (lp.mistakes.open >= 4 && target < 21 && kinds.includes('game')) kinds.splice(kinds.indexOf('game'), 1);
  void date;
  return kinds.slice(0, 8);
}

const MINUTES_BY_KIND: Record<JourneyStageKind, number> = {
  discover: 3, vocab: 5, grammar: 6, listening: 5, reading: 6, game: 4, challenge: 5,
};

const STAGE_META: Record<JourneyStageKind, { title: string; desc: string; emo: EmoName }> = {
  discover: { title: 'Kashfiyot', desc: 'Mavzuga kirish: qiziqarli faktlar', emo: 'sparkle' },
  vocab: { title: 'Yangi so‘zlar', desc: 'Mavzuli so‘zlarni o‘rganish va mashq', emo: 'cards' },
  grammar: { title: 'Grammatika', desc: 'Qoida + interaktiv mashqlar', emo: 'puzzle' },
  listening: { title: 'Tinglash', desc: 'Audio suhbat va tushunish savollari', emo: 'headset' },
  reading: { title: 'O‘qish', desc: 'Mavzuli matn va tushunish savollari', emo: 'book' },
  game: { title: 'Mini o‘yin', desc: 'Bugungi so‘zlarni o‘yin bilan mustahkamlash', emo: 'game' },
  challenge: { title: 'Yakuniy challenge', desc: 'O‘z bilimingizni sinang', emo: 'target' },
};

function stageMinutes(kinds: JourneyStageKind[], target: number): Record<string, number> {
  const total = kinds.reduce((a, k) => a + MINUTES_BY_KIND[k], 0);
  const scale = Math.max(0.7, Math.min(1.6, target / Math.max(1, total)));
  const out: Record<string, number> = {};
  for (const k of kinds) out[k] = Math.max(2, Math.round(MINUTES_BY_KIND[k] * scale));
  return out;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export interface BuildOpts {
  tts?: boolean; // is TTS available (listening + audio games need it)
  aiText?: JourneyAiText | null; // cached AI reading (merged into the reading stage)
}

export function buildJourney(s: PersistedState, date: string = today(), opts: BuildOpts = {}): JourneySession {
  const p = s.profile;
  if (!p) return minimalJourney(date);
  const lp = buildLearnerProfile(s, date);
  const rnd = seededRng(`journey:${date}:${p.name}:${p.estimatedLevel}`);
  const theme = pickTheme(s, date, s.journey?.themeHistory ?? [], rnd);
  const target = Math.min(25, Math.max(15, p.dailyMinutes));
  const kinds = composition(target, lp, date, rnd);
  const mins = stageMinutes(kinds, target);
  const est = p.estimatedLevel;

  const stages: JourneyStage[] = [];
  let idx = 0;
  const push = (st: Omit<JourneyStage, 'id'>) => stages.push({ ...st, id: `s${idx++}` });

  for (const kind of kinds) {
    const meta = STAGE_META[kind];
    switch (kind) {
      case 'discover': {
        const video = videoForTheme(theme.id);
        push({
          kind, ...meta, minutes: mins[kind],
          reason: 'Har safar qiziqarli kirish bilan boshlanadi — video va faktlar mavzuni «jonlantiradi».',
          facts: theme.facts,
          check: theme.check,
          videoId: video?.videoId,
        });
        break;
      }
      case 'vocab': {
        const words = pickVocabWords(theme, est, s, rnd);
        push({
          kind, ...meta, minutes: mins[kind],
          reason: words.length ? 'Mavzu so‘zlari darajangizga mos — kontekstda o‘rganish eng mustahkam yo‘l.' : 'Darajangizga mos yangi so‘zlar.',
          words: words.length >= 3 ? words : VOCAB.filter((w) => li(w.level) <= li(est)).slice(0, 5).map((w) => w.id),
        });
        break;
      }
      case 'grammar': {
        const gid = pickGrammar(est, lp, s, rnd);
        if (!gid) break;
        const g = GRAMMAR.find((x) => x.id === gid)!;
        push({
          kind, emo: meta.emo, title: `Grammatika: ${g.titleUz || g.title}`, desc: g.summaryUz, minutes: mins[kind],
          reason: lp.grammar.find((x) => x.id === gid)?.status === 'weak'
            ? 'Bu mavzuda natijangiz past bo‘lgan — bugun aynan uni mustahkamlaysiz.'
            : 'Grammatika ketma-ketligidagi keyingi mavzu.',
          grammarId: gid,
        });
        break;
      }
      case 'listening': {
        const lid = pickListening(theme, est, s);
        if (!lid) break;
        const l = LISTENING.find((x) => x.id === lid)!;
        push({
          kind, emo: meta.emo, title: `Tinglash: ${l.title}`, desc: l.situationUz, minutes: mins[kind],
          reason: 'Tinglash ko‘nikmasi faqat tinglash bilan o‘sadi.',
          listeningId: lid,
        });
        break;
      }
      case 'reading': {
        const rid = pickReading(theme, est, s);
        push({
          kind, emo: meta.emo, title: rid ? `O‘qish: ${READING.find((x) => x.id === rid)!.title}` : 'O‘qish', desc: 'Matnni o‘qing va savollarga javob bering', minutes: mins[kind],
          reason: 'O‘qish lug‘at va grammatikani birga mustahkamlaydi.',
          readingId: rid ?? undefined,
        });
        break;
      }
      case 'game': {
        const gid = pickGame(theme, est, s, rnd, opts);
        const g = GAMES.find((x) => x.id === gid)!;
        push({
          kind, emo: meta.emo, title: `Mini o‘yin: ${g.title}`, desc: g.tagline, minutes: mins[kind],
          reason: 'O‘yin shaklida takrorlash — bugungi so‘zlarni mustahkamlash.',
          gameId: gid,
        });
        break;
      }
      case 'challenge': {
        const ch = pickChallenge(lp, s, est, date, rnd);
        const titles: Record<JourneyChallenge['type'], string> = {
          speaking: 'Challenge: gapirib ko‘rsating',
          writing: 'Challenge: yozib ko‘ring',
          mistakes: 'Challenge: xatolarni tuzatish',
        };
        push({
          kind, emo: ch.type === 'mistakes' ? 'brain' : ch.type === 'speaking' ? 'mic' : 'pen',
          title: titles[ch.type], desc: ch.type === 'mistakes' ? `${ch.count} ta xatoni qayta ishlash` : 'Ovozli/yozma topshiriq', minutes: mins[kind],
          reason: ch.type === 'mistakes'
            ? 'Xatolar daftaringiz to‘lgan — ularni tuzatish eng tez o‘sish nuqtasi.'
            : ch.type === 'speaking'
              ? 'Gapirish — bilimni jonli ko‘nikmaga aylantiradi.'
              : 'Yozish — grammatikani erkin qo‘llash mashqi.',
          challenge: ch,
        });
        break;
      }
    }
  }

  const session: JourneySession = {
    date, seed: `journey:${date}:${p.name}`, themeId: theme.id,
    titleEn: theme.titleEn, titleUz: theme.titleUz, hookUz: theme.hookUz,
    level: est, minutes: stages.reduce((a, x) => a + x.minutes, 0),
    stages, objectives: objectivesFor(stages), rewardsXp: [55, 95],
  };
  const merged = withAiText(session, opts.aiText ?? null);
  return validateJourney(merged, s) ? merged : buildFallbackJourney(s, date, opts);
}

/** Embeds the (optional) AI reading text into the reading stage. */
export function withAiText(session: JourneySession, ai: JourneyAiText | null): JourneySession {
  if (!ai) return session;
  const stages = session.stages.map((st) => {
    if (st.kind !== 'reading') return st;
    const quiz: Quiz[] = ai.questions.slice(0, 4).map((q, i) => ({
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

function objectivesFor(stages: JourneyStage[]): string[] {
  const out: string[] = [];
  for (const st of stages) {
    if (st.kind === 'discover') out.push('Mavzuni qiziqarli faktlar bilan kashf etasiz');
    if (st.kind === 'vocab' && st.words?.length) out.push(`${st.words.length} ta foydali so‘z o‘rganasiz`);
    if (st.kind === 'grammar' && st.grammarId) out.push(`Grammatika mavzusini mustahkamlaysiz: ${st.title.replace('Grammatika: ', '')}`);
    if (st.kind === 'listening') out.push('Tinglab tushunishni mashq qilasiz');
    if (st.kind === 'reading') out.push('Mavzuli matnni o‘qib tushunasiz');
    if (st.kind === 'game') out.push('So‘zlarni o‘yin bilan takrorlaysiz');
    if (st.kind === 'challenge') out.push(st.challenge?.type === 'writing' ? 'Qisqa matn yozib, darhol tahlil olasiz' : st.challenge?.type === 'mistakes' ? 'Xatolaringizni tuzatasiz' : 'Ovoz chiqarib inglizcha gapirasiz');
  }
  return out;
}

// ---------------------------------------------------------------------------
// Quality control (Phase 9) — a broken session is never published
// ---------------------------------------------------------------------------

const quizOk = (q: Quiz | undefined): boolean =>
  !!q && !!q.q && Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 4
  && q.options.every((o) => !!o && o.length > 0 && o.length <= 160)
  && new Set(q.options.map((o) => o.toLowerCase())).size === q.options.length
  && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length
  && !!q.explain && q.explain.length <= 300;

/** Full structural validation. `s` (state) optional — content-id checks always run. */
export function validateJourney(session: JourneySession, s?: PersistedState): boolean {
  if (!session || !Array.isArray(session.stages)) return false;
  if (session.stages.length < 3 || session.stages.length > 8) return false;
  if (session.stages[0].kind !== 'discover') return false;
  if (!session.titleEn || session.titleEn.length > 90) return false;
  if (session.minutes < 10 || session.minutes > 45) return false;
  const seenWords = new Set<string>();
  const seenContent = new Set<string>();
  const theme = JOURNEY_THEMES.find((t) => t.id === session.themeId);
  if (!theme) return false;
  for (const st of session.stages) {
    if (!st.id || st.minutes < 2 || st.minutes > 14) return false;
    if (!st.title || !st.desc) return false;
    switch (st.kind) {
      case 'discover':
        if (!st.facts || st.facts.length < 2 || st.facts.length > 5) return false;
        if (!st.check || !quizOk(st.check)) return false;
        if (st.videoId && !isKnownVideoId(st.videoId)) return false; // only verified, curated videos
        break;
      case 'vocab': {
        if (!st.words || st.words.length < 3 || st.words.length > 6) return false;
        for (const id of st.words) {
          if (seenWords.has(id)) return false;
          seenWords.add(id);
          const w = VOCAB.find((v) => v.id === id);
          if (!w) return false;
          if (s && s.profile && !levelOk(w.level, s.profile.estimatedLevel)) return false;
        }
        break;
      }
      case 'grammar':
        if (!st.grammarId || seenContent.has(st.grammarId)) return false;
        seenContent.add(st.grammarId);
        if (!GRAMMAR.some((g) => g.id === st.grammarId)) return false;
        break;
      case 'listening':
        if (!st.listeningId || seenContent.has(st.listeningId)) return false;
        seenContent.add(st.listeningId);
        if (!LISTENING.some((l) => l.id === st.listeningId)) return false;
        break;
      case 'reading':
        if (!st.aiQuiz) {
          if (!st.readingId || seenContent.has(st.readingId)) return false;
          seenContent.add(st.readingId);
          if (!READING.some((r) => r.id === st.readingId)) return false;
        } else {
          if (!st.aiQuiz.every(quizOk)) return false;
        }
        break;
      case 'game':
        if (!st.gameId || !GAMES.some((g) => g.id === st.gameId)) return false;
        break;
      case 'challenge': {
        const ch = st.challenge;
        if (!ch) return false;
        if (ch.type === 'mistakes') {
          if (!ch.count || ch.count < 1 || ch.count > 10) return false;
        } else if (!ch.promptId) return false;
        if (ch.type === 'speaking' && !SPEAKING.some((x) => x.id === ch.promptId)) return false;
        if (ch.type === 'writing' && !WRITING.some((x) => x.id === ch.promptId)) return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Vocabulary recall items (used by the VOCAB stage) — pure + deterministic.
//
// Two item kinds, safest first choice per word:
//   'blank'  — the word's own example with the word blanked out. Built ONLY
//              when the word appears EXACTLY ONCE as a whole word in the
//              sentence AND no other option word also fits the sentence
//              (no ambiguous "two correct answers" questions, ever).
//   'meaning'— English word → correct Uzbek meaning among 3 same-level
//              distractors. Always unambiguous; used whenever the blank
//              rules cannot be satisfied.
// ---------------------------------------------------------------------------

export interface VocabRecallItem {
  wordId: string;
  kind: 'blank' | 'meaning';
  prompt: string; // sentence with _____ (blank) or the English word (meaning)
  options: string[];
  answer: number;
  word: string; // en
  uz: string;
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Deterministic rotation so option order is stable within a day (no Math.random). */
function rotate<T>(arr: T[], k: number): T[] {
  const n = arr.length;
  const r = ((k % n) + n) % n;
  return [...arr.slice(r), ...arr.slice(0, r)];
}

/** vocab-extra.ts ships ~700 bulk sentences of this one shape; blanking the word
 *  leaves "I want to learn the word _____" — no context, every option fits. */
const TEMPLATE_EX = /^i want to learn the word\b/i;

export function vocabRecallItems(wordIds: string[]): VocabRecallItem[] {
  const words = wordIds
    .map((id) => VOCAB.find((w) => w.id === id))
    .filter((w): w is (typeof VOCAB)[number] => !!w);
  if (!words.length) return [];

  return words.map((w, i) => {
    const others = words.filter((x) => x.id !== w.id);
    // --- try fill-in-the-blank (template sentences carry no context → meaning-match) ---
    const wordRe = new RegExp(`\\b${escapeRe(w.en)}\\b`, 'i');
    const occurrences = w.exEn.match(new RegExp(wordRe.source, 'gi'))?.length ?? 0;
    if (occurrences === 1 && !TEMPLATE_EX.test(w.exEn)) {
      const safeOthers = others
        .map((o) => o.en)
        .filter((o) => o !== w.en && !new RegExp(`\\b${escapeRe(o)}\\b`, 'i').test(w.exEn));
      if (safeOthers.length >= 3) {
        const opts = rotate([w.en, ...safeOthers.slice(0, 3)], i + 1);
        return {
          wordId: w.id, kind: 'blank', prompt: w.exEn.replace(wordRe, '_____'),
          options: opts, answer: opts.indexOf(w.en), word: w.en, uz: w.uz,
        };
      }
    }
    // --- meaning match (always safe) ---
    const usedUz = new Set<string>([w.uz]);
    const distractors: string[] = [];
    for (const o of others) {
      if (distractors.length >= 3) break;
      if (o.uz && !usedUz.has(o.uz)) { usedUz.add(o.uz); distractors.push(o.uz); }
    }
    if (distractors.length < 3) {
      // fill from the wider catalog at the same level
      for (const v of VOCAB) {
        if (distractors.length >= 3) break;
        if (v.id === w.id || words.some((x) => x.id === v.id)) continue;
        if (v.level !== w.level || !v.uz || usedUz.has(v.uz)) continue;
        usedUz.add(v.uz); distractors.push(v.uz);
      }
    }
    if (distractors.length < 3) {
      // ultimate fallback: level-mismatched distractors (still unique meanings)
      for (const v of VOCAB) {
        if (distractors.length >= 3) break;
        if (v.id === w.id || !v.uz || usedUz.has(v.uz)) continue;
        usedUz.add(v.uz); distractors.push(v.uz);
      }
    }
    const opts = rotate([w.uz, ...distractors.slice(0, 3)], i);
    return {
      wordId: w.id, kind: 'meaning', prompt: w.en,
      options: opts, answer: opts.indexOf(w.uz), word: w.en, uz: w.uz,
    };
  });
}

// ---------------------------------------------------------------------------
// Fallbacks — a learner must NEVER see an empty or broken session
// ---------------------------------------------------------------------------

/** Conservative, catalog-driven session (used when the primary build fails QC). */
export function buildFallbackJourney(s: PersistedState, date: string = today(), opts: BuildOpts = {}): JourneySession {
  const p = s.profile;
  const est = p?.estimatedLevel ?? 'A2';
  const rnd = seededRng(`journey-fallback:${date}:${est}`);
  const theme = JOURNEY_THEMES[6]; // everyday — the safest theme
  const stages: JourneyStage[] = [];
  let idx = 0;
  const push = (st: Omit<JourneyStage, 'id'>) => stages.push({ ...st, id: `s${idx++}` });

  push({ kind: 'discover', ...STAGE_META.discover, minutes: 3, facts: theme.facts, check: theme.check, videoId: videoForTheme(theme.id)?.videoId });

  const words = VOCAB.filter((w) => li(w.level) <= li(est) && p && s.vocab[w.id]?.status !== 'learned').slice(0, 5).map((w) => w.id);
  push({ kind: 'vocab', ...STAGE_META.vocab, minutes: 5, words: words.length >= 3 ? words : VOCAB.slice(0, 5).map((w) => w.id) });

  const gid = pickGrammar(est, buildLearnerProfile(s, date), s, rnd);
  if (gid) {
    const g = GRAMMAR.find((x) => x.id === gid)!;
    push({ kind: 'grammar', emo: 'puzzle', title: `Grammatika: ${g.titleUz || g.title}`, desc: g.summaryUz, minutes: 6, grammarId: gid });
  }

  const rid = pickReading(theme, est, s);
  if (rid) {
    const r = READING.find((x) => x.id === rid)!;
    push({ kind: 'reading', emo: 'book', title: `O‘qish: ${r.title}`, desc: 'Matnni o‘qing va savollarga javob bering', minutes: 6, readingId: rid });
  }

  push({ kind: 'game', ...STAGE_META.game, minutes: 4, gameId: 'memory' });

  const lp = buildLearnerProfile(s, date);
  const ch = pickChallenge(lp, s, est, date, rnd);
  push({
    kind: 'challenge',
    emo: ch.type === 'mistakes' ? 'brain' : ch.type === 'speaking' ? 'mic' : 'pen',
    title: ch.type === 'mistakes' ? 'Challenge: xatolarni tuzatish' : ch.type === 'speaking' ? 'Challenge: gapirib ko‘rsating' : 'Challenge: yozib ko‘ring',
    desc: ch.type === 'mistakes' ? `${ch.count} ta xatoni qayta ishlash` : 'Ovozli/yozma topshiriq',
    minutes: 5, challenge: ch,
  });

  const session: JourneySession = {
    date, seed: `journey-fallback:${date}`, themeId: theme.id,
    titleEn: theme.titleEn, titleUz: theme.titleUz, hookUz: theme.hookUz,
    level: est, minutes: stages.reduce((a, x) => a + x.minutes, 0),
    stages, objectives: objectivesFor(stages), rewardsXp: [50, 90],
  };
  return session;
}

/** Last-resort minimal session (only if even the fallback fails QC — practically unreachable). */
export function minimalJourney(date: string = today()): JourneySession {
  const theme = JOURNEY_THEMES[6];
  const words = VOCAB.filter((w) => li(w.level) <= 2).slice(0, 4).map((w) => w.id);
  const stages: JourneyStage[] = [
    { id: 's0', kind: 'discover', ...STAGE_META.discover, minutes: 3, facts: theme.facts, check: theme.check, videoId: videoForTheme(theme.id)?.videoId },
    { id: 's1', kind: 'vocab', ...STAGE_META.vocab, minutes: 5, words: words.length ? words : VOCAB.slice(0, 4).map((w) => w.id) },
    { id: 's2', kind: 'game', ...STAGE_META.game, minutes: 4, gameId: 'memory' },
  ];
  return {
    date, seed: `journey-min:${date}`, themeId: theme.id, titleEn: theme.titleEn, titleUz: theme.titleUz,
    hookUz: theme.hookUz, level: 'A2', minutes: 12, stages, objectives: objectivesFor(stages), rewardsXp: [30, 60],
  };
}

// ---------------------------------------------------------------------------
// Server lesson-key helper — must match api/xp.ts LESSON_KEY_RE exactly:
//   /^[a-z0-9][a-z0-9-]{0,40}:[a-z0-9][a-z0-9-]{0,40}$/i
// ---------------------------------------------------------------------------

const compactDate = (date: string): string => date.replace(/-/g, '');

/** `journey-20261120:done` — the daily session-completion key (XP fires once per day). */
export function journeyDoneKey(date: string = today()): string {
  return `journey-${compactDate(date)}:done`;
}

/** `journey-20261120:st2` — per-stage key (used by the AI-reading stage; other stages reuse existing content keys). */
export function journeyStageKey(date: string, stageIndex: number, part: string): string {
  const safe = part.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 12) || 'x';
  return `journey-${compactDate(date)}:st${Math.max(0, Math.min(30, stageIndex))}${safe}`;
}

/** Session progress helper used by the UI: how many stages are done. */
export function journeyProgress(doneCount: number, total: number): number {
  return total ? Math.round((doneCount / total) * 100) : 0;
}
