-- Phase v0.0.3.2: gate schema grants for API/service role access

grant usage on schema gate to service_role;
grant select, insert, update, delete on all tables in schema gate to service_role;
alter default privileges in schema gate
  grant select, insert, update, delete on tables to service_role;

-- Optional: allow authenticated to read (uncomment if needed)
-- grant usage on schema gate to authenticated;
-- grant select on all tables in schema gate to authenticated;
