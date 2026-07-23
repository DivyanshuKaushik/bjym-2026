-- =====================================================================
-- supabase/reset.sql
--
-- Run this FIRST, before the migrations, any time you want a guaranteed
-- clean slate — e.g. if this Supabase project has ever been used for any
-- earlier version of this app, or if a previous migration attempt failed
-- partway through and left things in an inconsistent state.
--
-- Safe to run on a brand-new project too (every DROP uses IF EXISTS).
-- This only touches objects in the `public` schema that this project
-- creates — it does not touch Supabase's own internal schemas
-- (auth, storage, realtime, etc.), and this project doesn't use
-- Supabase Auth/Storage in the first place (see README).
--
-- Usage: Supabase Dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. Then run the 16 migrations (or run_all_migrations.sql)
-- immediately after, in the same SQL Editor session or via `db push`.
-- =====================================================================

-- ---- Current-schema tables (drop children before/with parents; CASCADE
--      handles FK dependency order automatically either way) ----
drop table if exists public.export_jobs cascade;
drop table if exists public.export_history cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.member_status_history cascade;
drop table if exists public.member_referrals cascade;
drop table if exists public.members cascade;
drop table if exists public.membership_sequences cascade;
drop table if exists public.settings cascade;
drop table if exists public.role_permissions cascade;
drop table if exists public.admin_users cascade;
drop table if exists public.permissions cascade;
drop table if exists public.roles cascade;

-- ---- Leftover tables from any earlier/pre-refactor version of this
--      project, in case this Supabase project was used for that before
--      (harmless no-ops if they were never created) ----
drop table if exists public.referrals cascade;
drop table if exists public.memberships cascade;
drop table if exists public.mandals cascade;
drop table if exists public.assemblies cascade;
drop table if exists public.districts cascade;
drop table if exists public.profiles cascade;

-- ---- Functions (CASCADE also drops any trigger still attached to a
--      table that somehow survived the drops above) ----
drop function if exists public.set_updated_at() cascade;
drop function if exists public.set_settings_updated_at() cascade;
drop function if exists public.generate_membership_id() cascade;
drop function if exists public.generate_referral_code(text) cascade;
drop function if exists public.update_referral_stats(text) cascade;
drop function if exists public.log_activity(text, text, text, text, text, text, jsonb) cascade;
drop function if exists public.soft_delete_member(uuid, uuid, text) cascade;
drop function if exists public.suspend_member(uuid, uuid, text) cascade;
drop function if exists public.restore_member(uuid, uuid) cascade;
drop function if exists public.reset_member_mpin(uuid, text, uuid) cascade;
drop function if exists public.before_member_insert() cascade;
drop function if exists public.after_member_insert() cascade;
drop function if exists public.before_membership_insert() cascade;      -- old pre-refactor name
drop function if exists public.after_membership_insert_referral() cascade; -- old pre-refactor name
drop function if exists public.is_admin() cascade;                      -- old pre-refactor name
drop function if exists public.verify_membership(text) cascade;         -- old pre-refactor name
drop function if exists public.analytics_growth(int) cascade;
drop function if exists public.analytics_breakdown_district() cascade;
drop function if exists public.analytics_breakdown_category() cascade;
drop function if exists public.analytics_breakdown_gender() cascade;
drop function if exists public.analytics_breakdown_jaati(int) cascade;
drop function if exists public.analytics_age_distribution() cascade;
drop function if exists public.analytics_cross(text, text) cascade;
drop function if exists public.admin_dashboard_kpis() cascade;

-- ---- Storage (member-photos bucket + its RLS policies) ----
-- Only drops what this project itself created — does not touch any
-- other bucket you may have in the same Supabase project.
drop policy if exists "member-photos public read" on storage.objects;
drop policy if exists "member-photos no anon writes" on storage.objects;
drop policy if exists "member-photos no anon updates" on storage.objects;
drop policy if exists "member-photos no anon deletes" on storage.objects;
delete from storage.objects where bucket_id = 'member-photos';
delete from storage.buckets where id = 'member-photos';

-- ---- Done. Now run the migrations (see README §3 / §13), e.g.: ----
--   npm run db:push
-- or paste supabase/run_all_migrations.sql into SQL Editor.
select 'Reset complete — public schema is now clean. Run the migrations next.' as status;
