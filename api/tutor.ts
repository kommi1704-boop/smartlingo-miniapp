// Vercel serverless function: secure AI tutor proxy for "Lingo".
//  GET  /api/tutor  -> { live: boolean }   (is an AI key configured?)
//  POST /api/tutor  -> { reply: string }   (needs valid Telegram initData)
//
// The AI key lives ONLY in server environment variables (ANTHROPIC_API_KEY). It never reaches the browser.
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

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (req.method === 'GET') {
    res.status(200).json({ live: Boolean(apiKey) });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  if (!apiKey) {
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
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-haiku-5-5',
        max_tokens: 500,
        system: SYSTEM(level, name, age),
        messages,
      }),
    });
    if (!r.ok) {
      res.status(502).json({ error: 'upstream_error' });
      return;
    }
    const data = (await r.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n').trim();
    if (!reply) {
      res.status(502).json({ error: 'empty_reply' });
      return;
    }
    res.status(200).json({ reply });
  } catch {
    res.status(502).json({ error: 'upstream_unreachable' });
  }
}
