// ---------- Shared types for SmartLingo AI ----------

export type Level = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const LEVELS: Level[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type Skill = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing';

/** A multiple-choice question. `q` and `options` are English (exercise language); `explain` is Uzbek. */
export interface Quiz {
  id: string;
  q: string;
  options: string[]; // exactly 4
  answer: number; // index into options (0-3)
  explain: string; // Uzbek explanation shown after answering
}

// ---------- Content ----------

export interface VocabWord {
  id: string; // v001, v002 ...
  en: string;
  uz: string; // Uzbek meaning (Latin script)
  ipa: string; // pronunciation text, e.g. /həˈləʊ/
  exEn: string;
  exUz: string;
  level: Level;
  topic: string; // Uzbek topic name, e.g. "Oila"
}

export interface GrammarLesson {
  id: string; // g01 ...
  title: string; // English title, e.g. "Present Simple"
  titleUz: string; // Uzbek subtitle, e.g. "Hozirgi oddiy zamon"
  level: Level;
  emoji: string;
  summaryUz: string; // one-sentence Uzbek summary
  explanationUz: string[]; // Uzbek paragraphs (each paragraph is one string)
  examples: { en: string; uz: string }[];
  mistakes: { wrong: string; right: string; noteUz: string }[];
  quiz: Quiz[]; // 5 questions
}

export interface ReadingPassage {
  id: string; // r01 ...
  title: string;
  level: Level;
  text: string; // paragraphs separated by \n\n
  vocab: { en: string; uz: string }[]; // vocabulary support
  questions: Quiz[]; // 4 questions
}

export interface ListeningActivity {
  id: string; // l01 ...
  title: string;
  level: Level;
  situationUz: string; // Uzbek description of the situation
  transcript: string; // lines separated by \n; dialogues use "Name: text"
  audioUrl?: string; // only set when a real, verified audio URL exists (we leave it undefined)
  questions: Quiz[]; // 4 questions
}

export interface PlacementQuestion extends Quiz {
  section: 'vocabulary' | 'grammar' | 'reading';
  level: Level;
  passage?: string; // short text for reading questions
}

export interface SpeakingPrompt {
  id: string; // s01 ...
  kind: 'conversation' | 'ielts';
  level: Level;
  title: string;
  prompt: string; // English prompt
  promptUz: string; // Uzbek help/translation
  sample: string; // sample answer (English)
  expressions: { en: string; uz: string }[]; // useful expressions
}

export interface WritingPrompt {
  id: string; // w01 ...
  level: Level;
  title: string;
  promptEn: string;
  hintUz: string;
  minWords: number;
  sample: string; // example answer
  keywords: string[]; // useful words to try
}

export type ResourceCategory = 'youtube' | 'listening' | 'reading' | 'grammar' | 'vocabulary' | 'books';

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  level: string; // e.g. "A1–B2" or "Barcha darajalar"
  desc: string; // Uzbek description
  url?: string; // ONLY a verified URL; omit when not verified
}

// ---------- App state ----------

export type VocabStatus = 'new' | 'learning' | 'learned' | 'review';

export interface VocabProgress {
  status: VocabStatus;
  box: number; // 0..5, derived from the interval (kept for the star UI and older code)
  due: string; // YYYY-MM-DD next review date
  reviews: number;
  correct: number;
  lastReviewed?: string; // YYYY-MM-DD
  // --- SM-2-lite scheduling (added in the adaptive phase; optional so saved state keeps loading) ---
  ease?: number; // recall difficulty factor 1.3 (hard) .. 2.8 (easy)
  interval?: number; // current review interval in days
  lapses?: number; // how many times the word was forgotten
  streak?: number; // consecutive correct answers
  firstSeen?: string; // YYYY-MM-DD the word was first studied
}

export interface LessonResult {
  bestScore: number; // correct answers
  total: number;
  attempts: number;
  completed: boolean; // best >= 60%
  lastDate: string;
}

export type ContentKind = 'grammar' | 'reading' | 'listening' | 'vocab-quiz' | 'matching' | 'placement' | 'writing';

// ---------- Skill-based proficiency model (adaptive learning phase) ----------

/** How a skill estimate was produced. `usage` = merged from everyday exercises, never persisted. */
export type SkillSource = 'placement' | 'probe' | 'self' | 'usage';

export type Confidence = 'none' | 'low' | 'medium' | 'high';

/** One skill's current estimate. `level === null` means: not measured yet — the app never invents one. */
export interface SkillAssessment {
  level: Level | null;
  confidence: Confidence;
  source: SkillSource;
  updatedAt?: string; // ISO date of the last measurement
  /** 0..1 accuracy of the underlying evidence when available. */
  accuracy?: number;
}

export type SkillLevels = Partial<Record<Skill, SkillAssessment>>;

// ---------- AI roadmap (generated server-side; personal, but contains no private text) ----------

export interface AiRoadmapStage {
  level: Level;
  focus: string;
  weeks: number;
  objectives: string[];
  topics: string[];
  outcomes: string[];
  checkpoint: string;
  criteria: string;
}

export interface AiRoadmap {
  stages: AiRoadmapStage[];
  note: string;
  createdAt: string; // ISO datetime
  /** Hash of the learner inputs the roadmap was generated from (to detect "profile changed"). */
  inputsHash: string;
}

export interface QuizHistoryItem {
  id: string;
  kind: ContentKind;
  title: string;
  score: number;
  total: number;
  date: string; // ISO datetime
}

