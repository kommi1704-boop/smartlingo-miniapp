import type { Quiz, Level } from '../types';

// Extended (skill-based) assessment probes.
//
// Honesty rules:
//  - Listening probes are REAL listening: the transcript is spoken by the device's TTS voice and
//    is hidden until after answering. No audioUrl is claimed — this is a synthetic voice, not a
//    human recording, and the UI says so.
//  - Writing is checked by the local rule-based checker (grammar/spelling patterns). The result
//    is an estimate with LOW confidence; the AI writing check in the Writing section gives the
//    richer band feedback.
//  - Speaking has no speech analysis in the app, so it is a structured SELF-report with LOW
//    confidence. It is never presented as a measured pronunciation score.

export interface ListeningProbe {
  id: string; // lp-a2 ...
  level: Level;
  situationUz: string;
  transcript: string; // "Name: text" lines (spoken by TTS)
  questions: Quiz[]; // 2 questions
}

export interface WritingProbe {
  id: string; // wp-a2 ...
  level: Level;
  promptEn: string;
  promptUz: string;
  minWords: number;
}

export interface SpeakingStatement {
  en: string;
  uz: string;
}

export const LISTENING_PROBES: ListeningProbe[] = [
  {
    id: 'lp-a2',
    level: 'A2',
    situationUz: 'Do‘stingiz maktab kutubxonasi haqida gapiradi.',
    transcript: [
      'Tom: Hi, Lola! Where were you yesterday?',
      'Lola: I was in the school library. I needed a book about animals.',
      'Tom: Did you find it?',
      'Lola: Yes! It has beautiful pictures. I borrowed it for two weeks.',
      'Tom: Great! Can I read it after you?',
      'Lola: Of course. Come to my house on Saturday.',
    ].join('\n'),
    questions: [
      {
        id: 'lp-a2-q1',
        q: 'Why did Lola go to the library?',
        options: ['To meet Tom', 'To get a book about animals', 'To return a book', 'To do homework'],
        answer: 1,
        explain: 'Lola “I needed a book about animals” dedi — u hayvonlar haqidagi kitob uchun bordi.',
      },
      {
        id: 'lp-a2-q2',
        q: 'When will Tom read the book?',
        options: ['On Friday', 'On Saturday', 'On Sunday', 'In two weeks'],
        answer: 1,
        explain: 'Lola “Come to my house on Saturday” dedi — Shanba kuni.',
      },
    ],
  },
  {
    id: 'lp-b1',
    level: 'B1',
    situationUz: 'Ikkita do‘st dam olish kunlari rejalari haqida suhbatlashadi.',
    transcript: [
      'Dilnoza: Have you made any plans for the holiday?',
      'Aziz: I wanted to go hiking, but the weather forecast says it will rain all weekend.',
      'Dilnoza: That’s a shame. Why don’t you come with us to the museum instead?',
      'Aziz: Which museum? The history one downtown?',
      'Dilnoza: No, the new science museum. They’ve just opened a space exhibition.',
      'Aziz: That sounds interesting. How much are the tickets?',
      'Dilnoza: Quite cheap for students — about twenty thousand sums. Shall I book three?',
      'Aziz: Yes, please. I’ll take the metro and meet you at the entrance at ten.',
    ].join('\n'),
    questions: [
      {
        id: 'lp-b1-q1',
        q: 'Why has Aziz changed his plans?',
        options: ['The tickets are expensive.', 'The museum is closed.', 'It is going to rain.', 'His friends are busy.'],
        answer: 2,
        explain: 'Aziz ob-havo bashorati tufayli tog‘ga chiqmaslikka qaror qildi — “it will rain all weekend”.',
      },
      {
        id: 'lp-b1-q2',
        q: 'What will Aziz do at ten o’clock?',
        options: ['Book the tickets', 'Meet his friends at the entrance', 'Take a bus downtown', 'Call Dilnoza'],
        answer: 1,
        explain: 'Aziz “meet you at the entrance at ten” dedi — kirish joyida uchrashadi.',
      },
    ],
  },
  {
    id: 'lp-b2',
    level: 'B2',
    situationUz: 'Ikkita o‘quvchi maktab loyihasi va vaqt rejasi haqida muhokama qiladi.',
    transcript: [
      'Sardor: I’ve been working on the project for a week, and I still haven’t finished the research part.',
      'Madina: To be honest, you might be overcomplicating it. The teacher said three sources would be enough.',
      'Sardor: Possibly, but I wanted our presentation to stand out. Anyway, how long did yours take?',
      'Madina: About four days in total, but I made a schedule first and stuck to it. That’s the trick.',
      'Sardor: Fair point. If I had planned better, I wouldn’t be rushing now.',
      'Madina: Exactly. Why don’t you split what’s left into small tasks? It works wonders.',
      'Sardor: I might just do that. Thanks — and remind me never to start a project the night before it’s due again.',
    ].join('\n'),
    questions: [
      {
        id: 'lp-b2-q1',
        q: 'What does Madina think about Sardor’s approach?',
        options: ['He should find more sources.', 'He is making it more complicated than needed.', 'He should start the project again.', 'He is working too quickly.'],
        answer: 1,
        explain: 'Madina “you might be overcomplicating it” dedi — Sardor ishni keragidan ham murakkablashtiryapti.',
      },
      {
        id: 'lp-b2-q2',
        q: 'What does Sardor regret?',
        options: ['Choosing a difficult topic', 'Not planning the project earlier', 'Working with Madina', 'Spending money on the project'],
        answer: 1,
        explain: '“If I had planned better, I wouldn’t be rushing now” — u erta reja tuzmaganidan pushaymon.',
      },
    ],
  },
];

