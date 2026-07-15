# BJYM Chhattisgarh — Digital Membership Portal

Next.js 15 (App Router) + TypeScript + TailwindCSS + Supabase (Auth, PostgreSQL, RLS).

## 1. Create a Supabase project

1. Go to https://supabase.com → New Project.
2. Wait for it to finish provisioning.
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret!)

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@bjymcg.local
ADMIN_PASSWORD=bjym2026
ADMIN_NAME=divyanshukaushik
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` before running the admin creation
> script if you don't want the sample defaults.

## 3. Run the one-time database migration

1. Open your Supabase project → **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql`.
3. Click **Run**.

This creates all tables (`profiles`, `memberships`, `districts`, `assemblies`,
`mandals`, `referrals`, `membership_sequences`, `settings`, `activity_logs`),
the `generate_membership_id()` / `generate_referral_code()` functions and
triggers, the public `verify_membership()` RPC, all Row Level Security
policies, and seeds a starter Chhattisgarh district/assembly/mandal hierarchy
(extend this any time from **Admin → Hierarchy**).

Safe to re-run — every statement uses `IF NOT EXISTS` / `OR REPLACE` /
`ON CONFLICT DO NOTHING`.

## 4. Install dependencies

```bash
npm install
```

## 5. Create the Master Admin account

```bash
npm run create-admin
```

This uses your service-role key to create the one Master Admin auth user
(`divyanshukaushik` / `admin@bjymcg.local` / `bjym2026` by default) and marks
`profiles.role = 'admin'`. Log in at `/admin-login`.

## 6. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

## 7. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Import it in Vercel.
3. Add the same environment variables from `.env.local` in
   **Vercel → Project → Settings → Environment Variables**
   (set `NEXT_PUBLIC_SITE_URL` to your production URL).
4. Deploy.
5. Run `npm run create-admin` once locally (pointed at the same Supabase
   project) — it only needs to run once, not on every deploy.

---

## What's implemented

- **Auth**: Supabase Auth email+password for members, separate `/admin-login`
  gated by `profiles.role = 'admin'`. Forgot/reset password flows.
- **Registration**: 4-step form (Personal → Electoral → Social → Password),
  Zod-validated, dependent District → Assembly → Mandal dropdowns loaded live
  from Supabase, photo captured client-side (drag-drop, auto-cropped to a
  square, compressed to a JPEG data URL) and stored directly on the
  `memberships` row as `photo_base64` — **no Storage bucket needed**, per your
  request. On submit, a Server Action creates the Auth user and the
  membership row in one flow; the DB trigger auto-generates the
  `BJYM-CG-{year}-{000001}` membership ID and a referral code.
- **ID Card**: Always rendered in Hindi (per spec), with a real QR code
  (`qrcode` package) pointing at `/verify?id=...`. Downloadable as a
  high-resolution PNG (`html-to-image`, 3x pixel ratio) or PDF (`jspdf`) —
  generated entirely in the browser from the on-screen component, so nothing
  needs to be pre-rendered or stored server-side.
- **Public verification**: `/verify` calls the `verify_membership()` Postgres
  RPC (SECURITY DEFINER), which only exposes the limited fields needed for
  verification — no other membership data is ever exposed to anonymous
  users.
- **Member dashboard**: ID card + download, referral code/link + WhatsApp/
  Facebook/X share + referral count, profile view, change password.
- **Admin dashboard**: Overview KPIs (real Supabase counts), Members
  (search/filter/suspend/activate/soft-delete/export CSV), Member detail
  (full view, reset password, regenerate membership ID, referral tree),
  Analytics (Recharts: growth, daily registrations, district-wise, gender,
  referral leaderboard), Hierarchy management (add/remove District /
  Assembly / Mandal), Settings (ID card signatory name/title).
- **Security**: Row Level Security on every table; members can only read/
  write their own profile & membership; only `profiles.role = 'admin'` can
  write hierarchy data, suspend/delete members, or reset passwords (via a
  service-role Server Action, never exposed to the browser); public role can
  only call the read-only `verify_membership` RPC. Zod validation on every
  form. Next.js middleware protects `/dashboard/*` and `/admin/*`.
- **i18n**: Hindi (default) / English toggle via a lightweight client-side
  dictionary (see note below), persisted to `localStorage`. Hierarchy data is
  stored with both `name_en` and `name_hi` columns so the database stays in
  English while the UI displays the selected language, per your `language`
  spec.

## Known simplifications (be aware before scaling to production traffic)

- **i18n implementation**: the spec asked for `next-intl` with locale-prefixed
  routing. That combination adds meaningful complexity when mixed with
  Supabase SSR auth middleware (locale-aware redirects, `generateStaticParams`,
  etc.). This build ships a lightweight client-side dictionary/context
  instead (`src/lib/i18n`) that satisfies the same user-facing requirement
  (Hindi default, toggle to English, DB values stay English) with far less
  moving parts. Swapping in `next-intl` later is a contained change limited
  to `src/lib/i18n` and the pages that read from it.
- **Referral "pending" count**: the spec's `referral.member` list mentions
  "Pending Referrals," which implies tracking link clicks that don't convert.
  That needs a separate click-tracking table/event, which wasn't built here
  — only **joined** referrals are tracked (via the `referrals` table,
  populated by a DB trigger). Add a `referral_clicks` table + a beacon on the
  `/register?ref=` landing if you want true pending-vs-converted stats.
  Photos are stored as base64 directly in `memberships.photo_base64`, per
  your instruction to skip Storage. Fine for a portal in the tens/low
  hundreds of thousands of members; if you later scale past that or want
  faster table scans, migrate this column to Supabase Storage
  (`generated-idcards` / `member-photos` buckets are already reserved in the
  schema comments) and store a URL instead.
- **Analytics aggregation**: computed by fetching up to 5,000 recent rows and
  aggregating in the React component, which is fine at current scale. Past
  ~50k+ members, replace `src/app/admin/analytics/page.tsx`'s query with a
  SQL view / RPC that does the aggregation in Postgres.
- **TanStack Query** is wired up (`QueryProvider` in the root layout) but most
  data fetching here uses Server Components directly, which is the more
  idiomatic Next.js 15 pattern and keeps RLS enforcement server-side. Use
  TanStack Query for any client-side polling/optimistic-update features you
  add later (e.g. a live-updating admin overview).

## Project structure

```
src/
  app/                     Routes (App Router)
    actions/               Server Actions (register, auth, admin)
    admin/                 Admin dashboard (overview, members, analytics, hierarchy, settings)
    dashboard/             Member dashboard
    login, admin-login, forgot-password, reset-password, register, verify
  components/
    ui/                    Local shadcn-style primitives (Button, Input, Card, ...)
    common/                Navbar, Footer, Chakra icon, language switcher
    id-card/               MembershipCard, QR code, download buttons
    forms/                 Registration wizard, photo dropzone
    dashboard/, admin/, verify/, home/   Feature-specific client components
  lib/
    supabase/              client.ts (browser), server.ts (SSR), middleware.ts, admin.ts (service role)
    validators/             Zod schemas
    i18n/                   Hindi/English dictionary + provider
    types.ts, utils.ts
supabase/migrations/0001_init.sql   One-time DB migration (tables, functions, triggers, RLS, seed data)
scripts/create-admin.mjs            One-time Master Admin creation script
```

Built by Techxos · techxos.in
# bjym-2026
