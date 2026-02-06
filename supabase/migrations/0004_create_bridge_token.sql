-- Phase v0.0.3.1: Bridge token table
create table if not exists gate.bridge_token (
  id uuid primary key default gen_random_uuid(),
  human_id uuid not null references gate.human(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists bridge_token_code_key
  on gate.bridge_token (code);
