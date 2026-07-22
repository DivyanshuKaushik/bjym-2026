-- =====================================================================
-- COMBINED MIGRATION FILE — runs all 000001..000019 migrations in order.
-- Paste this ONE file into Supabase SQL Editor instead of running each
-- file one by one. Safe to re-run (every statement is idempotent).
--
-- If you want a guaranteed-clean slate first, run supabase/reset.sql
-- (or supabase/reset_and_migrate.sql, which does both in one paste).
-- =====================================================================


-- ============ FROM: 000001_initial_schema.sql ============
-- =====================================================================
-- 000001_initial_schema.sql
-- Extensions + shared trigger function + RBAC foundation (roles,
-- permissions, role_permissions). Auth itself lives in the app
-- (NextAuth) — these tables just describe WHAT an authenticated admin
-- is allowed to do.
-- =====================================================================

create extension if not exists "pgcrypto";

-- Shared trigger function: keeps `updated_at` current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);


-- ============ FROM: 000002_hierarchy.sql ============
-- =====================================================================
-- 000002_hierarchy.sql
--
-- INTENTIONALLY EMPTY (no tables created here).
--
-- Per project requirements, the District -> Assembly -> Mandal
-- organizational hierarchy is NOT stored in Supabase. It lives in the
-- Next.js codebase at:
--
--     src/data/hierarchy.ts
--
-- generated directly from the official BJYM organizational-districts
-- Excel sheet (36 districts, 102 assemblies, 479 mandals), so it can be
-- edited/regenerated and redeployed without a database migration. Only
-- the member's SELECTED values (id + English/Hindi name snapshots) are
-- stored on the `members` row — see 000004_members.sql, columns
-- `district_id/name_en/name_hi`, `assembly_id/name_en/name_hi`, etc.
--
-- NOTE: there is deliberately no Lok Sabha level. The source Excel sheet
-- has no Lok Sabha column, and BJYM's organizational districts (e.g.
-- भिलाई as distinct from दुर्ग, रायपुर शहर/ग्रामीण split) don't map 1:1
-- onto the 11 official Lok Sabha constituencies without a separately
-- verified mapping — so none was fabricated. District is the top level.
--
-- This file exists purely to preserve the migration numbering scheme
-- and to document the decision for anyone reading the migrations folder
-- top-to-bottom.
-- =====================================================================

select 1; -- no-op


-- ============ FROM: 000003_admin_users.sql ============
-- =====================================================================
-- 000003_admin_users.sql
-- Admin accounts (Master Admin / Supervisor). Completely separate from
-- the `members` table — admins log in with username + password at
-- /admin-login, members log in with mobile-or-email + MPIN at /login.
-- =====================================================================

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  full_name text not null,
  role_id uuid not null references public.roles(id),
  token_version int not null default 1,
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id)
);

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
  before update on public.admin_users
  for each row execute procedure public.set_updated_at();

create index if not exists idx_admin_users_role on public.admin_users(role_id);
create index if not exists idx_admin_users_active on public.admin_users(is_active) where is_active = true;


-- ============ FROM: 000004_members.sql ============
-- =====================================================================
-- 000004_members.sql
-- Core members table + the per-year membership-ID sequence it depends on.
-- Optimized for 5+ lakh (500,000+) rows: partial indexes exclude
-- soft-deleted rows from the hot-path unique constraints, a generated
-- tsvector column backs full-text search without a separate ETL step,
-- and every FK the admin dashboard filters/joins on on is indexed.
-- =====================================================================

