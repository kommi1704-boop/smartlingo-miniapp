// Client helpers for the Telegram Stars Coin Store (/api/payments).
//
// Flow: the client asks the server for a REAL Telegram invoice link (XTR), opens it
// with WebApp.openInvoice(), and Telegram collects the Stars. The bot webhook validates
// pre_checkout_query and, on successful_payment, records the credit in the payments
// ledger (atomic claim — exactly once). The client then pulls the ledger, adds the
// coins to its EXISTING wallet (state.coins.balance via the usual addCoins action) and
// acknowledges — so the credit also survives a new device and never double-applies.
//
// Everything degrades gracefully outside Telegram: the store page shows a notice.
import { BASE } from './api';
import { isTelegram, onTgEvent, tg, tgInitData } from './telegram';
import { addCoins } from '../store/actions';
import { toast } from '../store/ui';

// ===== Catalog — keep in sync with api/payments.ts PACKAGES (tests cross-check both) =====
export interface CoinPackage {
  id: string;
  label: string;
  coins: number;
  stars: number;
  popular?: boolean;
  maxPerUser?: number;
  tinyLeft?: number;
}

export const PACKAGES: CoinPackage[] = [
  { id: 'tiny', label: 'Tiny Pack', coins: 10, stars: 1, maxPerUser: 3 },
  { id: 'starter', label: 'Starter Pack', coins: 100, stars: 15 },
  { id: 'popular', label: 'Popular Pack', coins: 350, stars: 45, popular: true },
  { id: 'pro', label: 'Pro Pack', coins: 850, stars: 99 },
  { id: 'mega', label: 'Mega Pack', coins: 2000, stars: 199 },
  { id: 'ultimate', label: 'Ultimate Pack', coins: 5000, stars: 399 },
];

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentHistoryItem {
  id: string;
  packageId: string;
  coins: number;
  stars: number;
  status: PaymentStatus;
  date: string;
}

export interface BillingInfo {
  enabled: boolean;
  packages?: CoinPackage[];
  tinyLeft?: number;
  history?: PaymentHistoryItem[];
  pending?: { id: string; coins: number; packageId: string }[];
}

const headers = () => ({ 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() });

// IDs of payments this device has already added to the wallet (second line of defence
// against double-crediting; the server's `acked` flag is the primary guard).
const APPLIED_KEY = 'smartlingo:pays-applied';

function appliedList(): string[] {
  try {
    const raw = window.localStorage.getItem(APPLIED_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string').slice(-100) : [];
  } catch {
    return [];
  }
}

function markApplied(id: string): void {
  try {
    const next = [...appliedList(), id].slice(-100);
    window.localStorage.setItem(APPLIED_KEY, JSON.stringify(next));
  } catch {
    /* private mode — the server ack still protects */
  }
}

export const billingAvailable = (info: BillingInfo): boolean => info.enabled === true;

/** Fetches packages + history + unacknowledged credits. Throws on non-configuration errors. */
export async function fetchBilling(): Promise<BillingInfo> {
  const r = await fetch(`${BASE}/api/payments`, { headers: headers() });
  if (!r.ok) {
    let code = `http_${r.status}`;
    try {
      const j = (await r.json()) as { error?: string };
      if (j?.error) code = String(j.error);
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  return (await r.json()) as BillingInfo;
}

/**
 * Adds every not-yet-applied succeeded payment to the existing coin wallet,
 * exactly once per payment id (per device), then acks the server.
 * Returns the total coins credited by THIS call.
 */
export async function applyPendingCredits(info: BillingInfo, opts: { notify?: boolean } = {}): Promise<number> {
  const pending = info.pending ?? [];
  if (pending.length === 0 || !isTelegram()) return 0;
  const done = appliedList();
  const fresh = pending.filter((p) => p.coins > 0 && !done.includes(p.id));
  if (fresh.length === 0) {
    // already applied locally but maybe not acked — ack again, cheap and idempotent
    void ackIds(pending.map((p) => p.id));
    return 0;
  }
  let total = 0;
  const ids: string[] = [];
  for (const p of fresh) {
    addCoins(p.coins, { silent: true });
    markApplied(p.id);
    ids.push(p.id);
    total += p.coins;
  }
  if (total > 0 && opts.notify !== false) {
    toast(`🪙 +${total} Coin hisobingizga qo‘shildi — Stars to‘lovi tasdiqlandi`, 'success', 3600);
  }
  await ackIds(ids);
  return total;
}

async function ackIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    await fetch(`${BASE}/api/payments`, { method: 'POST', headers: headers(), body: JSON.stringify({ action: 'ack', ids }) });
  } catch {
    /* the next fetch will re-offer unacked ids — safe */
  }
}

/** One-shot check used at app start and when the store page opens. Returns credited coins. */
export async function checkPendingCredits(): Promise<number> {
  if (!isTelegram()) return 0;
  try {
    const info = await fetchBilling();
    return await applyPendingCredits(info);
  } catch {
    return 0;
  }
}

// ===== Purchase =====

export type BuyResult = 'paid' | 'maybe_paid' | 'cancelled' | 'failed';

interface InvoiceClosedEvent {
  url?: string;
  status?: string;
}

/**
 * Opens a real Telegram Stars invoice for the package and resolves once the invoice
 * is closed. Credits are applied by the ledger check (poll) right after 'paid'.
 */
export async function buyPackage(packageId: string): Promise<BuyResult> {
  if (!isTelegram() || !tg()?.openInvoice) throw new Error('no_telegram');
  const r = await fetch(`${BASE}/api/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ action: 'open', packageId }),
  });
  if (!r.ok) {
    let code = `http_${r.status}`;
    try {
      const j = (await r.json()) as { error?: string };
      if (j?.error) code = String(j.error);
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  const { id: payId, url } = (await r.json()) as { id: string; url: string };

  const closed = new Promise<InvoiceClosedEvent>((resolve) => {
    const w = tg();
    if (!w) return resolve({ status: 'failed' });
    const handler = (data?: unknown) => {
      const ev = (data ?? {}) as InvoiceClosedEvent;
      if (!ev.url || ev.url === url) resolve(ev);
    };
    onTgEvent('invoiceClosed', handler);
  });

  const w = tg();
  try {
    w?.openInvoice?.(url);
  } catch {
    throw new Error('invoice_open_failed');
  }

  const ev = await closed;
  const status = ev.status ?? 'failed';

  if (status === 'paid') {
    // The webhook may take a moment — poll the ledger briefly; even if it is slow,
    // checkPendingCredits() at the next app start picks the credit up.
    for (let i = 0; i < 10; i++) {
      await new Promise((res) => setTimeout(res, 700));
      try {
        const info = await fetchBilling();
        const hit = (info.pending ?? []).some((p) => p.id === payId);
        if (hit) {
          await applyPendingCredits(info);
          return 'paid';
        }
        if ((info.history ?? []).some((h) => h.id === payId && (h.status === 'succeeded' || h.status === 'refunded'))) {
          await applyPendingCredits(info);
          return 'paid';
        }
      } catch {
        /* keep polling */
      }
    }
    return 'maybe_paid';
  }

  // closed without paying — tell the server so the history shows it
  try {
    await fetch(`${BASE}/api/payments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'close', id: payId, status: status === 'cancelled' ? 'cancelled' : 'failed' }),
    });
  } catch {
    /* non-fatal */
  }
  return status === 'cancelled' ? 'cancelled' : 'failed';
}
