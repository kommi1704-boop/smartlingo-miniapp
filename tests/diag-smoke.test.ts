// Smoke test: ?k=diag responds with the self-test JSON even with NO env vars set.
process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.TELEGRAM_BOT_TOKEN = '';

const { default: handler } = await import('../api/admin-notify');

const res = {
  code: 0,
  body: null as unknown,
  status(c: number) { this.code = c; return this; },
  setHeader() { return this; },
  json(b: unknown) { this.body = b; },
};

await handler({ method: 'GET', url: '/api/admin-notify?k=diag', headers: {} } as never, res as never);

const j = res.body as { version: string; ok: boolean; env: Record<string, boolean>; bot: unknown; tables: unknown };
console.log('status:', res.code);
console.log('version:', j.version);
console.log('ok:', j.ok);
console.log('env:', JSON.stringify(j.env));
console.log('bot:', j.bot, '| tables:', j.tables);
if (res.code !== 200 || j.ok !== false || j.env.SUPABASE_URL !== false || j.version !== 'v3-diag') {
  console.error('DIAG SMOKE TEST FAILED');
  process.exit(1);
}
console.log('===== diag smoke test passed =====');
