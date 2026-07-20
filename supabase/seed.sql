-- =====================================================================
-- supabase/seed.sql
--
-- Run via: npm run db:seed   (or automatically by `supabase db reset`)
--
-- Creates the single default Master Admin account. Uses pgcrypto's
-- blowfish crypt() to produce a standard $2a$/$2b$ bcrypt hash — this is
-- byte-for-byte compatible with the bcryptjs library the app itself uses
-- (src/lib/auth/password.ts), so this admin can log in immediately.
--
-- CHANGE THE PASSWORD before running this against a real/production
-- database — 'bjym2026' is a placeholder default matching the project
-- brief, not something to ship live with.
-- =====================================================================

insert into public.admin_users (username, password_hash, full_name, role_id)
select
  'divyanshukaushik',
  crypt('bjym2026', gen_salt('bf')),
  'Divyanshu Kaushik',
  r.id
from public.roles r
where r.name = 'MASTER_ADMIN'
on conflict (username) do nothing;
