import type {
  ChatMessage, ContentKind, Conversation, DayActivity, HlColor, Mistake, PersistedState, Profile, Quiz, Settings,
} from '../types';
import { addRange, subtractRange, type HlSeg } from '../lib/highlights';
import { getState, setState, resetState } from './store';
import { celebrate, showXp, toast } from './ui';
import { today } from '../lib/dates';
import { applyReview, markLearnedProgress, markReviewProgress } from '../lib/srs';
import { BADGES, newBadges, xpLevel } from '../lib/gamification';
import { emptyDay } from '../lib/plan';
import { uid } from '../lib/utils';
import { haptic, setHapticsEnabled } from '../lib/telegram';

type Counters = Partial<Record<keyof DayActivity, number>>;

function bump(s: PersistedState, c: Counters, date = today()): PersistedState {
  const day: DayActivity = { ...emptyDay(), ...(s.activity[date] ?? {}) };
  for (const k of Object.keys(c) as (keyof DayActivity)[]) day[k] += c[k] ?? 0;
  return { ...s, xp: s.xp + (c.xp ?? 0), activity: { ...s.activity, [date]: day } };
}

function afterChange(beforeXp: number): void {
  const s = getState();
  const lvBefore = xpLevel(beforeXp);
  const lvAfter = xpLevel(s.xp);
  const fresh = newBadges(s);
  if (fresh.length) {
    const now = new Date().toISOString();
    setState((st) => ({ ...st, badges: { ...st.badges, ...Object.fromEntries(fresh.map((b) => [b.id, now])) } }));
  }
  if (lvAfter > lvBefore) {
    celebrate({ emoji: '🚀', title: `Yangi daraja: ${lvAfter}!`, text: 'Siz muntazam o‘rganayotganingiz uchun tajriba darajangiz oshdi. Davom eting!' });
  }
  fresh.forEach((b) => celebrate({ emoji: b.emoji, title: `Yangi nishon: ${b.title}`, text: b.desc }));
}

/** Adds XP / activity counters for today and checks level-ups and badges. */
export function record(c: Counters): void {
  const before = getState().xp;
  setState((s) => bump(s, c));
  if ((c.xp ?? 0) > 0) showXp(c.xp ?? 0);
  afterChange(before);
}

export function saveProfile(p: Profile): void {
  setState((s) => ({ ...s, profile: p }));
}

export function updateProfile(patch: Partial<Profile>): void {
  setState((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s));
}

export function updateSettings(patch: Partial<Settings>): void {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  if (patch.haptics !== undefined) setHapticsEnabled(patch.haptics);
}

export function recordPlacement(score: number, max: number, level: string): void {
  setState((s) => ({
    ...s,
    quizHistory: [
      ...s.quizHistory,
      { id: uid('qh'), kind: 'placement' as ContentKind, title: `Daraja aniqlash testi (${level})`, score, total: max, date: new Date().toISOString() },
    ].slice(-200),
  }));
  record({ xp: 20, quizzes: 1 });
}

// ---------- Vocabulary ----------

export function reviewWord(id: string, know: boolean, opts: { silent?: boolean } = {}): void {
  setState((s) => ({ ...s, vocab: { ...s.vocab, [id]: applyReview(s.vocab[id], know) } }));
  record({ words: 1, xp: opts.silent ? 0 : know ? 2 : 1 });
}

export function markLearned(id: string): void {
  setState((s) => ({ ...s, vocab: { ...s.vocab, [id]: markLearnedProgress(s.vocab[id]) } }));
  record({ words: 1, xp: 3 });
  toast('So‘z “o‘rganildi” deb belgilandi', 'success');
}

export function markForReview(id: string): void {
  setState((s) => ({ ...s, vocab: { ...s.vocab, [id]: markReviewProgress(s.vocab[id]) } }));
  toast('So‘z takrorlash ro‘yxatiga qo‘shildi');
}

// ---------- Quizzes ----------

export interface QuizItemResult {
  quiz: Quiz;
  picked: number;
}

export interface QuizOutcome {
  score: number;
  total: number;
  xp: number;
  completed: boolean;
  firstCompletion: boolean;
  mistakes: number;
}

export function finishQuiz(args: {
  kind: ContentKind;
  title: string;
  items: QuizItemResult[];
  lessonKey?: string; // e.g. "grammar:g01"
}): QuizOutcome {
  const { kind, title, items, lessonKey } = args;
  const total = items.length;
  const score = items.filter((i) => i.picked === i.quiz.answer).length;
  const prev = lessonKey ? getState().lessons[lessonKey] : undefined;
  const ratio = total ? score / total : 0;
  const completedNow = ratio >= 0.6;
  const firstCompletion = !!lessonKey && !prev?.completed && completedNow;
  const xp = score * 5 + (firstCompletion ? 20 : 0) + (score === total && total >= 3 ? 10 : 0);
  const date = new Date().toISOString();

  const wrong = items.filter((i) => i.picked !== i.quiz.answer);
  setState((s) => {
    const lessons = lessonKey
      ? {
          ...s.lessons,
          [lessonKey]: {
            bestScore: Math.max(prev?.bestScore ?? 0, score),
            total,
            attempts: (prev?.attempts ?? 0) + 1,
            completed: !!prev?.completed || completedNow,
            lastDate: date,
          },
        }
      : s.lessons;
    let mistakes = s.mistakes;
    for (const w of wrong) {
      const existing = mistakes.find((m) => m.source === kind && m.question === w.quiz.q);
      if (existing) {
        mistakes = mistakes.map((m) => (m.id === existing.id ? { ...m, yourAnswer: w.picked, corrected: false, date } : m));
      } else {
        const m: Mistake = {
          id: uid('m'), source: kind, sourceTitle: title, question: w.quiz.q, options: w.quiz.options,
          yourAnswer: w.picked, correctAnswer: w.quiz.answer, explain: w.quiz.explain, date, corrected: false,
        };
        mistakes = [m, ...mistakes];
      }
    }
    // a correct answer to a previously wrong question counts as corrected
    const rightQs = new Set(items.filter((i) => i.picked === i.quiz.answer).map((i) => i.quiz.q));
    mistakes = mistakes.map((m) => (m.source === kind && rightQs.has(m.question) && !m.corrected ? { ...m, corrected: true } : m));
    return {
      ...s,
      lessons,
      mistakes: mistakes.slice(0, 300),
      quizHistory: [...s.quizHistory, { id: uid('qh'), kind, title, score, total, date }].slice(-200),
    };
  });

  const counter: Counters =
    kind === 'grammar' ? { grammar: 1 } : kind === 'reading' ? { reading: 1 } : kind === 'listening' ? { listening: 1 } : {};
  record({ xp, quizzes: 1, ...counter });
  return { score, total, xp, completed: completedNow, firstCompletion, mistakes: wrong.length };
}

