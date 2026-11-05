// Vercel serverless function: the Coin Store (Telegram Stars / XTR billing).
//  GET  /api/payments                  (no auth)       -> { enabled: boolean }
//  GET  /api/payments                  (valid initData)-> { enabled, packages, tinyLeft, history, pending }
//  POST /api/payments { action:'open',  packageId }     -> { id, url }        real Telegram invoice link (XTR)
//  POST /api/payments { action:'close', id, status:'failed'|'cancelled' } -> { ok }   invoice closed without paying
//  POST /api/payments { action:'ack',   ids: string[] } -> { ok }             client applied the credits locally
//
// SECURITY MODEL
// - The user id comes ONLY from the HMAC-verified initData, never from the body.
// - The invoice is created server-side with createInvoiceLink (currency XTR, empty
//   provider_token = Telegram Stars). The client opens it with WebApp.openInvoice().
// - Coins are NEVER credited here. The bot webhook credits via the atomic
//   claim_payment() RPC on successful_payment; succeeded-but-unacked rows form the
//   ledger the client applies to its existing wallet (state.coins.balance) and then
//   acknowledges. This plays cleanly with the device-owned progress sync.
// - Tiny Pack is limited to 3 successful purchases per user, enforced here (invoice
//   creation) AND again in the webhook (refund if somehow exceeded).
//
// Env (server only): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import crypto from 'node:crypto';

// ===== Catalog — keep in sync with src/lib/billing.ts (tests cross-check both) =====
export interface CoinPackage {
  id: string;
  label: string; // Uzbek display name
  coins: number;
  stars: number;
  popular?: boolean;
  maxPerUser?: number; // only Tiny Pack has a purchase limit
}

export const PACKAGES: CoinPackage[] = [
  { id: 'tiny', label: 'Tiny Pack', coins: 10, stars: 1, maxPerUser: 3 },
  { id: 'starter', label: 'Starter Pack', coins: 100, stars: 15 },
  { id: 'popular', label: 'Popular Pack', coins: 350, stars: 45, popular: true },
  { id: 'pro', label: 'Pro Pack', coins: 850, stars: 99 },
  { id: 'mega', label: 'Mega Pack', coins: 2000, stars: 199 },
  { id: 'ultimate', label: 'Ultimate Pack', coins: 5000, stars: 399 },
];

export const TINY_MAX = 3;

export const packageById = (id: string): CoinPackage | undefined => PACKAGES.find((p) => p.id === id);

/** How many Tiny Packs this user may still buy, given their successful (not refunded) purchases. */
export function tinyLeftOf(successfulTinyCount: number): number {
  return Math.max(0, TINY_MAX - Math.max(0, Math.floor(successfulTinyCount)));
}

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  url?: string;
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

// Same check as api/progress.ts (kept here so this function is self-contained).
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

function rateLimited(key: string, limit: number, windowMs = 60_000): boolean {
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

interface PaymentRow {
  id: string;
  package_id: string;
  coins: number;
  stars: number;
  status: string;
  created_at: string;
}

const okId = (id: unknown): id is string => typeof id === 'string' && /^pay_[0-9a-zA-Z_]{3,64}$/.test(id);

async function tgApi(token: string, method: string, payload: unknown): Promise<{ ok: boolean; description?: string; result?: unknown }> {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });
  const j = (await r.json().catch(() => ({ ok: false, description: 'bad_json' }))) as { ok: boolean; description?: string; result?: unknown };
  return j;
}

interface PaymentBody {
  action?: string;
  packageId?: string;
  id?: string;
  status?: string;
  ids?: unknown;
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

