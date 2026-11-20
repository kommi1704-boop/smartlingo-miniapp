-- ============================================================================
-- SmartLingo AI — SCHEMA 2.0 (additive migration; safe to re-run)
-- New server-authoritative systems:
--   xp_ledger           — verified XP transactions (idempotent event keys)
--   streaks             — server-owned streaks (Asia/Tashkent days)
--   vocab_evidence      — per-word recall evidence ("O'rganildi" needs 2 correct)
--   discovery           — Today's Discovery: one cached item per user per day
--   placement_history   — CEFR assessment attempts (server-graded)
--   champions           — weekly championship winners (Tashkent Monday weeks)
--   learner_profiles    — light personalization input (level, interests)
-- RPCs (security definer, EXECUTE revoked from anon/authenticated — only the
-- Vercel service-role functions can call them):
--   tz_today(), week_monday()          — canonical Asia/Tashkent day math
--   streak_touch()                     — authoritative streak update
--   grant_xp()                         — idempotent, capped XP award
--   xp_summary(), xp_top_days()        — totals + ranked windows
--   champ_top(), champ_settle()        — championship standings + atomic prizes
--   record_vocab_answer(), mark_word_learned()
--   record_discovery(), complete_discovery()
--   record_purchase()                  — coin-spend journal (duplicate guard)
-- Notes:
--   * Every "day" below is an Asia/Tashkent date (UTC+5, no DST).
--   * A week starts on Monday (Tashkent) — championship window.
--   * 'legacy' XP rows (seeded once from the old client-owned totals) are
--     excluded from weekly boards and the championship.
-- ============================================================================

-- ---------- shared helpers ---------------------------------------------------

create or replace function public.tz_today() returns date
language sql stable as $$
  select (now() at time zone 'Asia/Tashkent')::date;
$$;

create or replace function public.week_monday(p_day date) returns date
language sql immutable as $$
  select p_day - ((extract(isodow from p_day))::int - 1);
$$;

-- ---------- xp_ledger --------------------------------------------------------

create table if not exists public.xp_ledger (
  id               text primary key,      -- deterministic: "xp_<uid>_<event>"
  telegram_user_id bigint  not null,
  amount           int     not null,
  source           text    not null,      -- vocab|lesson|placement|discovery|battle|milestone|champ_prize|legacy
  day              date    not null,      -- Asia/Tashkent day of the award
  week_start       date    not null,      -- Monday (Tashkent) of that day
  created_at       timestamptz not null default now()
);
create index if not exists xp_ledger_user_day_idx   on public.xp_ledger (telegram_user_id, day);
create index if not exists xp_ledger_user_week_idx  on public.xp_ledger (telegram_user_id, week_start);
create index if not exists xp_ledger_user_src_idx   on public.xp_ledger (telegram_user_id, source, day);
alter table public.xp_ledger enable row level security;

-- ---------- streaks ----------------------------------------------------------

create table if not exists public.streaks (
  telegram_user_id bigint primary key,
  current          int not null default 0,
  longest          int not null default 0,
  last_day         date,                       -- last qualifying practice day (Tashkent)
  tz               text not null default 'Asia/Tashkent',
  freezes          int not null default 0,     -- streak freezes held (server copy)
  updated_at       timestamptz not null default now()
);
alter table public.streaks enable row level security;

-- ---------- vocab evidence ---------------------------------------------------

create table if not exists public.vocab_evidence (
  telegram_user_id bigint not null,
  word_id          text not null,
  correct          int  not null default 0,
  wrong            int  not null default 0,
  learned          boolean not null default false,
  last_day         date,
  updated_at       timestamptz not null default now(),
  primary key (telegram_user_id, word_id)
);
alter table public.vocab_evidence enable row level security;

-- ---------- discovery (one item per user per day) ----------------------------

create table if not exists public.discovery (
  id               text primary key,           -- "d_<uid>_<day>"
  telegram_user_id bigint not null,
  day              date   not null,
  kind             text   not null,            -- fact|word|grammar|quiz|riddle|speak|vocab|culture
  payload          jsonb  not null,            -- validated content shown by the app
  completed        boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique (telegram_user_id, day)
);
create index if not exists discovery_user_recent_idx on public.discovery (telegram_user_id, day desc);
alter table public.discovery enable row level security;

