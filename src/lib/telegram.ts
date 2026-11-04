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

export function tgUser(): TgUser | undefined {
  return tg()?.initDataUnsafe?.user;
}

export function tgInitData(): string {
  return tg()?.initData ?? '';
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
