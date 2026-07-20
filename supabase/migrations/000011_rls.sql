-- =====================================================================
-- 000011_rls.sql
--
-- Authorization for this app happens entirely in the application layer
-- (NextAuth session + RBAC checks in src/lib/repositories and Server
-- Actions) because there is no Supabase Auth session for `auth.uid()`
-- to key off of — every request from the app connects with the
-- SERVICE ROLE key (src/lib/db/client.ts), which bypasses RLS by
-- design regardless of what policies exist here.
--
-- RLS is still enabled on every table with a default-deny policy set
-- (no policies granting anon/authenticated access) purely as
-- defense-in-depth: if the anon/public key were ever accidentally
-- exposed or misused, it would see nothing. This is a deliberate
-- belt-and-suspenders choice, not the app's real authorization
-- boundary — do not add anon/authenticated policies here expecting
-- them to be used by the app.
-- =====================================================================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admin_users enable row level security;
alter table public.members enable row level security;
alter table public.membership_sequences enable row level security;
alter table public.member_referrals enable row level security;
alter table public.member_status_history enable row level security;
alter table public.activity_logs enable row level security;
alter table public.export_history enable row level security;
alter table public.settings enable row level security;

-- No policies are created for anon/authenticated roles — RLS default
-- (deny-all) applies. The service_role Postgres role Supabase provisions
-- bypasses RLS unconditionally per Postgres/Supabase semantics, which is
-- exactly the client this app uses.
