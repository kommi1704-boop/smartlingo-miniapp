# Supabase (optional, later)

Not needed to run the app. Today everything lives in `localStorage` (`src/lib/repository.ts`).
Use this only when you want progress to follow a learner to another phone.

## Plan
1. Create a Supabase project and run `schema.sql` in the SQL Editor.
2. Add two server-only env vars on Vercel: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   (never `VITE_`-prefixed — the service-role key must not reach the browser).
3. Add `api/progress.ts` (not included yet):
   - `GET`  → validate the `x-telegram-init-data` header with `validateInitData` (exported from `api/tutor.ts`),
     then `select state from progress where telegram_user_id = <verified id>`.
   - `POST` → same validation, then upsert `{ telegram_user_id, state }`.
   Never trust a user id sent in the body; only use the id from the verified initData.
4. Add a `RemoteRepository` that implements `ProgressRepository` (`src/lib/repository.ts`),
   keeping localStorage as the offline cache, and pass it to the store in `src/store/store.ts`.
   Because `loadSync()` is synchronous, do the first fetch at startup and merge
   (e.g. keep whichever copy has more XP / later activity).

## Privacy
Learners are minors. Store only what the app already holds (name/nickname, age group, progress),
tell users what is stored, and provide a way to delete it (Settings → reset, plus a delete endpoint for the server copy).
