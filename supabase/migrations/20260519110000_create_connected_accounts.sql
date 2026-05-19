create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  provider text not null,
  provider_account_id text not null,
  username text not null,
  avatar_url text,
  access_token_ref text,
  scopes text[] not null default '{}',
  status text not null default 'connected',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connected_accounts_provider_check check (provider in ('github')),
  constraint connected_accounts_status_check check (status in ('connected', 'disconnected', 'revoked')),
  constraint connected_accounts_user_provider_account_unique unique (user_id, provider, provider_account_id)
);

create unique index if not exists connected_accounts_provider_username_unique_idx
  on public.connected_accounts (provider, username);

create index if not exists connected_accounts_user_provider_status_idx
  on public.connected_accounts (user_id, provider, status);

create or replace function public.set_connected_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists connected_accounts_set_updated_at on public.connected_accounts;
create trigger connected_accounts_set_updated_at
before update on public.connected_accounts
for each row
execute function public.set_connected_accounts_updated_at();
