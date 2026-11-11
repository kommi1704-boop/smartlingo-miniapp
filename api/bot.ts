// Vercel serverless function: Telegram bot webhook (no always-on server needed).
// Handles /start and /help and shows a button that opens the Mini App.
// Register it once with:  npm run setup-bot   (see README)
//
// Telegram Stars billing (Coin Store):
// - 'pre_checkout_query' is validated here (owner, pending row, amount, Tiny Pack
//   budget) and answered within Telegram's 10 s window.
// - 'message.successful_payment' credits coins EXACTLY ONCE through the atomic
//   claim_payment() RPC (unique telegram_payment_charge_id index as a second guard).
//   A Tiny Pack purchase that slipped past the budget (e.g. two invoices approved
//   in the same second) is refunded automatically via refundStarPayment.
// - Coins live in the payments ledger as succeeded+unacked rows; the Mini App
//   applies them to the existing wallet and acks (see src/lib/billing.ts).
//
// Referrals ("Do'st taklifi"):
// - Share links look like  https://t.me/<bot>?start=ref<referrer_id>  — Telegram
//   delivers them as the text  "/start ref<referrer_id>".
// - Only BRAND-NEW learners count (no online progress AND no identity yet).
// - The referral row is keyed by the invited user's id (PK => exactly once, ever).
// - The invited learner's coins are granted IMMEDIATELY here (deterministic grant
//   id => idempotent); the referrer's coins are paid by /api/progress the first
//   time the invited learner actually syncs (see reward_referral RPC).
// - /ref lets ANY user fetch their personal invite link right in the bot chat
//   (with a native share button) — the feature lives in the bot, not only in the app.
//
// Feature announcement broadcast (/news, admin only):
// - /news        -> preview: the exact message + how many users will receive it.
// - /news ha     -> sends the announcement to EVERY current user (progress ∪
//                  identities), each message containing that user's OWN referral
//                  link + a native share button.
// - Admins are listed in the ADMIN_TELEGRAM_IDS env var (comma-separated Telegram
//   ids). With no env set the bot answers /news with the sender's own id and the
//   setup instructions — fail closed, but self-documenting.
// - Rate-safe (25/chunk + pauses, far below Telegram's ~30 msg/s), capped at 300
//   per run; the report includes a continuation cursor ("/news ha <last_id>").
//
// Env (server only): TELEGRAM_BOT_TOKEN, WEBAPP_URL, WEBHOOK_SECRET,
//                    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (payments, referrals),
//                    ADMIN_TELEGRAM_IDS (optional — enables /news).

export const maxDuration = 60; // broadcast run fits well inside this budget

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}

interface SuccessfulPayment {
  currency: string;
  total_amount: number; // stars for XTR
  invoice_payload: string;
  telegram_payment_charge_id: string;
  provider_payment_charge_id?: string;
}

interface Update {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { id: number; first_name?: string; username?: string };
    successful_payment?: SuccessfulPayment;
  };
  pre_checkout_query?: {
    id: string;
    from: { id: number };
    currency: string;
    total_amount: number;
    invoice_payload: string;
  };
}

interface PaymentRow {
  id: string;
  package_id: string;
  coins: number;
  stars: number;
  status: string;
}

// Must mirror api/payments.ts PACKAGES (kept literal here: the webhook is self-contained).
const PKG: Record<string, { coins: number; stars: number }> = {
  tiny: { coins: 10, stars: 1 },
  starter: { coins: 100, stars: 15 },
  popular: { coins: 350, stars: 45 },
  pro: { coins: 850, stars: 99 },
  mega: { coins: 2000, stars: 199 },
  ultimate: { coins: 5000, stars: 399 },
};
const TINY_MAX = 3;

// Referral reward in Coins — keep in sync with api/progress.ts (tests cross-check both).
export const REFERRAL_COINS = 50;

/** Parses "/start ref<referrer_id>" — returns the referrer id, or null for any other text. */
export function parseRefPayload(text: string): number | null {
  const m = /^\/start(?:\s+ref(\d{1,15}))?\s*$/.exec(text.trim());
  if (!m || !m[1]) return null;
  const n = Number(m[1]);
  return n > 0 ? n : null;
}

/**
 * Parses "/start quiz_<fq_...>" — the Friend Quiz invitation deep link
 * (t.me/<bot>?start=quiz_fq_xxx). Returns the quiz id, or null for other text.
 * Kept separate from the referral payload: a /start can carry only one payload.
 */