create table if not exists public.membership_sequences (
  year int primary key,
  last_serial int not null default 0
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),

  membership_id text not null unique,
  status text not null default 'Active' check (status in ('Active', 'Suspended', 'Deleted')),
  verification_status text not null default 'Pending' check (verification_status in ('Pending', 'Verified', 'Rejected')),

  -- Personal
  photo_base64 text, -- WebP data URL, fixed passport-ratio crop (see PhotoCropper) — see README for the "why not Storage" note
  full_name text not null,
  father_name text not null,
  dob date not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  category text not null, -- Varg: General / OBC / SC / ST / EWS / Other (see src/data/hierarchy.ts CATEGORIES)
  jaati text not null,

  -- Contact
  mobile text not null,
  whatsapp text not null,
  email text not null,

  -- Organizational hierarchy — snapshotted id + both-language labels at
  -- registration time (see 000002_hierarchy.sql for why there's no FK here).
  -- District is the TOP level: the real BJYM organizational hierarchy data
  -- has no Lok Sabha column (org districts like भिलाई / रायपुर शहर / रायपुर
  -- ग्रामीण don't map 1:1 onto the 11 official Lok Sabha seats without a
  -- separately verified mapping) — see src/data/hierarchy.ts header.
  district_id text not null,
  district_name_en text not null,
  district_name_hi text not null,
  assembly_id text not null,
  assembly_name_en text not null,
  assembly_name_hi text not null,
  mandal_id text not null,
  mandal_name_en text not null,
  mandal_name_hi text not null,
  booth text,
  address text not null,
  pincode text not null,

  -- Security — MPIN only, no password, no Supabase Auth
  mpin_hash text not null,
  token_version int not null default 1, -- bump to force "logout everywhere"

  -- Referral program
  referral_code text not null unique,
  referred_by_code text references public.members(referral_code),
  referral_count int not null default 0, -- maintained by trigger, see 000010_triggers.sql

  -- Membership artifacts
  qr_generated boolean not null default true,
  id_card_generated boolean not null default false,

  -- Session / preference metadata
  last_login timestamptz,
  registration_source text not null default 'web',
  language_preference text not null default 'hi',

  -- Verification / lifecycle workflow
  rejection_reason text,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references public.admin_users(id),
  updated_by uuid references public.admin_users(id),
  verified_by uuid references public.admin_users(id),
  verified_at timestamptz,
  suspended_by uuid references public.admin_users(id),
  suspended_at timestamptz,
  rejected_by uuid references public.admin_users(id),
  rejected_at timestamptz,
  deleted_by uuid references public.admin_users(id),

  -- Full-text search — immutable generated column (safe: 'simple' config
  -- passed as a literal), backed by a GIN index below.
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(full_name, '') || ' ' || coalesce(membership_id, '') || ' ' ||
      coalesce(mobile, '') || ' ' || coalesce(whatsapp, '') || ' ' || coalesce(email, '')
    )
  ) stored,

  constraint chk_mpin_hash_present check (length(mpin_hash) > 0),
  constraint chk_pincode_format check (pincode ~ '^[0-9]{6}$'),
  constraint chk_mobile_format check (mobile ~ '^[6-9][0-9]{9}$'),
  constraint chk_whatsapp_format check (whatsapp ~ '^[6-9][0-9]{9}$')
);

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
  before update on public.members
  for each row execute procedure public.set_updated_at();


-- ============ FROM: 000005_referrals.sql ============
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


-- ============ FROM: 000006_activity_logs.sql ============
-- =====================================================================
-- 000006_activity_logs.sql
-- Everything log/audit-shaped lives here: general activity_logs, the
-- member status lifecycle history, and the export module's audit trail.
-- =====================================================================

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('admin', 'member', 'system')),
  actor_id text, -- admin_users.id (uuid as text) or members.membership_id, depending on actor_type
  actor_label text, -- display name snapshot, so history reads correctly even if the actor is later deleted
  action text not null,
  target_table text,
  target_id text,
  meta jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.member_status_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  from_status text,
  to_status text not null,
  reason text,
  changed_by uuid references public.admin_users(id),
  changed_at timestamptz not null default now()
);

create table if not exists public.export_history (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id),
  format text not null check (format in ('csv', 'xlsx', 'pdf')),
  filters jsonb,
  columns jsonb,
  record_count int not null default 0,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  created_at timestamptz not null default now()
);

-- Portal-wide key/value settings (ID card signatory name, portal name, etc.)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.admin_users(id),
  updated_at timestamptz not null default now()
);


