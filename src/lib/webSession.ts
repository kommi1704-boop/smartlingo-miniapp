// Browser sign-in via Telegram Login Widget -> server-signed session (see api/_lib/webauth.ts).
import { BASE } from './api';
import { getWebSession, isTelegram, setWebSession, type WebSession } from './telegram';

/** Bot username (no @) — required by the Telegram Login Widget. */
export const BOT_USERNAME: string = ((import.meta.env?.VITE_BOT_USERNAME as string | undefined) ?? '').trim().replace(/^@/, '');

export type WidgetUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

async function callRaw(body: unknown): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE}/api/web-auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) {
    let code = `http_${r.status}`;
    try {
      const j = (await r.json()) as { error?: string };
      if (j?.error) code = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  return (await r.json()) as Record<string, unknown>;
}

async function call(body: unknown): Promise<WebSession> {
  const j = (await callRaw(body)) as { initData?: string; user?: WebSession['user'] };
  if (!j?.initData || !j.user) throw new Error('bad_response');
  return { initData: j.initData, user: j.user, issuedAt: Date.now() };
}

/** Bot deep-link login, step 1: a one-time token. Open `botLoginLink(token)` in Telegram. */
export async function startBotLogin(): Promise<string> {
  const j = await callRaw({ action: 'start' });
  if (typeof j.token !== 'string') throw new Error('bad_response');
  return j.token;
}

export const botLoginLink = (token: string): string => `https://t.me/${BOT_USERNAME}?start=wl_${token}`;

/** Step 2 (poll every ~2 s): 'pending' | 'expired' | 'ok' (session stored). */
export async function pollBotLogin(token: string): Promise<'pending' | 'expired' | 'ok'> {
  const j = (await callRaw({ action: 'poll', token })) as { status?: string; initData?: string; user?: WebSession['user'] };
  if (j.status === 'ok' && j.initData && j.user) {
    setWebSession({ initData: j.initData, user: j.user, issuedAt: Date.now() });
    return 'ok';
  }
  return j.status === 'expired' ? 'expired' : 'pending';
}

/** Exchanges the Telegram Login Widget payload for a session and stores it. */
export async function loginWithTelegram(widgetUser: WidgetUser): Promise<WebSession> {
  const sess = await call({ action: 'login', user: widgetUser });
  setWebSession(sess);
  return sess;
}

export function logoutWeb(): void {
  setWebSession(null);
}

const REFRESH_AFTER_MS = 6 * 3600 * 1000; // some endpoints accept only 24 h-old data — stay well inside

/** Keeps an active browser session alive. Signs the user out only when the server says the session is dead (401). */
export async function refreshWebSession(): Promise<void> {
  if (isTelegram()) return;
  const cur = getWebSession();
  if (!cur || Date.now() - cur.issuedAt < REFRESH_AFTER_MS) return;
  try {
    setWebSession(await call({ action: 'refresh', initData: cur.initData }));
  } catch (e) {
    if (e instanceof Error && e.message === 'unauthorized') setWebSession(null);
    // network / server hiccup: keep the old session, try again next time
  }
}

export function startSessionKeepAlive(): () => void {
  void refreshWebSession();
  const t = window.setInterval(() => void refreshWebSession(), 30 * 60 * 1000);
  const onVis = () => {
    if (document.visibilityState === 'visible') void refreshWebSession();
  };
  document.addEventListener('visibilitychange', onVis);
  return () => {
    window.clearInterval(t);
    document.removeEventListener('visibilitychange', onVis);
  };
}
