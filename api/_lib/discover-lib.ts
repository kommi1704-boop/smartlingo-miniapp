// Today's Discovery — daily personalized content (Phase 2).
//
// One item per user per day (cached in the discovery table by the caller).
// Generation order:
//   1) AI (Gemini -> Groq) with personalization: CEFR level, interests and the
//      kinds already seen in the last 7 days (no repeats);
//   2) deterministic fallback bank (no AI key / API failure / invalid output).
// AI output is strictly validated — the model can only FILL the item template,
// never decide the schema or the XP (fixed 10 XP via the ledger).
//
// Pure helpers (fallbackPick, pickKind, validateDiscovery) are unit-tested in
// tests/discovery.test.ts.

export type DiscoveryKind = 'fact' | 'word' | 'grammar' | 'quiz' | 'riddle' | 'speak' | 'vocab' | 'culture';

export const DISCOVERY_KINDS: DiscoveryKind[] = ['fact', 'word', 'grammar', 'quiz', 'riddle', 'speak', 'vocab', 'culture'];

export const KIND_LABEL_UZ: Record<DiscoveryKind, string> = {
  fact: 'Qiziqarli fakt',
  word: 'Kunning so‘zi',
  grammar: 'Grammatika syurprizi',
  quiz: 'Mini test',
  riddle: 'Inglizcha topshiriq',
  speak: 'Gapirish challenge’i',
  vocab: 'So‘z challenge’i',
  culture: 'Madaniy kashfiyot',
};

const KIND_EMOJI: Record<DiscoveryKind, string> = {
  fact: '💡',
  word: '📖',
  grammar: '🧩',
  quiz: '🎯',
  riddle: '🤔',
  speak: '🗣️',
  vocab: '🃏',
  culture: '🌍',
};

export interface DiscoveryQuiz {
  q: string;
  options: string[]; // exactly 4
  answer: number; // 0..3
  explain?: string;
}

export interface DiscoveryItem {
  kind: DiscoveryKind;
  title: string;
  text: string; // 1-3 short sentences, Uzbek + English snippets
  quiz?: DiscoveryQuiz; // required for quiz/riddle kinds
  cta?: string; // suggested action label (optional)
}

export interface DiscoveryContext {
  level: string; // CEFR like 'A2'
  interests: string[];
  seenKinds: DiscoveryKind[]; // kinds shown in the last 7 days
  day: string; // YYYY-MM-DD
  seed: number; // stable per (uid, day)
}

// ---------------------------------------------------------------------------
// Deterministic fallback bank — decent content with zero AI dependency.
// ---------------------------------------------------------------------------

