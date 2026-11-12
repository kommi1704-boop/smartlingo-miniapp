# SmartLingo — Playground redesign + duel-only build

## What changed
- Quiz fully removed (client pages, /api/quiz, bot deep links). DB tables untouched, so nothing is lost; to bring quiz back, use the older zip.
- Duels: battle.ts / notify fixes from the earlier review ported in (race guard, idempotent notifications, `why` diagnostics).
- Visual: sky hero Home, gradient skill tiles (Vocab green, Grammar blue, Reading purple, Listening yellow, Speaking coral, Writing sky), purple AI Tutor card, new chat bubbles, reusable classes in src/index.css (`.sky-hero .tile-* .play-card .wash-* .bubble-*`).
- No schema changes, no data/logic changes.

## Duel "server not connected" checklist (Vercel)
1. Vercel Root Directory must be the folder that contains `api/` and `package.json` (the zip has an extra top-level folder).
2. Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, WEBAPP_URL. Redeploy after changing them.
3. Run supabase/schema.sql in Supabase SQL editor.
4. Open https://<domain>/api/battle  -> {"enabled":true}
5. Open https://<domain>/api/admin-notify?k=diag for the self-test.
Run `npm install && npm run build` before deploying.
