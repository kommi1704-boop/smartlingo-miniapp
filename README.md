# SmartLingo AI — Telegram Mini App

An English-learning Telegram Mini App for Uzbek-speaking learners aged 8–17.
The interface is in Uzbek (Latin script); English appears only inside the exercises.

**Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS v4. No backend is needed to run it.
Progress is stored on the user's device (localStorage). Two optional serverless functions
(`api/tutor.ts`, `api/bot.ts`) add the bot's /start button and a live AI tutor.

---

## 1. What is inside (and what is honest about it)

| Feature | How it really works |
|---|---|
| Placement test (Pre-A1 → C2) | 21 questions, 3 per level, adaptive stop. Result is labelled **"estimate, not an official CEFR certificate"**. |
| Roadmap + daily plan | Generated from level, goal, and minutes/day. Plan updates from what you finished today. |
| Vocabulary | 380 words (A1–B2; topics incl. technology, economics, arts, science, nature, travel, sport), flashcards, quiz, matching, Leitner spaced repetition (1/2/4/8/16-day boxes). |
| Grammar | 34 lessons with exercises. |
| Reading | 20 passages with questions. Select text to **highlight** it with a marker (4 colours, saved on the device); "Matnni tinglash" reads along line by line. |
| Listening | 5 activities. Audio is **device text-to-speech** (Web Speech API), not recorded human audio. Pick a voice and speed (default is slower), optionally switch on the free **natural voice** (Settings → Ovoz), two different voices read the two speakers when the device has them, and the transcript is highlightable. |
| Speaking | 30 prompts + self-check list. **There is no pronunciation analysis.** |
| Writing | 20 prompts + a **rule-based** checker (common mistakes only; it does not understand meaning). |
| Tutor "Lingo" | **Demo mode** by default: keyword-based answers from the app's own word list and grammar lessons, clearly labelled "Demo". It is *not* AI. Live mode needs the server (section 6). |
| Resources | 51 entries (British Council, Cambridge English, VOA, TED-Ed, NASA Space Place, National Geographic Kids, …). Every new link was opened while writing the list and the description only says what the page said; 2 older entries intentionally have no link. Sites can change, so check before relying on one. |
| Look & feel | "Lingo" the mascot (original SVG, moods), confetti and XP pop-ups, optional sound effects (Settings → Sound). Light mode: pastel sky with a soft sun and English-class doodles; dark mode: the same doodles glowing under a starry sky. All pure CSS/SVG in `src/index.css` ("Page backdrop"), no image files. |
| Games | 5 vocabulary games built from the app's own word list and matched to the student's level: memory cards, word runner, letter scramble, 60-second word blitz, listen & pick (device voice). Stars (0–3) and personal bests, a daily challenge (same words all day, +15 XP once), game badges, and missed words can be sent to spaced repetition. Game XP is capped at 60/day so games add to lessons instead of replacing them. Code: `src/pages/Games.tsx`, `src/components/games/`, `src/lib/games.ts`. |
| Coin shop | A second currency (**Coins 🪙**) earned from games (capped 30/day), **3 rotating daily quests**, first lesson completions, level-ups and weekly streak bonuses. The **Do'kon** (`/shop`) sells 7-day **avatar frames** (ODDIY: bronze/silver/neon ×2, PREMIUM: gold/microcircuit/frost/fire — all renewable), premium emoji avatars, profile **titles**, and gifts: a **mystery chest** (random coins/XP/streak-freeze with an opening animation), **2× XP booster** (24 h) and a **streak freeze** that automatically protects the daily streak for one missed day. Code: `src/pages/Shop.tsx`, `src/lib/shop.ts`. |
| Profile & rating | The **Profil** page (`/profile`) shows the framed avatar, equipped title, and a Codeforces-style **rating ladder**: rating = 1000 + XP÷3 + game stars + badge bonus + battle Elo (never below 900). Eight tiers — Specialist 1600 → Legendary Grandmaster 3000 — each unlock a permanent rating frame when the rating reaches it (locked ones show "Yopiq" and how many rating points are left). Owned frames/avatars can be switched any time. Code: `src/pages/Profile.tsx`, `ratingOf()` in `src/lib/gamification.ts`. |
| Friendly battle | The **Do'stona jang** page (`/battle`): 7-question quiz duels. **Raqib topish** — real matchmaking through `/api/battle` (Vercel + Supabase `battles` table): the challenger's client generates questions at/below their level, both players answer the same questions, the server compares scores and applies **Elo (K=32)** — win raises the rating, loss lowers it. If no opponent is found, or offline, play **Lingo AI**: the bot's per-question accuracy mirrors the learner's own recent quiz accuracy (so it is neither stronger nor weaker), with animated "thinking" reveals and a live per-question scoreboard. Only the first 5 AI battles per day change the rating (the rest are practice); rated battles also pay Coins (win 8 / draw 4 / loss 2). Battle history, W/L/D counters and the Elo delta live in the saved state (`battle`). Code: `src/pages/Battle.tsx`, `src/lib/battle.ts`, `src/lib/battleApi.ts`, `api/battle.ts`. |
| Leaderboard | The **Reyting** page (`/leaderboard`): top 100 learners by rating, built server-side from the synced progress rows (`/api/leaderboard`, first names and battle W/L only — nothing else leaves the server). Medals for the top 3, equipped frames and rank names shown, your own row highlighted with your position. Without the online server it still shows your own rating card and explains how to enable sync (Settings → Onlayn saqlash). Code: `src/pages/Leaderboard.tsx`, `api/leaderboard.ts`. |
| Progress | XP, streak, badges, mistake notebook, charts. |
| Dark mode | Settings → follows Telegram theme or manual. |