const FALLBACK: DiscoveryItem[] = [
  { kind: 'fact', title: '“Goodbye” aslida nima?', text: '“Goodbye” so‘zi 400 yil oldin “God be with ye” (Xudo sen bilan bo‘lsin) iborasining qisqartmasi edi. Ingliz tilidagi ko‘p iboralar shunday qisqargan.' },
  { kind: 'fact', title: 'Eng uzun so‘z', text: '“Smiles” so‘zini eng uzun so‘z deyishadi — chunki unda bir MILE (mil) bor! Ingliz tilida bunday o‘yinlar bilan so‘zlar esda qoladi.' },
  { kind: 'word', title: 'Serendipity', text: 'Serendipity — tasodifan chiqqan yoqimli kashfiyot. Misol: “Finding that café was pure serendipity.” Sinab ko‘ring: bugun bir tasodifiy kashfiyot qiling va inglizcha yozing.' },
  { kind: 'word', title: 'Curious', text: 'Curious — ikki ma’noli: “qiziqqan” va “ajoyib”. “I’m curious about space” / “a curious thing happened”. Har ikki ma’nosini bitta gapda ishlating.' },
  { kind: 'grammar', title: 'a vs an — faqat tovushga qarab', text: 'An apple, an hour (h yoziladi, lekin tovushi yo‘q), a university (tovushi “yu”). Qoida: harf emas, birinchi TOVUSHga qarang.' },
  { kind: 'grammar', title: 'Present Simple yoki Continuous?', text: 'Odatlar: “I drink tea every morning”. Ayni damda bo‘layotgan ish: “I am drinking tea now”. Sinov: bugun nima qilsangiz, ikkala zamonda gapirib ko‘ring.' },
  { kind: 'quiz', title: 'Mini test: choose the right word', text: 'Bir variantni tanlang va tushuntirishni o‘qing.', quiz: { q: 'She ___ to music while cooking yesterday.', options: ['listens', 'listened', 'was listening', 'is listening'], answer: 2, explain: 'Kecha, jarayon davomida — Past Continuous: was listening.' } },
  { kind: 'quiz', title: 'Mini test: question tag', text: 'Tag’lar bilan gapirish tabiiy ovoz chiqaradi — sinab ko‘ring!', quiz: { q: 'You have already eaten, ___?', options: ['haven’t you', 'don’t you', 'didn’t you', 'aren’t you'], answer: 0, explain: '“Have” yordamchisi bor gapning tag’i ham shu yordamchi bilan: haven’t you.' } },
  { kind: 'riddle', title: 'English riddle', text: '“I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.” Javob: an echo (aks sado).' },
  { kind: 'riddle', title: 'Riddle: what am I?', text: '“The more you take, the more you leave behind.” Javob: footsteps (qadamlar). Javobni o‘zbekcha izohlab, inglizcha yozib ko‘ring.' },
  { kind: 'speak', title: '30 sekund challenge', text: 'Bugun 30 soniya davomida sevimli mashg‘ulotingiz haqida inglizcha gapirib bering. Namla: “I really enjoy… because…”. O‘zingizni yozib olib, eshiting.' },
  { kind: 'speak', title: 'Shadowing challenge', text: 'Qisqa inglizcha videoni oching va gapirmoqchi bo‘lganingizdek bir vaqtda takrorlang (shadowing). Talaffuz va ohang tez o‘rgatadi.' },
  { kind: 'vocab', title: '5 ta yangi so‘z', text: 'Oila bilan bog‘liq 5 so‘z: sibling (jizzakam), relative (qarindosh), twin (egizak), couple (juftlik), generation (avlod). Har biri bilan bitta gap yozing.' },
  { kind: 'vocab', title: 'Collocations: MAKE yoki DO?', text: 'MAKE a mistake, a plan, a phone call; DO homework, exercise, the dishes. Xato qilsangiz ham: “I made a mistake — I’ll do better.”' },
  { kind: 'culture', title: 'Tea culture', text: 'Britaniyada choy tushdan keyin ~16:00 da ichiladi — bu “afternoon tea”. Gaplashuvda: “Fancy a cuppa?” = “choy ichaysizmi?”' },
  { kind: 'culture', title: 'Names & titles', text: 'Inglizda kattalarni Mr / Ms + familiya bilan chaqirishadi. Do‘stlar esa birinchi ism bilan. Sinab ko‘ring: “Good morning, Ms Smith!”' },
  { kind: 'fact', title: '“OK” qayerdan?', text: '“OK” — dunyoga tarqalgan eng mashhur inglizcha so‘z. 1830-yillarda Boston gazetasidagi “oll korrect” hazilidan chiqqan.' },
  { kind: 'word', title: 'Grateful ≠ great', text: 'Grateful — minnatdor. “I’m grateful for your help.” Great bilan chalkashtirmang: ular aslida qarindosh so‘zlar ham emas.' },
  { kind: 'grammar', title: 'Much yoki many?', text: 'Much + sanalmagan (much water, much time), many + sanaladigan (many books, many friends). “How much time / how many friends do you have?”' },
  { kind: 'quiz', title: 'Mini test: prepositions', text: 'Kichik so‘zlar — katta xatolar.', quiz: { q: 'I’m good ___ maths but bad ___ remembering dates.', options: ['in / at', 'at / at', 'at / in', 'in / in'], answer: 1, explain: '“good AT something” va “bad AT something” — ikkala joyda AT ishlatiladi.' } },
  { kind: 'riddle', title: 'Riddle: letters', text: '“What word is spelled incorrectly in every dictionary?” Javob: “incorrectly” — har lug‘atda aynan shu so‘z shunday yozilgan!' },
  { kind: 'speak', title: 'Role-play: store', text: 'Do‘konda rolni o‘ynang: “Excuse me, how much is this? — It’s 25,000 sums. — I’ll take it, please.” Juftligingiz bo‘lmasa, ikkala qismni o‘zingiz gapiring.' },
  { kind: 'vocab', title: 'Weather words', text: 'Fog (tuman), breeze (shabad), drizzle (jim-jim yomg‘ir), thunder (chaqmoq). Deraza oldida turib ob-havoni 3 gap bilan inglizcha tavsiflang.' },
  { kind: 'culture', title: 'Small talk', text: 'Britaniyada ob-havo — universal small talk. “Lovely weather today, isn’t it?” bilan tanish odam bilan suhbat oching.' },
];

