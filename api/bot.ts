// Vercel serverless function: Telegram bot webhook (no always-on server needed).
// Handles /start and /help and shows a button that opens the Mini App.
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
    if (msg.text.startsWith('/start') || msg.text.startsWith('/help')) {
      await tg(token, 'sendMessage', {
        chat_id: msg.chat.id,
        text: `Assalomu alaykum, ${name}! 👋😊\n\nSmartLingo AI ga xush kelibsiz! Men sizga ingliz tilini qiziqarli va oson o‘rganishda yordam beraman.\n\n✨ Qisqa test bilan darajangizni aniqlang\n📅 O‘zingizga mos kunlik reja oling\n💬 Lingo bilan mashq qiling\n🔥 XP yig‘ing va seriyangizni davom ettiring\n\nBoshlashga tayyormisiz? Pastdagi tugmani bosing 👇`,
        reply_markup: { inline_keyboard: [
    [{ text: '🚀 O‘rganishni boshlash', web_app: { url } }],
    [{ text: '📢 Yangiliklar', url: 'https://t.me/smartLingoUp' }]
  ]
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
