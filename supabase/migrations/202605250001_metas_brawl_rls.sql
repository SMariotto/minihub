create extension if not exists pgcrypto;

create table if not exists public.metas_brawl (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  player_tag text,
  player_name text,
  trofeus_atuais integer not null default 0,
  trofeus_meta integer not null default 0,
  data_final date,
  prazo_dias integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.metas_brawl
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid,
  add column if not exists player_tag text,
  add column if not exists player_name text,
  add column if not exists trofeus_atuais integer not null default 0,
  add column if not exists trofeus_meta integer not null default 0,
  add column if not exists data_final date,
  add column if not exists prazo_dias integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.metas_brawl
set data_final = current_date + greatest(prazo_dias, 0)
where data_final is null;

delete from public.metas_brawl
where user_id is null;

alter table public.metas_brawl
  alter column id set not null,
  alter column user_id set not null,
  alter column data_final set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'metas_brawl_pkey'
      and conrelid = 'public.metas_brawl'::regclass
  ) then
    alter table public.metas_brawl
      add constraint metas_brawl_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'metas_brawl_user_id_fkey'
      and conrelid = 'public.metas_brawl'::regclass
  ) then
    alter table public.metas_brawl
      add constraint metas_brawl_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end $$;

create unique index if not exists metas_brawl_user_id_key
  on public.metas_brawl (user_id);

alter table public.metas_brawl enable row level security;

drop policy if exists "metas_brawl_select_own" on public.metas_brawl;
drop policy if exists "metas_brawl_insert_own" on public.metas_brawl;
drop policy if exists "metas_brawl_update_own" on public.metas_brawl;

create policy "metas_brawl_select_own"
  on public.metas_brawl
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "metas_brawl_insert_own"
  on public.metas_brawl
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "metas_brawl_update_own"
  on public.metas_brawl
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