/** Stable hash for deterministic picks (FNV-1a). */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic fallback pick for (uid, day): rotates kinds, prefers ones not seen recently. */
export function fallbackPick(seed: number, seenKinds: DiscoveryKind[], day: string, uid: number): DiscoveryItem {
  const seen = new Set(seenKinds);
  const fresh = FALLBACK.filter((f) => !seen.has(f.kind));
  const pool = fresh.length ? fresh : FALLBACK;
  const item = pool[(seed + hash(day + ':' + uid)) % pool.length];
  return item;
}

// ---------------------------------------------------------------------------
// AI generation (optional) — the model only fills a fixed JSON template.
// ---------------------------------------------------------------------------

const KIND_PROMPT: Record<DiscoveryKind, string> = {
  fact: 'an interesting English-language fact (about the language itself, word origins or world knowledge an Uzbek teenager would enjoy)',
  word: 'one useful English "word of the day" with meaning and a short example',
  grammar: 'one surprising but simple English grammar insight with 2 examples',
  quiz: 'a mini multiple-choice quiz testing the target level',
  riddle: 'a short English riddle with its answer',
  speak: 'a small speaking challenge (30 seconds of speaking on a topic)',
  vocab: 'a vocabulary challenge (5 related words with Uzbek glosses)',
  culture: 'a short cultural discovery about an English-speaking country',
};

const LEVEL_HINT: Record<string, string> = {
  'Pre-A1': 'absolute beginner (Pre-A1): very short words and sentences',
  A1: 'beginner (A1): simple everyday vocabulary',
  A2: 'elementary (A2): common words, simple past/future',
  B1: 'intermediate (B1): opinions, feelings, longer sentences',
  B2: 'upper-intermediate (B2): abstract topics, nuance',
  C1: 'advanced (C1): idiomatic language, subtle nuance',
  C2: 'mastery (C2): sophisticated vocabulary and wordplay',
};

export function discoveryPrompt(ctx: DiscoveryContext, kind: DiscoveryKind): string {
  const lvl = LEVEL_HINT[ctx.level] ?? LEVEL_HINT.A2;
  const interests = ctx.interests.slice(0, 4).join(', ') || 'general topics';
  const avoid = ctx.seenKinds.length ? `The learner has already recently seen content of these kinds: ${ctx.seenKinds.join(', ')} — make today's content feel different.` : '';
  return [
    'You create ONE daily learning snippet for a language-learning app used by Uzbek teenagers.',
    `Target level: ${lvl}. Their interests: ${interests}.`,
    `Today's content kind: ${kind} — ${KIND_PROMPT[kind]}. ${avoid}`,
    'Reply with ONLY a JSON object in exactly this shape (no markdown, no extra keys):',
    '{"title": string (max 60 chars, can be in English), "text": string (2-3 short sentences; mix Uzbek explanations with English snippets), ',
    kind === 'quiz' || kind === 'riddle'
      ? '"quiz": {"q": string, "options": [string, string, string, string], "answer": 0-3, "explain": string}}'
      : '"cta": string (optional short action hint in Uzbek)}',
    'Keep it encouraging, concrete and safe for ages 8-17. Never mention that you are an AI model.',
  ].join(' ');
}

