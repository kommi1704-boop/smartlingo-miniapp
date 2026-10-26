# Online progress (Supabase)

Optional. Without it the app keeps working and stores progress in the phone's browser only.

## Setup (about 10 minutes, free plan is enough)
1. https://supabase.com → New project (any name, pick a region close to you, set a database password and keep it).
2. Left menu **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, press **Run**.
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key.
4. Vercel → your project → **Settings → Environment Variables** add (Production):
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key
   (`TELEGRAM_BOT_TOKEN` must already be there.) Then **Deployments → Redeploy**.
5. Open the app inside Telegram → Settings → "Onlayn saqlash" should say "Saqlandi ✓".

The service_role key is a master key: only in Vercel Environment Variables. Never GitHub, never chat, never `VITE_`-prefixed.

## How it works
- `api/progress.ts`: `GET` (restore), `PUT` (save), `DELETE` (remove). The learner id comes ONLY from verified Telegram initData.
- `src/lib/sync.ts`: on start, a new device takes the online copy; otherwise the copy with more XP wins. Changes are saved ~4 s after the last change and when the app is hidden.
- Not uploaded: chat history with Lingo and writing texts (they stay on the device).
- Uploaded: XP, streak, words, badges, game results, settings, profile name/age group, linked to the Telegram user id.
- Deletion: Settings → switch off "Onlayn saqlash" or "Barcha ma’lumotni o‘chirish" removes the server copy.
- Limits: a state over 300 KB is refused; 40 saves per minute per user.