export function parseQuizPayload(text: string): string | null {
  const m = /^\/start(?:@\w{1,32})?\s+(quiz_fq_[0-9a-z_]{3,40})\s*$/i.exec(text.trim());
  return m ? m[1].slice(5) : null;
}

/** Uzbek labels for the invitation card (kept tiny — the webhook never loads the question bank). */
export const QUIZ_CATEGORY_LABELS: Record<string, string> = {
  vocab: 'So‘z boyligi',
  grammar: 'Grammatika',
  mixed: 'Aralash',
  random: 'Tasodifiy',
};
export const QUIZ_DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Boshlang‘ich',
  elementary: 'Elementar',
  intermediate: 'O‘rta',
  advanced: 'Yuqori',
};

/** The invitation text a friend receives when the creator shares quiz_<id>. */
export function quizInviteText(creatorName: string, title: string, size: number, category: string, difficulty: string): string {
  return (
    `🎯 ${creatorName} sizni quiz’ga taklif qildi!\n\n` +
    `«${title}»\n` +
    `• ${size} ta savol · ${QUIZ_CATEGORY_LABELS[category] ?? category} · ${QUIZ_DIFFICULTY_LABELS[difficulty] ?? difficulty}\n\n` +
    'Javoblaringiz do‘stingizga yuboriladi — natijalar jadvalida o‘z o‘rningizni egallang! 🏆'
  );
}

// ---------------------------------------------------------------------------
// Admin broadcast (/news) — small pure helpers (unit-tested in tests/broadcast.test.ts)
// ---------------------------------------------------------------------------

