-- =====================================================================
-- 000015_analytics_functions.sql
--
-- Phase 2: replaces the previous "fetch up to 5,000 raw rows and
-- aggregate in the browser" analytics approach with real GROUP BY
-- aggregation inside Postgres. Every function here returns already-
-- summarized data (a handful to a few hundred rows), regardless of
-- whether the underlying `members` table has 5,000 or 5,00,000 rows.
-- =====================================================================

-- ---- Daily growth (true all-time cumulative total, last N days shown) ----
create or replace function public.analytics_growth(p_days int default 30)
returns table(day date, daily_count bigint, cumulative_count bigint)
language sql
security definer set search_path = public
stable
as $$
  with all_daily as (
    select date_trunc('day', created_at)::date as day, count(*) as daily_count
    from public.members
    where deleted_at is null
    group by 1
  ),
  running as (
    select day, daily_count, sum(daily_count) over (order by day) as cumulative_count
    from all_daily
  )
  select day, daily_count, cumulative_count
  from running
  where day >= (current_date - (p_days || ' days')::interval)
  order by day;
$$;

-- ---- Single-dimension breakdowns ----
create or replace function public.analytics_breakdown_district()
returns table(name text, count bigint)
language sql security definer set search_path = public stable
as $$
  select district_name_hi as name, count(*) as count
  from public.members where deleted_at is null
  group by district_name_hi order by count desc;
$$;

create or replace function public.analytics_breakdown_category()
returns table(name text, count bigint)
language sql security definer set search_path = public stable
as $$
  select category as name, count(*) as count
  from public.members where deleted_at is null
  group by category order by count desc;
$$;

create or replace function public.analytics_breakdown_gender()
returns table(name text, count bigint)
language sql security definer set search_path = public stable
as $$
  select gender as name, count(*) as count
  from public.members where deleted_at is null
  group by gender order by count desc;
$$;

create or replace function public.analytics_breakdown_jaati(p_limit int default 12)
returns table(name text, count bigint)
language sql security definer set search_path = public stable
as $$
  select jaati as name, count(*) as count
  from public.members where deleted_at is null
  group by jaati order by count desc limit p_limit;
$$;

-- ---- Age distribution (STABLE is fine here — age() depending on
--      current_date is allowed in a function body, just not in a
--      generated column expression) ----
create or replace function public.analytics_age_distribution()
returns table(bucket text, count bigint)
language sql security definer set search_path = public stable
as $$
  select
    case
      when extract(year from age(dob)) <= 22 then '18-22'
      when extract(year from age(dob)) <= 27 then '23-27'
      when extract(year from age(dob)) <= 32 then '28-32'
      when extract(year from age(dob)) <= 37 then '33-37'
      else '38-40'
    end as bucket,
    count(*) as count
  from public.members
  where deleted_at is null
  group by 1;
$$;

-- ---- Cross-filter (District vs Category, Assembly vs Gender, etc.) ----
-- p_x_field / p_y_field are validated against a hardcoded whitelist
-- before being used with format(%I) — never accepts arbitrary column
-- names, so this is not a SQL-injection vector despite building
-- dynamic SQL internally.
create or replace function public.analytics_cross(p_x_field text, p_y_field text)
returns table(x_value text, y_value text, count bigint)
language plpgsql security definer set search_path = public stable
as $$
declare
  allowed text[] := array['district_name_hi','assembly_name_hi','mandal_name_hi','category','gender','jaati'];
begin
  if not (p_x_field = any(allowed)) then
    raise exception 'Invalid x field: %', p_x_field;
  end if;
  if not (p_y_field = any(allowed)) then
    raise exception 'Invalid y field: %', p_y_field;
  end if;

  return query execute format(
    'select %I::text as x_value, %I::text as y_value, count(*)::bigint as count
     from public.members where deleted_at is null
     group by 1, 2
     order by count desc
     limit 2000',
    p_x_field, p_y_field
  );
end;
$$;

grant execute on function public.analytics_growth(int) to service_role;
grant execute on function public.analytics_breakdown_district() to service_role;
grant execute on function public.analytics_breakdown_category() to service_role;
grant execute on function public.analytics_breakdown_gender() to service_role;
grant execute on function public.analytics_breakdown_jaati(int) to service_role;
grant execute on function public.analytics_age_distribution() to service_role;
grant execute on function public.analytics_cross(text, text) to service_role;

-- Supports the referral leaderboard query at scale.
create index if not exists idx_members_referral_count on public.members(referral_count desc) where referral_count > 0;
