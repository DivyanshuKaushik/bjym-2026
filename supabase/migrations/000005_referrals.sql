-- =====================================================================
-- 000005_referrals.sql
-- Materialized referral log — one row per successful (joined) referral.
-- referral_count on `members` is a denormalized counter kept in sync by
-- a trigger (000010_triggers.sql) so leaderboard queries don't need to
-- aggregate this table at read time.
-- =====================================================================

create table if not exists public.member_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_membership_id text not null references public.members(membership_id) on delete cascade,
  referred_membership_id text not null unique references public.members(membership_id) on delete cascade,
  created_at timestamptz not null default now()
);