export interface DayActivity {
  xp: number;
  words: number; // vocabulary cards reviewed
  grammar: number;
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  tutor: number;
  quizzes: number;
  frozen?: boolean; // protected by a streak freeze (counts as active for the streak)
}

export interface GameBest {
  score: number;
  stars: number; // 0..3 (best ever)
  plays: number;
}

export interface GamesState {
  best: Record<string, GameBest>; // key: game id
  plays: number;
  daily: { date: string; done: boolean };
  dailyCount: number; // how many daily challenges were completed in total
  xpToday: { date: string; xp: number }; // XP earned from games today (capped)
}

export interface Mistake {
  id: string;
  source: ContentKind;
  sourceTitle: string;
  question: string;
  options: string[];
  yourAnswer: number;
  correctAnswer: number;
  explain: string;
  date: string;
  corrected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  demo?: boolean; // true if produced by the offline demo tutor
  link?: { label: string; route: string }; // optional "open lesson" shortcut
  ts: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  scriptId?: string; // demo role-play script
  scriptStep?: number;
}

export interface WritingSubmission {
  id: string;
  promptId: string;
  text: string;
  words: number;
  issues: number;
  date: string;
}

export interface Profile {
  name: string;
  age: number;
  goal: string; // goal id
  dailyMinutes: number;
  activities: string[]; // preferred activity ids
  selfLevel: Level;
  estimatedLevel: Level;
  targetLevel: Level;
  /** Device-only: topic chips for AI-generated reading texts. Never uploaded (stripped by sync). */
  interests?: string[];
  photoAvatar?: string; // data URL of an uploaded profile photo (small, square, device-made)
  placementScores?: {
    vocabulary: number;
    grammar: number;
    reading: number;
    total: number;
    max: number;
    askedBy?: { vocabulary: number; grammar: number; reading: number };
    /** How much evidence the placement estimate rests on (1 group asked = low … 3+ = high). */
    confidence?: 'low' | 'medium' | 'high';
  };
  createdAt: string;
}

// ---------- Coin economy (coins, shop, quests) ----------

export interface CoinState {
  balance: number; // Coins 🪙
  earnedToday: { date: string; amount: number }; // daily cap for game coins
  spentTotal: number;
}

export interface OwnedItem {
  purchasedAt: string; // ISO datetime
  expiresAt?: string; // ISO datetime — for time-limited items (frames: 7 days)
}

export interface ShopState {
  owned: Record<string, OwnedItem>; // item id -> ownership
  equipped: { frame?: string; avatar?: string; title?: string; nameColor?: string; nameFx?: string };
  chestsOpened: number;
  streakFreezes: number; // stored "muzlatgich" items ready to auto-protect the streak
  xpBoostUntil?: string; // ISO datetime — 2x XP active until
  streakBonusDate?: string; // last date the weekly streak bonus was paid
}

export interface QuestState {
  date: string; // YYYY-MM-DD the progress belongs to
  progress: Record<string, number>; // quest counter -> amount done today
  claimed: string[]; // quest ids whose coins were claimed today
}

// ---------- Friendly battle (rating duels) ----------

export interface BattleRecord {
  id: string;
  date: string; // ISO datetime
  vs: 'ai' | 'player';
  opponent: string; // display name ("Lingo (AI)" or the other learner's first name)
  you: number; // your correct answers
  them: number; // opponent's correct answers
  total: number; // questions in the battle
  result: 'win' | 'loss' | 'draw';
  delta: number; // rating change actually applied (0 when unrated)
}

export interface BattleState {
  ratingDelta: number; // accumulated Elo from battles, added on top of the base rating
  wins: number;
  losses: number;
  draws: number;
  ratedToday: { date: string; count: number }; // AI battles played today (only the first N are rated)
  history: BattleRecord[]; // latest first, capped at 20
}

export type BgStyle = 'doodle' | 'plain' | 'mesh' | 'sunset' | 'mint' | 'grid';

export interface Settings {
  theme: 'auto' | 'light' | 'dark';
  bg: BgStyle; // app backdrop style (Settings → "Orqa fon")
  dailyWordGoal: number;
  haptics: boolean;
  sound: boolean; // short feedback sounds (correct / wrong / level-up)
  showTranslation: boolean; // flashcards: show Uzbek by default
}

export type HlColor = 'yellow' | 'green' | 'pink' | 'blue';

/** A learner's text highlight: characters [s, e) of paragraph/line number p of some text. */
export interface Highlight {
  id: string;
  p: number;
  s: number;
  e: number;
  c: HlColor;
}

export interface PersistedState {
  version: 1;
  profile: Profile | null;
  xp: number;
  vocab: Record<string, VocabProgress>;
  lessons: Record<string, LessonResult>; // key: "grammar:g01", "reading:r01", "listening:l01"
  quizHistory: QuizHistoryItem[];
  activity: Record<string, DayActivity>; // key: YYYY-MM-DD
  mistakes: Mistake[];
  badges: Record<string, string>; // badge id -> ISO date
  conversations: Conversation[];
  writing: WritingSubmission[];
  speakingDone: Record<string, string[]>; // promptId -> dates completed
  highlights: Record<string, Highlight[]>; // key: "reading:r01", "listening:l01", "grammar:g02" ...
  settings: Settings;
  games: GamesState;
  coins: CoinState;
  shop: ShopState;
  quests: QuestState;
  battle: BattleState;
  /** Per-skill CEFR estimates from the placement/probes; everyday exercise evidence is merged on read. */
  skills?: SkillLevels;
  /** AI-generated roadmap (null until the learner generates one; optional field keeps old saves loading). */
  aiRoadmap?: AiRoadmap | null;
}
