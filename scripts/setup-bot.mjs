// One-time bot setup. Run AFTER deploying (so WEBAPP_URL exists):
//   TELEGRAM_BOT_TOKEN=123:ABC WEBAPP_URL=https://your-app.vercel.app WEBHOOK_SECRET=some-random-string npm run setup-bot
// It: (1) points the bot webhook to /api/bot, (2) sets the chat menu button to open the Mini App,
//     (3) sets the command list. Nothing is stored anywhere except at Telegram.
const token = process.env.TELEGRAM_BOT_TOKEN;
const url = (process.env.WEBAPP_URL || '').replace(/\/$/, '');
const secret = process.env.WEBHOOK_SECRET;

if (!token || !url) {
  console.error('Missing TELEGRAM_BOT_TOKEN or WEBAPP_URL. See README.md');
  process.exit(1);
}
if (!url.startsWith('https://')) {
  console.error('WEBAPP_URL must be an https:// URL (Telegram requires HTTPS).');
  process.exit(1);
}

async function call(method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const j = await r.json();
  console.log(method.padEnd(18), j.ok ? 'OK' : `FAILED: ${j.description}`);
  return j.ok;
}

await call('setWebhook', { url: `${url}/api/bot`, ...(secret ? { secret_token: secret } : {}), allowed_updates: ['message'] });
await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'O‘rganish', web_app: { url } } });
await call('setMyCommands', {
  commands: [
    { command: 'start', description: 'SmartLingo AI ni ochish' },
    { command: 'help', description: 'Yordam' },
  ],
});
console.log('\nDone. Open your bot in Telegram and send /start');