---

## 2. Run it on your computer

Requirements: **Node.js 20.19 or newer** (https://nodejs.org).

```bash
npm install
npm run dev        # opens http://localhost:5173
```

In a normal browser the app works fully (Telegram-specific things such as haptics are just skipped).

```bash
npm run build      # creates the dist/ folder (the finished site)
npm run preview    # test the built site locally
npm run typecheck  # optional: TypeScript check
```

---

## 3. Put it online (HTTPS is required by Telegram)

The app is a static site. The router is hash-based and `base` is `./`, so it works on any static host.

### Option A — Vercel (recommended: also gives you the optional API)
1. Push this folder to a GitHub repository.
2. On https://vercel.com → **Add New → Project** → import the repo. Settings are already in `vercel.json`.
3. Click **Deploy**. You get a URL like `https://smartlingo-xxxx.vercel.app`.

### Option B — Netlify / Cloudflare Pages / GitHub Pages
Build command `npm run build`, publish folder `dist`. (The `api/` functions only run on Vercel as written; without them the app runs in demo-tutor mode, which is fine.)

---

## 4. Connect it to Telegram

### 4.1 Create the bot
1. In Telegram open **@BotFather** → `/newbot` → choose a name and a username ending in `bot`.
2. Copy the **token** it gives you. Keep it secret.

### 4.2 Make the Mini App open (pick one)

**Easiest — menu button (no code):**
BotFather → `/mybots` → your bot → **Bot Settings → Menu Button → Configure menu button** →
send your deployed URL (`https://…vercel.app`) and a title such as `O‘rganish`.

**Or a direct link:** BotFather → `/newapp` → select the bot → fill in title/description/photo →
send the URL → choose a short name. You get `https://t.me/<bot>/<shortname>` to share.

### 4.3 (Optional) /start button via the included webhook — Vercel only
In Vercel → Project → **Settings → Environment Variables** add:

| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | token from BotFather |
| `WEBAPP_URL` | your deployed `https://…` URL |
| `WEBHOOK_SECRET` | any long random string you invent |

Redeploy, then run once on your computer:

```bash
TELEGRAM_BOT_TOKEN=123:ABC WEBAPP_URL=https://your-app.vercel.app WEBHOOK_SECRET=your-secret npm run setup-bot
```

This sets the webhook, menu button, and the `/start` + `/help` commands. Now `/start` replies with an
"open the app" button.

Optional: set `VITE_BOT_USERNAME` (without `@`) at build time so the "share with friends" button knows your bot.

---

## 5. Test inside Telegram while developing

Telegram needs HTTPS, so expose your local server with a tunnel:

```bash
npm run dev -- --host
# in another terminal, e.g.:
npx cloudflared tunnel --url http://localhost:5173
```

Put the printed `https://….trycloudflare.com` address into BotFather's menu-button URL while testing.

---

## 6. (Optional) Live AI tutor

Without any key the tutor runs in **Demo mode** and says so in the interface. Pick ONE provider (Groq is the easiest to set up):

**Option A — Google Gemini (has a free tier)**

1. Create a free key in Google AI Studio (https://aistudio.google.com) → "Get API key".
2. In Vercel → Settings → Environment Variables add:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | your Google AI Studio key |
| `TELEGRAM_BOT_TOKEN` | already set in step 4.3 — needed to verify that requests come from real Telegram users |
| `GEMINI_MODEL` | optional, default `gemini-3.5-flash-lite` |

3. Redeploy.

Read this before using the free tier: according to Google's pricing page, on the **free tier your prompts and answers may be used to improve Google products**, and limits per minute/day depend on your project (see https://aistudio.google.com/rate-limit). The app tells children not to write personal data, but for a children's product you should decide whether that is acceptable. Paid Gemini and Claude do not use the data that way by default, but check each provider's current terms.

**Option B — Groq (free plan, simpler sign-up, no Google Cloud project)**

1. Create an account at https://console.groq.com and make a key at https://console.groq.com/keys.
2. In Vercel add `GROQ_API_KEY` (and `TELEGRAM_BOT_TOKEN` as above), then Redeploy.
3. Default model is `openai/gpt-oss-20b` (a reasoning model, so the server asks for low reasoning effort). Model availability depends on your Groq account: list yours with `GET https://api.groq.com/openai/v1/models` and set `GROQ_MODEL` if needed (for example `openai/gpt-oss-120b`). Limits: see https://console.groq.com/settings/limits.
4. Small open models write weaker Uzbek than the big commercial ones; if the Uzbek explanations look poor, try another model or provider. Check Groq's current data-use terms before putting children's messages through it.

**Option C — Claude (paid per use)**

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | key from https://console.anthropic.com |
| `AI_MODEL` | optional, default `claude-haiku-5-5` |
| `TELEGRAM_BOT_TOKEN` | as above |

If several keys exist the order is Gemini, then Groq, then Claude; set `AI_PROVIDER=gemini|groq|anthropic` to force one.

Redeploy. The app asks `/api/tutor` whether live mode exists and switches the label automatically. If the AI service is busy or returns an error, the tutor falls back to a demo answer for that message.

Safety notes:
- The key lives only on the server. It is never in the frontend bundle.
- `/api/tutor` accepts requests only from real Telegram users (it validates Telegram `initData`
  with an HMAC check) and rate-limits them. The rate limit is in memory per server instance, so for a
  big audience add a shared store (e.g. Upstash Redis) and spending limits in your AI provider console.
- For local testing without Telegram you may set `ALLOW_UNAUTHENTICATED=true` — **never in production**.

---

### Online progress (optional)
Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel (see `supabase/README.md`). Inside Telegram, progress then follows the learner to a new phone. Chats and writing texts are never uploaded. Learners can switch it off or delete everything in Settings.

---

## 6b. Telegram Stars billing — buy Coins (optional)

A "Tanga do‘koni" screen lets learners buy Coin packs with **Telegram Stars (XTR)**:

| Package | Coins | Price | Limit |
|---|---|---|---|
| Tiny Pack | 10 | 1 Star | **max 3 per user** (enforced on the server) |
| Starter Pack | 100 | 15 Stars | — |
| Popular Pack | 350 | 45 Stars | — |
| Pro Pack | 850 | 99 Stars | — |
| Mega Pack | 2,000 | 199 Stars | — |
| Ultimate Pack | 5,000 | 399 Stars | — |

How it works (no mock confirmations — real Telegram invoices):
1. The client asks `POST /api/payments {action:'open'}`, which checks the Tiny Pack budget, stores a
   `pending` row and returns a **real invoice link** from `createInvoiceLink` (currency `XTR`).
2. The app opens it with `WebApp.openInvoice()`. The bot webhook (`/api/bot`) validates the
   `pre_checkout_query` (owner, amount, budget) and answers within Telegram's 10 s window.
3. On `successful_payment` the webhook credits **exactly once** through the atomic
   `claim_payment()` RPC (a unique index on the charge id blocks duplicate webhook deliveries).
   If a Tiny Pack purchase somehow exceeds the 3× budget, the Stars are **refunded automatically**.
4. The app pulls the payments ledger, adds the coins to the **existing** wallet and acknowledges
   (`ack`). A purchase also lands after a reinstall or on a new phone.
5. Payment history (successful / pending / failed / refunded) is shown in the store screen.

Setup (one-time):
1. In Supabase → SQL Editor re-run the **full `supabase/schema.sql`** — it adds the `payments` and
   `identities` tables plus the `claim_payment` / `ack_payments` functions (idempotent, existing data untouched).
2. Re-run the setup script **after deploying**: `… npm run setup-bot` — it now also subscribes the
   webhook to `pre_checkout_query` (mandatory for Stars payments).
3. No new environment variables: the billing reuses `TELEGRAM_BOT_TOKEN`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`.
4. Stars are real money. Test with the 1-Star Tiny Pack first.

---

## 6c. Public student profiles (optional)

Every learner who syncs online gets a **public profile** at `#/u/<telegram id>`:

- Opens when tapping a row in the **leaderboards** (rating / weekly XP / monthly XP), or an
  opponent's name during a friendly battle and on the battle result screen. Your own row opens
  your editable profile.
- Shows equipped cosmetics exactly as equipped in the owner's profile (avatar emoji, frame,
  name color / effect, title, background style), plus CEFR level, XP level, global / weekly /
  monthly rank, streak, learned words, completed lessons, badges and owned collectibles.
- **Privacy:** the server (`/api/profile?uid=…`) projects a sanitized view. Age, goal, uploaded
  photo, interests, placement details, chats, essays, mistakes and per-day activity **never leave
  the server**. Only the first name, the public Telegram @username (stored in the new
  `identities` table) and learning aggregates are exposed. There is no email/phone in the system.
- Weekly and monthly boards rank by XP earned in the last 7 / 30 UTC days.
- Requires the same setup as online progress: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`,
  and the `identities` table from the current `supabase/schema.sql`.

---

## 6d. Viral growth — referrals, share cards, streak reminders (optional)

Three growth features built on the same ledger patterns as billing (idempotent, no mock
confirmations, the existing wallet is reused).

**1. Referrals ("Do'stlarni taklif qiling" — Profile page)**
- Every learner gets a personal invite link `https://t.me/<bot>?start=ref<id>` (the bot
  username is read from Telegram's `getMe` and served by `/api/payments`).
- A **brand-new** learner opening the link is recorded once (`referrals` table, primary key
  on the invited user) and receives **+50 Coin immediately**; the referrer gets **+50 Coin**
  when the invited learner does their first exercise (first progress sync flips the referral
  via the atomic `reward_referral()` RPC). Both rewards reach the wallet through the same
  exactly-once `coin_grants` ledger used by Stars purchases. Self-invites and existing
  learners are rejected by the bot webhook.

**2. Share cards (Profile page)**
- "Ulashish" opens Telegram's native share dialog with an invite text; "Natijamni ulashish"
  shares a streak / XP / level card — and every shared card carries the referral link, so
  each share is a potential invite.

**3. Daily streak reminder (Telegram push)**
- A Vercel cron (`api/reminders.ts`, scheduled daily at 13:00 UTC = 18:00 Tashkent) messages
  learners who studied yesterday but not today ("🔥 Seriyangiz xavf ostida!") with a button
  that opens the Mini App. Max **one message per user per day**; learners holding a streak
  freeze are skipped. The input comes from the tiny `presence` table, refreshed on every
  progress sync.
- Cron auth: Vercel sends `x-vercel-cron: 1`. Optionally set `CRON_SECRET` in Vercel and you
  can also call `https://<app>/api/reminders` with `Authorization: Bearer <secret>` manually.
  Everything else is rejected (401).

Setup (one-time, on top of the billing setup):
1. Re-run the **full `supabase/schema.sql`** — it adds the `referrals`, `coin_grants` and
   `presence` tables plus the `reward_referral` function (idempotent, existing data untouched).
2. Redeploy — Vercel registers the cron from `vercel.json` automatically (Hobby plan supports
   daily crons; no extra env vars required, `CRON_SECRET` is optional).
3. The referral reward is 50 Coin (`REFERRAL_COINS`) — change it in `api/bot.ts`,
   `api/progress.ts` and `src/lib/referrals.ts` together (tests cross-check all three).


## 7. Known limits

- **Data is stored on the device only.** Clearing the browser/Telegram cache, or using another phone, starts fresh.
  A Supabase path is prepared — see `supabase/README.md`.
- Listening audio is device TTS; voice quality depends on the phone. The app ranks voices and lets the learner choose one (Settings → Ovoz), but it cannot make a weak device voice sound human; installing an "Enhanced / Natural" English voice on the phone is the real fix.
- **Natural voice (optional, beta):** uses the open-source Kokoro model (Apache-2.0), downloaded once (about 90 MB) from a CDN and run on the device with WebAssembly. It is English-only, may be slow on old phones, and falls back to the device voice on any error. It was tested here with a stand-in for the model (the real download is blocked in the build sandbox), so the first real run is on your phone. The code that loads it is in `src/lib/neural.ts`; if the CDN addresses there ever stop working, change `SOURCES`.
- No pronunciation scoring, no speech recognition.
- Placement level is an estimate from 21 questions, not an official CEFR result.
- The demo tutor and writing checker are rule-based and miss many things.
- The in-app word list (380) and lessons are a starter set; extend them in `src/data/`. Most of the added vocabulary, passages, prompts and grammar lessons were written for this app (not copied from the sites in Resources). Uzbek translations and IPA were not reviewed by a human, so please have a teacher skim them.

## 8. Testing status (please read)

The earlier parts of this note referred to the first release (written where the package registry
was blocked). Since then the project is verified in a normal environment on every delivery:

- `npm run typecheck` (tsc --strict) — clean.
- `npm run build` (vite) — succeeds.
- Unit suites (run with `npx tsx tests/<file>.ts`): `phase2.test.ts` (58), `ai-handlers.test.ts` (32),
  `billing-profile.test.ts` (70 — catalog parity, Tiny Pack budget, payload format, rating clamps,
  XP windows, streaks, public-profile projection + privacy leak checks), `handlers-smoke.test.ts` (9).
- The new screens (Tanga do‘koni incl. confirm/cancel/paid modals + credit application,
  leaderboards incl. weekly/monthly tabs, public profile incl. cosmetics and ranks) were
  exercised end-to-end in a real headless Chromium on desktop and mobile viewports with mocked
  APIs and a stubbed Telegram SDK — no console errors.
- The live Stars flow itself (real invoice, webhook, refund) can only be proven against a real
  bot + Supabase + a real 1-Star purchase; the server logic is covered by unit tests as far as
  possible without those secrets.

## 9. Where to change things

| What | File |
|---|---|
| Words / grammar / reading / listening / placement / speaking / writing | `src/data/*.ts` |
| Resource links | `src/data/resources.ts` |
| Colours & dark theme | `src/index.css` |
| Level logic, spaced repetition, plan, roadmap | `src/lib/` |
| Saving data (swap to Supabase here) | `src/lib/repository.ts` |
| Screens | `src/pages/` |
| Server functions | `api/` |
