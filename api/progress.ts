// Vercel serverless function: saves a learner's progress online (Supabase), keyed by the VERIFIED Telegram user id.
//  GET    /api/progress  (no auth)          -> { enabled: boolean }
//  GET    /api/progress  (valid initData)   -> { enabled: true, state: object | null, updatedAt: string | null }
//  PUT    /api/progress  (valid initData)   -> { ok: true }     body: { state }
//  DELETE /api/progress  (valid initData)   -> { ok: true }     (removes the server copy)
//
// Env (server only, never VITE_-prefixed): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// The browser never talks to Supabase. The user id is taken only from the verified initData, never from the body.
// Chat history and writing texts are NOT stored online (privacy: the learners are minors).
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

const MAX_BYTES = 300_000;
const hits = new Map<string, { n: number; reset: number }>();

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same check as api/tutor.ts (kept here so this function is self-contained).
function validateInitData(initData: string, botToken: string, maxAgeSec = 7 * 24 * 3600): { ok: boolean; userId?: string } {
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
  return /^\d{1,15}$/.test(userId ?? '') ? { ok: true, userId } : { ok: false };
}

function rateLimited(key: string, limit = 40, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  cur.n++;
  return cur.n > limit;
}

function supa(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

/** Keeps only what is needed to restore progress. Chats and writing texts stay on the device. */
function cleanState(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const s = { ...(raw as Record<string, unknown>) };
  if (s.version !== 1) return null;
  delete s.conversations;
  delete s.writing;
  return s;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const db = supa();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const enabled = Boolean(db && botToken);

  const initData = header(req, 'x-telegram-init-data');
  if (req.method === 'GET' && !initData) {
    res.status(200).json({ enabled });
    return;
  }
  if (!db || !botToken) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const auth = validateInitData(initData, botToken);
  if (!auth.ok || !auth.userId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const uid = auth.userId;
  if (rateLimited(uid)) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${db.url}/rest/v1/progress?telegram_user_id=eq.${uid}&select=state,updated_at&limit=1`, {
        headers: sbHeaders(db.key),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      const rows = (await r.json()) as { state: unknown; updated_at: string }[];
      res.status(200).json({ enabled: true, state: rows[0]?.state ?? null, updatedAt: rows[0]?.updated_at ?? null });
      return;
    }

    if (req.method === 'PUT') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as { state?: unknown } | undefined;
      const state = cleanState(body?.state);
      if (!state) {
        res.status(400).json({ error: 'bad_state' });
        return;
      }
      const text = JSON.stringify(state);
      if (Buffer.byteLength(text) > MAX_BYTES) {
        res.status(413).json({ error: 'too_large' });
        return;
      }
      const r = await fetch(`${db.url}/rest/v1/progress?on_conflict=telegram_user_id`, {
        method: 'POST',
        headers: { ...sbHeaders(db.key), prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ telegram_user_id: Number(uid), state, updated_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const r = await fetch(`${db.url}/rest/v1/progress?telegram_user_id=eq.${uid}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(db.key), prefer: 'return=minimal' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('progress failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
