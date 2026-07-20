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
