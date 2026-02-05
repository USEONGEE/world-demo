-- Phase v0.0.3: SIWE challenge table
create extension if not exists "pgcrypto";

create table if not exists siwe_challenge (
  id uuid primary key default gen_random_uuid(),
  human_id uuid not null references human(id) on delete cascade,
  address text not null,
  nonce text not null unique,
  issued_at timestamptz not null,
  expiration_time timestamptz not null,
  used boolean not null default false
);

create index if not exists siwe_challenge_human_id_idx
  on siwe_challenge (human_id);

create index if not exists siwe_challenge_address_idx
  on siwe_challenge (address);
