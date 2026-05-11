create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  email text,
  auth_provider_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  chain text not null,
  public_address text not null,
  encrypted_secret_ref text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint wallets_status_check check (status in ('active', 'inactive', 'revoked')),
  constraint wallets_user_chain_address_unique unique (user_id, chain, public_address)
);

create table if not exists public.activities (
  id text not null,
  user_id text not null references public.users(id) on delete cascade,
  type text,
  source text,
  title text not null,
  url text,
  description text,
  language text,
  stars integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  primary key (id, user_id)
);

create table if not exists public.user_skills (
  user_id text not null references public.users(id) on delete cascade,
  skill text not null,
  activity_id text,
  source text,
  created_at timestamptz not null default now(),
  constraint user_skills_unique unique nulls not distinct (user_id, skill, activity_id, source)
);

create table if not exists public.profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  hash text not null,
  schema_version text not null,
  receipt jsonb,
  transaction_hash text,
  network text,
  created_at timestamptz not null default now(),
  constraint profile_snapshots_user_hash_unique unique (user_id, hash)
);

create index if not exists activities_user_created_at_idx
  on public.activities (user_id, created_at desc);

create index if not exists user_skills_user_skill_idx
  on public.user_skills (user_id, skill);

create index if not exists profile_snapshots_user_created_at_idx
  on public.profile_snapshots (user_id, created_at desc);
