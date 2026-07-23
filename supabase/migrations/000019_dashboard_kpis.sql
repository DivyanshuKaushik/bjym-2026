-- =====================================================================
-- 000019_dashboard_kpis.sql
--
-- FIX for incorrect/inconsistent dashboard counts (e.g. "Today" showing
-- more members than "This Week"/"This Month", which is logically
-- impossible under correct date-range logic since today is always
-- inside this week and this month).
--
-- The previous implementation ran 12 SEPARATE count queries from
-- Node.js, computing "today"/"week"/"month" boundaries with
-- `new Date(...)` in the serverless function's own clock/timezone, then
-- comparing against `created_at` (a Postgres timestamptz). Two rows of
-- bugs live in that gap: (1) any clock/timezone skew between the
-- Node runtime and Postgres, and (2) nothing guaranteed the 12 queries'
-- results were even internally consistent with each other since they's
-- independent round-trips.
--
-- This migration replaces all of that with ONE query, computed entirely
-- inside Postgres against its own `now()`, so "today" is unambiguously a
-- subset of "this week" is a subset of "this month" by construction —
-- and it's one round-trip instead of twelve, which also matters at
-- 500,000+ rows.
--
-- NOTE: if `total` still looks wrong after this fix, that means the
-- *data* has an issue, not the query — run this to check for it:
--   select count(*) from public.members where deleted_at is not null and status <> 'Deleted';
-- (Members with deleted_at set but status still 'Active'/'Suspended'
-- would be excluded from `total` here, matching the old base() behavior,
-- while still showing up in `active`/`suspended` — if that diagnostic
-- query returns > 0, some rows have deleted_at populated without the
-- status actually being 'Deleted', usually from a bulk import/seed
-- script that set every column from a template including deleted_at.)
-- =====================================================================

create or replace function public.admin_dashboard_kpis()
returns table (
  total bigint,
  today bigint,
  week bigint,
  month bigint,
  active bigint,
  suspended bigint,
  deleted bigint,
  male bigint,
  female bigint,
  other bigint,
  verified bigint,
  pending bigint,
  rejected bigint,
  referral_count bigint
)
language sql
security definer set search_path = public
stable
as $$
  select
    count(*) filter (where deleted_at is null) as total,
    count(*) filter (where deleted_at is null and created_at >= date_trunc('day', now())) as today,
    count(*) filter (where deleted_at is null and created_at >= now() - interval '7 days') as week,
    count(*) filter (where deleted_at is null and created_at >= now() - interval '30 days') as month,
    count(*) filter (where status = 'Active') as active,
    count(*) filter (where status = 'Suspended') as suspended,
    count(*) filter (where status = 'Deleted') as deleted,
    count(*) filter (where deleted_at is null and gender = 'Male') as male,
    count(*) filter (where deleted_at is null and gender = 'Female') as female,
    count(*) filter (where deleted_at is null and gender = 'Other') as other,
    count(*) filter (where deleted_at is null and verification_status = 'Verified') as verified,
    count(*) filter (where deleted_at is null and verification_status = 'Pending') as pending,
    count(*) filter (where deleted_at is null and verification_status = 'Rejected') as rejected,
    (select count(*) from public.member_referrals) as referral_count
  from public.members;
$$;

grant execute on function public.admin_dashboard_kpis() to service_role;

-- Supports the `today`/`week`/`month` FILTER clauses above at scale.
create index if not exists idx_members_created_at_status on public.members(created_at, status) where deleted_at is null;
