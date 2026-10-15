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
