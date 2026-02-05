-- Phase v0.0.3: Wallet binding table
create extension if not exists "pgcrypto";

create table if not exists wallet_binding (
  id uuid primary key default gen_random_uuid(),
  human_id uuid not null references human(id) on delete cascade,
  chain text not null,
  address text not null,
  verified_at timestamptz not null default now(),
  verification_method text not null default 'SIWE'
);

create unique index if not exists wallet_binding_chain_address_key
  on wallet_binding (chain, address);

create index if not exists wallet_binding_human_id_idx
  on wallet_binding (human_id);
