create table if not exists public.verified_account_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  provider text not null,
  provider_id text not null,
  username text not null,
  verified_at timestamptz not null default now(),
  metadata jsonb,
  constraint verified_account_connections_provider_check check (provider in ('github')),
  constraint verified_account_connections_user_provider_id_unique unique (user_id, provider, provider_id),
  constraint verified_account_connections_user_provider_username_unique unique (user_id, provider, username)
);

create index if not exists verified_account_connections_user_provider_idx
  on public.verified_account_connections (user_id, provider);
