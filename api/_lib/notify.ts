// Shared notification dispatcher — the ONE place that decides whether a
// Telegram message may be sent, sends it, and records the delivery.
//
// Used by: api/quiz.ts (invitations/results), api/battle.ts (duel results),
// api/reminders.ts (the existing 18:00 Tashkent streak cron — upgraded in
// place, NOT duplicated), api/weekly.ts (weekly challenge + due campaigns)
// and api/bot.ts (reward/achievement messages).
//
// Guarantees:
// - PREFERENCES WIN: a user with the category off, a pause active, or quiet
//   hours running is never messaged (non-critical kinds only — see below).
// - IDEMPOTENT: the caller passes an `eventKey` unique per logical event
//   ("quiz fq_x finished for user 42"); the notification_history primary key
//   `n_<kind>_<uid>_<eventKey>` makes a retry (webhook redelivery, double
//   cron tick, warm-instance race) send at most once — same pattern as the
//   coin_grants ledger.
// - HONEST LEDGER: every delivery (sent / failed / skipped) lands in
//   notification_history, so the Settings page can show real history.
//
// Tone rule (product requirement): positive, encouraging language, no guilt
// or pressure. The texts themselves live with the callers; this module never
// invents copy.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (+ caller provides the bot token).

export type NotifyKind = 'streak' | 'news' | 'motivation' | 'achievements' | 'quiz' | 'battle' | 'weekly';

export const NOTIFY_KINDS: NotifyKind[] = ['streak', 'news', 'motivation', 'achievements', 'quiz', 'battle', 'weekly'];

/** Uzbek labels shown in Settings and (never sent) in admin tools. */
export const KIND_LABELS_UZ: Record<NotifyKind, string> = {
  streak: 'Seriya eslatmalari',
  news: 'Yangiliklar va e’lonlar',
  motivation: 'Kunlik motivatsiya',
  achievements: 'Yutuqlar va sovg‘alar',
  quiz: 'Do‘st quizi',
  battle: 'Janglar',
  weekly: 'Haftalik challenge',
};

export const DEFAULT_CATEGORIES: Record<NotifyKind, boolean> = {
  streak: true,
  news: true,
  motivation: true,
  achievements: true,
  quiz: true,
  battle: true,
  weekly: true,
};

export interface NotifyPrefs {
  categories: Record<NotifyKind, boolean>;
  quiet_enabled: boolean;
  quiet_start: number | null; // 0..23 Asia/Tashkent hour
  quiet_end: number | null;
  paused_until: string | null; // ISO
}

export function defaultPrefs(): NotifyPrefs {
  return { categories: { ...DEFAULT_CATEGORIES }, quiet_enabled: false, quiet_start: null, quiet_end: null, paused_until: null };
}