-- ---------- placement history ------------------------------------------------

create table if not exists public.placement_history (
  id               text primary key,           -- "ph_<uid>_<day>_<rand>"
  telegram_user_id bigint not null,
  level            text   not null,            -- Pre-A1 .. C2
  confidence       text,                       -- low|medium|high
  score            int    not null default 0,
  asked            int    not null default 0,
  by_section       jsonb,
  source           text   not null default 'server', -- server|client (legacy flow)
  day              date   not null,
  created_at       timestamptz not null default now()
);
create index if not exists placement_history_user_idx on public.placement_history (telegram_user_id, created_at desc);
alter table public.placement_history enable row level security;

-- ---------- weekly champions -------------------------------------------------

create table if not exists public.champions (
  week_start       date not null,              -- Monday (Tashkent) of the settled week
  place            int  not null,              -- 1..3
  telegram_user_id bigint not null,
  xp               bigint not null,
  prizes           jsonb,
  awarded_at       timestamptz not null default now(),
  primary key (week_start, place)
);
create index if not exists champions_user_idx on public.champions (telegram_user_id);
alter table public.champions enable row level security;

-- ---------- learner profile (personalization input) --------------------------

create table if not exists public.learner_profiles (
  telegram_user_id bigint primary key,
  level            text,
  interests        jsonb,
  updated_at       timestamptz not null default now()
);
alter table public.learner_profiles enable row level security;

-- ============================================================================
-- RPCs
-- ============================================================================

-- ---- streaks ----------------------------------------------------------------