/** Telegram ids listed in ADMIN_TELEGRAM_IDS ("123, 456;789" — any separator). */
export function adminIdsFromEnv(v: string | undefined | null): number[] {
  return (v ?? '')
    .split(/[,\s;]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export interface NewsArgs {
  confirm: boolean; // /news ha  (or a cursor given -> already a deliberate run)
  cursor: number | null; // /news ha <last_sent_id> — continue after this id
}

/** Parses "/news", "/news ha", "/news ha 500" (and "@bot" mention forms). null = not /news. */
export function parseNewsArgs(text: string): NewsArgs | null {
  const m = /^\/news(?:@\w{1,32})?(?:\s+(\S+))?(?:\s+(\S+))?\s*$/.exec(text.trim());
  if (!m) return null;
  const args = [m[1], m[2]].filter((a): a is string => typeof a === 'string');
  if (args.length === 0) return { confirm: false, cursor: null };
  const cursorArg = args.find((a) => /^\d{1,15}$/.test(a));
  const cursor = cursorArg ? Number(cursorArg) : null;
  const confirm = args.some((a) => a.toLowerCase() === 'ha') || cursor !== null;
  return { confirm, cursor };
}

/** Union + sort of user id rows fetched from several tables (junk ids dropped). */
export function mergeSortedIds(...groups: { telegram_user_id: number }[][]): number[] {
  const s = new Set<number>();
  for (const g of groups) {
    for (const r of g ?? []) {
      const n = Number(r?.telegram_user_id);
      if (Number.isInteger(n) && n > 0) s.add(n);
    }
  }
  return [...s].sort((a, b) => a - b);
}

/** Personal deep link, or the plain app URL when the bot username is unknown. */
export function referralLinkOf(uid: number, username: string | null | undefined, appUrl: string): string {
  return username ? `https://t.me/${username}?start=ref${uid}` : appUrl;
}

/** The announcement every current user receives — personalized with THEIR link. */
export function broadcastText(uid: number, username: string | null | undefined): string {
  const linkLine = username
    ? `\nSizning shaxsiy havolangiz:\n${referralLinkOf(uid, username, '')}\n`
    : '';
  return (
    '🎁 YANGILIK — «Do‘stlarni taklif qiling»!\n\n' +
    'Endi do‘stlaringiz bilan birga o‘rganish sizga Coin olib keladi:\n\n' +
    `🪙 Do‘stingiz shaxsiy havolangiz orqali qo‘shilsa — SIZGA +${REFERRAL_COINS} Coin\n` +
    `🎁 Unga ham darhol +${REFERRAL_COINS} Coin sovg‘a\n` +
    '🔥 U birinchi mashqini qilishi bilan mukofotingiz avtomatik tushadi\n' +
    linkLine +
    '\nHavolani sinfdoshlaringizga, guruhlaringizga yuboring — qancha ko‘p do‘st, shuncha Coin! 💎\n\n' +
    'Barcha takliflaringizni Profil → 🎁 Do‘stlarni taklif qiling bo‘limida kuzatib borasiz.'
  );
}

/** /ref answer — the user's own invite card. */
export function refText(uid: number, username: string | null | undefined): string {
  if (username) {
    const link = referralLinkOf(uid, username, '');
    return (
      `🎁 Do‘stlarni taklif qiling — har biriga +${REFERRAL_COINS} Coin!\n\n` +
      `Sizning shaxsiy havolangiz:\n${link}\n\n` +
      'Do‘stingiz havola orqali qo‘shilib, birinchi mashqini qilgach:\n' +
      `• Sizga: 🪙 +${REFERRAL_COINS} Coin\n` +
      `• Unga: 🪙 +${REFERRAL_COINS} Coin (darhol sovg‘a)\n\n` +
      'Barcha takliflaringizni Profil → 🎁 Do‘stlarni taklif qiling bo‘limida kuzatib borasiz.'
    );
  }
  return (
    `🎁 Do‘stlarni taklif qiling — har biriga +${REFERRAL_COINS} Coin!\n\n` +
    'Ilovani oching: Profil → 🎁 Do‘stlarni taklif qiling bo‘limida shaxsiy havolangiz va barcha statistikangiz turibdi.'
  );
}

interface TgResult {
  ok: boolean;
  description?: string;
  result?: unknown;
}

async function tg(token: string, method: string, payload: unknown): Promise<TgResult> {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
    return (await r.json().catch(() => ({ ok: false, description: 'bad_json' }))) as TgResult;
  } catch (e) {
    console.error(`tg ${method} failed`, e instanceof Error ? e.message : String(e));
    return { ok: false };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The bot username (from getMe) is needed for personal deep links; cache it for
// the lifetime of this serverless instance.
let cachedBotUsername = '';
async function botUsername(token: string): Promise<string | null> {
  if (cachedBotUsername) return cachedBotUsername;
  const r = await tg(token, 'getMe', {});
  const u = (r.result as { username?: string } | undefined)?.username;
  if (r.ok && typeof u === 'string' && /^\w{3,32}$/.test(u)) {
    cachedBotUsername = u;
    return u;
  }
  return null;
}

/** Native Telegram share sheet with the invite text prefilled (works everywhere). */
function shareUrlOf(link: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
}

// Keep the wording in sync with src/lib/referrals.ts inviteText().
const inviteShareText = (link: string): string =>
  `🚀 Ingliz tilini o‘rganishning eng qiziqarli yo‘li — SmartLingo AI!\n\nO‘yinlar, kunlik reja, Coin va sovg‘alar. Qo‘shil, birga o‘rganamiz! 👇\n${link}`;

function refKeyboard(uid: number, username: string | null | undefined, appUrl: string) {
  const rows: { text: string; url?: string; web_app?: { url: string } }[][] = [];
  if (username) {
    const link = referralLinkOf(uid, username, appUrl);
    rows.push([{ text: '🔗 Havolani ulashish', url: shareUrlOf(link, inviteShareText(link)) }]);
  }
  rows.push([{ text: '🚀 Ilovani ochish', web_app: { url: appUrl } }]);
  return { inline_keyboard: rows };
}

function supa(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

const sbHeaders = (key: string) => ({ apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' });

/** # of successful (not refunded) Tiny Pack purchases. */
async function tinyCount(url: string, key: string, uid: number): Promise<number> {
  const r = await fetch(`${url}/rest/v1/payments?select=id&telegram_user_id=eq.${uid}&package_id=eq.tiny&status=eq.succeeded`, {
    headers: sbHeaders(key),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) return -1; // signal storage trouble: fail closed
  const rows = (await r.json()) as { id: string }[];
  return rows.length;
}

/** Atomic claim: marks the row succeeded and returns the coins, or 0 when not claimable. */
async function claimPayment(url: string, key: string, id: string, uid: number, chargeId: string): Promise<number> {
  const r = await fetch(`${url}/rest/v1/rpc/claim_payment`, {
    method: 'POST',
    headers: sbHeaders(key),
    body: JSON.stringify({ p_id: id, p_uid: uid, p_charge_id: chargeId }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) return 0;
  const j = (await r.json().catch(() => 0)) as unknown;
  return typeof j === 'number' ? j : 0;
}

async function patchPayment(url: string, key: string, id: string, uid: number, fields: Record<string, unknown>): Promise<void> {
  await fetch(`${url}/rest/v1/payments?id=eq.${id}&telegram_user_id=eq.${uid}`, {
    method: 'PATCH',
    headers: sbHeaders(key),
    body: JSON.stringify(fields),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => undefined);
}

interface FromUser {
  id: number;
  first_name?: string;
}

const webAppBtn = (url: string) => ({ inline_keyboard: [[{ text: '🚀 Ilovani ochish', web_app: { url } }]] });

// ---------------------------------------------------------------------------
// Broadcast recipients + sender
// ---------------------------------------------------------------------------

/**
 * Every current user: anyone who ever synced progress OR opened the app with a
 * public identity. Both tables are written by /api/progress — this union is the
 * full audience. Ordered by id (stable continuation cursors).
 */
async function allUserIds(db: { url: string; key: string }, cursor: number | null): Promise<number[]> {
  const q = async (table: string): Promise<{ telegram_user_id: number }[]> => {
    try {
      const r = await fetch(
        `${db.url}/rest/v1/${table}?select=telegram_user_id&order=telegram_user_id.asc&limit=1000` +
          (cursor ? `&telegram_user_id=gt.${cursor}` : ''),
        { headers: sbHeaders(db.key), signal: AbortSignal.timeout(20_000) },
      );
      if (!r.ok) return [];
      return (await r.json()) as { telegram_user_id: number }[];
    } catch {
      return [];
    }
  };
  const [progressRows, identityRows] = await Promise.all([q('progress'), q('identities')]);
  return mergeSortedIds(progressRows, identityRows);
}

// Telegram allows ~30 messages/second — stay far below it. The cap keeps one run
// inside the function time budget; the report carries a continuation cursor.
const BROADCAST_CAP = 300;
const BROADCAST_CHUNK = 25;
const BROADCAST_PAUSE_MS = 1100;

/** One broadcast run. Resolves AFTER the last message was handed to Telegram. */
async function runBroadcast(
  db: { url: string; key: string },
  token: string,
  appUrl: string,
  username: string | null,
  cursor: number | null,
): Promise<{ sent: number; failed: number; last: number; more: boolean }> {
  const recipients = await allUserIds(db, cursor);
  const targets = recipients.slice(0, BROADCAST_CAP);
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < targets.length; i += BROADCAST_CHUNK) {
    const chunk = targets.slice(i, i + BROADCAST_CHUNK);
    await Promise.all(
      chunk.map(async (uid) => {
        const r = await tg(token, 'sendMessage', {
          chat_id: uid,
          text: broadcastText(uid, username),
          reply_markup: refKeyboard(uid, username, appUrl),
          link_preview_options: { is_disabled: true },
        });
        if (r.ok) sent++;
        else failed++;
        return r.ok;
      }),
    );
    if (i + BROADCAST_CHUNK < targets.length) await sleep(BROADCAST_PAUSE_MS);
  }
  return { sent, failed, last: targets.length ? targets[targets.length - 1] : 0, more: recipients.length > BROADCAST_CAP };
}

// Guards against the admin double-tapping "/news ha" on one warm instance.
let broadcasting = false;

/**
 * Records a referral and gifts the invited learner their coins.
 * Returns true when THIS call accepted the referral (first time only).
 * Every guard is idempotent: the PK on referrals.referred_id is the final say.
 */
async function handleReferral(db: { url: string; key: string }, token: string, appUrl: string, from: FromUser, referrerId: number): Promise<boolean> {
  if (referrerId === from.id) return false; // self-invites never count
  try {
    // The invited learner must be brand-new: no online progress AND no identity yet.
    // (Both were created by /api/progress on previous app opens.)
    const probe = await Promise.all([
      fetch(`${db.url}/rest/v1/progress?telegram_user_id=eq.${from.id}&select=telegram_user_id&limit=1`, { headers: sbHeaders(db.key), signal: AbortSignal.timeout(15_000) }),
      fetch(`${db.url}/rest/v1/identities?telegram_user_id=eq.${from.id}&select=telegram_user_id&limit=1`, { headers: sbHeaders(db.key), signal: AbortSignal.timeout(15_000) }),
    ]);
    for (const r of probe) {
      if (r.ok && ((await r.json()) as unknown[]).length > 0) {
        await tg(token, 'sendMessage', {
          chat_id: from.id,
          text: 'Bu taklif havolasi faqat yangi o‘quvchilar uchun 🙂 Siz allaqachon o‘quvchimiz — ilovani oching va o‘rganishni davom ettiring!',
        });
        return false;
      }
    }

    // Record the referral. on_conflict + ignore-duplicates => empty result when the
    // account was referred before (retry, second link, group of friends racing).
    const ins = await fetch(`${db.url}/rest/v1/referrals?on_conflict=referred_id`, {
      method: 'POST',
      headers: { ...sbHeaders(db.key), prefer: 'return=representation,resolution=ignore-duplicates' },
      body: JSON.stringify({ referred_id: from.id, referrer_id: referrerId, status: 'pending' }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!ins.ok) return false;
    const inserted = (await ins.json()) as unknown[];
    if (!Array.isArray(inserted) || inserted.length === 0) return false; // already referred earlier

    // Gift the invited learner NOW (deterministic id: a webhook retry cannot double-credit).
    await fetch(`${db.url}/rest/v1/coin_grants?on_conflict=id`, {
      method: 'POST',
      headers: { ...sbHeaders(db.key), prefer: 'return=minimal,resolution=ignore-duplicates' },
      body: JSON.stringify({ id: `gr_ref${from.id}_invite`, telegram_user_id: from.id, coins: REFERRAL_COINS, source: 'referral_invite' }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => undefined);

    const name = from.first_name?.trim().slice(0, 24) || 'do‘st';
    await tg(token, 'sendMessage', {
      chat_id: from.id,
      text: `🎉 Assalomu alaykum, ${name}!\n\nSiz do‘stingiz taklifi bilan keldingiz — hisobingizga 🪙 +${REFERRAL_COINS} Coin sovg‘a qilindi!\n\nIlovani oching: Coin darhol Do‘konda ko‘rinadi, do‘stingiz esa siz birinchi mashqingizni qilganingizdan so‘ng mukofot oladi. Omad! 🚀`,
      reply_markup: webAppBtn(appUrl),
    });
    await tg(token, 'sendMessage', {
      chat_id: referrerId,
      text: `🎉 ${name} sizning havolangiz orqali qo‘shildi!\n\nU ilovada birinchi mashqini qilgach hisobingizga 🪙 +${REFERRAL_COINS} Coin qo‘shiladi.\n\nYana do‘stlaringizni taklif qiling — har biri uchun mukofot! 💎`,
    });
    return true;
  } catch {
    return false; // any trouble -> treat as a normal /start, never block the new user
  }
}

export default async function handler(req: Req, res: Res): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = process.env.WEBAPP_URL;
  const secret = process.env.WEBHOOK_SECRET;
  if (!token || !url) {
    res.status(500).json({ error: 'not_configured' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true });
    return;
  }
  // Telegram sends the secret you set in setWebhook in this header.
  const got = req.headers['x-telegram-bot-api-secret-token'];
  if (secret && got !== secret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const update = (req.body ?? {}) as Update;

  // ---------- 1) Pre-checkout: validate the payment BEFORE it is charged (must answer within 10 s) ----------
  const pre = update.pre_checkout_query;
  if (pre) {
    const db = supa();
    const payload = pre.invoice_payload ?? '';
    const rowId = payload.startsWith('sl:') ? payload.slice(3) : '';
    const okRow = /^pay_[0-9a-zA-Z_]{3,64}$/.test(rowId);
    let ok = false;
    let error = 'To‘lovni tekshirib bo‘lmadi. Ilovani qayta ochib urinib ko‘ring.';
    if (db && okRow && pre.currency === 'XTR') {
      try {
        const r = await fetch(`${db.url}/rest/v1/payments?id=eq.${rowId}&select=id,package_id,coins,stars,status,telegram_user_id`, {
          headers: sbHeaders(db.key),
          signal: AbortSignal.timeout(15_000),
        });
        const rows = (await r.json()) as (PaymentRow & { telegram_user_id: number })[];
        const row = rows[0];
        const pkg = row ? PKG[row.package_id] : undefined;
        if (!row || !pkg) {
          error = 'Bu to‘lov topilmadi. Ilovada paketni qayta tanlang.';
        } else if (row.telegram_user_id !== pre.from.id) {
          error = 'Bu hisob-faktura sizga tegishli emas.';
        } else if (row.status !== 'pending') {
          error = 'Bu hisob-faktura allaqachon yopilgan. Yangi paketni tanlang.';
        } else if (row.stars !== pre.total_amount) {
          error = 'To‘lov summasi mos kelmadi.';
        } else if (pkg.stars !== row.stars || pkg.coins !== row.coins) {
          error = 'Paket ma’lumotlari mos kelmadi.';
        } else {
          const tiny = row.package_id === 'tiny' ? await tinyCount(db.url, db.key, pre.from.id) : 0;
          if (tiny < 0) {
            error = 'Server vaqtincha ishlamaydi. Bir necha soniyadan keyin qayta urinib ko‘ring.';
          } else if (tiny >= TINY_MAX) {
            error = 'Tiny Pack limiti tugagan (3/3). Boshqa paketni tanlang.';
          } else {
            ok = true;
          }
        }
      } catch {
        /* ok stays false */
      }
    }
    await tg(token, 'answerPreCheckoutQuery', ok
      ? { pre_checkout_query_id: pre.id, ok: true }
      : { pre_checkout_query_id: pre.id, ok: false, error_message: error });
    res.status(200).json({ ok: true });
    return;
  }

  // ---------- 2) Successful payment: credit EXACTLY ONCE (atomic), refund if over budget ----------
  const msg = update.message;
  const sp = msg?.successful_payment;
  if (sp && msg?.from?.id) {
    const db = supa();
    const uid = msg.from.id;
    const payload = sp.invoice_payload ?? '';
    const rowId = payload.startsWith('sl:') ? payload.slice(3) : '';
    if (!db) {
      // No database configured — never take money without crediting: refund immediately.
      if (sp.currency === 'XTR') await tg(token, 'refundStarPayment', { user_id: uid, telegram_payment_charge_id: sp.telegram_payment_charge_id });
      res.status(200).json({ ok: true });
      return;
    }
    try {
      // Atomic guard against duplicate webhook deliveries / retries: only the first
      // caller flips pending -> succeeded and receives the coin amount.
      const coins = await claimPayment(db.url, db.key, rowId, uid, sp.telegram_payment_charge_id);
      if (coins > 0) {
        // Tiny Pack budget re-check (two invoices approved in the same second).
        let overLimit = false;
        const row = await fetch(`${db.url}/rest/v1/payments?id=eq.${rowId}&select=package_id`, {
          headers: sbHeaders(db.key),
          signal: AbortSignal.timeout(15_000),
        }).then((r) => (r.ok ? (r.json() as Promise<PaymentRow[]>) : [] as never[])).catch(() => [] as PaymentRow[]);
        if (row[0]?.package_id === 'tiny') {
          const n = await tinyCount(db.url, db.key, uid);
          overLimit = n > TINY_MAX;
        }
        if (overLimit) {
          // Budget exceeded -> refund the Stars and mark the row refunded (never credited).
          const ref = await tg(token, 'refundStarPayment', { user_id: uid, telegram_payment_charge_id: sp.telegram_payment_charge_id });
          await patchPayment(db.url, db.key, rowId, uid, { status: ref.ok ? 'refunded' : 'failed' });
          await tg(token, 'sendMessage', {
            chat_id: uid,
            text: '⚠️ Tiny Pack limiti (3 marta) tugagandi — Stars qaytarildi (refund). Boshqa paketni tanlang.',
          });
        } else {
          // Credit lands in the ledger (succeeded + unacked); the Mini App applies it to the wallet.
          await tg(token, 'sendMessage', {
            chat_id: uid,
            text: `✅ +${coins} Coin hisobingizga qo‘shildi!\n\nIlovani oching — Coin darhol Do‘konda ko‘rinadi. Rahmat! 🪙✨`,
            reply_markup: { inline_keyboard: [[{ text: '🚀 Ilovani ochish', web_app: { url } }]] },
          });
        }
      }
      // coins === 0 -> duplicate delivery or unknown row: stay silent, Telegram retries stop.
    } catch (e) {
      console.error('successful_payment failure', e instanceof Error ? e.message : String(e));
    }
    res.status(200).json({ ok: true });
    return;
  }

  // ---------- 3) Regular messages (/start, /help, /ref, /news, referral links, anything else) ----------
  if (msg?.text) {
    const name = msg.from?.first_name ?? 'do‘st';
    const text = msg.text.trim();
    const db = supa();

    // ---- a) /ref — any user fetches their personal invite link right here ----
    if (/^\/ref(?:@\w{1,32})?\s*$/.test(text)) {
      const uid = msg.from?.id ?? msg.chat.id;
      const username = await botUsername(token);
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: refText(uid, username),
        reply_markup: refKeyboard(uid, username, url),
        link_preview_options: { is_disabled: true },
      });
      res.status(200).json({ ok: true });
      return;
    }

    // ---- a2) /quiz — feature explainer ----
    if (/^\/quiz(?:@\w{1,32})?\s*$/.test(text)) {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text:
          '🎯 Do‘st quizi nima?\n\n' +
          'Ilovada o‘zingizga quiz tuzasiz, so‘ng havolani do‘stlaringizga yuborasiz. Ular javob beradi, natijalar umumiy jadvalga tushadi!\n\n' +
          '• 5 savol — bepul\n• 10 savol — 🪙 50 Coin\n• Har quizda so‘z boyligi, grammatika yoki aralash savollar\n\n' +
          'Boshlash uchun ilovani oching: 🎯 Do‘st quizi bo‘limi.',
        reply_markup: webAppBtn(url),
      });
      res.status(200).json({ ok: true });
      return;
    }

    // ---- a3) /start quiz_<id> — Friend Quiz invitation deep link ----
    const quizPayload = parseQuizPayload(msg.text);
    if (quizPayload && db && msg.from && msg.chat.id === msg.from.id) {
      let handled = false;
      try {
        const r = await fetch(`${db.url}/rest/v1/friend_quizzes?select=id,title,creator_name,category,difficulty,size,status&id=eq.${encodeURIComponent(quizPayload)}&limit=1`, {
          headers: sbHeaders(db.key),
          signal: AbortSignal.timeout(15_000),
        });
        const rows = r.ok ? ((await r.json()) as { id: string; title: string; creator_name: string; category: string; difficulty: string; size: number; status: string }[]) : [];
        const quiz = rows[0];
        if (quiz && quiz.status === 'active') {
          await tg(token, 'sendMessage', {
            chat_id: msg.chat.id,
            text: quizInviteText(quiz.creator_name || 'Do‘stingiz', quiz.title, quiz.size, quiz.category, quiz.difficulty),
            reply_markup: {
              inline_keyboard: [[{ text: '🚀 Quizni boshlash', web_app: { url: `${url}?fq=${quiz.id}` } }]],
            },
            link_preview_options: { is_disabled: true },
          });
        } else {
          await tg(token, 'sendMessage', {
            chat_id: msg.chat.id,
            text: '🔎 Bu quiz topilmadi yoki allaqachon yopilgan. Do‘stingizdan yangi havola so‘rang yoki ilovada o‘zingiz quiz tuzing!',
            reply_markup: webAppBtn(url),
          });
        }
        handled = true;
      } catch {
        handled = false; // storage hiccup -> fall through to the normal welcome
      }
      if (handled) {
        res.status(200).json({ ok: true });
        return;
      }
    }

    // ---- b) /news — admin broadcast of the new feature (preview -> confirm) ----
    const news = parseNewsArgs(text);
    if (news) {
      const admins = adminIdsFromEnv(process.env.ADMIN_TELEGRAM_IDS);
      const fromId = msg.from?.id ?? 0;
      if (!db) {
        await tg(token, 'sendMessage', {
          chat_id: msg.chat.id,
          text: '⚠️ Ma’lumotlar bazasi (Supabase) sozlanmagan — yangilik yuborish imkonsiz.',
        });
      } else if (admins.length === 0) {
        // Fail closed, but tell the owner exactly how to enable it.
        await tg(token, 'sendMessage', {
          chat_id: msg.chat.id,
          text:
            '🔒 /news — yangilik yuborish faqat admin uchun.\n\n' +
            `Sizning Telegram ID: ${fromId || '—'}\n\n` +
            'Yoqish uchun: Vercel → Settings → Environment Variables → yangi o‘zgaruvchi qo‘shing:\n' +
            `ADMIN_TELEGRAM_IDS = ${fromId || '<sizning ID>'}\n\n` +
            'So‘ng loyihani qayta deploy qiling (Deployments → Redeploy). Shundan keyin /news barcha foydalanuvchilarga yangilik yuboradi.',
        });
      } else if (!admins.includes(fromId)) {
        await tg(token, 'sendMessage', { chat_id: msg.chat.id, text: '🔒 Bu buyruq faqat admin uchun.' });
      } else if (broadcasting) {
        await tg(token, 'sendMessage', {
          chat_id: msg.chat.id,
          text: '⏳ Oldingi yuborish hali davom etmoqda — bir necha soniyadan keyin /news bilan tekshiring.',
        });
      } else if (!news.confirm) {
        // Preview: exact message + recipient count + the confirm command.
        const [ids, username] = await Promise.all([allUserIds(db, null), botUsername(token)]);
        await tg(token, 'sendMessage', {
          chat_id: msg.chat.id,
          text:
            `📢 Yangilik yuborish\n\nQabul qiluvchilar: ${ids.length} ta foydalanuvchi.\n\n` +
            'Xabar matni (har bir foydalanuvchi o‘z shaxsiy havolasini oladi):\n\n' +
            '━━━━━━━━━━━━━━━━━━\n' +
            broadcastText(fromId, username) +
            '\n━━━━━━━━━━━━━━━━━━\n\n' +
            '✅ Yuborishni tasdiqlash:  /news ha\n' +
            '❌ Bekor qilish: hech narsa yubormang.',
          link_preview_options: { is_disabled: true },
        });
      } else {
        broadcasting = true;
        try {
          const username = await botUsername(token);
          await tg(token, 'sendMessage', { chat_id: msg.chat.id, text: `⏳ Yuborilmoqda…` });
          const r = await runBroadcast(db, token, url, username, news.cursor);
          await tg(token, 'sendMessage', {
            chat_id: msg.chat.id,
            text:
              '📣 Yuborish yakunlandi.\n\n' +
              `✅ Yetib bordi: ${r.sent} ta\n` +
              `⚠️ Yetib bormadi: ${r.failed} ta` +
              (r.more ? `\n\n➡️ Foydalanuvchilar ko‘p — davom etish:  /news ha ${r.last}` : ''),
          });
        } finally {
          broadcasting = false;
        }
      }
      res.status(200).json({ ok: true });
      return;
    }

    // ---- c) Referral deep link: /start ref<referrer_id> (private chats only) ----
    const ref = parseRefPayload(msg.text);
    if (ref && db && msg.from && msg.chat.id === msg.from.id) {
      const handled = await handleReferral(db, token, url, { id: msg.from.id, first_name: msg.from.first_name }, ref);
      if (handled) {
        res.status(200).json({ ok: true });
        return;
      }
      // not accepted (existing learner, duplicate, self, or storage hiccup)
      // -> fall through to the regular welcome below.
    }

    // ---- d) /start, /help — welcome (with the referral feature included) ----
    if (msg.text.startsWith('/start') || msg.text.startsWith('/help')) {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: `Assalomu alaykum, ${name}! 👋😊\n\nSmartLingo AI ga xush kelibsiz! Men sizga ingliz tilini qiziqarli va oson o‘rganishda yordam beraman.\n\n✨ Qisqa test bilan darajangizni aniqlang\n📅 O‘zingizga mos kunlik reja oling\n💬 Lingo bilan mashq qiling\n🔥 XP yig‘ing va seriyangizni davom ettiring\n🎯 Do‘stlaringizga quiz tuzib yuboring (/quiz)\n🎁 Do‘stlaringizni taklif qiling — har biriga +${REFERRAL_COINS} Coin (/ref)\n\nBoshlashga tayyormisiz? Pastdagi tugmani bosing 👇`,
        reply_markup: { inline_keyboard: [[{ text: '🚀 O‘rganishni boshlash', web_app: { url } }]] },
      });
    } else {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: 'Ilovani ochish uchun pastdagi tugmani bosing 👇',
        reply_markup: { inline_keyboard: [[{ text: '📚 SmartLingo AI', web_app: { url } }]] },
      });
    }
  }
  res.status(200).json({ ok: true });
}
