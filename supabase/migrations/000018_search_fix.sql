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