-- Authoritative streak update. Pure-day logic (mirrors api/_lib/xpcore.ts):
--   same day            -> no change
--   yesterday           -> streak + 1
--   2-day gap + freeze  -> consume one freeze, streak + 1 (missed day protected)
--   bigger gap          -> streak resets to 1 (a whole missed day always costs)
create or replace function public.streak_touch(p_uid bigint, p_day date default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_day date := coalesce(p_day, public.tz_today());
  v_cur int; v_long int; v_freezes int; v_last date; v_gap int;
  v_extended boolean := false; v_frozen boolean := false;
begin
  insert into public.streaks (telegram_user_id) values (p_uid) on conflict do nothing;
  select current, longest, freezes, last_day into v_cur, v_long, v_freezes, v_last
    from public.streaks where telegram_user_id = p_uid;
  if v_cur is null then v_cur := 0; end if;
  if v_long is null then v_long := 0; end if;
  if v_freezes is null then v_freezes := 0; end if;

  if v_last is null or v_last < v_day then
    if v_last is null then
      v_cur := 1;
    else
      v_gap := (v_day - v_last);
      if v_gap = 1 then
        v_cur := v_cur + 1;
      elsif v_gap = 2 and v_freezes > 0 then
        v_freezes := v_freezes - 1;
        v_cur := v_cur + 1;
        v_frozen := true;
      else
        v_cur := 1; -- an entire missed day resets the streak
      end if;
    end if;
    v_long := greatest(v_long, v_cur);
    update public.streaks
      set current = v_cur, longest = v_long, last_day = v_day, freezes = v_freezes, updated_at = now()
      where telegram_user_id = p_uid;
    v_extended := true;
  end if;
  return jsonb_build_object(
    'current', v_cur, 'longest', v_long, 'last_day', v_day,
    'extended', v_extended, 'freeze_used', v_frozen, 'freezes', v_freezes);
end $$;
revoke execute on function public.streak_touch(bigint, date) from anon, authenticated;

-- ---- XP ledger --------------------------------------------------------------

-- Idempotent, capped XP award. Returns { granted, streak }.
-- The event key makes a retry a no-op (same pattern as coin_grants / payments).
-- p_touch_streak = false for XP that is NOT today's practice (legacy seed,
-- championship prizes) — such XP must never extend a streak by itself.
create or replace function public.grant_xp(
  p_uid bigint, p_amount int, p_event text, p_source text, p_day_cap int default null, p_touch_streak boolean default true
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_day date := public.tz_today();
  v_id text;
  v_used int := 0;
  v_amt int := coalesce(p_amount, 0);
  v_streak jsonb;
begin
  if v_amt <= 0 then return jsonb_build_object('granted', 0); end if;
  if v_amt > 500 then v_amt := 500; end if; -- hard ceiling per event

  if p_day_cap is not null then
    select coalesce(sum(amount), 0) into v_used
      from public.xp_ledger
      where telegram_user_id = p_uid and source = p_source and day = v_day;
    if v_used >= p_day_cap then
      return jsonb_build_object('granted', 0, 'capped', true);
    end if;
    v_amt := least(v_amt, p_day_cap - v_used);
  end if;

  v_id := 'xp_' || p_uid::text || '_' || regexp_replace(p_event, '[^a-zA-Z0-9_.:-]', '', 'g');
  insert into public.xp_ledger (id, telegram_user_id, amount, source, day, week_start)
    values (v_id, p_uid, v_amt, p_source, v_day, public.week_monday(v_day))
    on conflict (id) do nothing
    returning amount into v_amt;
  if v_amt is null then
    return jsonb_build_object('granted', 0, 'duplicate', true); -- already awarded
  end if;

  if p_touch_streak then
    v_streak := public.streak_touch(p_uid, v_day);
  end if;
  return jsonb_build_object('granted', v_amt, 'streak', v_streak);
end $$;
revoke execute on function public.grant_xp(bigint, int, text, text, int, boolean) from anon, authenticated;

-- Totals for a learner: lifetime XP (ledger), this week's XP, streak state.
create or replace function public.xp_summary(p_uid bigint)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_total bigint; v_week bigint; v_week_start date := public.week_monday(public.tz_today());
  s record;
begin
  select coalesce(sum(amount), 0) into v_total from public.xp_ledger where telegram_user_id = p_uid;
  select coalesce(sum(amount), 0) into v_week from public.xp_ledger
    where telegram_user_id = p_uid and week_start = v_week_start and source <> 'legacy';
  select current, longest, last_day, freezes into s from public.streaks where telegram_user_id = p_uid;
  return jsonb_build_object(
    'xpTotal', v_total, 'xpWeek', v_week, 'weekStart', v_week_start,
    'streak', jsonb_build_object(
      'current', coalesce(s.current, 0), 'longest', coalesce(s.longest, 0),
      'lastDay', s.last_day, 'freezes', coalesce(s.freezes, 0)));
end $$;
revoke execute on function public.xp_summary(bigint) from anon, authenticated;

-- Ranked XP sums over a day window (weekly board = Monday..today, monthly = 30d).
create or replace function public.xp_top_days(p_from date, p_to date, p_limit int default 100)
returns table (uid bigint, xp bigint)
language sql security definer set search_path = '' as $$
  select telegram_user_id, sum(amount)::bigint as xp
    from public.xp_ledger
    where day between p_from and p_to and source <> 'legacy'
    group by telegram_user_id
    order by xp desc, telegram_user_id asc
    limit least(greatest(p_limit, 1), 500);
$$;
revoke execute on function public.xp_top_days(date, date, int) from anon, authenticated;

-- ---- championship -----------------------------------------------------------

create or replace function public.champ_top(p_week date, p_limit int default 50)
returns table (uid bigint, xp bigint)
language sql security definer set search_path = '' as $$
  select telegram_user_id, sum(amount)::bigint as xp
    from public.xp_ledger
    where week_start = p_week and source <> 'legacy'
    group by telegram_user_id
    order by xp desc, telegram_user_id asc
    limit least(greatest(p_limit, 1), 500);
$$;
revoke execute on function public.champ_top(date, int) from anon, authenticated;

-- Atomic settlement of a finished week. Re-running never double-awards:
-- the (week_start, place) PK makes a second call insert nothing.
create or replace function public.champ_settle(p_week date)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_rows jsonb;
begin
  with top as (
    select telegram_user_id, sum(amount)::bigint as xp
      from public.xp_ledger
      where week_start = p_week and source <> 'legacy'
      group by telegram_user_id
      order by xp desc, telegram_user_id asc
      limit 3
  ), ranked as (
    select telegram_user_id, xp, row_number() over (order by xp desc, telegram_user_id asc) as place from top
  ), ins as (
    insert into public.champions (week_start, place, telegram_user_id, xp, prizes)
    select p_week, place, telegram_user_id, xp,
           jsonb_build_object(
             'coins', case place when 1 then 500 when 2 then 250 else 100 end,
             'xp',    case place when 1 then 100 when 2 then 50  else 25  end,
             'frame', case when place = 1 then 'frame-champion' else null end)
      from ranked
      on conflict (week_start, place) do nothing
      returning place, telegram_user_id, xp, prizes
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'place', place, 'uid', telegram_user_id, 'xp', xp, 'prizes', prizes) order by place), '[]'::jsonb)
    into v_rows from ins;
  return jsonb_build_object('settled', jsonb_array_length(v_rows) > 0, 'winners', v_rows);
