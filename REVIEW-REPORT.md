# Review & log-fix report — 22 November 2026

Method: all 17 test suites run, TypeScript checked, and the **real app bundled and driven in headless Chromium**
(every route + random-click "monkey" runs, online / offline / unconfigured-server modes) while capturing every
console warning, error and page crash.

## Logs / errors found and fixed

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | `src/pages/Notify.tsx` ← `lib/notifyApi.ts` | **Crash**: outside Telegram the server answers a bare `{enabled}`; the screen read `.streak` of `undefined`. With no error boundary the **whole app went blank** (every later route empty). | `fetchNotifySettings` validates the response → clean "not configured" state. |
| 2 | `src/pages/Leaderboard.tsx` ← `lib/battleApi.ts` | **Crash** (`reading 'find'`) when switching Weekly/Monthly on the same probe response. | `fetchLeaderboard` validates the shape, defaults missing boards to `[]`. |
| 3 | `components/journey/stages.tsx` (Discover stage) | React console error: **`<button>` nested inside `<button>`** (fact card + audio button). | Opened card is a `<div>`, only the closed card is a `<button>`. |
| 4 | `src/lib/xpApi.ts` | Offline / timeout threw a raw `TypeError` — never recognised as `XpUnavailable`, so the offline fallbacks were skipped and `console.warn('… failed', e)` fired (visible in `journey.test.ts` as `ERR_INVALID_URL`). Outside Telegram every XP call also sent a request that could only 401/503. | One `request()` helper: network/timeout/no-initData → `XpUnavailable`; no doomed request. |
| 5 | `src/lib/ratingSync.ts` | Imported non-existent exports → **`npm run typecheck` failed** (the earlier fix report says it was deleted; it came back in this ZIP). | Deleted. |
| 6 | `tests/rating.test.ts`, `tests/quiz.test.ts` | Stale suites back in `tests/` → `npm test` crashed. (Header-annotated copies already exist in `tests/_not-run/`.) | Removed from `tests/`. |

## Added
- `components/ErrorBoundary.tsx` — one broken screen can no longer blank the app; friendly Uzbek message, "Qayta urinish" / "Bosh sahifa", keyed by route.
- `tests/api-client.test.ts` — 13 regression tests for items 1, 2 and 4.

## Cleanup / polish
- Removed dead code never reachable from the app: `QuizDetail/QuizFriends/QuizPlay` pages, `QuizResultCard`, `lib/quizApi.ts`, `src/pages/index.css` (703 unused lines).
- Progress: the three top tiles truncated their labels ("Ser…", "Da…") → stacked layout; all `StatTile` labels now wrap to 2 lines instead of truncating.
- README: Friend Quiz section marked removed, word count corrected (1,080).

## Result
- 18/18 test suites pass, no noisy output. Crawl of 50+ routes and monkey runs: **no console warnings/errors, no crashes**.
- The only remaining console line is Chrome's own `net::ERR_INTERNET_DISCONNECTED`, which appears only when the device is truly offline and cannot be suppressed from JS.

## Not verified here
`npm install` / `vite build` could not run in this sandbox (no network), so I bundled with esbuild and compiled Tailwind with the
installed v4 core instead; the 3D Universe (three.js) page was not rendered. Run `npm install && npm run build && npm test` once before deploying.

## Ideas for later
- Offline banner ("Internet yo'q — natijalar telefonda saqlanadi") using `navigator.onLine`.
- Serve battle questions without the answer key (already noted in DUEL-FIX-REPORT).
- `src/data/vocab-basic.ts` and `contentReview.ts` are not imported anywhere — keep or remove.
