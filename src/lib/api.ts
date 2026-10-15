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
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const j = await r.json();
  if (typeof j?.reply !== 'string') throw new Error('bad_response');
  return j.reply;
}