end $$;
revoke execute on function public.champ_settle(date) from anon, authenticated;

-- ---- vocabulary evidence ----------------------------------------------------

create or replace function public.record_vocab_answer(p_uid bigint, p_word text, p_known boolean)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_correct int; v_wrong int; v_learned boolean;
begin
  insert into public.vocab_evidence (telegram_user_id, word_id, correct, wrong, last_day)
    values (p_uid, left(p_word, 64), case when p_known then 1 else 0 end, case when p_known then 0 else 1 end, public.tz_today())
    on conflict (telegram_user_id, word_id) do update
      set correct = public.vocab_evidence.correct + case when p_known then 1 else 0 end,
          wrong   = public.vocab_evidence.wrong   + case when p_known then 0 else 1 end,
          last_day = public.tz_today(), updated_at = now();
  select correct, wrong, learned into v_correct, v_wrong, v_learned
    from public.vocab_evidence where telegram_user_id = p_uid and word_id = left(p_word, 64);
  return jsonb_build_object('correct', v_correct, 'wrong', v_wrong, 'learned', v_learned);
end $$;
revoke execute on function public.record_vocab_answer(bigint, text, boolean) from anon, authenticated;

-- "O'rganildi" is honoured only with evidence: 2+ correct recall answers.
create or replace function public.mark_word_learned(p_uid bigint, p_word text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ok boolean := false; v_correct int := 0;
begin
  select correct into v_correct from public.vocab_evidence
    where telegram_user_id = p_uid and word_id = left(p_word, 64);
  if coalesce(v_correct, 0) >= 2 then
    update public.vocab_evidence set learned = true, updated_at = now()
      where telegram_user_id = p_uid and word_id = left(p_word, 64) and learned = false;
    v_ok := found;
  end if;
  return jsonb_build_object('ok', v_ok, 'correct', coalesce(v_correct, 0));
end $$;
revoke execute on function public.mark_word_learned(bigint, text) from anon, authenticated;

-- ---- discovery --------------------------------------------------------------

create or replace function public.record_discovery(p_uid bigint, p_day date, p_kind text, p_payload jsonb)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.discovery (id, telegram_user_id, day, kind, payload)
    values ('d_' || p_uid::text || '_' || p_day::text, p_uid, p_day, left(p_kind, 24), p_payload)
    on conflict (telegram_user_id, day) do nothing;
  return found;
end $$;
revoke execute on function public.record_discovery(bigint, date, text, jsonb) from anon, authenticated;

create or replace function public.complete_discovery(p_uid bigint, p_day date)
returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.discovery set completed = true, completed_at = now()
    where telegram_user_id = p_uid and day = p_day and completed = false;
  return found;
end $$;
revoke execute on function public.complete_discovery(bigint, date) from anon, authenticated;

-- ---- purchases (server-side journal; duplicate-safe) ------------------------

create or replace function public.record_purchase(p_uid bigint, p_item text, p_coins int, p_kind text)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_id text;
begin
  -- permanent items journal once ever; rentals (kind = 'rental') once per day
  if p_kind = 'rental' then
    v_id := 'sp_' || p_uid::text || '_' || left(p_item, 48) || '_' || public.tz_today()::text;
  else
    v_id := 'sp_' || p_uid::text || '_' || left(p_item, 48);
  end if;
  insert into public.coin_spends (id, telegram_user_id, coins, purpose, status)
    values (v_id, p_uid, coalesce(p_coins, 0), 'shop_' || left(p_item, 40), 'spent')
    on conflict (id) do nothing;
  return found;
end $$;
revoke execute on function public.record_purchase(bigint, text, int, text) from anon, authenticated;
