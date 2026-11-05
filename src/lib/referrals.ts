// Client helpers for "Do'stlarni taklif qiling" (referrals) and share cards.
//
// How referrals work end to end:
// 1. The learner shares  https://t.me/<bot>?start=ref<theirTelegramId>  (the bot
//    username comes from /api/payments, which reads it from Telegram's getMe).
// 2. A brand-new learner opens that link -> the bot webhook records the referral
//    and gifts the NEW learner +REFERRAL_COINS immediately (coin_grants ledger).
// 3. The invited learner's first progress sync pays the referrer +REFERRAL_COINS
//    (atomic reward_referral RPC); both land in the wallet via the same
//    applyPendingCredits() flow as Stars purchases — exactly once, ever.
//
// Sharing works everywhere: inside Telegram it opens the native share dialog,
// outside it opens t.me/share in a new tab.
import { tgUser } from './telegram';

// Keep in sync with api/bot.ts and api/progress.ts (tests cross-check all three).
export const REFERRAL_COINS = 50;

/** Pure link builder — easy to test without Telegram globals. */
export function buildReferralLink(uid: number, botUsername: string | null | undefined, fallbackUrl: string): string {
  if (botUsername) return `https://t.me/${botUsername}?start=ref${uid}`;
  return fallbackUrl; // no bot link -> the referral cannot be tracked, but sharing still works
}

/** This device's Telegram user id (the payload of the referral deep link). */
export function myTelegramId(): number | null {
  const u = tgUser();
  return u && typeof u.id === 'number' && u.id > 0 ? u.id : null;
}

export function inviteText(link: string): string {
  return `🚀 Ingliz tilini o‘rganishning eng qiziqarli yo‘li — SmartLingo AI!\n\nO‘yinlar, kunlik reja, Coin va sovg‘alar. Qo‘shil, birga o‘rganamiz! 👇\n${link}`;
}

export function achievementText(link: string, streak: number, xp: number, level: number): string {
  return `🔥 ${streak} kunlik seriya! SmartLingo AI bilan ingliz tilini o‘rganmoqdaman — ${level}-daraja, ${xp} XP.\n\nQo‘shil, birga musobaqalamiz! 👇\n${link}`;
}

/** Clipboard copy with a legacy fallback (older Telegram webviews). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      return await navigator.clipboard.writeText(text).then(
        () => true,
        () => false,
      );
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
