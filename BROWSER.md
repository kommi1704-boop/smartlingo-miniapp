# Brauzer / noutbuk / planshet versiyasi

Ilova endi Telegramdan tashqarida ham to'liq ishlaydi. Kirish — **Telegram bilan kirish** (Telegram Login Widget).

## Qanday ishlaydi
1. Brauzerda foydalanuvchi "Telegram bilan kirish" tugmasini bosadi (Bosh sahifa yoki Sozlamalar).
2. Telegram imzolangan ma'lumot qaytaradi, `POST /api/web-auth` uni tekshiradi (`api/_lib/webauth.ts`).
3. Server Mini App `initData` formatidagi **o'zi imzolagan sessiya** qaytaradi. Barcha `api/*` funksiyalar uni
   o'zgarishsiz qabul qiladi, shuning uchun progress, seriya, coin, reyting, janglar va eslatmalar telefondagi bilan
   **bir xil Telegram akkaunt**da ishlaydi.
4. Sessiya faol foydalanuvchi uchun avtomatik yangilanadi (6 soatda bir). 7 kun kirilmasa — qayta kirish.

## Bir martalik sozlash
- Vercel env: `VITE_BOT_USERNAME` (bot username, @ siz) — brauzer uchun ham shart. O'zgargach qayta deploy qiling.
- `@BotFather` -> `/setdomain` -> botni tanlang -> ilovaning domeni (masalan `smartlingo.vercel.app`).
  Busiz Login Widget ochilmaydi. `localhost` da ishlamaydi.

## To'lovlar
Telegram Stars brauzerda Telegramning o'zida tasdiqlanadi: "Sotib olish" invoice havolasini ochadi, to'lov botga
tushgach coin brauzerda ham avtomatik qo'shiladi (taxminan 90 soniyagacha kutadi).

## Ko'rinish
Telefon: pastki menyu. Planshet/noutbuk (md+): yon menyu; lg+ da kontent kengroq. Orqaga tugmasi sahifa sarlavhasida.

## Test
`npx tsx tests/webauth.test.ts`

## Toza manzillar (`#/` yo'q)
Sahifalar endi `smartlingo.app/tutor`, `/journey/run` ko'rinishida. Eski `/#/notify` havolalari ham ishlaydi
(birinchi ochilishda toza manzilga o'tkaziladi). Telegramning o'z `#tgWebAppData=...` parametrlariga tegilmaydi.
- `vite.config.ts`: `base: '/'` (ilovani domen ildizida joylashtiring; GitHub Pages `/repo/` uchun `base: '/repo/'`).
- `vercel.json`: oxirgi qoida barcha `api/` bo'lmagan yo'llarni `index.html` ga yo'naltiradi (sahifani yangilash 404 bermaydi).
- Bot tugmasi endi `…/notify` ni ochadi.