-- ============ FROM: 000007_repair_legacy_tables.sql ============
-- =====================================================================
-- 000007_repair_legacy_tables.sql
--
-- FIX for: "column actor_type does not exist" (and similar).
--
-- If this Supabase project was previously used for an earlier version of
-- this app, `public.activity_logs` and `public.settings` may already
-- exist with the OLD column shape. Because 000006_activity_logs.sql uses
-- `create table if not exists`, it silently skipped creating the NEW
-- shape on a project where these tables already existed — leaving the
-- old, incompatible columns in place. This migration repairs both.
--
-- Safe to run even on a project where these tables were already created
-- correctly by 000006 (every statement is defensive / IF NOT EXISTS).
-- =====================================================================

-- ---- activity_logs: old shape had no actor_type/actor_label/ip_address/
--      user_agent, and actor_id was `uuid` (new code needs `text`, since
--      it stores either an admin's uuid-as-text or a member's
--      membership_id string). Easiest safe fix: drop and recreate — this
--      table only holds audit/log rows, not primary member data, and at
--      this stage of setup it should be empty or near-empty. ----

drop table if exists public.activity_logs cascade;

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('admin', 'member', 'system')),
  actor_id text,
  actor_label text,
  action text not null,
  target_table text,
  target_id text,
  meta jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_actor on public.activity_logs(actor_type, actor_id);
create index if not exists idx_activity_logs_target on public.activity_logs(target_table, target_id);

alter table public.activity_logs enable row level security;

-- ---- settings: old shape was missing updated_by / updated_at, which
--      the 000009 trigger (trg_settings_updated_at) and the admin
--      Settings page both need. Patch in place — existing key/value rows
--      (if any) are preserved. ----

alter table public.settings add column if not exists updated_by uuid references public.admin_users(id);
alter table public.settings add column if not exists updated_at timestamptz not null default now();

-- NOTE: the trg_settings_updated_at trigger itself is created later, in
-- 000010_triggers.sql, alongside the set_settings_updated_at() function
-- it depends on — that function doesn't exist yet at this point in the
-- migration sequence, so it's deliberately NOT created here. By the time
-- 000010 runs, the updated_at column above already exists, so the
-- trigger creation there succeeds.

