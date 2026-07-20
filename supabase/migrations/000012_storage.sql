-- =====================================================================
-- 000012_storage.sql
--
-- Supabase Storage is INTENTIONALLY NOT used in this project. Member
-- photos are captured client-side (crop + zoom + rotate to a fixed
-- passport ratio, compressed to WebP — see PhotoCropper.tsx), which
-- typically produces a 15-40 KB image, and stored directly as a data
-- URL in members.photo_base64. This keeps the stack simpler (no bucket
-- policies, no signed URLs, no extra round trip) and was an explicit
-- project decision.
--
-- If you outgrow this later (e.g. you want larger/multiple photos per
-- member, or want to serve images via a CDN instead of inline base64),
-- uncomment and run the block below, then switch photo_base64 to a
-- photo_url column and update the upload flow to call Storage instead
-- of writing a data URL.
-- =====================================================================

-- insert into storage.buckets (id, name, public)
-- values ('member-photos', 'member-photos', false)
-- on conflict (id) do nothing;
--
-- insert into storage.buckets (id, name, public)
-- values ('generated-idcards', 'generated-idcards', false)
-- on conflict (id) do nothing;

select 1; -- no-op — see comment above
