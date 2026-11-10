// Client helpers for the notification settings (/api/notifications).
import { BASE } from './api';
import { tgInitData } from './telegram';
import type { NotifyKind } from '../types.notify';

const headers = () => ({ 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() });

export interface HistoryItem {
  id: string;
  kind: NotifyKind;
  label: string;
  status: string;
  error?: string;
  at: string;
}

export interface NotifySettings {
  enabled: boolean;
  categories: Record<NotifyKind, boolean>;
  kinds: { id: NotifyKind; label: string; enabled: boolean }[];
  quietEnabled: boolean;
  quietStart: number | null;
  quietEnd: number | null;
  pausedUntil: string | null;
  history: HistoryItem[];
}

async function json<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let code = `http_${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) code = String(j.error);
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  return (await r.json()) as T;
}

export const notifNotConfigured = (e: unknown): boolean =>
  e instanceof Error && (e.message === 'not_configured' || e.message === 'http_503' || e.message === 'http_404');

export async function fetchNotifySettings(): Promise<NotifySettings> {
  return json(await fetch(`${BASE}/api/notifications`, { headers: headers() }));
}

export async function saveNotifyPrefs(patch: {
  categories?: Record<NotifyKind, boolean>;
  quietEnabled?: boolean;
  quietStart?: number | null;
  quietEnd?: number | null;
}): Promise<NotifySettings> {
  return json(
    await fetch(`${BASE}/api/notifications`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'prefs', patch }),
    }),
  );
}

export async function pauseNotifications(hours: number): Promise<NotifySettings> {
  return json(
    await fetch(`${BASE}/api/notifications`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'pause', hours }),
    }),
  );
}

export async function resetNotifications(): Promise<NotifySettings> {
  return json(
    await fetch(`${BASE}/api/notifications`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'reset' }),
    }),
  );
}
