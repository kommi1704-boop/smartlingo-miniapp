// Vercel serverless function: ADMIN-only Notification Manager (SmartLingo news).
//  GET  /api/admin-notify                                   (admin) -> { campaigns[] }
//  POST { action:'create', title, text, imageUrl?, buttonLabel?, buttonUrl?, audience, category, scheduledAt? } -> { campaign }
//  POST { action:'update',  id, ...same fields }             -> { campaign }   (draft/scheduled only)
//  POST { action:'preview', id }                             -> { text, buttonLabel, audienceCount }
//  POST { action:'test',    id }                             -> { ok }   (sends ONLY to the requesting admin)
//  POST { action:'send',    id }                             -> { sent, failed, skipped, more, lastUid }   (chunked run)
//  POST { action:'cancel',  id }                             -> { ok }   (scheduled -> cancelled)
//  POST { action:'delete',  id }                             -> { ok }   (draft only)
//
// RULES (product requirements, enforced here):
// - NOTHING is broadcast automatically. A message goes out only through
//   action:'send' by an admin, or when a scheduled campaign is picked up by the
//   weekly cron (api/weekly.ts) — which the admin explicitly scheduled earlier.
// - The existing /news bot command stays untouched; this API is the richer
//   manager on top. Both use the same ADMIN_TELEGRAM_IDS list (fail closed).
// - Every recipient keeps their rights: the dispatcher (api/notify.ts) gates
//   each message by the user's category preference, quiet hours and pause, and
//   records every delivery in notification_history with a deterministic id
//   (campaign retries can never double-send).
//
// Env (server only): TELEGRAM_BOT_TOKEN, WEBAPP_URL, SUPABASE_URL,
//                    SUPABASE_SERVICE_ROLE_KEY, ADMIN_TELEGRAM_IDS.
import crypto from 'node:crypto';
import { adminIdsFromEnv } from './bot';
import { NOTIFY_KINDS, dispatch, fetchPrefsMap, sbHeaders, uztHour, type DbCtx, type NotifyKind } from './_lib/notify';
import { uztDay } from './progress';

export const AUDIENCES = ['all', 'active', 'inactive'] as const;
export type Audience = (typeof AUDIENCES)[number];

const SEND_CHUNK = 25;
const SEND_PAUSE_MS = 1100;
const SEND_CAP = 300; // per invocation; the response carries a continuation cursor

interface Req {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
}

export interface CampaignRow {
  id: string;
  admin_id: number;
  title: string;
  text: string;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  audience: string;
  category: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
  last_uid: number | null;
  created_at: string;
}

function header(req: Req, name: string): string {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

// Same initData check as every other api/ function.
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

function supa(): DbCtx | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

async function sb<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; rows: T[] }> {
  try {
    const headers = { ...sbHeaders(process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()), ...((init?.headers ?? {}) as Record<string, string>) };
    const r = await fetch(path, { ...init, headers, signal: AbortSignal.timeout(20_000) });
    const rows = r.ok ? ((await r.json().catch(() => [])) as T[]) : [];
    return { ok: r.ok, status: r.status, rows };
  } catch {
    return { ok: false, status: 0, rows: [] };
  }
}

// ---------------------------------------------------------------------------
// Audience (progress ∪ identities, filtered by recent activity)
// ---------------------------------------------------------------------------

export async function audienceIds(db: DbCtx, audience: Audience, now = Date.now()): Promise<number[]> {
  const q = async <T extends { telegram_user_id: number }>(table: string, extra = ''): Promise<T[]> => {
    const r = await sb<T>(
      `${db.url}/rest/v1/${table}?select=telegram_user_id${table === 'presence' ? ',last_active' : ''}&order=telegram_user_id.asc&limit=10000${extra}`,
    );
    return r.ok ? r.rows : [];
  };
  const [progressRows, identityRows, presenceRows] = await Promise.all([
    q<{ telegram_user_id: number }>('progress'),
    q<{ telegram_user_id: number }>('identities'),
    q<{ telegram_user_id: number; last_active?: string | null }>('presence'),
  ]);
  const union = new Map<number, void>();
  for (const g of [progressRows, identityRows]) for (const r of g) if (Number.isInteger(r.telegram_user_id) && r.telegram_user_id > 0) union.set(r.telegram_user_id);
  if (audience === 'all') return [...union.keys()].sort((a, b) => a - b);
  const cutoff = now - 7 * 24 * 3600 * 1000;
  const active = new Set<number>();
  for (const r of presenceRows) {
    const uid = Number(r.telegram_user_id);
    if (!union.has(uid)) continue; // presence rows for users we cannot message are irrelevant
    if (r.last_active && typeof r.last_active === 'string') {
      const t = Date.parse(`${r.last_active}T12:00:00Z`);
      if (Number.isFinite(t) && t >= cutoff) active.add(uid);
    }
  }
  if (audience === 'active') return [...active].sort((a, b) => a - b);
  return [...union.keys()].filter((uid) => !active.has(uid)).sort((a, b) => a - b);
}