export function recordMatching(errors: number, title: string, pairs: number): number {
  const xp = Math.max(5, 20 - errors * 2);
  setState((s) => ({
    ...s,
    quizHistory: [
      ...s.quizHistory,
      { id: uid('qh'), kind: 'matching' as ContentKind, title, score: Math.max(0, pairs - errors), total: pairs, date: new Date().toISOString() },
    ].slice(-200),
  }));
  record({ xp, quizzes: 1 });
  return xp;
}

export function toggleMistake(id: string): void {
  setState((s) => ({ ...s, mistakes: s.mistakes.map((m) => (m.id === id ? { ...m, corrected: !m.corrected } : m)) }));
  const m = getState().mistakes.find((x) => x.id === id);
  if (m?.corrected) {
    const before = getState().xp;
    setState((s) => bump(s, { xp: 3 }));
    afterChange(before);
  } else {
    afterChange(getState().xp);
  }
}

// ---------- Speaking / Writing ----------

export function completeSpeaking(promptId: string, checked: number, total: number): number {
  const xp = 10 + Math.round((checked / Math.max(1, total)) * 10);
  setState((s) => ({ ...s, speakingDone: { ...s.speakingDone, [promptId]: [...(s.speakingDone[promptId] ?? []), today()] } }));
  record({ xp, speaking: 1 });
  return xp;
}

export function submitWriting(promptId: string, text: string, words: number, issues: number, minWords: number): number {
  const xp = words >= minWords ? 20 : 10;
  setState((s) => ({
    ...s,
    writing: [...s.writing, { id: uid('w'), promptId, text, words, issues, date: new Date().toISOString() }].slice(-100),
  }));
  record({ xp, writing: 1 });
  return xp;
}

// ---------- Tutor conversations ----------

export function newConversation(): string {
  const id = uid('c');
  const c: Conversation = { id, title: 'Yangi suhbat', messages: [], updatedAt: Date.now() };
  setState((s) => ({ ...s, conversations: [c, ...s.conversations].slice(0, 30) }));
  return id;
}

export function deleteConversation(id: string): void {
  setState((s) => ({ ...s, conversations: s.conversations.filter((c) => c.id !== id) }));
}

export function appendMessage(convId: string, msg: Omit<ChatMessage, 'id' | 'ts'>, patch: Partial<Conversation> = {}): void {
  const m: ChatMessage = { ...msg, id: uid('msg'), ts: Date.now() };
  setState((s) => ({
    ...s,
    conversations: s.conversations
      .map((c) => {
        if (c.id !== convId) return c;
        const first = c.messages.length === 0 && msg.role === 'user';
        return {
          ...c,
          ...patch,
          title: first ? msg.text.slice(0, 40) : c.title,
          messages: [...c.messages, m].slice(-200),
          updatedAt: Date.now(),
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt),
  }));
}

/** XP for talking to the tutor: only the first 5 user messages of a day give XP (no farming). */
export function recordTutorMessage(): void {
  const done = getState().activity[today()]?.tutor ?? 0;
  record({ tutor: 1, xp: done < 5 ? 3 : 0 });
}

export function resetAll(): void {
  resetState();
}

export { BADGES, haptic };

// ---------- Text highlights ----------

const hid = () => uid('hl');

/** Highlights the given segments (replacing whatever they overlap). key = e.g. "reading:r01". */
export function addHighlights(key: string, segs: HlSeg[], color: HlColor): void {
  setState((s) => {
    let list = s.highlights?.[key] ?? [];
    for (const g of segs) list = addRange(list, g, color, hid);
    return { ...s, highlights: { ...(s.highlights ?? {}), [key]: list } };
  });
}

/** Removes highlighting from the given segments. */
export function eraseHighlights(key: string, segs: HlSeg[]): void {
  setState((s) => {
    let list = s.highlights?.[key] ?? [];
    for (const g of segs) list = subtractRange(list, g.p, g.s, g.e, hid);
    return { ...s, highlights: { ...(s.highlights ?? {}), [key]: list } };
  });
}

export function removeHighlight(key: string, id: string): void {
  setState((s) => ({ ...s, highlights: { ...(s.highlights ?? {}), [key]: (s.highlights?.[key] ?? []).filter((h) => h.id !== id) } }));
}

export function clearHighlights(key: string): void {
  setState((s) => {
    const next = { ...(s.highlights ?? {}) };
    delete next[key];
    return { ...s, highlights: next };
  });
}