export const WRITING_PROBES: WritingProbe[] = [
  {
    id: 'wp-a2',
    level: 'A2',
    promptEn: 'Write about your family or your best friend. Who are they? What do you do together?',
    promptUz: 'Oilangiz yoki eng yaxshi do‘stingiz haqida yozing. Ular kim? Birga nima qilasiz?',
    minWords: 25,
  },
  {
    id: 'wp-b1',
    level: 'B1',
    promptEn: 'Describe a memorable day from last month. What happened, and how did you feel?',
    promptUz: 'O‘tgan oydan esda qolgan kunni tasvirlab bering. Nima bo‘ldi va qanday his qildingiz?',
    minWords: 45,
  },
  {
    id: 'wp-b2',
    level: 'B2',
    promptEn: 'Some people think children spend too much time on their phones. What is your opinion? Give reasons.',
    promptUz: 'Ba’zilar bolalar telefonga juda ko‘p vaqt sarflashini aytadi. Sizning fikringiz? Asoslarini yozing.',
    minWords: 70,
  },
];

/** Structured self-report for speaking. "I can ..." statements, easiest first. */
export const SPEAKING_STATEMENTS: SpeakingStatement[] = [
  { en: 'I can say my name, age and where I live.', uz: 'Ismim, yoshim va yashash joyim haqida aytib bera olaman.' },
  { en: 'I can order food and ask simple questions in a shop.', uz: 'Do‘konda sodda savol berib ovqat buyurtma qila olaman.' },
  { en: 'I can talk about my day and my plans for tomorrow.', uz: 'Kunim va ertangi rejalarim haqida gapira olaman.' },
  { en: 'I can describe people, places and my hobbies in detail.', uz: 'Odamlar, joylar va sevimli mashg‘ulotlarimni batafsil tasvirlay olaman.' },
  { en: 'I can give my opinion and explain why I think so.', uz: 'Fikrimni aytib, nima uchun shunday o‘ylashimni tushuntira olaman.' },
  { en: 'I can discuss familiar topics for several minutes without long pauses.', uz: 'Tanish mavzularda uzoq to‘xtovsiz suhbatlasha olaman.' },
];

/** Maps the listening probe score (of 2) onto an estimated level + honest confidence. */
const LADDER: Level[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function listeningProbeResult(probeLevel: Level, correct: number): { level: Level; confidence: 'low' | 'medium' } {
  const i = LADDER.indexOf(probeLevel);
  if (correct === 2) return { level: LADDER[Math.min(6, i + 1)], confidence: 'medium' };
  if (correct === 1) return { level: probeLevel, confidence: 'low' };
  return { level: LADDER[Math.max(0, i - 1)], confidence: 'low' };
}

/** Maps the number of "yes" self-statements (0..6) onto a self-reported level. */
export function speakingSelfResult(yes: number): Level {
  if (yes <= 1) return 'A1';
  if (yes <= 2) return 'A2';
  if (yes <= 4) return 'B1';
  return 'B2';
}

/** Maps the writing probe's issues-per-10-words onto an estimated level (LOW confidence). */
export function writingProbeResult(words: number, issues: number, selfLevel: Level): { level: Level; confidence: 'low' } {
  if (words < 10) return { level: 'Pre-A1', confidence: 'low' };
  const ip10 = (issues / words) * 10;
  const bands: [number, Level][] = [
    [0.8, 'C1'],
    [1.6, 'B2'],
    [2.8, 'B1'],
    [4.2, 'A2'],
    [6.5, 'A1'],
  ];
  for (const [limit, level] of bands) if (ip10 <= limit) return { level, confidence: 'low' };
  return { level: 'Pre-A1', confidence: 'low' };
}
