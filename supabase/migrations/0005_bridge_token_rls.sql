-- Phase v0.0.3.1: gate.bridge_token RLS + permissions

-- Enable RLS (default deny)
alter table gate.bridge_token enable row level security;

-- Revoke direct access for anon/authenticated
revoke all on table gate.bridge_token from anon, authenticated;

-- Allow server-only access via service_role
grant usage on schema gate to service_role;
grant select, insert, update on gate.bridge_token to service_role;

-- Explicit RLS policy for service_role (defensive)
create policy gate_bridge_token_service_role_all
  on gate.bridge_token
  for all
  to service_role
  using (true)
  with check (true);
