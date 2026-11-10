-- OPTIONAL. The app works without this (progress is stored on the device).
-- Run in Supabase -> SQL Editor if you later want progress to follow the user across devices.
-- The table is keyed by the Telegram user id, which your SERVER must verify (initData HMAC).
-- Row Level Security is on with no policies: browsers can NOT read/write it directly;
-- only your server function using the service-role key can.

create table if not exists public.progress (
  telegram_user_id bigint primary key,
  state            jsonb       not null,           -- the PersistedState object from src/types.ts
  updated_at       timestamptz not null default now()
);

alter table public.progress enable row level security;

create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

-- Friendly battles ("Do'stona jang"): open challenges + active duels + finished results.
-- Same security model as progress: RLS on, no policies — only the server function
-- (service-role key, initData verified) may read or write these rows.
create table if not exists public.battles (
  id          text primary key,
  p1          bigint      not null,                -- challenger (telegram user id)
  p2          bigint,                              -- joiner
  p1_name     text        not null default '',     -- first names only
  p2_name     text,
  p1_rating   int         not null default 1000,   -- rating at battle start (for Elo)
  p2_rating   int,
  p1_avatar   text,
  p2_avatar   text,
  p1_score    int,
  p2_score    int,
  p1_done     boolean     not null default false,
  p2_done     boolean     not null default false,
  status      text        not null default 'open', -- open | active | finished
  questions   jsonb       not null,                -- the shared Quiz[] (same for both players)
  winner      bigint,                              -- user id, or 0 for a draw
  p1_delta    int,                                 -- Elo applied when finished
  p2_delta    int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.battles enable row level security;

-- Live-duel state (real-time rounds): current round, round start (server clock),
-- both players' answers, running scores and heartbeats. Added after the first
-- release — safe to re-run: "add column if not exists" keeps existing rows.
-- seen1/seen2 (heartbeats) are separate columns so a heartbeat write can never
-- clobber a concurrent `live` answer write.
alter table public.battles add column if not exists live jsonb;
alter table public.battles add column if not exists seen1 bigint;
alter table public.battles add column if not exists seen2 bigint;

drop trigger if exists battles_touch on public.battles;
create trigger battles_touch before update on public.battles
  for each row execute function public.touch_updated_at();

-- AI feature quotas (writing check, mistake explanation, generated reading texts).
-- The table stores ONLY an anonymous per-user-per-day counter: no texts, no names, no content.
-- Security model identical to progress/battles: RLS on, NO policies — anon/authenticated users
-- cannot touch it; the Vercel server functions use the service-role key (bypasses RLS).
create table if not exists public.ai_usage (
  telegram_user_id bigint      not null,
  day              date         not null,             -- UTC date the counter belongs to
  kind             text         not null,             -- 'writing-check' | 'explain-mistake' | 'generate-text'
  count            int          not null default 0,
  updated_at       timestamptz  not null default now(),
  primary key (telegram_user_id, day, kind)
);

alter table public.ai_usage enable row level security;

drop trigger if exists ai_usage_touch on public.ai_usage;
create trigger ai_usage_touch before update on public.ai_usage
  for each row execute function public.touch_updated_at();

-- Atomic increment used by the api/*.ts endpoints. SECURITY DEFINER + empty search_path so it
-- runs as the table owner; the service-role key calls it through PostgREST RPC.
-- The same function is NOT callable through the anon key for INSERTs? It is callable, but it
-- only returns a count and writes to ai_usage — the client's anon key cannot read ai_usage
-- (RLS), so the count it receives leaks nothing sensitive. For defence in depth we revoke
-- EXECUTE from anon/authenticated below, leaving the service role unaffected.
create or replace function public.bump_ai_usage(p_uid bigint, p_day date, p_kind text)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v int;
begin
  insert into public.ai_usage (telegram_user_id, day, kind, count)
  values (p_uid, p_day, p_kind, 1)
  on conflict (telegram_user_id, day, kind)
  do update set count = public.ai_usage.count + 1, updated_at = now();
  select count into v from public.ai_usage
    where telegram_user_id = p_uid and day = p_day and kind = p_kind;
  return v;
end;
$$;

revoke execute on function public.bump_ai_usage(bigint, date, text) from anon, authenticated;

-- ============================================================================
-- Telegram Stars payments (Coin Store). Idempotent: safe to re-run.
-- SECURITY MODEL IDENTICAL TO progress/battles: RLS on, NO policies — browsers
-- cannot read or write these rows; only the Vercel server functions (service-role
-- key) may. The client NEVER touches this table directly.
-- ----------------------------------------------------------------------------
-- One row per created invoice: 'pending' -> 'succeeded' | 'failed' | 'refunded'.
-- Coins are NOT written into progress.state here (the device owns that copy);
-- instead succeeded+unacked rows form a durable ledger that the client applies
-- via ack (see src/lib/billing.ts). This avoids the client overwriting a
-- server-side balance change with its own stale copy on the next sync push.
create table if not exists public.payments (
  id                          text primary key,      -- "pay_<uid>_<rand>", embedded in the invoice payload
  telegram_user_id            bigint      not null,
  package_id                  text        not null,  -- 'tiny' | 'starter' | 'popular' | 'pro' | 'mega' | 'ultimate'
  coins                       int         not null,
  stars                       int         not null,
  currency                    text        not null default 'XTR',
  status                      text        not null default 'pending', -- pending|succeeded|failed|refunded
  invoice_payload             text,
  telegram_payment_charge_id  text,                  -- unique — Telegram's idempotency key
  acked                       boolean     not null default false, -- client applied the credit to its balance
  acked_at                    timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Duplicate-payment guard at the database level: a charge id can exist only once.
create unique index if not exists payments_charge_id_uq
  on public.payments (telegram_payment_charge_id)
  where telegram_payment_charge_id is not null;

create index if not exists payments_user_created_idx
  on public.payments (telegram_user_id, created_at desc);

drop trigger if exists payments_touch on public.payments;
create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();

-- Atomic credit claim. The webhook calls this on successful_payment:
--   returns coins (>0)  -> this call won the race, the payment IS credited (row now 'succeeded')
--   returns 0           -> missing row / other user / already processed (duplicate delivery)
-- Counts as the single source of truth for "credit exactly once".
create or replace function public.claim_payment(p_id text, p_uid bigint, p_charge_id text)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coins int;
begin
  update public.payments
     set status = 'succeeded',
         telegram_payment_charge_id = p_charge_id,
         updated_at = now()
   where id = p_id
     and telegram_user_id = p_uid
     and status = 'pending'
   returning coins into v_coins;
  return coalesce(v_coins, 0);
end;
$$;

revoke execute on function public.claim_payment(text, bigint, text) from anon, authenticated;

-- Client acknowledgement: "I have added these coins to my balance". Only the
-- owner can ack, only succeeded rows. Idempotent.
create or replace function public.ack_payments(p_ids text[], p_uid bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.payments
     set acked = true, acked_at = now(), updated_at = now()
   where id = any(p_ids)
     and telegram_user_id = p_uid
     and status = 'succeeded'
     and acked = false;
end;
$$;

revoke execute on function public.ack_payments(text[], bigint) from anon, authenticated;

-- ============================================================================
-- Referrals ("Do'st taklifi"). Idempotent: safe to re-run.
-- One row per invited learner, keyed by the INVITED user (a person can be
-- referred only once — the primary key enforces that at the database level).
-- Life cycle: bot webhook inserts status='pending' when a NEW learner opens the
-- bot via t.me/<bot>?start=ref<referrer>; /api/progress flips it to 'rewarded'
-- (and pays the referrer through coin_grants) the first time the invited
-- learner actually syncs progress from the Mini App. No browser ever touches
-- these rows: RLS on, no policies — only the server functions (service-role key).
create table if not exists public.referrals (
  referred_id   bigint      primary key,            -- invited learner (telegram id)
  referrer_id   bigint      not null,               -- who shared the link
  status        text        not null default 'pending', -- pending | rewarded
  created_at    timestamptz not null default now(),
  rewarded_at   timestamptz
);

alter table public.referrals enable row level security;

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_id, created_at desc);

drop trigger if exists referrals_touch on public.referrals;
create trigger referrals_touch before update on public.referrals
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Coin grants — server-side coin GIFTS (referral rewards today, campaigns later).
-- Mirrors the payments ledger pattern: the server records the gift, the client
-- applies it to its existing wallet (addCoins) exactly once and acknowledges.
-- Reward ids are DETERMINISTIC ("gr_ref<referred>_invite" / "gr_ref<referred>_bonus")
-- so re-running the same reward (webhook retry, duplicate sync) can never
-- double-credit: the primary key makes the second insert a no-op.
create table if not exists public.coin_grants (
  id               text        primary key,  -- deterministic idempotency key
  telegram_user_id bigint      not null,
  coins            int         not null,
  source           text        not null,     -- 'referral_invite' | 'referral_bonus'
  acked            boolean     not null default false,
  acked_at         timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.coin_grants enable row level security;

create index if not exists coin_grants_user_idx
  on public.coin_grants (telegram_user_id, created_at desc);

-- ============================================================================
-- Presence — tiny daily snapshot for the streak-reminder cron (api/reminders.ts).
-- Written ONLY by /api/progress (server-parsed from the verified state):
--   last_active = the last day (Asia/Tashkent date) the learner earned anything
--   freezes     = streak freezes held at the last sync (protected users are not nagged)
--   reminded_on = the last day the cron sent this user a reminder (1/day max)
create table if not exists public.presence (
  telegram_user_id bigint      primary key,
  last_active      date,
  freezes          int         not null default 0,
  reminded_on      date,
  updated_at       timestamptz not null default now()
);

alter table public.presence enable row level security;

create index if not exists presence_last_active_idx
  on public.presence (last_active) where last_active is not null;

drop trigger if exists presence_touch on public.presence;
create trigger presence_touch before update on public.presence
  for each row execute function public.touch_updated_at();

-- Atomic referral reward. /api/progress calls it when the invited learner first
-- syncs: flips pending -> rewarded and grants the referrer's coins. Returns the
-- coins granted (0 when there was nothing pending). Idempotent.
create or replace function public.reward_referral(p_referred bigint, p_coins int)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referrer bigint;
begin
  update public.referrals
     set status = 'rewarded', rewarded_at = now()
   where referred_id = p_referred
     and status = 'pending'
   returning referrer_id into v_referrer;
  if v_referrer is null then
    return 0;
  end if;
  insert into public.coin_grants (id, telegram_user_id, coins, source)
    values ('gr_ref' || p_referred::text || '_bonus', v_referrer, p_coins, 'referral_bonus')
    on conflict (id) do nothing;
  return p_coins;
end;
$$;

revoke execute on function public.reward_referral(bigint, int) from anon, authenticated;

-- ============================================================================
-- Public identities (username / first name as seen in Telegram). Idempotent.
-- Written ONLY from the server after initData verification. Usernames are public
-- Telegram handles by design (the user chooses them); no email, phone or any
-- other contact data is ever stored.
create table if not exists public.identities (
  telegram_user_id bigint primary key,
  username         text,
  first_name       text,
  updated_at       timestamptz not null default now()
);

alter table public.identities enable row level security;

drop trigger if exists identities_touch on public.identities;
create trigger identities_touch before update on public.identities
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- ============================================================================
-- Friend Quiz ("Do'st quizi") + Notification System — added together, same
-- security model as every table above: RLS ON, NO policies. Browsers can NOT
-- read or write these rows; only the Vercel server functions (service-role
-- key, initData verified) may. The client NEVER talks to Supabase directly.
-- Both blocks are idempotent: safe to re-run the whole file.
-- ============================================================================

-- Friend Quiz: a quiz a learner builds from the verified question bank and
-- shares through a Telegram deep link. `questions` keeps the correct answers —
-- it stays on the server forever; clients only ever receive answer-stripped
-- copies. "random" reuses the mixed pool; category stays explicit for clarity.
create table if not exists public.friend_quizzes (
  id           text        primary key,      -- "fq_<uid>_<rand>" (unpredictable -> not enumerable)
  creator_id   bigint      not null,
  creator_name text        not null default '',
  title        text        not null,
  category     text        not null,         -- vocab | grammar | mixed | random
  difficulty   text        not null,         -- beginner | elementary | intermediate | advanced
  size         int         not null,         -- 5 (free) | 10 (50 Coins)
  cost_coins   int         not null default 0,
  status       text        not null default 'active', -- active | closed
  questions    jsonb       not null,         -- Quiz[] WITH answers — server-only
  spend_id     text,                         -- coin_spends.id when creation cost Coins
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.friend_quizzes enable row level security;

create index if not exists friend_quizzes_creator_idx
  on public.friend_quizzes (creator_id, created_at desc);

create index if not exists friend_quizzes_created_idx
  on public.friend_quizzes (created_at desc);

drop trigger if exists friend_quizzes_touch on public.friend_quizzes;
create trigger friend_quizzes_touch before update on public.friend_quizzes
  for each row execute function public.touch_updated_at();

-- One row per SUBMITTED attempt. The composite unique index is the
-- duplicate-submission guard at the database level: a second submission by the
-- same player for the same quiz can never land, whatever the client does.
create table if not exists public.friend_quiz_attempts (
  id            text        primary key,    -- "fqa_<rand>"
  quiz_id       text        not null,
  player_id     bigint      not null,
  player_name   text        not null default '',
  player_avatar text,
  score         int         not null,       -- server-computed, client input is only option indices
  total         int         not null,
  answers       jsonb       not null,       -- picked option index per question
  duration_ms   int         not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.friend_quiz_attempts enable row level security;

-- the anti-double-submit guard + the per-quiz leaderboard read
create unique index if not exists friend_quiz_attempts_unique
  on public.friend_quiz_attempts (quiz_id, player_id);

create index if not exists friend_quiz_attempts_player_idx
  on public.friend_quiz_attempts (player_id, created_at desc);

-- Coin spend journal ("Validate all payments server-side"). The wallet itself
-- stays where it is today (device-owned state.coins.balance + the existing
-- payments/coin_grants ledgers) — NO new wallet. This table only JOURNALS the
-- spends the Mini App reports for quiz features, with deterministic ids so a
-- retry can never journal the same spend twice, and refund marks so failed
-- creations are auditable (the refund itself flows through coin_grants, which
-- the client already applies exactly once).
create table if not exists public.coin_spends (
  id               text        primary key,  -- deterministic idempotency key
  telegram_user_id bigint      not null,
  coins            int         not null,
  purpose          text        not null,     -- 'quiz_create_10' | 'quiz_card'
  ref_id           text,                     -- quiz id / card theme owner id
  status           text        not null default 'spent', -- spent | refunded
  refunded_at      timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.coin_spends enable row level security;

create index if not exists coin_spends_user_idx
  on public.coin_spends (telegram_user_id, created_at desc);

-- ============================================================================
-- Notification system ("Bildirishnomalar"). Three small tables:
--   preferences — what the learner allows (per category, quiet hours, pause)
--   history     — every delivery attempt (also the idempotency ledger: the
--                 primary key makes a duplicate event send at most once)
--   campaigns   — admin-written announcements (draft -> scheduled -> sent)
-- ============================================================================

-- Categories (jsonb keys, all default ON — respect means the user can say no):
--   streak | news | motivation | achievements | quiz | battle | weekly
create table if not exists public.notification_preferences (
  telegram_user_id bigint      primary key,
  categories       jsonb       not null default '{"streak":true,"news":true,"motivation":true,"achievements":true,"quiz":true,"battle":true,"weekly":true}',
  quiet_enabled    boolean     not null default false,
  quiet_start      int,                      -- 0..23, Asia/Tashkent hour
  quiet_end        int,                      -- 0..23
  paused_until     timestamptz,              -- temporary pause (noop when in the past)
  updated_at       timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop trigger if exists notification_preferences_touch on public.notification_preferences;
create trigger notification_preferences_touch before update on public.notification_preferences
  for each row execute function public.touch_updated_at();

-- One row per (event, user). id is DETERMINISTIC ("n_<kind>_<uid>_<event key>")
-- so webhook retries / double cron runs can never send the same notification
-- twice — the primary key is the final say, exactly like coin_grants.
create table if not exists public.notification_history (
  id               text        primary key,
  telegram_user_id bigint      not null,
  kind             text        not null,   -- streak|news|motivation|achievements|quiz|battle|weekly
  status           text        not null default 'sent', -- sent|failed|skipped_pref|skipped_quiet|skipped_paused|skipped_block
  error            text,
  sent_at          timestamptz not null default now()
);

alter table public.notification_history enable row level security;

create index if not exists notification_history_user_idx
  on public.notification_history (telegram_user_id, sent_at desc);

create index if not exists notification_history_kind_idx
  on public.notification_history (kind, sent_at desc);

-- Admin campaigns. Written only by admins (ADMIN_TELEGRAM_IDS, same list the
-- /news command uses). Nothing is auto-broadcast: a message reaches users only
-- after an admin explicitly sends/schedules it, and every recipient still has
-- the 'news' category enabled (quiet hours + pause respected).
create table if not exists public.notification_campaigns (
  id           text        primary key,    -- "nc_<rand>"
  admin_id     bigint      not null,
  title        text        not null,       -- internal name (never sent)
  text         text        not null,       -- message body (Uzbek)
  image_url    text,
  button_label text,
  button_url   text,
  audience     text        not null default 'all', -- all | active | inactive
  category     text        not null default 'news',
  status       text        not null default 'draft', -- draft|scheduled|sending|sent|failed|cancelled
  scheduled_at timestamptz,
  sent_at      timestamptz,
  sent_count   int         not null default 0,
  failed_count int         not null default 0,
  last_uid     bigint,                     -- continuation cursor for chunked sending
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.notification_campaigns enable row level security;

create index if not exists notification_campaigns_status_idx
  on public.notification_campaigns (status, scheduled_at);

drop trigger if exists notification_campaigns_touch on public.notification_campaigns;
create trigger notification_campaigns_touch before update on public.notification_campaigns
  for each row execute function public.touch_updated_at();
