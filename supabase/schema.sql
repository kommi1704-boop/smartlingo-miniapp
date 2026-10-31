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
