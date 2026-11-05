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
// Env (server only): TELEGRAM_BOT_TOKEN, WEBAPP_URL, WEBHOOK_SECRET,
//                    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (payments).

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

async function tg(token: string, method: string, payload: unknown): Promise<{ ok: boolean; description?: string }> {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
    return (await r.json().catch(() => ({ ok: false, description: 'bad_json' }))) as { ok: boolean; description?: string };
  } catch (e) {
    console.error(`tg ${method} failed`, e instanceof Error ? e.message : String(e));
    return { ok: false };
  }
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

  // ---------- 3) Regular messages (/start, /help, anything else) ----------
  if (msg?.text) {
    const name = msg.from?.first_name ?? 'do‘st';
    if (msg.text.startsWith('/start') || msg.text.startsWith('/help')) {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: `Assalomu alaykum, ${name}! 👋😊\n\nSmartLingo AI ga xush kelibsiz! Men sizga ingliz tilini qiziqarli va oson o‘rganishda yordam beraman.\n\n✨ Qisqa test bilan darajangizni aniqlang\n📅 O‘zingizga mos kunlik reja oling\n💬 Lingo bilan mashq qiling\n🔥 XP yig‘ing va seriyangizni davom ettiring\n\nBoshlashga tayyormisiz? Pastdagi tugmani bosing 👇`,
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
