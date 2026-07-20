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
