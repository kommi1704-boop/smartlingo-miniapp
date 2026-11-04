const pad = (n: number) => String(n).padStart(2, '0');

/** Local date as YYYY-MM-DD */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const today = (): string => dayKey();

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const dt = parseKey(key);
  dt.setDate(dt.getDate() + n);
  return dayKey(dt);
}

/** The last n day keys ending at `end` (oldest first). */
export function lastDays(n: number, end: string = today()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
export function shortDay(key: string): string {
  return WEEKDAYS[parseKey(key).getDay()];
}

export function dayOfYear(key: string = today()): number {
  const d = parseKey(key);
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
export function prettyDate(key: string): string {
  const d = parseKey(key);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
}

export function prettyDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