/** Validates a preferences patch from the client. Unknown keys are dropped, values clamped. */
export function sanitizePrefs(raw: unknown): Partial<NotifyPrefs> {
  const out: Partial<NotifyPrefs> = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    if (r.categories && typeof r.categories === 'object' && !Array.isArray(r.categories)) {
      const cats: Partial<Record<NotifyKind, boolean>> = {};
      for (const k of NOTIFY_KINDS) {
        const v = (r.categories as Record<string, unknown>)[k];
        if (typeof v === 'boolean') cats[k] = v;
      }
      out.categories = { ...DEFAULT_CATEGORIES, ...cats } as Record<NotifyKind, boolean>;
    }
    if (typeof r.quiet_enabled === 'boolean') out.quiet_enabled = r.quiet_enabled;
    if (r.quiet_start === null) out.quiet_start = null;
    else if (Number.isInteger(r.quiet_start)) out.quiet_start = Math.min(23, Math.max(0, r.quiet_start as number));
    if (r.quiet_end === null) out.quiet_end = null;
    else if (Number.isInteger(r.quiet_end)) out.quiet_end = Math.min(23, Math.max(0, r.quiet_end as number));
    if (r.paused_until === null) out.paused_until = null;
    else if (typeof r.paused_until === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(r.paused_until)) {
      // pause is capped at 30 days so a stray value cannot mute a user forever
      const t = Date.parse(r.paused_until);
      if (Number.isFinite(t)) out.paused_until = new Date(Math.min(t, Date.now() + 30 * 24 * 3600 * 1000)).toISOString();
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Gating (pure functions — unit-tested in tests/notify.test.ts)
// ---------------------------------------------------------------------------

export type GateResult = 'ok' | 'skipped_pref' | 'skipped_paused' | 'skipped_quiet';

/** Current hour (0..23) in Asia/Tashkent (UTC+5, no DST). */
export function uztHour(ts: number = Date.now()): number {
  return new Date(ts + 5 * 3600 * 1000).getUTCHours();
}

/** True when `hour` falls inside the [start, end) quiet window (wraps midnight). */
export function inQuietHours(hour: number, start: number | null, end: number | null): boolean {
  if (start === null || end === null || start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end; // window wraps midnight (e.g. 22 -> 7)
}

/**
 * Decides whether a message of `kind` may go out right now.
 * Quiet hours and pauses do NOT gate 'achievements' — a reward the user has
 * already earned is their property; muting it would look like losing it.
 */
export function gate(prefs: NotifyPrefs, kind: NotifyKind, ts: number = Date.now()): GateResult {
  if (prefs.categories[kind] === false) return 'skipped_pref';
  if (kind !== 'achievements') {
    if (prefs.paused_until && Date.parse(prefs.paused_until) > ts) return 'skipped_paused';
    if (prefs.quiet_enabled && inQuietHours(uztHour(ts), prefs.quiet_start, prefs.quiet_end)) return 'skipped_quiet';
  }
  return 'ok';
}

// ---------------------------------------------------------------------------
// Supabase + Telegram plumbing (same style as the other api/ functions)
// ---------------------------------------------------------------------------

export interface DbCtx {
  url: string;
  key: string;
}

export const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

export interface TgSender {
  token: string;
}

export interface NotifyButton {
  label: string;
  url?: string; // external URL button
  webApp?: boolean; // true -> opens the Mini App (url must be the WEBAPP_URL)
}

export interface NotifyInput {
  uid: number;
  kind: NotifyKind;
  /** Unique per logical event, e.g. "quiz_finished:fq_123:42". Deterministic. */
  eventKey: string;
  text: string;
  button?: NotifyButton;
  imageUrl?: string;
  /** Disable the "Sozlamalar" footer button (default: attached). */
  noSettingsFooter?: boolean;
}

const okEventKey = (k: string): string => k.replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 80);

export function historyIdOf(kind: NotifyKind, uid: number, eventKey: string): string {
  return `n_${kind}_${uid}_${okEventKey(eventKey)}`.slice(0, 120);
}

export async function fetchPrefs(db: DbCtx, uid: number): Promise<NotifyPrefs> {
  try {
    const r = await fetch(`${db.url}/rest/v1/notification_preferences?telegram_user_id=eq.${uid}&select=categories,quiet_enabled,quiet_start,quiet_end,paused_until&limit=1`, {
      headers: sbHeaders(db.key),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return defaultPrefs();
    const rows = (await r.json()) as (Partial<NotifyPrefs> & { categories?: Partial<Record<NotifyKind, boolean>> })[];
    const row = rows[0];
    if (!row) return defaultPrefs();
    return {
      categories: { ...DEFAULT_CATEGORIES, ...(row.categories ?? {}) } as Record<NotifyKind, boolean>,
      quiet_enabled: row.quiet_enabled === true,
      quiet_start: typeof row.quiet_start === 'number' ? row.quiet_start : null,
      quiet_end: typeof row.quiet_end === 'number' ? row.quiet_end : null,
      paused_until: typeof row.paused_until === 'string' ? row.paused_until : null,
    };
  } catch {
    return defaultPrefs(); // storage hiccup -> behave like the old code (send), never block a flow
  }
}

export interface DispatchResult {
  status: 'sent' | 'failed' | 'duplicate' | GateResult;
  id: string;
}

/**
 * The full pipeline: gate -> reserve (history row) -> send -> record outcome.
 * Never throws: notifications are best-effort and must not break the caller's flow.
 */
export async function dispatch(db: DbCtx, token: string, appUrl: string, input: NotifyInput): Promise<DispatchResult> {
  const id = historyIdOf(input.kind, input.uid, input.eventKey);
  try {
    const prefs = await fetchPrefs(db, input.uid);
    const g = gate(prefs, input.kind);
    if (g !== 'ok') return { status: g, id };

    // Reserve FIRST: a duplicate event (retry/race) collides with the PK and stops here.
    const ins = await fetch(`${db.url}/rest/v1/notification_history?on_conflict=id`, {
      method: 'POST',
      headers: { ...sbHeaders(db.key), prefer: 'return=representation,resolution=ignore-duplicates' },
      body: JSON.stringify({ id, telegram_user_id: input.uid, kind: input.kind, status: 'sending' }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!ins.ok) {
      // e.g. 404 PGRST205 = notification_history table missing (schema.sql not re-run)
      console.error('notify reserve failed', `supabase_${ins.status}`);
      return { status: 'failed', id };
    }
    const rows = (await ins.json().catch(() => [])) as { id: string }[];
    if (!Array.isArray(rows) || rows.length === 0) return { status: 'duplicate', id }; // already reserved

    const markup = buildKeyboard(input, appUrl);
    const payload: Record<string, unknown> = {
      chat_id: input.uid,
      text: input.text,
      link_preview_options: { is_disabled: true },
    };
    if (markup) payload.reply_markup = markup;
    const method = input.imageUrl ? 'sendPhoto' : 'sendMessage';
    if (input.imageUrl) {
      payload.photo = input.imageUrl;
      payload.caption = input.text;
      delete payload.text;
    }

    const sent = await tgSend(token, method, payload);
    await fetch(`${db.url}/rest/v1/notification_history?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(db.key),
      body: JSON.stringify(sent.ok ? { status: 'sent' } : { status: 'failed', error: (sent.error ?? 'send_failed').slice(0, 200) }),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => undefined);
    return { status: sent.ok ? 'sent' : 'failed', id };
  } catch {
    return { status: 'failed', id };
  }
}

/** The standard footer: the optional action button + "Sozlamalar" (one tap to opt out). */
function buildKeyboard(input: NotifyInput, appUrl: string) {
  const rows: ({ text: string; url: string } | { text: string; web_app: { url: string } })[][] = [];
  // Telegram rejects the WHOLE message ("BUTTON_URL_INVALID" / "Wrong HTTP URL") when a web_app
  // button has an empty or non-https url — which is what happened on every battle/quiz notification
  // while WEBAPP_URL was unset. Without a valid app URL we send the text without app buttons.
  const appOk = /^https:\/\/\S+$/.test(appUrl);
  if (input.button?.url) rows.push([{ text: input.button.label, url: input.button.url }]);
  else if (input.button?.webApp && appOk) rows.push([{ text: input.button.label, web_app: { url: appUrl } }]);
  if (!input.noSettingsFooter && appOk) rows.push([{ text: '🔕 Bildirishnoma sozlamalari', web_app: { url: `${appUrl}#/notify` } }]);
  return rows.length ? { inline_keyboard: rows } : null;
}

export async function tgSend(token: string, method: string, payload: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
    const j = (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; description?: string };
    return j.ok ? { ok: true } : { ok: false, error: j.description };
  } catch {
    return { ok: false, error: 'network' };
  }
}

/** Loads prefs for MANY users in one request (crons). Returns a map keyed by uid. */
export async function fetchPrefsMap(db: DbCtx): Promise<Map<number, NotifyPrefs>> {
  const map = new Map<number, NotifyPrefs>();
  try {
    const r = await fetch(`${db.url}/rest/v1/notification_preferences?select=telegram_user_id,categories,quiet_enabled,quiet_start,quiet_end,paused_until&limit=10000`, {
      headers: sbHeaders(db.key),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) return map;
    const rows = (await r.json()) as (Partial<NotifyPrefs> & { telegram_user_id: number; categories?: Partial<Record<NotifyKind, boolean>> })[];
    for (const row of rows) {
      map.set(Number(row.telegram_user_id), {
        categories: { ...DEFAULT_CATEGORIES, ...(row.categories ?? {}) } as Record<NotifyKind, boolean>,
        quiet_enabled: row.quiet_enabled === true,
        quiet_start: typeof row.quiet_start === 'number' ? row.quiet_start : null,
        quiet_end: typeof row.quiet_end === 'number' ? row.quiet_end : null,
        paused_until: typeof row.paused_until === 'string' ? row.paused_until : null,
      });
    }
  } catch {
    /* empty map -> callers treat missing prefs as default-on */
  }
  return map;
}

/**
 * Records a SKIP for cron sends (streak/weekly) so the Settings history shows
 * why nothing arrived. Cheap, and only for cron-kind events.
 */
export async function recordSkip(db: DbCtx, uid: number, kind: NotifyKind, eventKey: string, status: string): Promise<void> {
  try {
    await fetch(`${db.url}/rest/v1/notification_history?on_conflict=id`, {
      method: 'POST',
      headers: { ...sbHeaders(db.key), prefer: 'return=minimal,resolution=ignore-duplicates' },
      body: JSON.stringify({ id: historyIdOf(kind, uid, eventKey), telegram_user_id: uid, kind, status }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    /* best-effort */
  }
}