/** The exact text a recipient receives (no personalization in campaigns — plain Uzbek copy). */
export function campaignText(c: Pick<CampaignRow, 'title' | 'text'>, appName = 'SmartLingo AI'): string {
  return `📢 ${c.title}\n\n${c.text}\n\n— ${appName} jamoasi`;
}

// ---------------------------------------------------------------------------
// Sending one chunk
// ---------------------------------------------------------------------------

export async function runCampaignSend(
  db: DbCtx,
  token: string,
  appUrl: string,
  campaign: CampaignRow,
  cursor: number | null,
): Promise<{ sent: number; failed: number; skipped: number; last: number; more: boolean }> {
  const targets = (await audienceIds(db, campaign.audience as Audience)).filter((u) => (cursor ? u > cursor : true));
  const batch = targets.slice(0, SEND_CAP);
  const kind = (NOTIFY_KINDS.includes(campaign.category as NotifyKind) ? campaign.category : 'news') as NotifyKind;
  const text = campaignText(campaign);
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (let i = 0; i < batch.length; i += SEND_CHUNK) {
    const chunk = batch.slice(i, i + SEND_CHUNK);
    await Promise.all(
      chunk.map(async (uid) => {
        const r = await dispatch(db, token, appUrl, {
          uid,
          kind,
          eventKey: `camp:${campaign.id}`,
          text,
          imageUrl: campaign.image_url ?? undefined,
          button: campaign.button_url
            ? { label: campaign.button_label || 'Ochish', url: campaign.button_url }
            : campaign.button_label
              ? { label: campaign.button_label, webApp: true }
              : undefined,
        });
        if (r.status === 'sent') sent++;
        else if (r.status === 'failed') failed++;
        else skipped++; // duplicate / pref-off / quiet hours / paused
        return r.status;
      }),
    );
    if (i + SEND_CHUNK < batch.length) await new Promise((r) => setTimeout(r, SEND_PAUSE_MS));
  }
  const last = batch.length ? batch[batch.length - 1] : (cursor ?? 0);
  const more = targets.length > SEND_CAP;
  return { sent, failed, skipped, last, more };
}

// ---------------------------------------------------------------------------

