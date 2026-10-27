import type {
  ChatMessage, ContentKind, Conversation, DayActivity, HlColor, Mistake, PersistedState, Profile, Quiz, QuestState, Settings,
} from '../types';
import { addRange, subtractRange, type HlSeg } from '../lib/highlights';
import { getState, setState, resetState } from './store';
import { celebrate, showCoins, showXp, toast } from './ui';
import { addDays, today } from '../lib/dates';
import { applyReview, markLearnedProgress, markReviewProgress } from '../lib/srs';
import { BADGES, newBadges, streakOf, xpLevel } from '../lib/gamification';
import { emptyDay } from '../lib/plan';
import { uid } from '../lib/utils';
import { haptic, setHapticsEnabled } from '../lib/telegram';
import { DAILY_BONUS_XP, GAME_XP_CAP, xpForResult, type GameResult } from '../lib/games';
import {
  CHEST_PRICE, FIRST_LESSON_COINS, FRAME_DAYS, FREEZE_PRICE, GAME_COIN_CAP, LEVEL_UP_COINS,
  STREAK_BONUS_COINS, XP_BOOST_HOURS, XP_BOOST_PRICE, coinsForResult, questById, rollChest,
  type AvatarItem, type ChestReward, type FrameItem, type QuestCounter, type TitleItem,
} from '../lib/shop';

const DAY_MS = 24 * 60 * 60 * 1000;

type Counters = Partial<Record<keyof DayActivity, number>>;

// ---------- Robocoin helpers ----------

/** True while the 2x XP booster is active. */
export function isXpBoosted(s: PersistedState): boolean {
  return !!s.shop.xpBoostUntil && new Date(s.shop.xpBoostUntil).getTime() > Date.now();
}

function bump(s: PersistedState, c: Counters, date = today()): PersistedState {
  const day: DayActivity = { ...emptyDay(), ...(s.activity[date] ?? {}) };
  for (const k of Object.keys(c) as (keyof DayActivity)[]) {
    if (k === 'frozen') continue; // only numeric counters arrive here
    day[k] = ((day[k] as number | undefined) ?? 0) + (c[k] ?? 0);
  }
  // 2x XP booster also applies to the day total (streaks and charts show boosted XP)
  const mult = isXpBoosted(s) ? 2 : 1;
  const gain = (c.xp ?? 0) * mult;
  day.xp += (c.xp ?? 0) * (mult - 1);
  // daily quest progress: most activity counters map straight onto quest counters
  const quests: QuestState =
    s.quests.date !== date ? { date, progress: {}, claimed: [] } : { ...s.quests, progress: { ...s.quests.progress } };
  const qp = quests.progress;
  if (c.xp) qp.xp = (qp.xp ?? 0) + gain;
  if (c.words) qp.words = (qp.words ?? 0) + (c.words ?? 0);
  if (c.tutor) qp.tutor = (qp.tutor ?? 0) + (c.tutor ?? 0);
  if (c.speaking) qp.speaking = (qp.speaking ?? 0) + (c.speaking ?? 0);
  if (c.writing) qp.writing = (qp.writing ?? 0) + (c.writing ?? 0);
  return { ...s, xp: s.xp + gain, activity: { ...s.activity, [date]: day }, quests };
}

/** Adds Robocoins to the balance and shows a floating "+N 🪙" bubble. */
export function addCoins(amount: number, opts: { silent?: boolean } = {}): void {
  if (amount <= 0) return;
  setState((s) => ({ ...s, coins: { ...s.coins, balance: s.coins.balance + amount } }));
  if (!opts.silent) showCoins(amount);
}

/** Advances a quest counter that has no dedicated activity counter (games played, lessons completed). */
export function tickQuest(counter: QuestCounter, amount = 1): void {
  const date = today();
  setState((s) => {
    const quests: QuestState =
      s.quests.date !== date ? { date, progress: {}, claimed: [] } : s.quests;
    return { ...s, quests: { ...quests, progress: { ...quests.progress, [counter]: (quests.progress[counter] ?? 0) + amount } } };
  });
}

/**
 * Once-per-day upkeep: auto-consume a streak freeze when yesterday was missed,
 * and pay the weekly streak bonus. Safe to call any number of times.
 */
export function dayStart(): void {
  const s = getState();
  const t = today();
  const y = addDays(t, -1);
  const yesterday = s.activity[y];
  const dayBefore = s.activity[addDays(y, -1)];
  if (!yesterday && (dayBefore?.xp ?? 0) > 0 && s.shop.streakFreezes > 0) {
    setState((st) => ({
      ...st,
      shop: { ...st.shop, streakFreezes: st.shop.streakFreezes - 1 },
      activity: { ...st.activity, [y]: { ...emptyDay(), frozen: true } },
    }));
    toast('🧊 Muzlatgich ishladi — kunlik seriyangiz saqlab qolindi!', 'success');
  }
  const st2 = getState();
  const streak = streakOf(st2.activity);
  if (streak >= 7 && streak % 7 === 0 && st2.shop.streakBonusDate !== t && (st2.activity[t]?.xp ?? 0) > 0) {
    setState((st) => ({ ...st, shop: { ...st.shop, streakBonusDate: t } }));
    addCoins(STREAK_BONUS_COINS);
    toast(`🔥 ${streak} kunlik seriya! +${STREAK_BONUS_COINS} Robocoin`, 'success');
  }
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
    addCoins(LEVEL_UP_COINS);
  }
  fresh.forEach((b) => celebrate({ emoji: b.emoji, title: `Yangi nishon: ${b.title}`, text: b.desc }));
}

