// Vercel serverless function: secure AI tutor proxy for "Lingo".
//  GET  /api/tutor  -> { live: boolean }   (is an AI key configured?)
//  POST /api/tutor  -> { reply: string }   (needs valid Telegram initData)
//
// The AI key lives ONLY in server environment variables. It never reaches the browser.
// Providers (first one that has a key wins; set AI_PROVIDER=anthropic|gemini to force one):
//   GEMINI_API_KEY     -> Google Gemini (has a free tier; GEMINI_MODEL optional, default below)
//   GROQ_API_KEY       -> Groq (has a free plan, simple sign-up; GROQ_MODEL optional)
//   ANTHROPIC_API_KEY  -> Claude (paid per use; AI_MODEL optional)
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

const MAX_MESSAGES = 10;
const MAX_TEXT = 1200;
const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

/** Validates Telegram Mini App initData (HMAC-SHA256) as described in the official docs. */
export function validateInitData(initData: string, botToken: string, maxAgeSec = 24 * 3600): { ok: boolean; userId?: string } {
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

function rateLimited(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  cur.n++;
  return cur.n > limit; // best-effort only (per serverless instance)
}

const SYSTEM = (level: string, name: string, age: number) => `You are Lingo, a friendly, patient English tutor inside a Telegram Mini App for Uzbek-speaking children and teenagers (ages 8-17).
Student: ${name}, age ${age}, estimated English level ${level} (CEFR, approximate).
Rules:
- Explain in simple Uzbek (Latin script). Use English only for examples, practice sentences and corrections.
- Keep answers short (max ~120 words), friendly and encouraging. Use examples that match the level ${level}.
- When the student writes an English sentence, correct it, show the corrected version, and explain the main mistake briefly in Uzbek.
- If asked to practise conversation, reply in simple English and ask ONE follow-up question.
- Stay on topic: English learning only. Politely refuse unsafe, adult or off-topic requests and steer back to English practice.
- Never ask for or store personal data (address, phone, passwords). Never claim to be human.`;

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
  constructor(public status: number) {
    super(`upstream_${status}`);
  }
}

type Msg = { role: 'user' | 'assistant'; content: string };

const GEMINI_DEFAULT_MODEL = 'gemini-3.5-flash-lite';

/** Google Gemini generateContent. The key goes in a header, never in the URL (URLs end up in logs). */
async function askGemini(key: string, system: string, messages: Msg[]): Promise<string> {
  // Gemini wants roles "user"/"model", a first "user" turn, and alternating turns.
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const last = contents[contents.length - 1];
    if (!last && role === 'model') continue;
    if (last && last.role === role) last.parts[0].text += `\n${m.content}`;
    else contents.push({ role, parts: [{ text: m.content }] });
  }
  const model = (process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL).replace(/[^A-Za-z0-9._-]/g, '');
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      // generous cap: newer Gemini models may count internal "thinking" tokens in this limit too
      generationConfig: { maxOutputTokens: 1024 },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!r.ok) throw new UpstreamError(r.status);
  const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => !p.thought && typeof p.text === 'string')
    .map((p) => p.text as string)
    .join('')
    .trim();
}

const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/** Groq (OpenAI-compatible chat completions). */
async function askGroq(key: string, system: string, messages: Msg[]): Promise<string> {
  const model = (process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL).replace(/[^A-Za-z0-9._/-]/g, '');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      max_completion_tokens: 600,
      temperature: 0.6,
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!r.ok) throw new UpstreamError(r.status);
  const data = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

async function askClaude(key: string, system: string, messages: Msg[]): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-haiku-5-5', max_tokens: 500, system, messages }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!r.ok) throw new UpstreamError(r.status);
  const data = (await r.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n').trim();
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

  // Authentication: only real Telegram users of YOUR bot may use the paid AI endpoint.
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const allowAnon = process.env.ALLOW_UNAUTHENTICATED === 'true'; // for local testing only
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
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  const body = (req.body ?? {}) as { messages?: { role?: string; text?: string }[]; level?: string; name?: string; age?: number };
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.text).slice(0, MAX_TEXT) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'bad_request' });
    return;
  }
  const level = /^(Pre-A1|A1|A2|B1|B2|C1|C2)$/.test(body.level ?? '') ? (body.level as string) : 'A1';
  const name = String(body.name ?? 'Student').replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 30) || 'Student';
  const age = Math.min(99, Math.max(6, Number(body.age) || 12));

  try {
    const system = SYSTEM(level, name, age);
    const ask = provider.kind === 'gemini' ? askGemini : provider.kind === 'groq' ? askGroq : askClaude;
    const reply = await ask(provider.key, system, messages);
    if (!reply) {
      res.status(502).json({ error: 'empty_reply' });
      return;
    }
    res.status(200).json({ reply });
  } catch (e) {
    if (e instanceof UpstreamError && e.status === 429) res.status(429).json({ error: 'upstream_busy' });
    else if (e instanceof UpstreamError) res.status(502).json({ error: 'upstream_error' });
    else res.status(502).json({ error: 'upstream_unreachable' });
  }
}
