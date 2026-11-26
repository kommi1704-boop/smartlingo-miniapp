import { useEffect, useRef, useState } from 'react';
import { Button, Notice } from './ui';
import { getWebSession, isTelegram } from '../lib/telegram';
import { BOT_USERNAME, botLoginLink, loginWithTelegram, logoutWeb, pollBotLogin, startBotLogin, type WidgetUser } from '../lib/webSession';
import { toast } from '../store/ui';

/**
 * "Telegram bilan kirish" for browser / laptop / tablet. Inside Telegram this renders nothing.
 * After a successful sign-in the page reloads so every module (cloud sync, XP ledger, billing,
 * leaderboard) starts with the session — progress is restored from the same Telegram account.
 */
export function WebLogin({ compact = false }: { compact?: boolean }) {
  const [err, setErr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const sess = getWebSession();
  const active = !isTelegram() && !sess && !!BOT_USERNAME;

  // Pre-create the one-time token so the button is a REAL link (popup blockers never stop a plain <a>).
  const prepare = () => {
    setErr(null);
    setWaiting(false);
    startBotLogin()
      .then(setToken)
      .catch((e: unknown) => setErr(e instanceof Error && e.message === 'not_configured' ? 'Server hali sozlanmagan.' : 'Ulanib bo‘lmadi. Qayta urinib ko‘ring.'));
  };
  useEffect(() => {
    if (active) prepare();
  }, [active]);

  // After the link was opened, poll until the bot confirms.
  useEffect(() => {
    if (!active || !token || !waiting) return;
    let stop = false;
    const tick = async () => {
      try {
        const st = await pollBotLogin(token);
        if (stop) return;
        if (st === 'ok') {
          toast('Kirildi ✓ Natijalar tiklanmoqda…', 'success');
          setTimeout(() => window.location.reload(), 500);
          stop = true;
        } else if (st === 'expired') {
          stop = true;
          setToken(null);
          setErr('Havola muddati tugadi.');
          prepare();
        }
      } catch {
        /* network hiccup: keep polling */
      }
    };
    const t = window.setInterval(() => void tick(), 2000);
    const onVis = () => document.visibilityState === 'visible' && void tick();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop = true;
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active, token, waiting]);

  // Optional fallback: the classic Telegram Login Widget (phone + confirmation push).
  useEffect(() => {
    if (!active || !showWidget || !box.current) return;
    const w = window as unknown as { __slTgAuth?: (u: WidgetUser) => void };
    w.__slTgAuth = (u: WidgetUser) => {
      loginWithTelegram(u)
        .then(() => setTimeout(() => window.location.reload(), 500))
        .catch(() => setErr('Kirib bo‘lmadi. Qayta urinib ko‘ring.'));
    };
    const el = box.current;
    el.innerHTML = '';
    const sc = document.createElement('script');
    sc.async = true;
    sc.src = 'https://telegram.org/js/telegram-widget.js?22';
    sc.setAttribute('data-telegram-login', BOT_USERNAME);
    sc.setAttribute('data-size', 'large');
    sc.setAttribute('data-radius', '14');
    sc.setAttribute('data-userpic', 'false');
    sc.setAttribute('data-request-access', 'write');
    sc.setAttribute('data-onauth', '__slTgAuth(user)');
    el.appendChild(sc);
    return () => {
      delete w.__slTgAuth;
    };
  }, [active, showWidget]);

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
        Tugmani bosing — Telegramdagi SmartLingo boti ochiladi. Botda <b>Start</b> ni bosing va brauzerga qayting. Telefon raqam kerak emas.
      </div>
      <a
        href={token ? botLoginLink(token) : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!token}
        onClick={() => token && setWaiting(true)}
        className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#229ED9] px-4 py-2.5 text-sm font-bold text-white ${token ? '' : 'pointer-events-none opacity-60'}`}
      >
        ✈️ Telegram orqali kirish
      </a>
      {waiting && <div className="mt-2 text-xs font-semibold text-muted">Telegramda <b>Start</b> ni bosing… tasdiqlanishi bilan bu yerda avtomatik kirasiz ⏳</div>}
      {err && <div className="mt-2 text-xs font-semibold text-rose-600">{err}</div>}
      {!showWidget ? (
        <button type="button" className="mt-2 text-xs text-muted underline" onClick={() => setShowWidget(true)}>
          Boshqa usul (telefon raqam bilan)
        </button>
      ) : (
        <div ref={box} className="mt-2 min-h-[44px]" />
      )}
    </div>
  );
}
