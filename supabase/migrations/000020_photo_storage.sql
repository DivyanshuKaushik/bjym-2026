-- =====================================================================
-- 000020_photo_storage.sql
--
-- Moves member photos out of the database (base64 text in `photo_base64`,
-- which bloated every row and every query result) and into Supabase
-- Storage instead. This migration is purely ADDITIVE and non-breaking:
--
--   - `photo_base64` is untouched — existing members keep working exactly
--     as before, no data is moved or deleted by this migration.
--   - Two new nullable columns are added: `photo_url` (the URL the app
--     should render) and `photo_storage_path` (the object path inside
--     the bucket, needed to delete/replace/re-sign the file later).
--   - New registrations (after this migration + the matching app-code
--     deploy) write ONLY photo_url/photo_storage_path, leaving
--     photo_base64 null.
--   - A later, separate, standalone script (scripts/migrate-photos.mjs)
--     backfills existing photo_base64 rows into Storage at your own
--     pace — this migration does not run that automatically.
-- =====================================================================

alter table public.members add column if not exists photo_url text;
alter table public.members add column if not exists photo_storage_path text;

create index if not exists idx_members_photo_url on public.members(photo_url) where photo_url is not null;

-- ---- Storage bucket ----
-- Public-READ bucket: a member's own digital ID card photo is meant to
-- be shown/shared (that's the whole point of a "digital membership
-- card"), similar in sensitivity to a LinkedIn profile photo — so public
-- read access on a per-object basis (object paths aren't listable/
-- browsable, only fetchable if you already have the exact path/URL) is
-- an acceptable, much simpler default than signed URLs with expiry
-- management. Writes are still locked down below. If you'd rather keep
-- photos fully private, switch `public` to `false` here and generate
-- short-lived signed URLs server-side instead (the app's repository
-- layer already isolates all photo reads/writes behind a couple of
-- functions, so that swap is contained — see src/lib/storage/photos.ts).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-photos', 'member-photos', true, 2097152, array['image/webp', 'image/jpeg', 'image/png','image/jpg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---- Storage RLS ----
-- This app never uses the Supabase anon/authenticated client roles at
-- all (every DB/Storage call goes through the service-role key,
-- server-side only — see src/lib/db/client.ts) — the service role
-- bypasses RLS entirely regardless of these policies. They exist as
-- defense-in-depth / explicit documentation of intent, in case this
-- project's Storage is ever accessed a different way in the future:
-- public can READ objects in this bucket (needed for member/public ID
-- card photo display), but only the service role can write.

drop policy if exists "member-photos public read" on storage.objects;
create policy "member-photos public read"
  on storage.objects for select
  using (bucket_id = 'member-photos');

drop policy if exists "member-photos no anon writes" on storage.objects;
create policy "member-photos no anon writes"
  on storage.objects for insert
  with check (bucket_id = 'member-photos' and auth.role() = 'service_role');

drop policy if exists "member-photos no anon updates" on storage.objects;
create policy "member-photos no anon updates"
  on storage.objects for update
  using (bucket_id = 'member-photos' and auth.role() = 'service_role');

drop policy if exists "member-photos no anon deletes" on storage.objects;
create policy "member-photos no anon deletes"
  on storage.objects for delete
  using (bucket_id = 'member-photos' and auth.role() = 'service_role');
