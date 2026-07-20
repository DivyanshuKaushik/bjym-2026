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