/** Adds XP / activity counters for today and checks level-ups and badges. */
export function record(c: Counters): void {
  const s0 = getState();
  const before = s0.xp;
  const newDay = s0.quests.date !== today();
  setState((s) => bump(s, c));
  if (newDay) dayStart();
  if ((c.xp ?? 0) > 0) showXp((c.xp ?? 0) * (isXpBoosted(getState()) ? 2 : 1));
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

export function markManyForReview(ids: string[]): void {
  if (!ids.length) return;
  setState((s) => {
    const vocab = { ...s.vocab };
    for (const id of ids) vocab[id] = markReviewProgress(vocab[id]);
    return { ...s, vocab };
  });
  toast(`${ids.length} ta so‘z takrorlash ro‘yxatiga qo‘shildi`, 'success');
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
  if (completedNow) tickQuest('lessons', 1);
  if (firstCompletion) addCoins(FIRST_LESSON_COINS);
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

export interface GameOutcome {
  xp: number;
  dailyBonus: number;
  record: boolean;
  capped: boolean;
  bestStars: number;
  coins: number;
}

/** Saves a finished game: personal best, stars, XP (capped per day so games never replace lessons) and the daily challenge. */
export function finishGame(r: GameResult, daily: boolean): GameOutcome {
  const t = today();
  const st = getState().games;
  const prev = st.best[r.game] ?? { score: 0, stars: 0, plays: 0 };
  const isRecord = r.score > prev.score && prev.plays > 0;
  const usedToday = st.xpToday.date === t ? st.xpToday.xp : 0;
  const want = xpForResult(r);
  const xp = Math.max(0, Math.min(want, GAME_XP_CAP - usedToday));
  const capped = xp < want;
  const dailyBonus = daily && r.stars >= 1 && !(st.daily.date === t && st.daily.done) ? DAILY_BONUS_XP : 0;
  setState((s) => ({
    ...s,
    games: {
      ...s.games,
      plays: s.games.plays + 1,
      best: {
        ...s.games.best,
        [r.game]: { score: Math.max(prev.score, r.score), stars: Math.max(prev.stars, r.stars), plays: prev.plays + 1 },
      },
      xpToday: { date: t, xp: usedToday + xp },
      daily: dailyBonus ? { date: t, done: true } : s.games.daily,
      dailyCount: s.games.dailyCount + (dailyBonus ? 1 : 0),
    },
  }));
  record({ xp: xp + dailyBonus });
  // Robocoins: stars + record bonus, with a daily cap so games never replace tasks either
  const wantCoins = coinsForResult(r, isRecord);
  const cState = getState().coins;
  const usedCoins = cState.earnedToday.date === t ? cState.earnedToday.amount : 0;
  const coins = Math.max(0, Math.min(wantCoins, GAME_COIN_CAP - usedCoins));
  if (coins > 0) {
    setState((s) => ({
      ...s,
      coins: {
        ...s.coins,
        balance: s.coins.balance + coins,
        earnedToday: { date: t, amount: (s.coins.earnedToday.date === t ? s.coins.earnedToday.amount : 0) + coins },
      },
    }));
    showCoins(coins);
  }
  tickQuest('games', 1);
  return { xp, dailyBonus, record: isRecord, capped, bestStars: Math.max(prev.stars, r.stars), coins };
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
  addCoins(4);
  return xp;
}

export function submitWriting(promptId: string, text: string, words: number, issues: number, minWords: number): number {
  const xp = words >= minWords ? 20 : 10;
  setState((s) => ({
    ...s,
    writing: [...s.writing, { id: uid('w'), promptId, text, words, issues, date: new Date().toISOString() }].slice(-100),
  }));
  record({ xp, writing: 1 });
  addCoins(4);
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

// ---------- Robocoin shop ----------

/** Ownership that has not expired (items without expiry are permanent). */
export function isOwnedActive(id: string): boolean {
  const o = getState().shop.owned[id];
  if (!o) return false;
  return !o.expiresAt || new Date(o.expiresAt).getTime() > Date.now();
}

function spend(price: number): boolean {
  const s = getState();
  if (s.coins.balance < price) {
    toast('Yetarli Robocoin yo‘q — vazifalar va o‘yinlar bilan yig‘ing!', 'warn');
    return false;
  }
  setState((st) => ({ ...st, coins: { ...st.coins, balance: st.coins.balance - price, spentTotal: st.coins.spentTotal + price } }));
  return true;
}

function markOwned(id: string, days?: number): void {
  const now = Date.now();
  setState((st) => ({
    ...st,
    shop: {
      ...st.shop,
      owned: {
        ...st.shop.owned,
        [id]: days ? { purchasedAt: new Date(now).toISOString(), expiresAt: new Date(now + days * DAY_MS).toISOString() } : { purchasedAt: new Date(now).toISOString() },
      },
    },
  }));
}

/** Buys a 7-day avatar frame and equips it right away. Renewing: just call again while active. */
export function buyFrame(item: FrameItem): boolean {
  if (isOwnedActive(item.id)) {
    equipFrame(item.id);
    toast(`${item.name} taqildi`, 'success');
    return true;
  }
  if (!spend(item.price)) return false;
  markOwned(item.id, FRAME_DAYS);
  equipFrame(item.id);
  haptic('success');
  toast(`${item.name} taqildi! ${FRAME_DAYS} kun davom etadi 🎉`, 'success');
  return true;
}

/** Extends an owned frame by 7 days (from the current expiry if still active). */
export function renewFrame(item: FrameItem): boolean {
  if (!spend(item.price)) return false;
  const current = getState().shop.owned[item.id]?.expiresAt;
  const base = Math.max(Date.now(), current ? new Date(current).getTime() : 0);
  setState((st) => ({
    ...st,
    shop: { ...st.shop, owned: { ...st.shop.owned, [item.id]: { ...st.shop.owned[item.id], expiresAt: new Date(base + FRAME_DAYS * DAY_MS).toISOString() } } },
  }));
  equipFrame(item.id);
  haptic('success');
  toast(`${item.name} ${FRAME_DAYS} kunga uzaytirildi ✓`, 'success');
  return true;
}

export function equipFrame(id?: string): void {
  setState((st) => ({ ...st, shop: { ...st.shop, equipped: { ...st.shop.equipped, frame: id } } }));
}

export function buyAvatar(item: AvatarItem): boolean {
  if (!spend(item.price)) return false;
  markOwned(item.id);
  equipAvatar(item.emoji);
  haptic('success');
  toast(`${item.name} avatari sizniki! 🎉`, 'success');
  return true;
}

export function equipAvatar(emoji: string): void {
  setState((st) => ({ ...st, shop: { ...st.shop, equipped: { ...st.shop.equipped, avatar: emoji } } }));
}

export function buyTitle(item: TitleItem): boolean {
  if (!spend(item.price)) return false;
  markOwned(item.id);
  setState((st) => ({ ...st, shop: { ...st.shop, equipped: { ...st.shop.equipped, title: item.id } } }));
  haptic('success');
  toast(`“${item.name}” unvoni taqildi! 🎉`, 'success');
  return true;
}

export function equipTitle(id?: string): void {
  setState((st) => ({ ...st, shop: { ...st.shop, equipped: { ...st.shop.equipped, title: id } } }));
}

/** Buys and opens a mystery chest. Returns the rolled reward (or null if the purchase failed). */
export function openChest(): ChestReward | null {
  if (!spend(CHEST_PRICE)) return null;
  const reward = rollChest();
  setState((st) => ({ ...st, shop: { ...st.shop, chestsOpened: st.shop.chestsOpened + 1 } }));
  haptic('success');
  if (reward.kind === 'coins') addCoins(reward.amount);
  else if (reward.kind === 'xp') record({ xp: reward.amount });
  else if (reward.kind === 'freeze') {
    setState((st) => ({ ...st, shop: { ...st.shop, streakFreezes: st.shop.streakFreezes + 1 } }));
    toast('🧊 Muzlatgich omborga qo‘shildi — seriya himoyada!', 'success');
  }
  return reward;
}

/** Activates the 2x XP booster for 24 hours. */
export function buyXpBoost(): boolean {
  if (!spend(XP_BOOST_PRICE)) return false;
  const until = new Date(Date.now() + XP_BOOST_HOURS * 60 * 60 * 1000).toISOString();
  setState((st) => ({ ...st, shop: { ...st.shop, xpBoostUntil: until } }));
  haptic('success');
  toast(`⚡ 2x XP yoqildi! ${XP_BOOST_HOURS} soat davom etadi`, 'success');
  return true;
}

/** Buys one streak freeze (auto-used when a day is missed). */
export function buyFreeze(): boolean {
  if (!spend(FREEZE_PRICE)) return false;
  setState((st) => ({ ...st, shop: { ...st.shop, streakFreezes: st.shop.streakFreezes + 1 } }));
  haptic('success');
  toast('🧊 Muzlatgich qo‘shildi — seriyangiz endi himoyada!', 'success');
  return true;
}

/** Claims the coins for a completed daily quest. */
export function claimQuest(id: string): void {
  const t = today();
  const quest = questById(id);
  if (!quest) return;
  const q = getState().quests;
  if (q.date !== t || q.claimed.includes(id)) return;
  if ((q.progress[quest.counter] ?? 0) < quest.target) return;
  setState((st) => ({ ...st, quests: { ...st.quests, claimed: [...st.quests.claimed, id] } }));
  addCoins(quest.coins);
  haptic('success');
  toast(`Vazifa bajarildi: +${quest.coins} Robocoin! 🪙`, 'success');
}
