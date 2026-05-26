create extension if not exists pgcrypto;

create table if not exists public.brawl_player_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_tag text not null,
  total_victories integer not null default 0,
  current_trophies integer not null default 0,
  exp_level integer not null default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists brawl_player_snapshots_user_created_idx
  on public.brawl_player_snapshots (user_id, created_at desc);

alter table public.brawl_player_snapshots enable row level security;

drop policy if exists "brawl_player_snapshots_select_own" on public.brawl_player_snapshots;
drop policy if exists "brawl_player_snapshots_insert_own" on public.brawl_player_snapshots;

create policy "brawl_player_snapshots_select_own"
  on public.brawl_player_snapshots
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "brawl_player_snapshots_insert_own"
  on public.brawl_player_snapshots
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create unique index if not exists brawl_match_history_user_battle_player_key
  on public.brawl_match_history (user_id, battle_time, player_tag);

alter table public.brawl_match_history
  add column if not exists total_victories integer,
  add column if not exists current_trophies integer,
  add column if not exists exp_level integer;
