-- Phase v0.0.2: Human table
create extension if not exists "pgcrypto";

create table if not exists human (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  nullifier_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists human_action_nullifier_hash_key
  on human (action, nullifier_hash);
