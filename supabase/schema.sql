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

-- ===================================================================================
-- SERVER-OWNED RATING (Reyting). The browser can NEVER change these numbers: only the
-- Vercel functions (service-role key) write them, and only as the result of a finished
-- battle. Same security model as the other tables: RLS on, no policies.
-- Safe to re-run.
-- ===================================================================================
create table if not exists public.ratings (
  telegram_user_id bigint      primary key,
  rating           int         not null default 1000,   -- 1000 + accumulated Elo, never below 900
  wins             int         not null default 0,
  losses           int         not null default 0,
  draws            int         not null default 0,
  ai_day           date,                                -- day (Asia/Tashkent) of ai_count
  ai_count         int         not null default 0,      -- rated Lingo-AI battles started that day
  ai_open_at       timestamptz,                         -- set while a rated AI battle is in progress
  updated_at       timestamptz not null default now()
);

alter table public.ratings enable row level security;

create index if not exists ratings_rating_idx on public.ratings (rating desc);

drop trigger if exists ratings_touch on public.ratings;
create trigger ratings_touch before update on public.ratings
  for each row execute function public.touch_updated_at();

-- A finished PvP battle is applied to both players' ratings exactly once.
alter table public.battles add column if not exists settled boolean not null default false;

-- Atomic, idempotent: locks the battle row, applies both deltas + W/L/D, marks it settled.
create or replace function public.settle_battle(p_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.battles%rowtype;
begin
  select * into b from public.battles where id = p_id for update;
  if not found or b.status <> 'finished' or b.settled or b.p2 is null then
    return;
  end if;

  insert into public.ratings (telegram_user_id) values (b.p1) on conflict do nothing;
  insert into public.ratings (telegram_user_id) values (b.p2) on conflict do nothing;

  update public.ratings set
    rating = greatest(900, rating + coalesce(b.p1_delta, 0)),
    wins   = wins   + (case when b.winner = b.p1 then 1 else 0 end),
    losses = losses + (case when b.winner is not null and b.winner <> 0 and b.winner <> b.p1 then 1 else 0 end),
    draws  = draws  + (case when b.winner = 0 then 1 else 0 end)
  where telegram_user_id = b.p1;

  update public.ratings set
    rating = greatest(900, rating + coalesce(b.p2_delta, 0)),
    wins   = wins   + (case when b.winner = b.p2 then 1 else 0 end),
    losses = losses + (case when b.winner is not null and b.winner <> 0 and b.winner <> b.p2 then 1 else 0 end),
    draws  = draws  + (case when b.winner = 0 then 1 else 0 end)
  where telegram_user_id = b.p2;

  update public.battles set settled = true where id = p_id;
end;
$$;

-- Safety net: settles every finished-but-unsettled battle (called before old rows are deleted).
create or replace function public.settle_all_finished()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare r record;
begin
  for r in select id from public.battles where status = 'finished' and not settled loop
    perform public.settle_battle(r.id);
  end loop;
end;
$$;

-- Applies the result of one Lingo-AI battle (delta is computed by the server function).
create or replace function public.apply_ai_result(p_uid bigint, p_delta int, p_result text)
returns public.ratings
language plpgsql
security definer
set search_path = ''
as $$
declare out public.ratings;
begin
  insert into public.ratings (telegram_user_id) values (p_uid) on conflict do nothing;
  update public.ratings set
    rating = greatest(900, rating + p_delta),
    wins   = wins   + (case when p_result = 'win'  then 1 else 0 end),
    losses = losses + (case when p_result = 'loss' then 1 else 0 end),
    draws  = draws  + (case when p_result = 'draw' then 1 else 0 end)
  where telegram_user_id = p_uid
  returning * into out;
  return out;
end;
$$;

revoke execute on function public.settle_battle(text)                 from anon, authenticated;
revoke execute on function public.settle_all_finished()               from anon, authenticated;
revoke execute on function public.apply_ai_result(bigint, int, text)  from anon, authenticated;

-- One-time carry-over: keep the rating of players who already have battles recorded in
-- their saved progress (clamped to what their W/L/D could have produced). Safe to re-run
-- (does nothing for users who already have a ratings row).
insert into public.ratings (telegram_user_id, rating, wins, losses, draws)
select
  p.telegram_user_id,
  greatest(900, 1000 + greatest(
    -((coalesce((p.state->'battle'->>'losses')::int, 0) + coalesce((p.state->'battle'->>'draws')::int, 0)) * 64),
    least(
      ((coalesce((p.state->'battle'->>'wins')::int, 0) + coalesce((p.state->'battle'->>'draws')::int, 0)) * 64),
      coalesce((p.state->'battle'->>'ratingDelta')::numeric, 0)
    )
  ))::int,
  coalesce((p.state->'battle'->>'wins')::int, 0),
  coalesce((p.state->'battle'->>'losses')::int, 0),
  coalesce((p.state->'battle'->>'draws')::int, 0)
from public.progress p
where jsonb_typeof(p.state->'battle') = 'object'
on conflict (telegram_user_id) do nothing;
