// Vercel serverless function: AI-generated personal learning roadmap.
//  GET  /api/roadmap -> { live: boolean }        (is an AI key configured?)
//  POST /api/roadmap -> { stages: [...], note }  (needs valid Telegram initData)
//
// Same security model as /api/tutor: the AI key lives ONLY in server env vars, the request is
// authenticated with Telegram initData, and NOTHING from the request body is logged. The body
// contains learning aggregates only (levels, topic titles, minutes) — never chat texts, essays
// or recordings. Interests are sent ONLY when the learner explicitly consented on the device.
//
// The response must match a strict JSON schema; anything malformed is rejected with 502 and the
// app falls back to its built-in rule-based roadmap (never a broken screen).
import crypto from 'node:crypto';

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
}

const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

/** Validates Telegram Mini App initData (HMAC-SHA256). Self-contained: api files must not import each other. */
function validateInitData(initData: string, botToken: string, maxAgeSec = 24 * 3600): { ok: boolean; userId?: string } {
  if (!initData) return { ok: false };
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false };
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  const a = Buffer.from(calc, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };
  const authDate = Number(params.get('auth_date') ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return { ok: false };
  let userId: string | undefined;
  try {
    userId = String(JSON.parse(params.get('user') ?? '{}').id ?? '');
  } catch {
    /* ignore */
  }
  return { ok: true, userId };
}

function rateLimited(key: string, limit = 10, windowMs = 60 * 60_000): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  cur.n++;
  return cur.n > limit;
}

const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const SYSTEM = `You are an expert CEFR curriculum designer for an English-learning app for Uzbek-speaking children (ages 8-17).
You will receive a learner's profile as short Uzbek lines (estimated level, goal, target level, daily study time, weakest skills, grammar topics that need reinforcement).

Design a personal learning ROADMAP. Respond with ONLY a valid JSON object, no markdown fences, in this exact shape:
{
  "stages": [
    {
      "level": "A2",                        // one of: Pre-A1, A1, A2, B1, B2, C1, C2
      "focus": "one sentence in Uzbek",
      "weeks": 6,                            // realistic weeks at this learner's pace (1..52)
      "objectives": ["2-4 concrete learning objectives in Uzbek"],
      "topics": ["2-5 concrete topics to study, may mix grammar and vocabulary, in Uzbek or English topic names"],
      "outcomes": ["2-4 MEASURABLE outcomes in Uzbek, each with a number, e.g. '10 ta o'qish testida o'rtacha 70% natija'"],
      "checkpoint": "how progress is checked at the end of the stage, in Uzbek, one sentence",
      "criteria": "completion criteria in Uzbek, one sentence"
    }
  ],
  "note": "one short encouraging sentence in Uzbek"
}

Rules:
- 2 to 4 stages, starting from the learner's estimated level and ending at the target level (never beyond it).
- weeks must be realistic for the given daily minutes: roughly 30-120 hours of study per CEFR level split across the stages. Never promise faster timelines to please the user.
- objectives and outcomes must be concrete and measurable (numbers, percentages, counts). No vague phrases like "learn better".
- Give MORE stage time and specific topics to the learner's weakest skills listed in the profile.
- All human-readable text in simple Uzbek (Latin script), topics may keep English names.
- Output must be parseable by JSON.parse with no extra text.`;

type Provider = { kind: 'gemini' | 'groq' | 'anthropic'; key: string };

function pickProvider(): Provider | null {
  const g = process.env.GEMINI_API_KEY?.trim();
  const q = process.env.GROQ_API_KEY?.trim();
  const a = process.env.ANTHROPIC_API_KEY?.trim();
  const want = (process.env.AI_PROVIDER ?? '').toLowerCase();
  if (want === 'anthropic' && a) return { kind: 'anthropic', key: a };
  if (want === 'gemini' && g) return { kind: 'gemini', key: g };
  if (want === 'groq' && q) return { kind: 'groq', key: q };
  if (g) return { kind: 'gemini', key: g };
  if (q) return { kind: 'groq', key: q };
  if (a) return { kind: 'anthropic', key: a };
  return null;
}

class UpstreamError extends Error {
  constructor(public status: number, public detail = '') {
    super(`upstream_${status}`);
  }
}

async function failure(r: Response): Promise<UpstreamError> {
  let detail = '';
  try {
    const t = (await r.text()).slice(0, 300);
    try {
      const j = JSON.parse(t) as { error?: { message?: string } | string };
      detail = typeof j.error === 'string' ? j.error : j.error?.message ?? t;
    } catch {
      detail = t;
    }
  } catch {
    /* ignore */
  }
  detail = detail.replace(/(gsk_|sk-|AIza)[A-Za-z0-9_-]{8,}/g, '[key]').replace(/\s+/g, ' ').trim().slice(0, 120);
  return new UpstreamError(r.status, detail);
}

type Msg = { role: 'user' | 'assistant'; content: string };

const GEMINI_DEFAULT_MODEL = 'gemini-3.5-flash-lite';

async function askGemini(key: string, system: string, messages: Msg[]): Promise<string> {
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const m of messages) {
    const last = contents[contents.length - 1];
    contents.push({ role: 'user', parts: [{ text: m.content }] });
    void last;
  }
  const model = (process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL).replace(/[^A-Za-z0-9._-]/g, '');
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw await failure(r);
  const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text as string).join('').trim();
}

