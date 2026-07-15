-- =====================================================================
-- BJYM Chhattisgarh Digital Membership Portal
-- ONE-TIME MIGRATION SCRIPT
-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE everywhere.
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. HIERARCHY TABLES (District -> Assembly -> Mandal)
-- =====================================================================

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  name_en text not null unique,
  name_hi text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.assemblies (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id) on delete cascade,
  name_en text not null,
  name_hi text not null,
  created_at timestamptz not null default now(),
  unique (district_id, name_en)
);

create table if not exists public.mandals (
  id uuid primary key default gen_random_uuid(),
  assembly_id uuid not null references public.assemblies(id) on delete cascade,
  name_en text not null,
  name_hi text not null,
  created_at timestamptz not null default now(),
  unique (assembly_id, name_en)
);

create index if not exists idx_assemblies_district on public.assemblies(district_id);
create index if not exists idx_mandals_assembly on public.mandals(assembly_id);

-- =====================================================================
-- 2. PROFILES (mirrors auth.users, holds role)
-- =====================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 3. MEMBERSHIP SEQUENCES (per-year auto-increment, never reused)
-- =====================================================================

create table if not exists public.membership_sequences (
  year int primary key,
  last_serial int not null default 0
);

create or replace function public.generate_membership_id()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  cur_year int := extract(year from now());
  next_serial int;
  new_id text;
begin
  insert into public.membership_sequences (year, last_serial)
  values (cur_year, 1)
  on conflict (year) do update set last_serial = public.membership_sequences.last_serial + 1
  returning last_serial into next_serial;

  new_id := 'BJYM-CG-' || cur_year || '-' || lpad(next_serial::text, 6, '0');
  return new_id;
end;
$$;

-- =====================================================================
-- 4. MEMBERSHIPS
-- =====================================================================

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  membership_id text not null unique,

  photo_base64 text,
  full_name text not null,
  father_name text not null,
  dob date not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  phone text not null unique,
  email text not null unique,
  address text not null,
  pincode text not null,

  district_id uuid references public.districts(id),
  assembly_id uuid references public.assemblies(id),
  mandal_id uuid references public.mandals(id),
  booth text not null,

  whatsapp text,
  facebook text,
  instagram text,
  twitter text,

  referral_code text not null unique,
  referred_by_code text references public.memberships(referral_code),

  status text not null default 'Active' check (status in ('Active', 'Suspended', 'Deleted')),
  joined_at timestamptz not null default now()
);

create index if not exists idx_memberships_district on public.memberships(district_id);
create index if not exists idx_memberships_assembly on public.memberships(assembly_id);
create index if not exists idx_memberships_mandal on public.memberships(mandal_id);
create index if not exists idx_memberships_status on public.memberships(status);
create index if not exists idx_memberships_joined_at on public.memberships(joined_at);
create index if not exists idx_memberships_referred_by on public.memberships(referred_by_code);
create index if not exists idx_memberships_search on public.memberships using gin (
  to_tsvector('simple', coalesce(full_name,'') || ' ' || coalesce(membership_id,'') || ' ' || coalesce(phone,'') || ' ' || coalesce(email,''))
);

-- Generate a short unique referral code from the member's name
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
    exit when not exists (select 1 from public.memberships where referral_code = upper(candidate));
    i := i + 1;
    exit when i > 20;
  end loop;
  return upper(candidate);
end;
$$;

-- Auto-fill membership_id + referral_code on insert if not provided
create or replace function public.before_membership_insert()
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

drop trigger if exists trg_before_membership_insert on public.memberships;
create trigger trg_before_membership_insert
  before insert on public.memberships
  for each row execute procedure public.before_membership_insert();

