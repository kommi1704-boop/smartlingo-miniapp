# Online Duel fix report — 14 November 2026

Companion to `SmartLingo-Online-Duel-Audit-Report.docx` (delivered next to the ZIP).
This file summarises what changed and how to deploy; the docx has the full analysis.

## Root causes found (confirmed)

1. **Matchmaking deadlock (Critical)** — two players tapping "Raqib topish" within the same
   few seconds both saw an empty challenge list, both opened a challenge, and each then
   polled ONLY their own battle forever. They never met. `src/pages/Battle.tsx goSearching()`.
   **Fix:** the waiting poll now re-scans the open list every other tick (~6 s) and joins
   another searcher's challenge; `api/battle.ts join` also deletes the joiner's own stale
   open challenges.
2. **Search screen hangs forever (High)** — the poll only transitioned on `status=active`,
   so a battle that ended while searching (joiner forfeit / ghost abort) was never shown.
   **Fix:** finished battles are handled (aborted → lobby with a neutral message; real
   finish → result screen), plus a 5-minute search timeout.
3. **Ghost challenges (High)** — a challenger who opened a challenge and closed the app left
   a "ghost": the joiner sat in a dead battle (~2.5 min) and could farm full Elo by answering
   alone. `api/battle.ts sync` exempted never-seen opponents from the stale-forfeit forever.
   **Fix:** `live.startedAt` records activation; 75 s (GONE_MS) with an never-seen opponent
   aborts the battle (winner 0, deltas 0, `aborted` flag) — a real disconnect after appearing
   still forfeits normally after 40 s.
4. **Lost answers on flaky networks (High)** — a failed answer POST was never retried; the
   pick stayed locked and the round was lost despite a correct tap. `src/pages/Battle.tsx
   LiveDuel.choose()`. **Fix:** the answer is pending-ref'd and re-sent by the poll loop until
   the server records it or the round advances.
5. **Answers accepted before the question clock opened (Medium)** — `api/battle.ts answer`
   now also requires `Date.now() >= live.roundStart` (countdown/reveal-pause abuse closed).
6. **Battle-end notifications could outlive the Vercel function (Medium)** —
   `notifyBattleEnd` is now capped with an 8 s race budget (the sends continue draining).
7. **Dead module with non-existent imports (Medium)** — `src/lib/ratingSync.ts` deleted;
   it imported `fetchMyRating`/`applyServerRating` which do not exist and broke
   `npm run typecheck`. Rating is device-owned (1000 + server-computed deltas) by design.
8. **Stale test suites (Medium)** — `tests/rating.test.ts` (removed "server-owned rating"
   architecture; crashed) and `tests/quiz.test.ts` (imports the removed Friend Quiz API)
   moved to `tests/_not-run/` with explanatory headers. Every suite in `tests/` now runs.

## New tests

`tests/battle-e2e.test.ts` — 57 assertions driving the real `api/battle.ts` through the full
lifecycle: simultaneous-searcher matchmaking, same battle/questions, synchronized start,
first-correct-takes-the-point, exactly-once Elo, stale-round + countdown answer rejection,
disconnect forfeit, ghost abort, heartbeat reconnection, manual forfeit loss.
Run everything with:  `npx tsx tests/<name>.test.ts`

## Files changed

- `api/battle.ts` — ghost abort + startedAt, answer-timing guard, notify budget, join cleanup
- `src/pages/Battle.tsx` — cross-join poll, finished-battle handling, search timeout, answer retry
- `src/lib/battleApi.ts` — negative probe expires after 15 s; leaderboard fetch timeout
- `src/lib/ratingSync.ts` — deleted
- `tests/rating.test.ts`, `tests/quiz.test.ts` — moved to `tests/_not-run/`
- `tests/battle-e2e.test.ts` — new
- `package.json` / `package-lock.json` — added `tsx` as devDependency (runs the test suites)

## Database / configuration

**No migration required.** `live.startedAt` is a field inside the existing `live` jsonb
column (with a fallback for rows created before this deploy). `supabase/schema.sql` is
unchanged and idempotent — re-run it ONLY if the `battles` table does not exist yet
(check Supabase → Table Editor; the SQL editor screenshot suggested Run may not have been
pressed). Required Vercel env vars (confirmed present): `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `WEBAPP_URL`. Redeploy after any change.

## Deployment checklist

1. `npm install && npm run build` (both must succeed).
2. Deploy to Vercel; Root Directory must be the folder containing `api/` + `package.json`.
3. `GET https://<domain>/api/battle` (no auth) → must return `{"enabled":true}`.
4. Supabase Table Editor must list `battles` (else run `supabase/schema.sql`).
5. Two devices in Telegram tap "Raqib topish" a few seconds apart → both must land in the
   same duel, see identical questions, answer, finish, and see the rating change.
6. If anything fails: Vercel function logs filter `battle` (the code logs precise,
   PII-free codes like `supabase_404:PGRST205 (battle:list)`), plus the browser console.

## Known limitations (documented, intentionally unchanged)

- Clients receive the question set WITH the answer key (existing design); a modified client
  could auto-answer. Recommended future hardening: serve questions from the server-side bank
  (`server/quizBank.ts` already exists) and strip answers.
- Elo inputs at open/join are client-supplied (device-owned rating design); the leaderboard
  recomputes the same number from synced progress.
- Reloading the page mid-battle forfeits after 40 s (documented "leaving = loss" behaviour).
