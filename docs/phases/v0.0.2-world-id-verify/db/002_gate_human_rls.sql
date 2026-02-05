-- Phase v0.0.2: gate.human RLS + permissions

-- Enable RLS (default deny)
alter table gate.human enable row level security;

-- Revoke direct access for anon/authenticated
revoke all on table gate.human from anon, authenticated;

-- Allow server-only access via service_role
grant usage on schema gate to service_role;
grant select, insert on gate.human to service_role;
