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
