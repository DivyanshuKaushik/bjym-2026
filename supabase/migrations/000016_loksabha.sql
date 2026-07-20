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
