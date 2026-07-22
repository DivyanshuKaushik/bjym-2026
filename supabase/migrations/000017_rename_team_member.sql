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
