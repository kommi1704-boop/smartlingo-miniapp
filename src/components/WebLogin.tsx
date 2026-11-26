import { useEffect, useRef, useState } from 'react';
import { Button, Notice } from './ui';
import { getWebSession, isTelegram } from '../lib/telegram';
import { BOT_USERNAME, loginWithTelegram, logoutWeb, type WidgetUser } from '../lib/webSession';
import { toast } from '../store/ui';

/**
 * "Telegram bilan kirish" for browser / laptop / tablet. Inside Telegram this renders nothing.
 * After a successful sign-in the page reloads so every module (cloud sync, XP ledger, billing,
 * leaderboard) starts with the session — progress is restored from the same Telegram account.
 */
export function WebLogin({ compact = false }: { compact?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sess = getWebSession();

  useEffect(() => {
    if (isTelegram() || sess || !BOT_USERNAME || !box.current) return;
    const w = window as unknown as { __slTgAuth?: (u: WidgetUser) => void };
    w.__slTgAuth = (u: WidgetUser) => {
      setBusy(true);
      setErr(null);
      loginWithTelegram(u)
        .then(() => {
          toast('Kirildi ✓ Natijalar tiklanmoqda…', 'success');
          setTimeout(() => window.location.reload(), 600);
        })
        .catch((e: unknown) => {
          setBusy(false);
          const m = e instanceof Error ? e.message : '';
          setErr(m === 'not_configured' ? 'Server hali sozlanmagan (bot tokeni).' : m === 'rate_limited' ? 'Juda ko‘p urinish. Biroz kutib qayta urining.' : 'Kirib bo‘lmadi. Qayta urinib ko‘ring.');
        });
    };
    const el = box.current;
    el.innerHTML = '';
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.setAttribute('data-telegram-login', BOT_USERNAME);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '14');
    s.setAttribute('data-userpic', 'false');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-onauth', '__slTgAuth(user)');
    el.appendChild(s);
    return () => {
      delete w.__slTgAuth;
    };
  }, [sess]);

  if (isTelegram()) return null;

  if (sess) {
    const name = [sess.user.first_name, sess.user.last_name].filter(Boolean).join(' ') || (sess.user.username ? `@${sess.user.username}` : `ID ${sess.user.id}`);
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold">Telegram hisobi</div>
          <div className="truncate text-xs text-muted">{name} sifatida kirgansiz. Natijalar telefon va kompyuterda bir xil.</div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            logoutWeb();
            window.location.reload();
          }}
        >
          Chiqish
        </Button>
      </div>
    );
  }

  if (!BOT_USERNAME) {
    return compact ? null : <Notice tone="warn">Brauzerda kirish uchun <b>VITE_BOT_USERNAME</b> sozlanmagan.</Notice>;
  }

  return (
    <div>
      {!compact && <div className="font-bold">Telegram bilan kirish</div>}
      <div className="mb-2 text-xs text-muted">
        Telegram hisobingiz bilan kiring — XP, seriya, coin va reyting telefondagi ilova bilan bir xil bo‘ladi, bildirishnomalar ham ishlaydi.
      </div>
      <div ref={box} className="min-h-[44px]" aria-busy={busy} />
      {busy && <div className="mt-2 text-xs font-semibold text-muted">Tekshirilmoqda…</div>}
      {err && <div className="mt-2 text-xs font-semibold text-rose-600">{err}</div>}
    </div>
  );
}
