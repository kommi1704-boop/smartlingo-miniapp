// Browser (laptop / tablet) sign-in for SmartLingo — "Telegram bilan kirish".
//
// Every server function in api/ authenticates with Telegram Mini App `initData`
// (HMAC-SHA256 keyed with the bot token, header `X-Telegram-Init-Data`). Outside
// Telegram there is no initData, so this module is the bridge:
//
//   1. The browser shows the official Telegram Login Widget. Telegram returns the
//      user's id/name signed with SHA256(bot token)  ->  verified here.
//   2. We answer with a *server-signed initData string* in exactly the same format
//      and signature scheme that Telegram uses for Mini Apps (+ a `web=1` marker).
//      Because the format is identical, EVERY existing endpoint (progress, XP,
//      battle, leaderboard, payments, notifications, AI...) accepts it with zero
//      changes — same Telegram user id, so progress, streak and coins are the same
//      account on phone and laptop.
//   3. `refresh` re-issues a fresh string while the old one is still valid, so an
//      active user stays signed in; 7 days of inactivity = sign in again.
//
// Routed via vercel.json:  /api/web-auth  ->  /api/bot?k=webauth  (keeps the
// Vercel Hobby function count unchanged).
//
// Setup (once): in @BotFather run /setdomain and enter the app's domain, otherwise
// the Login Widget refuses to open.
import crypto from 'node:crypto';

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}

export interface WebUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

const WIDGET_MAX_AGE_SEC = 24 * 3600;
const SESSION_MAX_AGE_SEC = 7 * 24 * 3600;

const hits = new Map<string, { n: number; reset: number }>();
function rateLimited(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  cur.n++;
  return cur.n > limit;
}

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const x = Buffer.from(a, 'hex');
    const y = Buffer.from(b, 'hex');
    return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

/** Telegram Login Widget check: hash = HMAC_SHA256(SHA256(botToken), data_check_string). Pure — unit-testable. */
export function verifyWidgetLogin(raw: unknown, botToken: string, nowSec: number = Math.floor(Date.now() / 1000)): WebUser | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const hash = typeof o.hash === 'string' ? o.hash : '';
  if (!/^[0-9a-f]{64}$/i.test(hash)) return null;
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) {
    if (k === 'hash') continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') fields[k] = String(v);
  }
  const dcs = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  if (!safeEqualHex(calc, hash.toLowerCase())) return null;
  const authDate = Number(fields.auth_date ?? 0);
  if (!authDate || nowSec - authDate > WIDGET_MAX_AGE_SEC || authDate - nowSec > 300) return null;
  if (!/^\d{1,15}$/.test(fields.id ?? '')) return null;
  return {
    id: Number(fields.id),
    first_name: fields.first_name?.slice(0, 64),
    last_name: fields.last_name?.slice(0, 64),
    username: fields.username?.slice(0, 64),
    photo_url: fields.photo_url && /^https:\/\//.test(fields.photo_url) ? fields.photo_url.slice(0, 300) : undefined,
  };
}

/** Builds a Mini-App-format initData string and signs it with the Mini App scheme (key = HMAC("WebAppData", botToken)). */
export function signInitData(user: WebUser, botToken: string, nowSec: number = Math.floor(Date.now() / 1000)): string {
  const params = new URLSearchParams();
  params.set('auth_date', String(nowSec));
  params.set('user', JSON.stringify({ ...user, language_code: user.language_code ?? 'uz' }));
  params.set('web', '1');
  const dcs = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  params.set('hash', crypto.createHmac('sha256', secret).update(dcs).digest('hex'));
  return params.toString();
}

/** Validates an initData string issued by signInitData (must carry web=1) and returns its user. */
export function verifyWebSession(initData: string, botToken: string, nowSec: number = Math.floor(Date.now() / 1000)): WebUser | null {
  if (!initData || initData.length > 4000) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || params.get('web') !== '1') return null;
  params.delete('hash');
  const dcs = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  if (!safeEqualHex(calc, hash)) return null;
  const authDate = Number(params.get('auth_date') ?? 0);
  if (!authDate || nowSec - authDate > SESSION_MAX_AGE_SEC) return null;
  try {
    const u = JSON.parse(params.get('user') ?? '{}') as WebUser;
    return /^\d{1,15}$/.test(String(u.id ?? '')) ? u : null;
  } catch {
    return null;
  }
}

/**
 *  GET  /api/web-auth                              -> { enabled }
 *  POST /api/web-auth { action:'login', user }     -> { initData, user }   (user = Telegram Login Widget payload)
 *  POST /api/web-auth { action:'refresh', initData } -> { initData, user }
 */
export async function webAuthHandler(req: Req, res: Res): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (req.method === 'GET') {
    res.status(200).json({ enabled: Boolean(botToken) });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  if (!botToken) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const ip = header(req, 'x-forwarded-for').split(',')[0]?.trim() || 'anon';
  if (rateLimited(`wa:${ip}`)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as { action?: string; user?: unknown; initData?: unknown };

  if (body.action === 'login') {
    const u = verifyWidgetLogin(body.user, botToken);
    if (!u) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    res.status(200).json({ initData: signInitData(u, botToken), user: u });
    return;
  }
  if (body.action === 'refresh') {
    const u = typeof body.initData === 'string' ? verifyWebSession(body.initData, botToken) : null;
    if (!u) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    res.status(200).json({ initData: signInitData(u, botToken), user: u });
    return;
  }
  res.status(400).json({ error: 'bad_request' });
}
