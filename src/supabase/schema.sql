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