  try {
    // ---------- GET: store data (packages, tiny budget, history, pending credits) ----------
    if (req.method === 'GET') {
      if (rateLimited(`get:${uid}`, 30)) {
        res.status(429).json({ error: 'too_many_requests' });
        return;
      }
      const h = sbHeaders(db.key);
      const [histRes, tinyRes, pendRes] = await Promise.all([
        fetch(`${db.url}/rest/v1/payments?select=id,package_id,coins,stars,status,created_at&telegram_user_id=eq.${uid}&order=created_at.desc&limit=30`, { headers: h, signal: AbortSignal.timeout(15_000) }),
        fetch(`${db.url}/rest/v1/payments?select=id&telegram_user_id=eq.${uid}&package_id=eq.tiny&status=eq.succeeded`, { headers: h, signal: AbortSignal.timeout(15_000) }),
        fetch(`${db.url}/rest/v1/payments?select=id,coins,package_id&telegram_user_id=eq.${uid}&status=eq.succeeded&acked=eq.false&order=created_at.asc&limit=20`, { headers: h, signal: AbortSignal.timeout(15_000) }),
      ]);
      if (!histRes.ok || !tinyRes.ok || !pendRes.ok) throw new Error(`supabase_${histRes.status}/${tinyRes.status}/${pendRes.status}`);
      const history = (await histRes.json()) as PaymentRow[];
      const tinyRows = (await tinyRes.json()) as { id: string }[];
      const pending = (await pendRes.json()) as { id: string; coins: number; package_id: string }[];

      res.status(200).json({
        enabled: true,
        packages: PACKAGES.map((p) => ({ ...p, tinyLeft: p.maxPerUser ? tinyLeftOf(tinyRows.length) : undefined })),
        tinyLeft: tinyLeftOf(tinyRows.length),
        history: history.map((r) => ({ id: r.id, packageId: r.package_id, coins: r.coins, stars: r.stars, status: r.status, date: r.created_at })),
        pending: pending.map((r) => ({ id: r.id, coins: r.coins, packageId: r.package_id })),
      });
      return;
    }

    // ---------- POST: open / close / ack ----------
    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as PaymentBody | undefined;
      const action = body?.action;
      if (action === 'open') {
        if (rateLimited(`open:${uid}`, 8)) {
          res.status(429).json({ error: 'too_many_requests' });
          return;
        }
        const pkg = packageById(String(body?.packageId ?? ''));
        if (!pkg) {
          res.status(400).json({ error: 'bad_package' });
          return;
        }
        const h = sbHeaders(db.key);

        // Tiny Pack budget — enforced BEFORE creating a real invoice.
        if (pkg.maxPerUser) {
          const t = await fetch(`${db.url}/rest/v1/payments?select=id&telegram_user_id=eq.${uid}&package_id=eq.${pkg.id}&status=eq.succeeded`, { headers: h, signal: AbortSignal.timeout(15_000) });
          if (!t.ok) throw new Error(`supabase_${t.status}`);
          const rows = (await t.json()) as { id: string }[];
          if (tinyLeftOf(rows.length) <= 0) {
            res.status(409).json({ error: 'tiny_limit' });
            return;
          }
        }

        // Random suffix makes each invoice unique (two opens of the same pack are two payments).
        const id = `pay_${uid}_${crypto.randomBytes(5).toString('hex')}`;
        const payload = `sl:${id}`;
        const ins = await fetch(`${db.url}/rest/v1/payments`, {
          method: 'POST',
          headers: { ...h, prefer: 'return=minimal' },
          body: JSON.stringify({
            id,
            telegram_user_id: Number(uid),
            package_id: pkg.id,
            coins: pkg.coins,
            stars: pkg.stars,
            currency: 'XTR',
            status: 'pending',
            invoice_payload: payload,
          }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!ins.ok && ins.status !== 409) throw new Error(`supabase_${ins.status}`);

        // Real Telegram Stars invoice (XTR with an empty provider_token).
        const link = await tgApi(botToken, 'createInvoiceLink', {
          title: 'SmartLingo Coin',
          description: `${pkg.label}: ${pkg.coins} ta Coin — do‘kon, sovg‘alar va boostlar uchun`,
          payload,
          provider_token: '',
          currency: 'XTR',
          prices: [{ label: `${pkg.coins} Coin`, amount: pkg.stars }],
        });
        if (!link.ok || typeof link.result !== 'string') {
          console.error('createInvoiceLink failed', link.description);
          // Do not leave a phantom pending row — mark it failed.
          await fetch(`${db.url}/rest/v1/payments?id=eq.${id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'failed' }) }).catch(() => undefined);
          res.status(502).json({ error: 'invoice_failed' });
          return;
        }
        res.status(200).json({ id, url: link.result });
        return;
      }

      if (action === 'close') {
        if (rateLimited(`close:${uid}`, 30)) {
          res.status(429).json({ error: 'too_many_requests' });
          return;
        }
        const id = body?.id;
        const status = body?.status;
        if (!okId(id) || (status !== 'failed' && status !== 'cancelled')) {
          res.status(400).json({ error: 'bad_request' });
          return;
        }
        // Only the owner can close, and only a still-pending invoice (a paid one stays).
        await fetch(`${db.url}/rest/v1/payments?id=eq.${id}&telegram_user_id=eq.${uid}&status=eq.pending`, {
          method: 'PATCH',
          headers: sbHeaders(db.key),
          body: JSON.stringify({ status: 'failed' }),
          signal: AbortSignal.timeout(15_000),
        });
        res.status(200).json({ ok: true });
        return;
      }

      if (action === 'ack') {
        if (rateLimited(`ack:${uid}`, 30)) {
          res.status(429).json({ error: 'too_many_requests' });
          return;
        }
        const ids = Array.isArray(body?.ids) ? (body?.ids as unknown[]).filter(okId).slice(0, 20) : [];
        if (ids.length === 0) {
          res.status(400).json({ error: 'bad_request' });
          return;
        }
        await fetch(`${db.url}/rest/v1/rpc/ack_payments`, {
          method: 'POST',
          headers: sbHeaders(db.key),
          body: JSON.stringify({ p_ids: ids, p_uid: Number(uid) }),
          signal: AbortSignal.timeout(15_000),
        });
        res.status(200).json({ ok: true });
        return;
      }

      res.status(400).json({ error: 'bad_action' });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('payments failure', e instanceof Error ? e.message : String(e));
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
