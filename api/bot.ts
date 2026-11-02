// Vercel serverless function: Telegram bot webhook (no always-on server needed).
// Handles /start, /help and the shortcut commands (/plan /battle /top /games /profile): each replies with a
// button that opens the Mini App straight on that page (via ?go=<page>, read in src/main.tsx).
// Register it once with:  npm run setup-bot   (see README)

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}

interface Update {
  message?: { chat: { id: number }; text?: string; from?: { first_name?: string } };
}

async function tg(token: string, method: string, payload: unknown): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ====== EDIT THESE TWO LINES ======
const NEWS_CHANNEL_URL = 'https://t.me/smartLingoUp'; 
const HELP_PROFILE_URL = 'https://t.me/bakhtiyorrvc'; 
// ==================================
const isSet = (u: string) => !/YOUR_/.test(u);

const SHORTCUTS: Record<string, { go: string; text: string; button: string }> = {
  '/plan': { go: 'plan', text: '📅 Bugungi kunlik rejangiz tayyor. Ochamizmi?', button: '📅 Kunlik reja' },
  '/battle': { go: 'battle', text: '⚔️ Do‘stona jangga tayyormisiz? Reytingni ko‘taring!', button: '⚔️ Jangga kirish' },
  '/top': { go: 'leaderboard', text: '🏆 Reyting jadvalini ko‘ring va o‘z o‘rningizni toping.', button: '🏆 Reyting' },
  '/games': { go: 'games', text: '🎮 Qiziqarli mini-o‘yinlar sizni kutmoqda!', button: '🎮 O‘yinlar' },
  '/profile': { go: 'profile', text: '🧑‍🚀 Profilingiz, avatar va ramkalaringiz.', button: '🧑‍🚀 Profil' },
};

export default async function handler(req: Req, res: Res): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = process.env.WEBAPP_URL;
  const secret = process.env.WEBHOOK_SECRET;
  if (!token || !url) {
    res.status(500).json({ error: 'not_configured' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true });
    return;
  }
  // Telegram sends the secret you set in setWebhook in this header.
  const got = req.headers['x-telegram-bot-api-secret-token'];
  if (secret && got !== secret) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const update = (req.body ?? {}) as Update;
  const msg = update.message;
  if (msg?.text) {
    const name = msg.from?.first_name ?? 'do‘st';
    const cmd = (msg.text.split(/\s/)[0] ?? '').split('@')[0].toLowerCase();
    const shortcut = SHORTCUTS[cmd];
    if (shortcut) {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: shortcut.text,
        reply_markup: { inline_keyboard: [[{ text: shortcut.button, web_app: { url: `${url.replace(/\/$/, '')}/?go=${shortcut.go}` } }]] },
      });
    } else if (cmd === '/help') {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: 'Savol, taklif yoki muammo bo‘lsa, bevosita yozing 👇',
        reply_markup: {
          inline_keyboard: [
            ...(isSet(HELP_PROFILE_URL) ? [[{ text: '💬 Muallifga yozish', url: HELP_PROFILE_URL }]] : []),
            [{ text: '🚀 Ilovani ochish', web_app: { url } }],
          ],
        },
      });
    } else if (cmd === '/start') {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: `Assalomu alaykum, ${name}! 👋😊\n\nSmartLingo AI ga xush kelibsiz! Men sizga ingliz tilini qiziqarli va oson o‘rganishda yordam beraman.\n\n✨ Qisqa test bilan darajangizni aniqlang\n📅 O‘zingizga mos kunlik reja oling\n💬 Lingo bilan mashq qiling\n🔥 XP yig‘ing va seriyangizni davom ettiring\n\nBoshlashga tayyormisiz? Pastdagi tugmani bosing 👇`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 O‘rganishni boshlash', web_app: { url } }],
            ...(isSet(NEWS_CHANNEL_URL) ? [[{ text: '📢 Yangiliklar', url: NEWS_CHANNEL_URL }]] : []),
          ],
        },
      });
    } else {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: 'Ilovani ochish uchun pastdagi tugmani bosing 👇',
        reply_markup: { inline_keyboard: [[{ text: '📚 SmartLingo AI', web_app: { url } }]] },
      });
    }
  }
  res.status(200).json({ ok: true });
}
