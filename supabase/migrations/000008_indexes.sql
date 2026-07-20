-- =====================================================================
-- 000008_indexes.sql
-- Indexing strategy for 5+ lakh member rows.
--
-- Partial unique indexes on mobile/email/referral_code/membership_id
-- exclude soft-deleted rows (`deleted_at is null`) so a deleted member's
-- phone number or email can be reused by someone re-registering, while
-- still enforcing uniqueness among live members. membership_id and
-- referral_code stay globally unique (including deleted rows) since
-- other rows may still reference a deleted member's referral_code in
-- their referred_by_code / member_referrals history.
-- =====================================================================

-- Uniqueness (partial, live rows only)
create unique index if not exists uq_members_mobile_live on public.members(mobile) where deleted_at is null;
create unique index if not exists uq_members_email_live on public.members(email) where deleted_at is null;

-- Uniqueness (global, survives soft delete — referenced by history/referrals):
-- membership_id and referral_code are already declared `unique` inline on
-- the column in 000004_members.sql (required there so the self-referencing
-- `referred_by_code -> referral_code` foreign key has something unique to
-- point at within the same CREATE TABLE statement). No separate index
-- needed here — the inline `unique` already created one.

-- Filter/join columns used constantly by the admin dashboard
create index if not exists idx_members_status on public.members(status) where deleted_at is null;
create index if not exists idx_members_verification_status on public.members(verification_status) where deleted_at is null;
create index if not exists idx_members_district on public.members(district_id);
create index if not exists idx_members_assembly on public.members(assembly_id);
create index if not exists idx_members_mandal on public.members(mandal_id);
create index if not exists idx_members_category on public.members(category);
create index if not exists idx_members_gender on public.members(gender);
create index if not exists idx_members_created_at on public.members(created_at);
create index if not exists idx_members_referred_by on public.members(referred_by_code);
create index if not exists idx_members_dob on public.members(dob); -- age-range filters

-- Common admin cross-filter combinations (composite indexes)
create index if not exists idx_members_district_status on public.members(district_id, status) where deleted_at is null;
create index if not exists idx_members_district_category on public.members(district_id, category);
create index if not exists idx_members_assembly_gender on public.members(assembly_id, gender);

-- Full-text search (backs the generated `search_vector` column)
create index if not exists idx_members_search on public.members using gin (search_vector);

-- Referral leaderboard
create index if not exists idx_member_referrals_referrer on public.member_referrals(referrer_membership_id);

-- Logs
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_actor on public.activity_logs(actor_type, actor_id);
create index if not exists idx_activity_logs_target on public.activity_logs(target_table, target_id);
create index if not exists idx_member_status_history_member on public.member_status_history(member_id);
create index if not exists idx_export_history_admin on public.export_history(admin_id, created_at desc);
