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
| Vocabulary | 130 words, flashcards, quiz, matching, Leitner spaced repetition (1/2/4/8/16-day boxes). |
| Grammar | 14 lessons with exercises. |
| Reading | 10 passages with questions. |
| Listening | 5 activities. Audio is **device text-to-speech** (Web Speech API), not recorded human audio. A transcript is always available. |
| Speaking | Prompts + self-check list. **There is no pronunciation analysis.** |
| Writing | 8 prompts + a **rule-based** checker (common mistakes only; it does not understand meaning). |
| Tutor "Lingo" | **Demo mode** by default: keyword-based answers from the app's own word list and grammar lessons, clearly labelled "Demo". It is *not* AI. Live mode needs the server (section 6). |
| Resources | 35 entries; URLs were checked, and 2 entries intentionally have no link. |
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

Without any key the tutor runs in **Demo mode** and says so in the interface.

To enable live mode on Vercel add the environment variables:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | key from https://console.anthropic.com (this is **paid per use**) |
| `AI_MODEL` | optional, default `claude-haiku-5-5` |
| `TELEGRAM_BOT_TOKEN` | already set in step 4.3 — needed to verify that requests come from real Telegram users |

Redeploy. The app asks `/api/tutor` whether live mode exists and switches the label automatically.

Safety notes:
- The key lives only on the server. It is never in the frontend bundle.
- `/api/tutor` accepts requests only from real Telegram users (it validates Telegram `initData`
  with an HMAC check) and rate-limits them. The rate limit is in memory per server instance, so for a
  big audience add a shared store (e.g. Upstash Redis) and spending limits in your AI provider console.
- For local testing without Telegram you may set `ALLOW_UNAUTHENTICATED=true` — **never in production**.

---

## 7. Known limits

- **Data is stored on the device only.** Clearing the browser/Telegram cache, or using another phone, starts fresh.
  A Supabase path is prepared — see `supabase/README.md`.
- Listening audio is device TTS; voice quality depends on the phone.
- No pronunciation scoring, no speech recognition.
- Placement level is an estimate from 21 questions, not an official CEFR result.
- The demo tutor and writing checker are rule-based and miss many things.
- The in-app word list (130) and lessons are a starter set; extend them in `src/data/`.

## 8. Testing status (please read)

The package registry was blocked in the environment where this project was written, so
`npm install`, the real `vite build`, and `tsc` were **not run there**. Instead the code was bundled with
esbuild + Tailwind and exercised in a real headless Chromium: landing, onboarding, placement test,
all 19 screens, flashcards/quiz/matching, grammar quiz, tutor demo, writing feedback, dark mode, and
persistence after reload all passed (~35 checks, no runtime errors).
Because the real type-check has not run, `npm run typecheck` may report a few small type nits;
`npm run build` does not depend on it. If `npm install` or the build shows an error, send it to me and I'll fix it.

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