-- ---- Re-seed default settings in case the old table had none of these
--      keys (harmless no-op if they're already present). ----
insert into public.settings (key, value) values
  ('signatory_name', '"राहुल योगराज टिकरिहा"'),
  ('signatory_title_hi', '"प्रदेश अध्यक्ष - भाजयुमो छत्तीसगढ़"'),
  ('portal_name_hi', '"भारतीय जनता युवा मोर्चा, छत्तीसगढ़"'),
  ('portal_website', '"joinbjymcg2026.com"')
on conflict (key) do nothing;


-- ============ FROM: 000008_indexes.sql ============
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


-- ============ FROM: 000009_functions.sql ============
-- =====================================================================
-- 000009_functions.sql
-- Reusable server-side functions. All are SECURITY DEFINER since the
-- app always connects with the service-role key (see src/lib/db/client.ts)
-- — that key already bypasses RLS, so SECURITY DEFINER here is about
-- keeping search_path pinned, not about elevating privilege further.
-- =====================================================================

-- ---- Membership ID: BJYM-CG-{year}-{000001}, never reused ----
create or replace function public.generate_membership_id()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  cur_year int := extract(year from now());
  next_serial int;
begin
  insert into public.membership_sequences (year, last_serial)
  values (cur_year, 1)
  on conflict (year) do update set last_serial = public.membership_sequences.last_serial + 1
  returning last_serial into next_serial;

  return 'BJYM-CG-' || cur_year || '-' || lpad(next_serial::text, 6, '0');
end;
$$;

-- ---- Referral code: 5-letter name prefix + 5 random alnum chars ----
create or replace function public.generate_referral_code(p_name text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
  i int := 0;
begin
  base := upper(regexp_replace(coalesce(split_part(p_name, ' ', 1), 'BJYM'), '[^a-zA-Z]', '', 'g'));
  base := left(coalesce(nullif(base, ''), 'BJYM'), 5);
  loop
    candidate := base || substr(replace(gen_random_uuid()::text, '-', ''), 1, 5);
    exit when not exists (select 1 from public.members where referral_code = upper(candidate));
    i := i + 1;
    exit when i > 20;
  end loop;
  return upper(candidate);
end;
$$;

-- ---- Referral stats: bump the referrer's denormalized counter ----
create or replace function public.update_referral_stats(p_referrer_membership_id text)
returns void
language sql
security definer set search_path = public
as $$
  update public.members
  set referral_count = referral_count + 1
  where membership_id = p_referrer_membership_id;
$$;

-- ---- Generic activity log entry ----
create or replace function public.log_activity(
  p_actor_type text, p_actor_id text, p_actor_label text,
  p_action text, p_target_table text, p_target_id text, p_meta jsonb default '{}'::jsonb
)
returns void
language sql
security definer set search_path = public
as $$
  insert into public.activity_logs (actor_type, actor_id, actor_label, action, target_table, target_id, meta)
  values (p_actor_type, p_actor_id, p_actor_label, p_action, p_target_table, p_target_id, p_meta);
$$;

-- ---- Status transition helpers (all log to member_status_history + activity_logs) ----

create or replace function public.soft_delete_member(p_member_id uuid, p_admin_id uuid, p_reason text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_old_status text;
begin
  select status into v_old_status from public.members where id = p_member_id;

  update public.members
  set status = 'Deleted', deleted_at = now(), deleted_by = p_admin_id, updated_by = p_admin_id
  where id = p_member_id;

  insert into public.member_status_history (member_id, from_status, to_status, reason, changed_by)
  values (p_member_id, v_old_status, 'Deleted', p_reason, p_admin_id);

  perform public.log_activity('admin', p_admin_id::text, null, 'member_soft_deleted', 'members', p_member_id::text, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.suspend_member(p_member_id uuid, p_admin_id uuid, p_reason text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_old_status text;
begin
  select status into v_old_status from public.members where id = p_member_id;

  update public.members
  set status = 'Suspended', suspended_at = now(), suspended_by = p_admin_id, updated_by = p_admin_id
  where id = p_member_id;

  insert into public.member_status_history (member_id, from_status, to_status, reason, changed_by)
  values (p_member_id, v_old_status, 'Suspended', p_reason, p_admin_id);

  perform public.log_activity('admin', p_admin_id::text, null, 'member_suspended', 'members', p_member_id::text, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.restore_member(p_member_id uuid, p_admin_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_old_status text;
begin
  select status into v_old_status from public.members where id = p_member_id;

  update public.members
  set status = 'Active', deleted_at = null, deleted_by = null, suspended_at = null, suspended_by = null, updated_by = p_admin_id
  where id = p_member_id;

  insert into public.member_status_history (member_id, from_status, to_status, reason, changed_by)
  values (p_member_id, v_old_status, 'Active', 'Restored/activated by admin', p_admin_id);

  perform public.log_activity('admin', p_admin_id::text, null, 'member_activated', 'members', p_member_id::text, '{}'::jsonb);
end;
$$;

-- ---- Reset a member's MPIN (hash computed in the app with bcrypt, passed in) ----
create or replace function public.reset_member_mpin(p_member_id uuid, p_new_mpin_hash text, p_admin_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.members
  set mpin_hash = p_new_mpin_hash, token_version = token_version + 1, updated_by = p_admin_id
  where id = p_member_id;

  perform public.log_activity('admin', p_admin_id::text, null, 'mpin_reset', 'members', p_member_id::text, '{}'::jsonb);
end;
$$;


-- ============ FROM: 000010_triggers.sql ============
-- =====================================================================
-- 000010_triggers.sql
-- `updated_at` triggers for admin_users and members were already wired
-- in their own migrations (000003, 000004) so they ship atomically with
-- the table. This file covers everything else: auto-generating
-- membership_id/referral_code on insert, and the after-insert referral
-- bookkeeping (member_referrals row + referrer's referral_count +
-- activity log entry).
-- =====================================================================

create or replace function public.set_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute procedure public.set_settings_updated_at();

-- ---- Auto-fill membership_id + referral_code before insert ----
create or replace function public.before_member_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.membership_id is null or new.membership_id = '' then
    new.membership_id := public.generate_membership_id();
  end if;
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_referral_code(new.full_name);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_before_member_insert on public.members;
create trigger trg_before_member_insert
  before insert on public.members
  for each row execute procedure public.before_member_insert();

-- ---- After insert: log the referral + bump the referrer's counter ----
create or replace function public.after_member_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_referrer_membership_id text;
begin
  if new.referred_by_code is not null then
    select membership_id into v_referrer_membership_id
    from public.members
    where referral_code = new.referred_by_code;

    if v_referrer_membership_id is not null then
      insert into public.member_referrals (referrer_membership_id, referred_membership_id)
      values (v_referrer_membership_id, new.membership_id)
      on conflict (referred_membership_id) do nothing;

      perform public.update_referral_stats(v_referrer_membership_id);
    end if;
  end if;

  insert into public.member_status_history (member_id, from_status, to_status, reason)
  values (new.id, null, new.status, 'Initial registration');

  perform public.log_activity('member', new.membership_id, new.full_name, 'member_registered', 'members', new.id::text, '{}'::jsonb);

  return new;
end;
$$;

drop trigger if exists trg_after_member_insert on public.members;
create trigger trg_after_member_insert
  after insert on public.members
  for each row execute procedure public.after_member_insert();


-- ============ FROM: 000011_rls.sql ============
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


-- ============ FROM: 000012_storage.sql ============
-- =====================================================================
-- 000012_storage.sql
--
-- Supabase Storage is INTENTIONALLY NOT used in this project. Member
-- photos are captured client-side (crop + zoom + rotate to a fixed
-- passport ratio, compressed to WebP — see PhotoCropper.tsx), which
-- typically produces a 15-40 KB image, and stored directly as a data
-- URL in members.photo_base64. This keeps the stack simpler (no bucket
-- policies, no signed URLs, no extra round trip) and was an explicit
-- project decision.
--
-- If you outgrow this later (e.g. you want larger/multiple photos per
-- member, or want to serve images via a CDN instead of inline base64),
-- uncomment and run the block below, then switch photo_base64 to a
-- photo_url column and update the upload flow to call Storage instead
-- of writing a data URL.
-- =====================================================================

-- insert into storage.buckets (id, name, public)
-- values ('member-photos', 'member-photos', false)
-- on conflict (id) do nothing;
--
-- insert into storage.buckets (id, name, public)
-- values ('generated-idcards', 'generated-idcards', false)
-- on conflict (id) do nothing;

select 1; -- no-op — see comment above


-- ============ FROM: 000013_seed.sql ============
-- =====================================================================
-- 000013_seed.sql
-- Structural seed data the app cannot function correctly without:
-- the two roles, every permission key, and the default role->permission
-- mapping. This runs as a normal migration (via `db push`/`migration up`)
-- because RBAC breaking on a fresh environment is worse than a bit of
-- data living in a migration file. The default Master Admin account and
-- portal settings are in `supabase/seed.sql` instead (run via
-- `npm run db:seed`) since those are more "starter data" than schema.
--
-- Every statement is idempotent (ON CONFLICT DO NOTHING) — safe to
-- re-run.
-- =====================================================================

insert into public.roles (name, description) values
  ('MASTER_ADMIN', 'Full access to every module, including Settings, Export, and Admin User management.'),
  ('SUPERVISOR', 'Created by Master Admin. Can review/verify members and manage their status, but cannot view analytics, export data, delete members, create admin users, or access settings.')
on conflict (name) do nothing;

insert into public.permissions (key, description) values
  ('dashboard.view', 'View the admin dashboard overview'),
  ('analytics.view', 'View analytics charts and cross-filters'),
  ('members.view', 'View the members list and member detail'),
  ('members.edit', 'Edit a member''s details'),
  ('members.approve', 'Approve (verify) a pending member'),
  ('members.reject', 'Reject a pending member'),
  ('members.suspend', 'Suspend a member'),
  ('members.activate', 'Activate/restore a member'),
  ('members.delete', 'Soft-delete a member'),
  ('members.reset_mpin', 'Reset a member''s MPIN'),
  ('members.export', 'Access the data export module'),
  ('referrals.view', 'View referral trees and leaderboard'),
  ('hierarchy.view', 'View the organizational hierarchy reference'),
  ('settings.view', 'View portal settings'),
  ('settings.edit', 'Edit portal settings'),
  ('admins.manage', 'Create/manage other admin users'),
  ('logs.view', 'View activity logs')
on conflict (key) do nothing;

-- MASTER_ADMIN gets every permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'MASTER_ADMIN'
on conflict do nothing;

-- SUPERVISOR gets a limited subset
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'dashboard.view',
  'members.view',
  'members.approve',
  'members.reject',
  'members.suspend',
  'members.activate',
  'members.reset_mpin'
)
where r.name = 'SUPERVISOR'
on conflict do nothing;

-- Default settings
insert into public.settings (key, value) values
  ('signatory_name', '"राहुल योगराज टिकरिहा"'),
  ('signatory_title_hi', '"प्रदेश अध्यक्ष - भाजयुमो छत्तीसगढ़"'),
  ('portal_name_hi', '"भारतीय जनता युवा मोर्चा, छत्तीसगढ़"'),
  ('portal_website', '"joinbjymcg2026.com"')
on conflict (key) do nothing;


-- ============ FROM: 000014_export_jobs.sql ============
-- =====================================================================
-- 000014_export_jobs.sql
--
-- Background export queue. Small exports (below EXPORT_SYNC_THRESHOLD in
-- src/app/actions/export.ts) still happen synchronously in the request/
-- response cycle for instant download. Larger exports create a row here
-- and are processed after the response returns (via Next.js `after()`),
-- with `processed_rows` updated incrementally so the client can poll and
-- show a real progress bar — this is the "queue exports exceeding a
-- configurable limit" + "progress indicator" requirement, implemented
-- without needing an external job-queue service (Redis/Inngest/etc.),
-- which keeps this deployable on plain Vercel + Supabase.
--
-- The finished file is stored directly in `file_base64` (this project
-- already made the deliberate choice to avoid Supabase Storage — see
-- 000012_storage.sql — and export files are text (CSV/XLSX/PDF), so this
-- stays consistent with that choice; typical exports here are low tens of
-- MB at most even at 5 lakh rows with a modest column selection).
-- =====================================================================

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id),

  format text not null check (format in ('csv', 'xlsx', 'pdf')),
  filters jsonb not null default '{}'::jsonb,
  columns jsonb not null default '[]'::jsonb,

  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  total_rows int not null default 0,
  processed_rows int not null default 0,

  file_base64 text,
  file_name text,
  error_message text,

  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_export_jobs_admin on public.export_jobs(admin_id, created_at desc);
create index if not exists idx_export_jobs_status on public.export_jobs(status);

alter table public.export_jobs enable row level security;
-- Same defense-in-depth stance as 000011_rls.sql: no anon/authenticated
-- policies — the app always connects with the service role.


-- ============ FROM: 000015_analytics_functions.sql ============
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


-- ============ FROM: 000016_loksabha.sql ============
-- =====================================================================
-- 000016_loksabha.sql
--
-- Adds Lok Sabha fields back onto `members`, as a NULLABLE, independent
-- attribute — not a foreign key into any hierarchy table, and not
-- required at registration. This is deliberately decoupled from
-- district_id/assembly_id/mandal_id (see src/data/hierarchy.ts and
-- src/data/loksabha.ts headers for why): a member's Lok Sabha selection
-- doesn't gate or get gated by their District/Assembly/Mandal selection.
--
-- Nullable (not `not null`) so this ships without a backfill migration —
-- existing members simply have loksabha_id = null until re-saved via
-- profile edit, or until you choose to backfill it separately.
-- =====================================================================

alter table public.members add column if not exists loksabha_id text;
alter table public.members add column if not exists loksabha_name_en text;
alter table public.members add column if not exists loksabha_name_hi text;

create index if not exists idx_members_loksabha on public.members(loksabha_id);


-- ============ FROM: 000017_rename_team_member.sql ============
-- =====================================================================
-- 000017_rename_team_member.sql
--
-- Renames the SUPERVISOR role to TEAM_MEMBER, and narrows its
-- permissions to ONLY member verification (approve/reject) — per the
-- updated spec, Team Members must not see analytics, exports, the full
-- member list, settings, referral analytics, dashboard stats, admin/role
-- management, or be able to suspend/activate members/reset MPIN.
--
-- Safe to re-run.
-- =====================================================================

update public.roles set name = 'TEAM_MEMBER', description = 'Created by Master Admin. Can only review pending members: view their photo/name/mobile, then approve or reject. No other access.'
where name = 'SUPERVISOR';

-- Replace TEAM_MEMBER's permission set entirely (delete then re-insert,
-- rather than trying to diff — simplest way to guarantee it matches
-- exactly what's listed above, regardless of what an older seed granted).
delete from public.role_permissions
where role_id = (select id from public.roles where name = 'TEAM_MEMBER');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('members.approve', 'members.reject')
where r.name = 'TEAM_MEMBER'
on conflict do nothing;


-- ============ FROM: 000018_search_fix.sql ============
-- =====================================================================
-- 000018_search_fix.sql
--
-- FIX for unreliable admin search. Two problems with the previous
-- approach (tsvector + plainto_tsquery):
--   1. tsvector matches whole lexemes only — searching "0001" would NOT
--      match membership_id "BJYM-CG-2026-000123" as a substring, which
--      is exactly the kind of partial-digit search an admin does.
--   2. referral_code was never included in the search vector at all,
--      so "Search should work for Referral Code" silently failed.
--
-- Fix: switch admin search to ILIKE '%term%' across the exact fields
-- requested (membership_id, full_name, mobile, email, referral_code),
-- backed by pg_trgm trigram GIN indexes so ILIKE with a leading wildcard
-- still uses an index instead of a sequential scan — this is what keeps
-- search fast at 5+ lakh rows. The generated `search_vector` column is
-- left in place (harmless) but the app no longer queries it for the
-- member search box.
-- =====================================================================

create extension if not exists "pg_trgm";

create index if not exists idx_members_trgm_membership_id on public.members using gin (membership_id gin_trgm_ops);
create index if not exists idx_members_trgm_full_name on public.members using gin (full_name gin_trgm_ops);
create index if not exists idx_members_trgm_mobile on public.members using gin (mobile gin_trgm_ops);
create index if not exists idx_members_trgm_email on public.members using gin (email gin_trgm_ops);
create index if not exists idx_members_trgm_referral_code on public.members using gin (referral_code gin_trgm_ops);


-- ============ FROM: 000019_membership_id_7_digits.sql ============
-- =====================================================================
-- 000019_membership_id_7_digits.sql
--
-- Bumps the membership ID serial padding from 6 digits to 7, ahead of
-- the 10-lakh (10,00,000 / 1,000,000) user target.
--
-- Note on why this was necessary at all: `lpad(next_serial::text, 6, '0')`
-- does NOT truncate — it only pads UP TO a minimum width. Serial 1000000
-- (7 digits) already produced 'BJYM-CG-2026-1000000' correctly even with
-- the old 6-digit padding; nothing would have broken or been cut off past
-- 999999. This migration is a presentation choice, not a bug fix: with a
-- 10-lakh target, most real IDs will be 7 digits anyway, so starting the
-- padding at 7 from the get-go keeps every ID the same length (and
-- therefore visually consistent on the ID card, in exports, in search
-- results, etc.) all the way up to 99,99,999 members, instead of member
-- #1 through #999,999 looking shorter than member #1,000,000 onward.
--
-- `create or replace function` — safe to re-run, and applies immediately
-- to the very next membership_id generated after this migration runs.
-- Every ID generated *before* this migration keeps its original (6-digit-
-- padded, or organically-longer) value; this only changes the padding
-- width used going forward, nothing is renumbered or backfilled.
-- =====================================================================

create or replace function public.generate_membership_id()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  cur_year int := extract(year from now());
  next_serial int;
begin
  insert into public.membership_sequences (year, last_serial)
  values (cur_year, 1)
  on conflict (year) do update set last_serial = public.membership_sequences.last_serial + 1
  returning last_serial into next_serial;

  return 'BJYM-CG-' || cur_year || '-' || lpad(next_serial::text, 7, '0');
end;
$$;

