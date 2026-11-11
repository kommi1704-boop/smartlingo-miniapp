// Full API smoke test: every handler must answer a benign GET without crashing
// even with NO env vars (mirrors a fresh Vercel deployment before env setup).
process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.TELEGRAM_BOT_TOKEN = '';
process.env.WEBAPP_URL = '';
process.env.ADMIN_TELEGRAM_IDS = '';
process.env.OPENROUTER_API_KEY = '';
process.env.GEMINI_API_KEY = '';

interface FakeRes {
  code: number;
  body: unknown;
  status(c: number): FakeRes;
  setHeader(): FakeRes;
  json(b: unknown): void;
}
function fakeRes(): FakeRes {
  const r = {
    code: 0,
    body: null as unknown,
    status(c: number) { r.code = c; return r; },
    setHeader() { return r; },
    json(b: unknown) { r.body = b; },
  };
  return r;
}

const targets: { name: string; mod: string; url: string }[] = [
  { name: 'admin-notify (?k=diag)', mod: '../api/admin-notify.ts', url: '/api/admin-notify?k=diag' },
  { name: 'admin-notify (?k=weekly)', mod: '../api/admin-notify.ts', url: '/api/admin-notify?k=weekly' },
  { name: 'admin-notify (bare)', mod: '../api/admin-notify.ts', url: '/api/admin-notify' },
  { name: 'ai (?k=tutor)', mod: '../api/ai.ts', url: '/api/ai?k=tutor' },
  { name: 'ai (bare)', mod: '../api/ai.ts', url: '/api/ai' },
  { name: 'battle (probe)', mod: '../api/battle.ts', url: '/api/battle' },
  { name: 'bot (GET)', mod: '../api/bot.ts', url: '/api/bot' },
  { name: 'leaderboard', mod: '../api/leaderboard.ts', url: '/api/leaderboard' },
  { name: 'notifications', mod: '../api/notifications.ts', url: '/api/notifications' },
  { name: 'payments', mod: '../api/payments.ts', url: '/api/payments' },
  { name: 'profile', mod: '../api/profile.ts', url: '/api/profile' },
  { name: 'progress', mod: '../api/progress.ts', url: '/api/progress' },
  { name: 'quiz (probe)', mod: '../api/quiz.ts', url: '/api/quiz' },
  { name: 'reminders', mod: '../api/reminders.ts', url: '/api/reminders' },
];

let failed = 0;
for (const t of targets) {
  try {
    const mod = (await import(t.mod)) as { default: (req: unknown, res: unknown) => Promise<void> };
    const res = fakeRes();
    await mod.default({ method: 'GET', url: t.url, headers: {} }, res);
    const code = res.body && typeof res.body === 'object' && 'error' in (res.body as object)
      ? `${res.code} ${(res.body as { error: string }).error}`
      : `${res.code}`;
    console.log(`PASS  ${t.name.padEnd(26)} -> ${code}`);
  } catch (e) {
    failed++;
    console.log(`CRASH ${t.name.padEnd(26)} -> ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(failed === 0 ? '===== ALL HANDLERS OK =====' : `===== ${failed} CRASHED =====`);
process.exit(failed === 0 ? 0 : 1);
