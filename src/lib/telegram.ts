// Thin, defensive wrapper around the Telegram Mini Apps SDK (window.Telegram.WebApp).
// Every call is safe outside Telegram (normal browser) and on older Telegram versions.

interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TgWebApp {
  initData: string;
  initDataUnsafe: { user?: TgUser; start_param?: string };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast(v: string): boolean;
  setHeaderColor?(c: string): void;
  setBackgroundColor?(c: string): void;
  setBottomBarColor?(c: string): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation?(): void;
  openLink(url: string, opts?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  /** Opens a native Telegram invoice (Telegram Stars / XTR payments). Available since Bot API 6.x clients. */
  openInvoice?(url: string): void;
  onEvent(name: string, cb: () => void): void;
  offEvent(name: string, cb: () => void): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void; isVisible: boolean };
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export function tg(): TgWebApp | undefined {
  try {
    return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  } catch {
    return undefined;
  }
}

/** True only when really opened inside Telegram (initData is non-empty). */
export function isTelegram(): boolean {
  return !!tg()?.initData;
}

export function initTelegram(): void {
  const w = tg();
  if (!w) return;
  try {
    w.ready();
    w.expand();
    if (w.isVersionAtLeast('7.7')) w.disableVerticalSwipes?.();
  } catch {
    /* ignore */
  }
}

// ---- Browser (laptop/tablet) session -------------------------------------------------------------------
// Outside Telegram the user signs in with the Telegram Login Widget; the server (api/_lib/webauth.ts) answers
// with an initData-format string that every endpoint already understands. It lives in localStorage.
const WEB_KEY = 'sl_web_session_v1';

export interface WebSession {
  initData: string;
  user: TgUser & { photo_url?: string };
  issuedAt: number; // ms
}

export function getWebSession(): WebSession | null {
  try {
    const raw = localStorage.getItem(WEB_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as WebSession;
    return j && typeof j.initData === 'string' && j.initData && j.user && typeof j.user.id === 'number' ? j : null;
  } catch {
    return null;
  }
}

export function setWebSession(sess: WebSession | null): void {
  try {
    if (sess) localStorage.setItem(WEB_KEY, JSON.stringify(sess));
    else localStorage.removeItem(WEB_KEY);
  } catch {
    /* private mode / blocked storage: the user simply stays signed out */
  }
}

/** Signed in either inside Telegram or in the browser via Telegram Login. */
export function hasSession(): boolean {
  return isTelegram() || !!getWebSession();
}

/** True when running in a normal browser with a Telegram Login session (no Mini App). */
export function isWebSession(): boolean {
  return !isTelegram() && !!getWebSession();
}

export function tgUser(): TgUser | undefined {
  return tg()?.initDataUnsafe?.user ?? getWebSession()?.user;
}

export function tgInitData(): string {
  return tg()?.initData || getWebSession()?.initData || '';
}

export function tgColorScheme(): 'light' | 'dark' | undefined {
  return tg()?.colorScheme;
}

export function onTgEvent(name: string, cb: () => void): () => void {
  const w = tg();
  if (!w) return () => {};
  try {
    w.onEvent(name, cb);
  } catch {
    return () => {};
  }
  return () => {
    try {
      w.offEvent(name, cb);
    } catch {
      /* ignore */
    }
  };
}

export function setTgColors(color: string): void {
  const w = tg();
  if (!w) return;
  try {
    if (w.isVersionAtLeast('6.1')) {
      w.setHeaderColor?.(color);
      w.setBackgroundColor?.(color);
    }
    if (w.isVersionAtLeast('7.10')) w.setBottomBarColor?.(color);
  } catch {
    /* ignore */
  }
}

let hapticsEnabled = true;
export function setHapticsEnabled(v: boolean) {
  hapticsEnabled = v;
}

export function haptic(kind: 'success' | 'error' | 'warning' | 'light' | 'select'): void {
  if (!hapticsEnabled) return;
  const h = tg()?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === 'success' || kind === 'error' || kind === 'warning') h.notificationOccurred(kind);
    else if (kind === 'select') h.selectionChanged();
    else h.impactOccurred('light');
  } catch {
    /* ignore */
  }
}

/** Opens an external link: inside Telegram via openLink, otherwise a new tab. */
export function openExternal(url: string): void {
  const w = tg();
  if (w && isTelegram()) {
    try {
      w.openLink(url);
      return;
    } catch {
      /* fall through */
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareToTelegram(url: string, text: string): void {
  const link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const w = tg();
  if (w && isTelegram()) {
    try {
      w.openTelegramLink(link);
      return;
    } catch {
      /* fall through */
    }
  }
  window.open(link, '_blank', 'noopener,noreferrer');
}

/** Controls Telegram's native Back button. Returns a cleanup function. */
export function bindBackButton(visible: boolean, onClick: () => void): () => void {
  const w = tg();
  if (!w || !isTelegram() || !w.isVersionAtLeast('6.1')) return () => {};
  try {
    if (visible) {
      w.BackButton.onClick(onClick);
      w.BackButton.show();
    } else {
      w.BackButton.hide();
    }
  } catch {
    return () => {};
  }
  return () => {
    try {
      w.BackButton.offClick(onClick);
    } catch {
      /* ignore */
    }
  };
}
