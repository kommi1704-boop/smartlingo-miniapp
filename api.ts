import { tgInitData } from './telegram';

// Optional backend. If /api/tutor is not deployed (static hosting) or has no AI key configured,
// the app silently stays in DEMO mode. No secret ever lives in the frontend.
const BASE: string = (import.meta.env?.VITE_API_BASE as string | undefined) ?? '';

let cached: boolean | null = null;

export async function tutorIsLive(force = false): Promise<boolean> {
  if (cached !== null && !force) return cached;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(`${BASE}/api/tutor`, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    clearTimeout(timer);
    if (!r.ok) return (cached = false);
    const j = await r.json();
    return (cached = j?.live === true);
  } catch {
    return (cached = false);
  }
}

export interface TutorRequest {
  messages: { role: 'user' | 'assistant'; text: string }[];
  level: string;
  name: string;
  age: number;
}

export async function askLiveTutor(req: TutorRequest): Promise<string> {
  const r = await fetch(`${BASE}/api/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() },
    body: JSON.stringify(req),
  });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) {
        msg = j.status ? `${j.error}_${j.status}` : String(j.error);
        if (typeof j.detail === 'string' && j.detail) msg += `|${j.detail}`;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const j = await r.json();
  if (typeof j?.reply !== 'string') throw new Error('bad_response');
  return j.reply;
}

/** Short Uzbek explanation of why the live tutor failed (shown in the toast, so the cause is visible). */
export function tutorErrorHint(full: string): string {
  const [msg, ...rest] = full.split('|');
  const detail = rest.join('|').trim();
  const hint = baseHint(msg);
  return detail ? `${hint}: ${detail}` : hint;
}

function baseHint(msg: string): string {
  if (msg === 'unauthorized') return 'Telegram ichidan oching: brauzerda jonli AI ishlamaydi';
  if (msg.startsWith('server_misconfigured')) return 'serverda TELEGRAM_BOT_TOKEN yo‘q';
  if (msg === 'not_configured') return 'serverda AI kaliti yo‘q';
  if (msg === 'upstream_error_401' || msg === 'upstream_error_403') return 'AI kaliti noto‘g‘ri yoki bu hududga ruxsat yo‘q';
  if (msg === 'upstream_error_404') return 'AI modeli topilmadi';
  if (msg.startsWith('upstream_error_4')) return `AI so‘rovni rad etdi (${msg.replace('upstream_error_', '')})`;
  if (msg.startsWith('upstream_error')) return 'AI xizmatida nosozlik';
  if (msg === 'upstream_busy' || msg === 'too_many_requests') return 'AI band yoki limit tugadi';
  if (msg === 'empty_reply') return 'AI bo‘sh javob qaytardi';
  if (msg === 'upstream_unreachable') return 'AI xizmatiga ulanib bo‘lmadi';
  return `xato: ${msg}`;
}
