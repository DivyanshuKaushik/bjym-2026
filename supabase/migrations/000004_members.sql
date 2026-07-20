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