function kOf(req: Req): string {
  try {
    return new URL(req.url ?? '', 'http://local').searchParams.get('k') ?? '';
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin-notify?k=diag — one-URL deployment self-test.
// Answers WHY the app shows the "offline" banner: which env vars are absent,
// whether the bot token is valid (getMe username), whether Supabase is
// reachable and whether the schema tables exist. Only booleans / usernames /
// table status are returned — never a secret value. Open it in a browser:
//   https://<your-domain>/api/admin-notify?k=diag
// (Safe to remove this block once everything works.)
// ---------------------------------------------------------------------------
const DIAG_VERSION = 'v3-diag'; // bump when the api/ bundle changes — proves which build is live

async function diagHandler(res: Res): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const webappUrl = process.env.WEBAPP_URL?.trim() || null;

  const out: {
    version: string;
    ok: boolean | null;
    node: string;
    env: Record<string, boolean>;
    webappUrl: string | null;
    bot: { ok: boolean; username: string | null; error?: string } | null;
    supabase: { reachable: boolean } | null;
    tables: Record<string, string> | null;
    time: string;
  } = {
    version: DIAG_VERSION,
    ok: null,
    node: process.version,
    env: {
      SUPABASE_URL: Boolean(url),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(key),
      TELEGRAM_BOT_TOKEN: Boolean(token),
      WEBAPP_URL: Boolean(webappUrl),
      ADMIN_TELEGRAM_IDS: Boolean(process.env.ADMIN_TELEGRAM_IDS?.trim()),
    },
    webappUrl,
    bot: null,
    supabase: null,
    tables: null,
    time: new Date().toISOString(),
  };

  const checks: Promise<void>[] = [];

  if (token) {
    checks.push((async () => {
      try {
        const r = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
          signal: AbortSignal.timeout(10_000),
        });
        const j = (await r.json().catch(() => ({ ok: false }))) as { ok?: boolean; result?: { username?: unknown } };
        const u = j.result?.username;
        out.bot = { ok: j.ok === true, username: typeof u === 'string' ? u : null };
      } catch {
        out.bot = { ok: false, username: null, error: 'unreachable' };
      }
    })());
  }

  if (url && key) {
    const tableCheck = async (name: string): Promise<string> => {
      try {
        const r = await fetch(`${url}/rest/v1/${name}?select=*&limit=1`, {
          headers: { apikey: key, authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(10_000),
        });
        return r.status === 200 ? 'ok' : `http_${r.status}`; // 404 -> table missing, 401/403 -> wrong key
      } catch {
        return 'unreachable';
      }
    };
    checks.push((async () => {
      const names = [
        'progress', 'battles', 'coin_spends',
        'friend_quizzes', 'friend_quiz_attempts',
        'notification_preferences', 'notification_history', 'notification_campaigns',
      ];
      const statuses = await Promise.all(names.map(tableCheck));
      const tableStatus: Record<string, string> = {};
      names.forEach((n, i) => { tableStatus[n] = statuses[i]; });
      out.tables = tableStatus;
      out.supabase = { reachable: statuses.some((v) => v === 'ok') };
    })());
  }

  await Promise.all(checks);

  const envOk = Boolean(url && key && token);
  const tablesOk = out.tables === null ? false : !Object.values(out.tables).some((v) => v !== 'ok');
  out.ok = envOk && tablesOk && out.bot?.ok === true;
  res.status(200).json(out);
}

