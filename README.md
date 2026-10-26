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

The package registry was blocked in the environment where this project was written, so
`npm install` and the real `vite build` were **not run there** (they were later run on the owner's machine for the first version; the latest additions have not been through that yet). Only the data files were type-checked with `tsc --strict`. Instead the code was bundled with
esbuild + Tailwind and exercised in a real headless Chromium: landing, onboarding, placement test,
all 19 screens, flashcards/quiz/matching, grammar quiz, tutor demo, writing feedback, dark mode,
persistence after reload, the highlighter, voice picker, mascot and sounds all passed (35 + 30 checks, no runtime errors).
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
