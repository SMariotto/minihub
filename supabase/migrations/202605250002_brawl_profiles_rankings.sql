create extension if not exists pgcrypto;

create table if not exists public.brawl_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_tag text not null,
  player_name text,
  current_trophies integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists brawl_profiles_player_tag_key
  on public.brawl_profiles (player_tag);

alter table public.brawl_profiles enable row level security;

drop policy if exists "brawl_profiles_select_own" on public.brawl_profiles;
drop policy if exists "brawl_profiles_insert_own" on public.brawl_profiles;
drop policy if exists "brawl_profiles_update_own" on public.brawl_profiles;

create policy "brawl_profiles_select_own"
  on public.brawl_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "brawl_profiles_insert_own"
  on public.brawl_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "brawl_profiles_update_own"
  on public.brawl_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.brawl_match_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_tag text not null,
  battle_time timestamptz not null,
  result text not null check (result in ('victory', 'defeat', 'draw')),
  trophies_delta integer not null default 0,
  participation_count integer not null default 1,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists brawl_match_history_user_time_idx
  on public.brawl_match_history (user_id, battle_time desc);

create index if not exists brawl_match_history_player_time_idx
  on public.brawl_match_history (player_tag, battle_time desc);

alter table public.brawl_match_history enable row level security;

drop policy if exists "brawl_match_history_select_own" on public.brawl_match_history;
drop policy if exists "brawl_match_history_insert_own" on public.brawl_match_history;
drop policy if exists "brawl_match_history_update_own" on public.brawl_match_history;

create policy "brawl_match_history_select_own"
  on public.brawl_match_history
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "brawl_match_history_insert_own"
  on public.brawl_match_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "brawl_match_history_update_own"
  on public.brawl_match_history
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.brawl_friend_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brawl_friend_group_members (
  group_id uuid not null references public.brawl_friend_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists brawl_friend_group_members_user_idx
  on public.brawl_friend_group_members (user_id);

alter table public.brawl_friend_groups enable row level security;
alter table public.brawl_friend_group_members enable row level security;

drop policy if exists "brawl_friend_groups_select_member" on public.brawl_friend_groups;
drop policy if exists "brawl_friend_groups_insert_own" on public.brawl_friend_groups;
drop policy if exists "brawl_friend_groups_update_owner" on public.brawl_friend_groups;
drop policy if exists "brawl_friend_group_members_select_own_groups" on public.brawl_friend_group_members;
drop policy if exists "brawl_friend_group_members_insert_self" on public.brawl_friend_group_members;
drop policy if exists "brawl_friend_group_members_update_self" on public.brawl_friend_group_members;

create policy "brawl_friend_groups_select_member"
  on public.brawl_friend_groups
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.brawl_friend_group_members members
      where members.group_id = brawl_friend_groups.id
        and members.user_id = auth.uid()
    )
  );

create policy "brawl_friend_groups_insert_own"
  on public.brawl_friend_groups
  for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "brawl_friend_groups_update_owner"
  on public.brawl_friend_groups
  for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "brawl_friend_group_members_select_own_groups"
  on public.brawl_friend_group_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.brawl_friend_group_members own_membership
      where own_membership.group_id = brawl_friend_group_members.group_id
        and own_membership.user_id = auth.uid()
    )
  );

create policy "brawl_friend_group_members_insert_self"
  on public.brawl_friend_group_members
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "brawl_friend_group_members_update_self"
  on public.brawl_friend_group_members
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace view public.brawl_ranking_totals as
select
  history.user_id,
  history.player_tag,
  profiles.player_name,
  count(*) filter (where history.result = 'victory')::integer as victories,
  count(*) filter (where history.result = 'defeat')::integer as defeats,
  sum(history.participation_count)::integer as participations,
  sum(history.trophies_delta)::integer as trophies_delta,
  date_trunc('day', history.battle_time) as day_bucket,
  date_trunc('month', history.battle_time) as month_bucket
from public.brawl_match_history history
left join public.brawl_profiles profiles on profiles.user_id = history.user_id
group by history.user_id, history.player_tag, profiles.player_name, date_trunc('day', history.battle_time), date_trunc('month', history.battle_time);

alter view public.brawl_ranking_totals set (security_invoker = true);