export default async function handler(req: Req, res: Res): Promise<void> {
  // Hobby-plan function-count limit: /api/weekly (Vercel cron) is served by this same
  // function via a vercel.json rewrite (?k=weekly) — auth and behavior unchanged.
  if (kOf(req) === 'weekly') return weeklyHandler(req, res);
  if (kOf(req) === 'diag') return diagHandler(res);
  res.setHeader('Cache-Control', 'no-store');
  const db = supa();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const appUrl = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '') ?? '';
  if (!db || !botToken) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const auth = validateInitData(header(req, 'x-telegram-init-data'), botToken);
  if (!auth.ok || !auth.userId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  const admins = adminIdsFromEnv(process.env.ADMIN_TELEGRAM_IDS);
  const adminId = Number(auth.userId);
  if (admins.length === 0 || !admins.includes(adminId)) {
    res.status(403).json({ error: 'forbidden' }); // fail closed, same as the /news command
    return;
  }

  const H = { ...sbHeaders(db.key) };

  try {
    if (req.method === 'GET') {
      const r = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns?select=*&order=created_at.desc&limit=50`, { headers: H });
      if (!r.ok) throw new Error(`supabase_${r.status}`);
      res.status(200).json({ campaigns: r.rows.map(serialize) });
      return;
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<string, unknown> | undefined;
      const action = body?.action;

      if (action === 'create' || action === 'update') {
        const fields = campaignFields(body, action === 'update');
        if ('error' in fields) {
          res.status(400).json({ error: fields.error });
          return;
        }
        let id: string;
        if (action === 'create') {
          id = `nc_${crypto.randomBytes(5).toString('hex')}`;
          const ins = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns`, {
            method: 'POST',
            headers: { ...H, prefer: 'return=representation' },
            body: JSON.stringify({ id, admin_id: adminId, ...fields, status: fields.scheduled_at ? 'scheduled' : 'draft' }),
          });
          if (!ins.ok || !ins.rows[0]) throw new Error(`supabase_${ins.status}`);
          res.status(200).json({ campaign: serialize(ins.rows[0]) });
          return;
        }
        id = String(body?.id ?? '');
        if (!/^nc_[0-9a-f]{10}$/.test(id)) {
          res.status(400).json({ error: 'bad_id' });
          return;
        }
        const cur = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns?select=*&id=eq.${id}&limit=1`, { headers: H });
        const row = cur.rows[0];
        if (!row) {
          res.status(404).json({ error: 'not_found' });
          return;
        }
        if (row.status !== 'draft' && row.status !== 'scheduled') {
          res.status(409).json({ error: 'not_editable' });
          return;
        }
        const nextStatus = fields.scheduled_at ? 'scheduled' : row.status === 'scheduled' ? 'draft' : row.status;
        const upd = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...H, prefer: 'return=representation' },
          body: JSON.stringify({ ...fields, status: nextStatus, updated_at: new Date().toISOString() }),
        });
        if (!upd.ok || !upd.rows[0]) throw new Error(`supabase_${upd.status}`);
        res.status(200).json({ campaign: serialize(upd.rows[0]) });
        return;
      }

      if (action === 'preview') {
        const id = String(body?.id ?? '');
        const cur = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, { headers: H });
        const row = cur.rows[0];
        if (!row) {
          res.status(404).json({ error: 'not_found' });
          return;
        }
        const count = (await audienceIds(db, row.audience as Audience)).length;
        res.status(200).json({
          text: campaignText(row),
          buttonLabel: row.button_label ?? undefined,
          imageUrl: row.image_url ?? undefined,
          audience: row.audience,
          category: row.category,
          audienceCount: count,
        });
        return;
      }

      if (action === 'test') {
        // test messages go ONLY to the requesting admin and skip the ledger/prefs
        // (an admin with 'news' off must still be able to test the pipeline)
        const id = String(body?.id ?? '');
        const cur = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, { headers: H });
        const row = cur.rows[0];
        if (!row) {
          res.status(404).json({ error: 'not_found' });
          return;
        }
        const payload: Record<string, unknown> = {
          chat_id: adminId,
          text: `🧪 TEST — bu faqat sizga yuborildi.\n\n${campaignText(row)}`,
          link_preview_options: { is_disabled: true },
        };
        if (row.button_url) payload.reply_markup = { inline_keyboard: [[{ text: row.button_label || 'Ochish', url: row.button_url }]] };
        const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(12_000),
        });
        const j = (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; description?: string };
        res.status(200).json({ ok: j.ok, error: j.ok ? undefined : j.description });
        return;
      }

      if (action === 'send') {
        const id = String(body?.id ?? '');
        if (!/^nc_[0-9a-f]{10}$/.test(id)) {
          res.status(400).json({ error: 'bad_id' });
          return;
        }
        const cur = await sb<CampaignRow>(`${db.url}/rest/v1/notification_campaigns?select=*&id=eq.${id}&limit=1`, { headers: H });
        const row = cur.rows[0];
        if (!row) {
          res.status(404).json({ error: 'not_found' });
          return;
        }
        if (row.status !== 'draft' && row.status !== 'scheduled' && row.status !== 'sending') {
          res.status(409).json({ error: 'not_sendable' });
          return;
        }
        const cursor = row.status === 'sending' ? row.last_uid : null; // continuation after a partial run
        if (row.status !== 'sending') {
          await sb(`${db.url}/rest/v1/notification_campaigns?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ status: 'sending', sent_count: 0, failed_count: 0, updated_at: new Date().toISOString() }) });
        }
        const r = await runCampaignSend(db, botToken, appUrl, { ...row, status: 'sending' }, cursor);
        const sentTotal = row.sent_count + r.sent;
        const failedTotal = row.failed_count + r.failed;
        await sb(`${db.url}/rest/v1/notification_campaigns?id=eq.${id}`, {
          method: 'PATCH',
          headers: H,
          body: JSON.stringify({
            status: r.more ? 'sending' : 'sent',
            sent_at: r.more ? row.sent_at : new Date().toISOString(),
            sent_count: sentTotal,
            failed_count: failedTotal,
            last_uid: r.more ? r.last : null,
            updated_at: new Date().toISOString(),
          }),
        });
        res.status(200).json({ sent: r.sent, failed: r.failed, skipped: r.skipped, more: r.more, lastUid: r.last, totals: { sent: sentTotal, failed: failedTotal } });
        return;
      }

      if (action === 'cancel') {
        const id = String(body?.id ?? '');
        await sb(`${db.url}/rest/v1/notification_campaigns?id=eq.${encodeURIComponent(id)}&status=eq.scheduled`, { method: 'PATCH', headers: H, body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() }) });
        res.status(200).json({ ok: true });
        return;
      }

      if (action === 'delete') {
        const id = String(body?.id ?? '');
        await sb(`${db.url}/rest/v1/notification_campaigns?id=eq.${encodeURIComponent(id)}&status=eq.draft`, { method: 'DELETE', headers: { ...H, prefer: 'return=minimal' } });
        res.status(200).json({ ok: true });
        return;
      }

      res.status(400).json({ error: 'bad_action' });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('admin-notify failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}

// ---------------------------------------------------------------------------

function serialize(c: CampaignRow) {
  return {
    id: c.id,
    title: c.title,
    text: c.text,
    imageUrl: c.image_url ?? undefined,
    buttonLabel: c.button_label ?? undefined,
    buttonUrl: c.button_url ?? undefined,
    audience: c.audience,
    category: c.category,
    status: c.status,
    scheduledAt: c.scheduled_at ?? undefined,
    sentAt: c.sent_at ?? undefined,
    sentCount: c.sent_count,
    failedCount: c.failed_count,
    createdAt: c.created_at,
  };
}

/** Validates/extracts campaign fields from an admin request body. */
function campaignFields(body: Record<string, unknown> | undefined, partial: boolean): Record<string, unknown> | { error: string } {
  const out: Record<string, unknown> = {};
  const has = (k: string) => body?.[k] !== undefined;
  if (!partial || has('title')) {
    const title = typeof body?.title === 'string' ? body.title.trim().replace(/\s+/g, ' ').slice(0, 64) : '';
    if (!title) return { error: 'bad_title' };
    out.title = title;
  }
  if (!partial || has('text')) {
    const text = typeof body?.text === 'string' ? body.text.replace(/[\p{C}]/gu, '\n').trim().slice(0, 2000) : '';
    if (!text) return { error: 'bad_text' };
    out.text = text;
  }
  if (has('imageUrl')) {
    const u = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
    if (u && !/^https:\/\/\S+$/.test(u)) return { error: 'bad_image' };
    out.image_url = u || null;
  }
  if (has('buttonLabel')) out.button_label = typeof body?.buttonLabel === 'string' ? body.buttonLabel.trim().slice(0, 32) || null : null;
  if (has('buttonUrl')) {
    const u = typeof body?.buttonUrl === 'string' ? body.buttonUrl.trim() : '';
    if (u && !/^https:\/\//.test(u)) return { error: 'bad_button' };
    out.button_url = u || null;
  }
  if (!partial || has('audience')) {
    const a = String(body?.audience ?? 'all');
    if (!AUDIENCES.includes(a as Audience)) return { error: 'bad_audience' };
    out.audience = a;
  }
  if (!partial || has('category')) {
    const c = String(body?.category ?? 'news');
    if (!NOTIFY_KINDS.includes(c as NotifyKind)) return { error: 'bad_category' };
    out.category = c;
  }
  if (has('scheduledAt')) {
    const s = body?.scheduledAt;
    if (s === null || s === '') out.scheduled_at = null;
    else if (typeof s === 'string') {
      const t = Date.parse(s);
      if (!Number.isFinite(t) || t < Date.now() - 60_000) return { error: 'bad_schedule' };
      out.scheduled_at = new Date(t).toISOString();
    }
  }
  // a button needs a label when it has a URL
  if (out.button_url && !out.button_label && !partial) return { error: 'bad_button' };
  return out;
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

// =============================================================================
// SECTION: weekly.ts (cron, ?k=weekly) — moved verbatim from api/weekly.ts
// =============================================================================
const WEEKLY_TEXT =
  '🏁 Haftalik challenge boshlandi!\n\n' +
  'Shu hafta ichida 5 ta mashqni bajaring va +50 XP bonus oling! Har kuni kichik qadam — hafta oxirida katta natija. 🚀\n\n' +
  'Do‘stlaringizni ham challenge’ga taklif qiling — birga o‘rganish ancha qiziqarli!';

async function weeklyHandler(req: Req, res: Res): Promise<void> {
  const secret = process.env.CRON_SECRET?.trim();
  const viaCronHeader = header(req, 'x-vercel-cron') === '1';
  const viaSecret = secret ? header(req, 'authorization') === `Bearer ${secret}` : false;
  if (!viaCronHeader && !viaSecret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const appUrl = process.env.WEBAPP_URL?.trim().replace(/\/+$/, '');
  const dbUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!token || !appUrl || !dbUrl || !dbKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }
  const db: DbCtx = { url: dbUrl, key: dbKey };
  const q = new URL(req.url ?? '', 'http://local').searchParams;
  const force = q.get('force') === '1' && viaSecret;
  const today = uztDay();
  const isMonday = new Date(`${today}T12:00:00Z`).getUTCDay() === 1;
  const out: Record<string, unknown> = { ok: true, day: today };

  try {
    // ---------- 1) weekly challenge (Mondays, active learners, prefs respected) ----------
    if (isMonday || force) {
      const prefs = await fetchPrefsMap(db);
      const active = await audienceIds(db, 'active');
      const targets = active.filter((uid) => {
        const p = prefs.get(uid);
        return !p || p.categories.weekly !== false; // default-on; explicit opt-out wins
      });
      let sent = 0;
      let skipped = 0;
      let failed = 0;
      const chunk = targets.slice(0, 300);
      for (let i = 0; i < chunk.length; i += 15) {
        const part = chunk.slice(i, i + 15);
        const results = await Promise.all(
          part.map(async (uid) => {
            const r = await dispatch(db, token, appUrl, {
              uid,
              kind: 'weekly',
              eventKey: `weekly:${today}`,
              text: WEEKLY_TEXT,
              button: { label: '🏁 Challenge’ga qo‘shilish', webApp: true },
            });
            return r.status;
          }),
        );
        for (const s of results) {
          if (s === 'sent') sent++;
          else if (s === 'failed') failed++;
          else skipped++;
        }
        if (i + 15 < chunk.length) await new Promise((r) => setTimeout(r, 1500));
      }
      out.weekly = { targets: targets.length, sent, failed, skipped, hour: uztHour() };
    } else {
      out.weekly = { skipped: 'not_monday' };
    }

    // ---------- 2) due scheduled campaigns + 3) continuations ----------
    const nowIso = new Date().toISOString();
    const r = await fetch(
      `${dbUrl}/rest/v1/notification_campaigns?select=*&or=(and(status=eq.scheduled,scheduled_at=lte.${nowIso}),status=eq.sending)&order=created_at.asc&limit=5`,
      { headers: sbHeaders(dbKey), signal: AbortSignal.timeout(20_000) },
    );
    const campaigns = r.ok ? ((await r.json().catch(() => [])) as CampaignRow[]) : [];
    const campaignResults: Record<string, unknown>[] = [];
    for (const c of campaigns) {
      const cursor = c.status === 'sending' ? c.last_uid : null;
      if (c.status !== 'sending') {
        await fetch(`${dbUrl}/rest/v1/notification_campaigns?id=eq.${c.id}`, {
          method: 'PATCH',
          headers: sbHeaders(dbKey),
          body: JSON.stringify({ status: 'sending', sent_count: 0, failed_count: 0, updated_at: nowIso }),
          signal: AbortSignal.timeout(15_000),
        }).catch(() => undefined);
      }
      const run = await runCampaignSend(db, token, appUrl, { ...c, status: 'sending' }, cursor);
      await fetch(`${dbUrl}/rest/v1/notification_campaigns?id=eq.${c.id}`, {
        method: 'PATCH',
        headers: sbHeaders(dbKey),
        body: JSON.stringify({
          status: run.more ? 'sending' : 'sent',
          sent_at: run.more ? c.sent_at : new Date().toISOString(),
          sent_count: c.sent_count + run.sent,
          failed_count: c.failed_count + run.failed,
          last_uid: run.more ? run.last : null,
          updated_at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(15_000),
      }).catch(() => undefined);
      campaignResults.push({ id: c.id, ...run });
    }
    out.campaigns = campaignResults;
    res.status(200).json(out);
  } catch (e) {
    console.error('weekly failure', e instanceof Error ? e.message : String(e));
    res.status(502).json({ error: 'storage_error' });
  }
}