const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-20b';

async function askGroq(key: string, system: string, messages: Msg[]): Promise<string> {
  const model = (process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL).replace(/[^A-Za-z0-9._/-]/g, '');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', max_completion_tokens: 2400 } : { max_completion_tokens: 1600 }),
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw await failure(r);
  const data = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

async function askClaude(key: string, system: string, messages: Msg[]): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-haiku-5-5', max_tokens: 2000, system, messages }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw await failure(r);
  const data = (await r.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n').trim();
}

// ---------------------------------------------------------------- response validation

function asStr(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
}

function asStrList(v: unknown, min: number, max: number, itemMax: number): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const x of v.slice(0, max + 2)) {
    const s = asStr(x, itemMax);
    if (s) out.push(s);
  }
  return out.length >= min ? out.slice(0, max) : null;
}

/** Parses and strictly validates the model output. Returns null when anything is off. */
export function parseRoadmap(raw: string, fromLevel: string, toLevel: string): { stages: unknown[]; note: string } | null {
  let text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      parsed = JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  const root = parsed as { stages?: unknown; note?: unknown };
  if (!Array.isArray(root.stages) || root.stages.length < 2 || root.stages.length > 5) return null;

  const fromIdx = LEVELS.indexOf(fromLevel);
  const toIdx = LEVELS.indexOf(toLevel);
  const stages: unknown[] = [];
  let prevIdx = Math.max(0, fromIdx);
  for (const st of root.stages) {
    const o = (st ?? {}) as Record<string, unknown>;
    const level = asStr(o.level, 6);
    if (!level || !LEVELS.includes(level)) return null;
    const li = LEVELS.indexOf(level);
    if (li < prevIdx - 1 || li > toIdx) return null; // may repeat the current level, never jump backwards
    prevIdx = li;
    const weeks = Number(o.weeks);
    if (!Number.isFinite(weeks) || weeks < 1 || weeks > 52) return null;
    const focus = asStr(o.focus, 160);
    const objectives = asStrList(o.objectives, 2, 4, 200);
    const topics = asStrList(o.topics, 2, 6, 120);
    const outcomes = asStrList(o.outcomes, 2, 4, 200);
    const checkpoint = asStr(o.checkpoint, 240);
    const criteria = asStr(o.criteria, 240);
    if (!focus || !objectives || !topics || !outcomes || !checkpoint || !criteria) return null;
    stages.push({ level, focus, weeks: Math.round(weeks), objectives, topics, outcomes, checkpoint, criteria });
  }
  const note = asStr(root.note, 240) ?? '';
  return { stages, note };
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const provider = pickProvider();

  if (req.method === 'GET') {
    res.status(200).json({ live: Boolean(provider) });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  if (!provider) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const allowAnon = process.env.ALLOW_UNAUTHENTICATED === 'true';
  let who = 'anon';
  if (botToken) {
    const v = validateInitData(header(req, 'x-telegram-init-data'), botToken);
    if (!v.ok && !allowAnon) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    who = v.userId || 'anon';
  } else if (!allowAnon) {
    res.status(500).json({ error: 'server_misconfigured: set TELEGRAM_BOT_TOKEN' });
    return;
  }
  if (rateLimited(who)) {
    res.status(429).json({ error: 'too_many_requests', resetAt: new Date(hits.get(who)?.reset ?? Date.now() + 3600_000).toISOString() });
    return;
  }

  const body = (req.body ?? {}) as { profile?: unknown };
  const profile = typeof body.profile === 'string' ? body.profile.slice(0, 1600).trim() : '';
  if (!profile) {
    res.status(400).json({ error: 'bad_request' });
    return;
  }
  // extract just the level lines (validated against the whitelist)
  const estLine = profile.match(/(?:Taxminiy daraja|Hozirgi daraja):?\s*([A-Za-z0-9-]+)/)?.[1] ?? 'A1';
  const targetLine = profile.match(/Maqsad:?\s*([A-Za-z0-9-]+)/)?.[1] ?? 'B1';
  const fromLevel = LEVELS.includes(estLine) ? estLine : 'A1';
  const toLevel = LEVELS.includes(targetLine) && LEVELS.indexOf(targetLine) >= LEVELS.indexOf(fromLevel) ? targetLevelSafe(targetLine, fromLevel) : fromLevel;

  try {
    const ask = provider.kind === 'gemini' ? askGemini : provider.kind === 'groq' ? askGroq : askClaude;
    const raw = await ask(provider.key, SYSTEM, [{ role: 'user', content: profile }]);
    const parsed = parseRoadmap(raw, fromLevel, toLevel);
    if (!parsed) {
      res.status(502).json({ error: 'ai_bad_output' });
      return;
    }
    res.status(200).json(parsed);
  } catch (e) {
    console.error('roadmap upstream failure', provider.kind, e instanceof UpstreamError ? `${e.status} ${e.detail}` : String(e instanceof Error ? e.name : e));
    if (e instanceof UpstreamError && e.status === 429) res.status(429).json({ error: 'upstream_busy' });
    else if (e instanceof UpstreamError) res.status(502).json({ error: 'upstream_error', status: e.status, detail: e.detail });
    else res.status(502).json({ error: 'upstream_unreachable' });
  }
}

function targetLevelSafe(target: string, from: string): string {
  return LEVELS.indexOf(target) >= LEVELS.indexOf(from) ? target : from;
}
