-- =====================================================================
-- 000014_export_jobs.sql
--
-- Background export queue. Small exports (below EXPORT_SYNC_THRESHOLD in
-- src/app/actions/export.ts) still happen synchronously in the request/
-- response cycle for instant download. Larger exports create a row here
-- and are processed after the response returns (via Next.js `after()`),
-- with `processed_rows` updated incrementally so the client can poll and
-- show a real progress bar — this is the "queue exports exceeding a
-- configurable limit" + "progress indicator" requirement, implemented
-- without needing an external job-queue service (Redis/Inngest/etc.),
-- which keeps this deployable on plain Vercel + Supabase.
--
-- The finished file is stored directly in `file_base64` (this project
-- already made the deliberate choice to avoid Supabase Storage — see
-- 000012_storage.sql — and export files are text (CSV/XLSX/PDF), so this
-- stays consistent with that choice; typical exports here are low tens of
-- MB at most even at 5 lakh rows with a modest column selection).
-- =====================================================================

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admin_users(id),

  format text not null check (format in ('csv', 'xlsx', 'pdf')),
  filters jsonb not null default '{}'::jsonb,
  columns jsonb not null default '[]'::jsonb,

  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  total_rows int not null default 0,
  processed_rows int not null default 0,

  file_base64 text,
  file_name text,
  error_message text,

  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_export_jobs_admin on public.export_jobs(admin_id, created_at desc);
create index if not exists idx_export_jobs_status on public.export_jobs(status);

alter table public.export_jobs enable row level security;
-- Same defense-in-depth stance as 000011_rls.sql: no anon/authenticated
-- policies — the app always connects with the service role.
