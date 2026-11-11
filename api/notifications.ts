// Vercel serverless function: per-user notification preferences + history.
//  GET  /api/notifications                          (no auth) -> { enabled }
//  GET  /api/notifications                          (auth)    -> { prefs, history[] }
//  POST /api/notifications { action:'prefs', patch }  -> { prefs }
//  POST /api/notifications { action:'pause', hours }  -> { prefs }   (0 clears the pause)
//  POST /api/notifications { action:'reset' }         -> { prefs }   (defaults, quiet off)
//
// The dispatcher (api/notify.ts) reads these preferences on EVERY send, so a
// change here applies to the very next notification of any kind.
//
// Env (server only): TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import crypto from 'node:crypto';
import { NOTIFY_KINDS, KIND_LABELS_UZ, sanitizePrefs, defaultPrefs, type NotifyPrefs, type NotifyKind } from './_lib/notify';

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

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same initData check as the other api/ functions (kept self-contained).
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

function supa(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

interface HistoryRow {
  id: string;
  kind: string;
  status: string;
  error: string | null;
  sent_at: string;
}

function prefsPayload(p: NotifyPrefs) {
  return {
    categories: p.categories,
    kinds: NOTIFY_KINDS.map((k) => ({ id: k, label: KIND_LABELS_UZ[k], enabled: p.categories[k] !== false })),
    quietEnabled: p.quiet_enabled,
    quietStart: p.quiet_start,
    quietEnd: p.quiet_end,
    pausedUntil: p.paused_until,
  };
}

async function loadPrefs(db: { url: string; key: string }, uid: number): Promise<NotifyPrefs> {
  const r = await fetch(`${db.url}/rest/v1/notification_preferences?telegram_user_id=eq.${uid}&select=categories,quiet_enabled,quiet_start,quiet_end,paused_until&limit=1`, {
    headers: sbHeaders(db.key),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) throw new Error(`supabase_${r.status}`);
  const rows = (await r.json()) as ({ categories?: Partial<Record<NotifyKind, boolean>>; quiet_enabled?: boolean; quiet_start?: number | null; quiet_end?: number | null; paused_until?: string | null } | null)[];
  const row = rows[0];
  if (!row) return defaultPrefs();
  return {
    categories: { ...defaultPrefs().categories, ...(row.categories ?? {}) } as Record<NotifyKind, boolean>,
    quiet_enabled: row.quiet_enabled === true,
    quiet_start: typeof row.quiet_start === 'number' ? row.quiet_start : null,
    quiet_end: typeof row.quiet_end === 'number' ? row.quiet_end : null,
    paused_until: typeof row.paused_until === 'string' ? row.paused_until : null,
  };
}

async function savePrefs(db: { url: string; key: string }, uid: number, prefs: NotifyPrefs): Promise<void> {
  await fetch(`${db.url}/rest/v1/notification_preferences?on_conflict=telegram_user_id`, {
    method: 'POST',
    headers: { ...sbHeaders(db.key), prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      telegram_user_id: uid,
      categories: prefs.categories,
      quiet_enabled: prefs.quiet_enabled,
      quiet_start: prefs.quiet_start,
      quiet_end: prefs.quiet_end,
      paused_until: prefs.paused_until,
      updated_at: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(15_000),
  });
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
  const uid = Number(auth.userId);

  try {
    if (req.method === 'GET') {
      const prefs = await loadPrefs(db, uid);
      const hr = await fetch(`${db.url}/rest/v1/notification_history?select=id,kind,status,error,sent_at&telegram_user_id=eq.${uid}&order=sent_at.desc&limit=20`, {
        headers: sbHeaders(db.key),
        signal: AbortSignal.timeout(15_000),
      });
      const historyRows = hr.ok ? ((await hr.json()) as HistoryRow[]) : [];
      res.status(200).json({
        ...prefsPayload(prefs),
        history: historyRows.map((h) => {
          const kind: NotifyKind = NOTIFY_KINDS.includes(h.kind as NotifyKind) ? (h.kind as NotifyKind) : 'news';
          return { id: h.id, kind, label: KIND_LABELS_UZ[kind], status: h.status, error: h.error ?? undefined, at: h.sent_at };
        }),
      });
      return;
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<string, unknown> | undefined;
      const action = body?.action;
      const current = await loadPrefs(db, uid);

      if (action === 'prefs') {
        const patch = sanitizePrefs(body?.patch);
        const next: NotifyPrefs = {
          categories: patch.categories ?? current.categories,
          quiet_enabled: patch.quiet_enabled ?? current.quiet_enabled,
          quiet_start: patch.quiet_start !== undefined ? patch.quiet_start : current.quiet_start,
          quiet_end: patch.quiet_end !== undefined ? patch.quiet_end : current.quiet_end,
          paused_until: patch.paused_until !== undefined ? patch.paused_until : current.paused_until,
        };
        // quiet hours need both ends; invalid pairs are ignored
        if (next.quiet_enabled && (next.quiet_start === null || next.quiet_end === null)) next.quiet_enabled = false;
        await savePrefs(db, uid, next);
        res.status(200).json(prefsPayload(next));
        return;
      }

      if (action === 'pause') {
        const hours = Math.round(Number(body?.hours));
        const next: NotifyPrefs = { ...current, paused_until: hours > 0 ? new Date(Date.now() + Math.min(hours, 24 * 30) * 3600_000).toISOString() : null };
        await savePrefs(db, uid, next);
        res.status(200).json(prefsPayload(next));
        return;
      }

      if (action === 'reset') {
        const next = defaultPrefs();
        await savePrefs(db, uid, next);
        res.status(200).json(prefsPayload(next));
        return;
      }

      res.status(400).json({ error: 'bad_action' });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('notifications failure', e instanceof Error ? e.message : String(e));
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