-- =====================================================================
-- 5. REFERRALS (materialized log of who joined via whom)
-- =====================================================================

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_membership_id text not null references public.memberships(membership_id) on delete cascade,
  referred_membership_id text not null unique references public.memberships(membership_id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_referrer on public.referrals(referrer_membership_id);

create or replace function public.after_membership_insert_referral()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  referrer_id text;
begin
  if new.referred_by_code is not null then
    select membership_id into referrer_id from public.memberships where referral_code = new.referred_by_code;
    if referrer_id is not null then
      insert into public.referrals (referrer_membership_id, referred_membership_id)
      values (referrer_id, new.membership_id)
      on conflict (referred_membership_id) do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_after_membership_insert_referral on public.memberships;
create trigger trg_after_membership_insert_referral
  after insert on public.memberships
  for each row execute procedure public.after_membership_insert_referral();

-- =====================================================================
-- 6. ACTIVITY LOGS + SETTINGS
-- =====================================================================

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_table text,
  target_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

insert into public.settings (key, value) values
  ('signatory_name', '"Rahul Yograj Tikariha"'),
  ('signatory_title_hi', '"प्रदेश अध्यक्ष"'),
  ('portal_name_hi', '"भारतीय जनता युवा मोर्चा - छत्तीसगढ़"')
on conflict (key) do nothing;

-- =====================================================================
-- 7. HELPER: current user's role (used inside RLS policies)
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- 8. PUBLIC VERIFICATION RPC (safe, limited columns, no auth required)
-- =====================================================================

create or replace function public.verify_membership(p_membership_id text)
returns table (
  membership_id text,
  full_name text,
  photo_base64 text,
  district_name_hi text,
  assembly_name_hi text,
  mandal_name_hi text,
  status text,
  joined_at timestamptz
)
language sql
security definer set search_path = public
stable
as $$
  select
    m.membership_id,
    m.full_name,
    m.photo_base64,
    d.name_hi,
    a.name_hi,
    md.name_hi,
    m.status,
    m.joined_at
  from public.memberships m
  left join public.districts d on d.id = m.district_id
  left join public.assemblies a on a.id = m.assembly_id
  left join public.mandals md on md.id = m.mandal_id
  where m.membership_id = p_membership_id;
$$;

grant execute on function public.verify_membership(text) to anon, authenticated;

-- =====================================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================================

alter table public.districts enable row level security;
alter table public.assemblies enable row level security;
alter table public.mandals enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.referrals enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;
alter table public.membership_sequences enable row level security;

-- Hierarchy: readable by everyone (needed on public registration form), writable by admin only
drop policy if exists "hierarchy_read_all" on public.districts;
create policy "hierarchy_read_all" on public.districts for select using (true);
drop policy if exists "hierarchy_admin_write" on public.districts;
create policy "hierarchy_admin_write" on public.districts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "hierarchy_read_all" on public.assemblies;
create policy "hierarchy_read_all" on public.assemblies for select using (true);
drop policy if exists "hierarchy_admin_write" on public.assemblies;
create policy "hierarchy_admin_write" on public.assemblies for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "hierarchy_read_all" on public.mandals;
create policy "hierarchy_read_all" on public.mandals for select using (true);
drop policy if exists "hierarchy_admin_write" on public.mandals;
create policy "hierarchy_admin_write" on public.mandals for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: user sees/updates own row; admin sees all
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- Memberships: member manages own; admin manages all
drop policy if exists "memberships_self_select" on public.memberships;
create policy "memberships_self_select" on public.memberships for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "memberships_self_insert" on public.memberships;
create policy "memberships_self_insert" on public.memberships for insert with check (profile_id = auth.uid());
drop policy if exists "memberships_update" on public.memberships;
create policy "memberships_update" on public.memberships for update using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "memberships_admin_delete" on public.memberships;
create policy "memberships_admin_delete" on public.memberships for delete using (public.is_admin());

-- Referrals: referrer member can see own referrals; admin sees all
drop policy if exists "referrals_select" on public.referrals;
create policy "referrals_select" on public.referrals for select using (
  public.is_admin() or
  exists (select 1 from public.memberships m where m.membership_id = referrals.referrer_membership_id and m.profile_id = auth.uid())
);

-- Activity logs + settings + sequences: admin only (settings read may be public for ID card signatory)
drop policy if exists "activity_logs_admin" on public.activity_logs;
create policy "activity_logs_admin" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_read_all" on public.settings;
create policy "settings_read_all" on public.settings for select using (true);
drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for insert with check (public.is_admin());
drop policy if exists "settings_admin_update" on public.settings;
create policy "settings_admin_update" on public.settings for update using (public.is_admin());

drop policy if exists "sequences_admin_only" on public.membership_sequences;
create policy "sequences_admin_only" on public.membership_sequences for all using (public.is_admin());

-- =====================================================================
-- 10. SEED: Chhattisgarh hierarchy (sample — extend via Admin > Hierarchy)
-- =====================================================================

insert into public.districts (name_en, name_hi) values
  ('Janjgir-Champa', 'जांजगीर-चांपा'),
  ('Bilaspur', 'बिलासपुर'),
  ('Raipur', 'रायपुर'),
  ('Korba', 'कोरबा'),
  ('Raigarh', 'रायगढ़'),
  ('Durg', 'दुर्ग')
on conflict (name_en) do nothing;

insert into public.assemblies (district_id, name_en, name_hi)
select d.id, a.name_en, a.name_hi from public.districts d
join (values
  ('Janjgir-Champa', 'Janjgir', 'जांजगीर'),
  ('Janjgir-Champa', 'Champa', 'चांपा'),
  ('Janjgir-Champa', 'Akaltara', 'अकलतरा'),
  ('Janjgir-Champa', 'Pamgarh', 'पामगढ़'),
  ('Bilaspur', 'Bilaspur', 'बिलासपुर'),
  ('Bilaspur', 'Bilha', 'बिल्हा'),
  ('Bilaspur', 'Takhatpur', 'तखतपुर'),
  ('Raipur', 'Raipur North', 'रायपुर उत्तर'),
  ('Raipur', 'Raipur South', 'रायपुर दक्षिण'),
  ('Raipur', 'Raipur Rural', 'रायपुर ग्रामीण'),
  ('Korba', 'Korba', 'कोरबा'),
  ('Korba', 'Katghora', 'कटघोरा'),
  ('Raigarh', 'Raigarh', 'रायगढ़'),
  ('Raigarh', 'Kharsia', 'खरसिया'),
  ('Durg', 'Durg City', 'दुर्ग शहर'),
  ('Durg', 'Bhilai Nagar', 'भिलाई नगर')
) as a(district_en, name_en, name_hi) on d.name_en = a.district_en
on conflict (district_id, name_en) do nothing;

insert into public.mandals (assembly_id, name_en, name_hi)
select ase.id, m.mandal_en, m.mandal_hi from public.assemblies ase
join (values
  ('Janjgir', 'Mandal 01', 'मंडल 01'), ('Janjgir', 'Mandal 02', 'मंडल 02'),
  ('Champa', 'Mandal 01', 'मंडल 01'), ('Champa', 'Mandal 02', 'मंडल 02'),
  ('Akaltara', 'Mandal 01', 'मंडल 01'),
  ('Pamgarh', 'Mandal 01', 'मंडल 01'),
  ('Bilaspur', 'Mandal 01', 'मंडल 01'), ('Bilaspur', 'Mandal 02', 'मंडल 02'),
  ('Bilha', 'Mandal 01', 'मंडल 01'),
  ('Takhatpur', 'Mandal 01', 'मंडल 01'),
  ('Raipur North', 'Mandal 01', 'मंडल 01'),
  ('Raipur South', 'Mandal 01', 'मंडल 01'),
  ('Raipur Rural', 'Mandal 01', 'मंडल 01'),
  ('Korba', 'Mandal 01', 'मंडल 01'),
  ('Katghora', 'Mandal 01', 'मंडल 01'),
  ('Raigarh', 'Mandal 01', 'मंडल 01'),
  ('Kharsia', 'Mandal 01', 'मंडल 01'),
  ('Durg City', 'Mandal 01', 'मंडल 01'),
  ('Bhilai Nagar', 'Mandal 01', 'मंडल 01')
) as m(assembly_en, mandal_en, mandal_hi) on ase.name_en = m.assembly_en
on conflict (assembly_id, name_en) do nothing;

-- =====================================================================
-- DONE. Next step: create the Master Admin user — see scripts/create-admin.mjs
-- =====================================================================