/** Strict validation of AI output — anything imperfect falls back to the bank. */
export function validateDiscovery(raw: unknown, kind: DiscoveryKind): DiscoveryItem | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim().slice(0, 80) : '';
  const text = typeof o.text === 'string' ? o.text.trim().slice(0, 600) : '';
  if (!title || text.length < 12) return null;
  const item: DiscoveryItem = { kind, title, text };
  if (kind === 'quiz' || kind === 'riddle') {
    const qz = (o.quiz ?? null) as Record<string, unknown> | null;
    const q = typeof qz?.q === 'string' ? qz.q.trim().slice(0, 300) : '';
    const options = Array.isArray(qz?.options) ? (qz!.options as unknown[]).filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim().slice(0, 120)) : [];
    const answer = Number(qz?.answer);
    if (!q || options.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3) return null;
    item.quiz = {
      q,
      options,
      answer,
      explain: typeof qz?.explain === 'string' ? qz!.explain.trim().slice(0, 300) : undefined,
    };
  } else if (typeof o.cta === 'string' && o.cta.trim()) {
    item.cta = o.cta.trim().slice(0, 60);
  }
  return item;
}

/** Calls Gemini, then Groq. Returns null when no key or the call fails. */
async function callAi(prompt: string): Promise<unknown | null> {
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const groq = process.env.GROQ_API_KEY?.trim();
  try {
    if (gemini) {
      const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(gemini)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 500, responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(25_000),
        },
      );
      if (r.ok) {
        const j = (await r.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null;
        const text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (text) return JSON.parse(text);
      }
    }
    if (groq) {
      const model = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-20b';
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${groq}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (r.ok) {
        const j = (await r.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
        const text = j?.choices?.[0]?.message?.content ?? '';
        if (text) return JSON.parse(text);
      }
    }
  } catch {
    /* fall through to null */
  }
  return null;
}

/**
 * Generates one item. Tries AI once (with one retry on invalid JSON), then the
 * deterministic bank. Never throws — offline-friendly by design.
 */
export async function generateDiscovery(ctx: DiscoveryContext): Promise<DiscoveryItem> {
  const fresh = DISCOVERY_KINDS.filter((k) => !ctx.seenKinds.includes(k));
  const pool = fresh.length ? fresh : DISCOVERY_KINDS;
  const kind = pool[ctx.seed % pool.length];

  if (process.env.GEMINI_API_KEY?.trim() || process.env.GROQ_API_KEY?.trim()) {
    const prompt = discoveryPrompt(ctx, kind);
    let parsed = await callAi(prompt);
    const validated = validateDiscovery(parsed, kind);
    if (validated) return validated;
    parsed = await callAi(prompt); // one retry
    const validated2 = validateDiscovery(parsed, kind);
    if (validated2) return validated2;
  }
  return fallbackPick(ctx.seed, ctx.seenKinds, ctx.day, 0);
}

/** Decorates an item for the client (adds emoji + label). */
export function present(item: DiscoveryItem): DiscoveryItem & { emoji: string; label: string } {
  return { ...item, emoji: KIND_EMOJI[item.kind], label: KIND_LABEL_UZ[item.kind] };
}

/** Which kinds were shown in the last `days` days — used to avoid repeats. */
export function recentKinds(rows: { kind: string; day: string }[], days: number, todayDay: string): DiscoveryKind[] {
  const cutoff = new Date(`${todayDay}T00:00:00Z`).getTime() - (days - 1) * 86_400_000;
  const kinds = new Set<DiscoveryKind>();
  for (const r of rows) {
    const t = Date.parse(`${r.day}T00:00:00Z`);
    if (Number.isFinite(t) && t >= cutoff && DISCOVERY_KINDS.includes(r.kind as DiscoveryKind)) kinds.add(r.kind as DiscoveryKind);
  }
  return [...kinds];
}
