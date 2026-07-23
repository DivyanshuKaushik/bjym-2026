# BJYM Chhattisgarh — Digital Membership Portal (v3)

Next.js 15 (App Router) + TypeScript + TailwindCSS + **Auth.js (NextAuth v5)**
+ Supabase (PostgreSQL only — **not** Supabase Auth).

This is a ground-up refactor of the previous version: authentication moved
off Supabase Auth entirely (no MAU limits), members log in with
**mobile/email + MPIN** instead of a password, the org hierarchy moved out
of the database into code, and the admin side got real RBAC (Master Admin
vs Team Member) plus an export module.

---

## 1. Architecture at a glance

- **Auth**: Auth.js v5, JWT session strategy, HTTP-only cookies. Two
  Credentials providers — `member` (mobile/email + MPIN) and `admin`
  (username + password). No Supabase Auth anywhere.
- **Database**: Supabase PostgreSQL, accessed **only** via the service-role
  key from server-side code (`src/lib/db/client.ts`). The browser never
  talks to Supabase directly. Authorization is enforced in the app layer
  (NextAuth session + RBAC checks), not in Postgres RLS — RLS is enabled
  with default-deny policies purely as defense-in-depth.
- **Hierarchy**: Lok Sabha → District → Assembly → Mandal lives in
  `src/data/hierarchy.ts` (plain TypeScript), not in the database. A
  member's selected values are snapshotted (id + English/Hindi labels)
  onto their `members` row at registration time.
- **RBAC**: `roles` / `permissions` / `role_permissions` tables. An admin's
  permission list is embedded in their JWT at login; the admin sidebar and
  `middleware.ts` both filter/gate purely off that list.
- **Repository layer**: every Supabase query lives in
  `src/lib/repositories/*.repository.ts`. No component or Server Action
  writes raw `.from(...)` queries directly.

## 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, never exposed to the browser

AUTH_SECRET=replace-with-a-random-32-byte-secret   # generate: npx auth secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ADMIN_USERNAME=divyanshukaushik
ADMIN_PASSWORD=bjym2026
ADMIN_NAME=Divyanshu Kaushik
```

There is **no** `NEXT_PUBLIC_SUPABASE_ANON_KEY` in this version — the
browser has no Supabase client at all.

## 3. Database setup

**Recommended: reset first, always.** Whether this is a brand-new
Supabase project or one you've experimented with before, start every
setup (or re-setup) attempt with the reset script — it's the single
biggest source of migration errors otherwise (leftover tables/functions
from a partial earlier attempt silently conflicting with a fresh run).

1. Create a Supabase project → **Project Settings → API** → copy the
   Project URL and `service_role` key into `.env.local`.
2. **Reset**: SQL Editor → New query → paste `supabase/reset.sql` → Run.
   Safe on a brand-new project too (every `DROP` uses `IF EXISTS`).
3. **Migrate**: either
   - paste `supabase/run_all_migrations.sql` (all 16, in order) into a new
     SQL Editor query and Run, **or**
   - paste `supabase/reset_and_migrate.sql` instead of doing steps 2+3
     separately — it's reset.sql followed by all 20 migrations in one file, **or**
   - `npm run db:push` via the Supabase CLI (applies
     `supabase/migrations/*.sql` in filename order automatically).
4. Seed the default Master Admin — **either**:
   - `npm run db:seed` (runs `supabase/seed.sql` via the Supabase CLI), **or**
   - `npm run create-admin` (plain Node script, no CLI required)

   Both create username `divyanshukaushik` / password `bjym2026` — **change
   this password before going anywhere near production.**

### What each migration does

- `000001_initial_schema.sql` — extensions, shared `updated_at` trigger
  fn, RBAC tables (roles/permissions/role_permissions)
- `000002_hierarchy.sql` — intentionally a no-op (see file header —
  hierarchy lives in code, not the DB)
- `000003_admin_users.sql`
- `000004_members.sql` — the core table
- `000005_referrals.sql`
- `000006_activity_logs.sql` — activity_logs, member_status_history,
  export_history, settings
- `000007_repair_legacy_tables.sql` — only does real work if this project
  previously ran an older version of this schema (patches
  `activity_logs`/`settings` if they exist in an old shape); a no-op on a
  fresh project. Only *adds columns* here — it deliberately does **not**
  create the `trg_settings_updated_at` trigger (that needs a function
  that isn't defined until `000010_triggers.sql`; creating a trigger
  against a not-yet-existing function was a bug in an earlier version of
  this file, now fixed — see the file's own comment).
- `000008_indexes.sql`
- `000009_functions.sql` — generate_membership_id, generate_referral_code,
  update_referral_stats, soft_delete_member, suspend_member,
  restore_member, reset_member_mpin, log_activity
- `000010_triggers.sql` — defines `set_settings_updated_at()` **and**
  creates the trigger that uses it, now correctly in that order
- `000011_rls.sql` — defense-in-depth only, see file header
- `000012_storage.sql` — no-op (photos are base64, not Storage — see
  file header for why, and how to switch later)
- `000013_seed.sql` — roles, permissions, role_permissions, default
  settings (idempotent, safe as a real migration)
- `000014_export_jobs.sql` — background export job queue (Phase 2)
- `000015_analytics_functions.sql` — SQL-based aggregation functions
  for the analytics dashboard, at any table size (Phase 2)
- `000016_loksabha.sql` — adds `loksabha_id/name_en/name_hi` back onto
  `members` (nullable, additive — doesn't touch 000004); see §13 for why
  Lok Sabha is a separate, independent dataset from the District/Assembly/
  Mandal hierarchy
- `000017_rename_team_member.sql` — renames the `SUPERVISOR` role to
  `TEAM_MEMBER` and narrows its permissions to verification-only
  (`members.approve`, `members.reject`) — see §16
- `000018_search_fix.sql` — `pg_trgm` trigram indexes backing reliable
  ILIKE substring search on membership ID/name/mobile/email/referral code
  — see §16
- `000019_dashboard_kpis.sql` — single-query dashboard KPI function,
  replacing 12 separate client-side-date-math count queries — see §17
- `000020_photo_storage.sql` — `photo_url`/`photo_storage_path` columns
  + the `member-photos` Storage bucket and its RLS policies — see §17

## 4. Local development

```bash

npm install
npm run dev
```

Visit http://localhost:3000. Member registration is at `/register`, member
login at `/login`, admin login at `/admin-login`.

### Database scripts (require the Supabase CLI: `npm i -g supabase`)

```bash
npm run db:start           # start local Supabase (Docker)
npm run db:stop
npm run db:reset           # re-applies all migrations + supabase/seed.sql
npm run db:push            # push local migrations to your linked remote project
npm run db:pull            # pull remote schema down
npm run db:migrate         # apply pending migrations
npm run db:seed            # run supabase/seed.sql against the linked project
npm run db:lint
npm run db:status
npm run db:generate-types  # regenerate src/types/database.ts from the linked project
```

`src/types/database.ts` is currently hand-authored (documented at the top
of the file) so the project type-checks without a live project linked. Run
`db:generate-types` once you've linked your real project to get the
authoritative version.

## 5. Authentication flow

**Members** (`/login`, `/register`):
- Register → 3-step form → Server Action creates the `members` row
  (MPIN bcrypt-hashed, `mpin_hash` column) → auto signs in via
  `signIn("member", { identifier, mpin, ... })` → redirect to `/dashboard`.
- Login → mobile-or-email + 4-6 digit MPIN → same Credentials provider.
- "Remember Me" shortens/extends the JWT's own `exp` claim (1 day
  unchecked, 30 days checked) inside the `jwt` callback in
  `src/lib/auth/config.ts`.
- "Logout Everywhere" bumps `members.token_version`; `middleware.ts`
  compares the JWT's snapshotted `tokenVersion` against the live DB value
  on every `/dashboard/*` navigation and forces re-login on mismatch. This
  is a per-navigation check (not instant across open tabs mid-session) —
  documented trade-off of pure JWT auth without a server-side revocation
  store; upgrading to instant revocation would mean adding a Redis/DB
  denylist checked on every request, not just navigations.

**Admins** (`/admin-login`):
- Username + password (bcrypt-hashed `password_hash` on `admin_users`).
- Same "Remember Me" / "Logout Everywhere" mechanics as members, keyed off
  `admin_users.token_version`.
- On successful login, the JWT embeds `roleName` and the flat `permissions`
  string array (resolved once at login from `role_permissions`) — the
  sidebar (`AdminSidebar.tsx`) and `middleware.ts` both filter purely off
  that array, no DB round-trip needed to render the UI.

## 6. RBAC architecture

Two seeded roles:

- **MASTER_ADMIN** — every permission (see
  `src/lib/rbac/permissions.ts` → `PERMISSIONS`): dashboard, analytics,
  full member management, export, hierarchy view, settings, admin user
  management, activity logs.
- **TEAM_MEMBER** (renamed from "Supervisor") — created by a Master Admin.
  Verification only: views the pending-verification queue (photo, name,
  mobile), then approves or rejects. No dashboard stats, no member list
  browsing, no suspend/activate, no MPIN reset, no analytics/export/
  settings/admin-management — see `DEFAULT_ROLE_PERMISSIONS.TEAM_MEMBER`
  in `src/lib/rbac/permissions.ts`, which is now just
  `[MEMBERS_APPROVE, MEMBERS_REJECT]`.

Enforcement happens at **three layers**, deliberately redundant:

1. `middleware.ts` — blocks navigation to an `/admin/*` route the signed-in
   admin's permission list doesn't cover (redirects to `/admin?denied=1`).
2. Server Actions (`src/app/actions/admin.ts`, `export.ts`) — every
   mutating action calls `requirePermission(...)` before touching the DB,
   so even a direct fetch to the action (bypassing the UI) is rejected.
3. `AdminSidebar.tsx` — only renders nav items the admin has permission
   for, so the UI never shows an option they can't use.

To add a new permission: add the key to `PERMISSIONS` in
`src/lib/rbac/permissions.ts`, insert it in `000013_seed.sql`'s
`permissions` table, map it to a role in the `role_permissions` insert
right below, then gate the relevant Server Action / nav item with it.

## 7. Data export module (Master Admin only)

`/admin/export` — filters (status, verification, gender, category,
district, referral, date range, search), a remembered column selector
(persisted to `localStorage`, all 36 requested fields available), and
three formats:

- **CSV / Excel (.xlsx)** — complete filtered records.
  - **≤ 3,000 matching rows** (`EXPORT_SYNC_THRESHOLD` in
    `src/app/actions/export.ts`): built and returned inline for an instant
    download.
  - **> 3,000 rows**: automatically queued as a background job. A
    `export_jobs` row is created, then `startBackgroundExport` uses
    Next.js's `after()` API to keep fetching/appending 2,000-row pages
    *after* the response has already returned to the browser — no
    external queue service (Redis/Inngest/etc.) required, so this stays
    deployable on plain Vercel + Supabase. The client polls
    `getExportJobStatus` every 1.5s and renders a real progress bar
    (processed/total rows); on completion, the file is available from the
    **Background Job History** table on the same page. Capped at 500,000
    rows (`HARD_CAP`) as a safety ceiling.
- **PDF** — a filtered *summary* report (counts by status/gender/category),
  computed via targeted `COUNT(*)` queries (`getExportSummary`) rather than
  fetching any rows at all — stays fast regardless of how many members
  match the filters, so it's never queued.

Every export (sync or background) is logged to `export_history` (who,
when, format, filters, row count) and shown in the **Export History**
table. `export_jobs` additionally tracks per-job progress and holds the
finished file (base64) for re-download. All export Server Actions
re-validate the caller's `members.export` permission on every call — a
A Team Member hitting them directly gets rejected regardless of what the UI
shows.

## 8. Analytics

`/admin/analytics` is backed entirely by SQL `GROUP BY` aggregation
(migration `000015_analytics_functions.sql`) — growth, district/category/
gender/jaati breakdowns, and age distribution are all computed inside
Postgres and return a handful to a few hundred summarized rows, regardless
of whether `members` has 5,000 or 5,00,000 rows. The **Cross Filter** panel
(District vs Category, Assembly vs Gender, Mandal vs Jaati, etc.) calls a
`analytics_cross(x_field, y_field)` Postgres function live as you change
the dropdowns — the two field names are validated against a hardcoded
whitelist before being used in dynamic SQL, so it isn't a SQL-injection
vector despite building the query with `format(%I)`.

## 9. Notifications

The admin topbar bell is backed by real data (no placeholder): pending-
verification count and today's registration count, fetched once per
admin-area page load in `src/app/admin/layout.tsx` and passed down to
`AdminTopbar`. Clicking a notification navigates to the relevant list.

## 10. ID Card

`src/components/id-card/MembershipCard.tsx` uses the official BJP+BJYM
logo you provided (`public/brand/logo.png`) and mirrors your reference
template's layout: tricolor diagonal corner, Hindi heading, green ribbon,
tricolor-bordered photo frame, icon+label info rows, signature block, and
**QR bottom-left** (per your latest instruction — the reference screenshot
didn't show one, but the brief asked for bottom-left placement). Fixed
pixel dimensions (380×580) with `text-overflow: ellipsis` on every
variable-length field, so long names/districts never wrap or overflow.
Always renders in Hindi regardless of the portal's active display language,
per spec. Downloads as a 3x-scale PNG or a matching-orientation PDF via
`html-to-image` + `jsPDF` — both generated client-side from the exact
on-screen component, so there's no separate server-side rendering path to
keep in sync.

## 11. Remaining known simplifications

- **i18n**: a lightweight client-side Hindi/English dictionary
  (`src/lib/i18n`) rather than full `next-intl` locale-routing — see the
  in-code comment for why (keeps it from fighting with the auth
  middleware). The DB-stores-English / UI-shows-selected-language rule is
  honored via the `_name_en` / `_name_hi` columns on `members`.
- **"Logout Everywhere"** is enforced on navigation (via middleware) rather
  than instantly on every in-flight request mid-session — see §5. Fully
  instant revocation would need a server-side session store checked on
  every Server Action too, not just page loads.
- The export hard cap (500,000 rows, §7) is a safety ceiling, not a true
  unbounded-scale solution — beyond that, split the export by date range
  or district and run multiple jobs.

## 10. Deployment (Vercel)

1. Push to GitHub, import into Vercel.
2. Add every variable from `.env.local` to **Vercel → Project → Settings
   → Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to your real
   domain, generate a fresh `AUTH_SECRET` for production).
3. Deploy.
4. Run the migrations against your production Supabase project (SQL
   Editor, or `supabase db push` once linked) and seed the Master Admin
   (`npm run create-admin` pointed at prod, or `db:seed`) — do this once,
   not on every deploy.

## 11. Production checklist

- [ ] Change the default Master Admin password immediately after first login
- [ ] Generate a fresh `AUTH_SECRET` for production (`npx auth secret`)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your real domain (used in QR/referral links)
- [ ] Review `supabase/migrations/000011_rls.sql`'s comment if you ever add
      a second, less-trusted client to this project
- [ ] Add a real SMTP/notification pathway if you plan to build out the
      notification bell
- [ ] Decide on the export background-queue upgrade (see §7) before your
      member base is large enough that 20,000 rows stops being enough

## 12. Folder structure

```
src/
  app/
    actions/            Server Actions: login, logout, register, member, admin,
                        export, analytics (cross-filter), public
    admin/               Admin dashboard: overview, members, verification, analytics,
                          export, hierarchy (read-only viewer), admins, activity-logs, settings
    dashboard/            Member dashboard
    login, admin-login, register, verify, privacy-policy
    api/auth/[...nextauth]/route.ts
  components/
    ui/                   Local shadcn-style primitives
    common/                Navbar, Footer, Chakra icon, language switcher
    id-card/               MembershipCard, QR code, download buttons
    forms/                 RegisterWizard, PhotoCropper (crop/zoom/rotate/WebP)
    admin/                 Sidebar, Topbar, MembersTable, MemberDetailClient,
                            VerificationQueue, AnalyticsCharts, AdminUsersClient,
                            HierarchyManager (read-only), SettingsForm, export/ExportClient
  data/
    hierarchy.ts           District -> Assembly -> Mandal (static, generated from the
                            official BJYM organizational-districts Excel sheet)
    dob.ts                 DOB dropdown data, 18-40 age validation helpers
  lib/
    auth/                  NextAuth config (config.ts, index.ts), password.ts (bcrypt)
    db/client.ts            The one Supabase client (service role, server-only)
    repositories/            member, admin, referral, settings, activity, export (incl. job queue)
    rbac/permissions.ts      Permission constants, admin nav definitions
    validators/               Zod schemas: registration, auth, member, admin, settings
    export/columns.ts         Export column definitions (all 36 requested fields)
    image/cropImage.ts         Canvas crop/rotate/resize utility
    i18n/                     Hindi/English dictionary + provider
  types/database.ts           Hand-authored DB types (see §3 re: db:generate-types)
supabase/
  migrations/000001..000020.sql
  seed.sql                    Default Master Admin (pgcrypto bcrypt, matches bcryptjs)
  config.toml
scripts/create-admin.mjs      Node alternative to `db:seed` for the Master Admin
```

---

## 13. Phase 3 — Homepage, mobile-first, hierarchy from real data, SEO, branding

### Fresh installation guide (quick start)

```bash
git clone <your-repo> && cd bjym-portal
npm install
cp .env.example .env.local        # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET

# 1. Reset (SQL Editor -> paste supabase/reset.sql -> Run) — safe even on a brand-new project
# 2. Migrate: paste supabase/run_all_migrations.sql into SQL Editor, OR:
npm run db:push                   # applies all 20 migrations in filename order
# ...or do both 1+2 in one paste: supabase/reset_and_migrate.sql

npm run db:seed                   # or: npm run create-admin
npm run dev
```

Migrations 000001-000006 and 000008-000020 always do real work.
`000007_repair_legacy_tables.sql` only matters if this Supabase project
previously ran an older version of this schema (patches
`activity_logs`/`settings` if they're in an old shape) — it's a no-op on
a project that's never seen this schema before.

### Organizational hierarchy — real data, Lok Sabha kept independent

`src/data/hierarchy.ts` is generated directly from the official BJYM
organizational-districts Excel sheet: **36 districts, 102 assemblies, 479
mandals**, verbatim. District is the top level of *this* file — the
source Excel has no Lok Sabha column, and BJYM's organizational districts
(e.g. भिलाई as distinct from दुर्ग, रायपुर शहर/ग्रामीण split) don't map
1:1 onto the 11 official Lok Sabha constituencies without a separately
verified assembly-level mapping.

Per your follow-up, Lok Sabha is back — as a **deliberately independent**
dataset:

- `src/data/loksabha.ts` — a flat list of the 11 Chhattisgarh Lok Sabha
  constituencies (id + English/Hindi names), with **no link into**
  `hierarchy.ts`. It's not nested under District, and District/Assembly/
  Mandal don't filter or get filtered by it.
- On the registration form (Electoral step), Lok Sabha is its own
  dropdown, selected independently of District — picking one doesn't
  gate or reset the other.
- `members.loksabha_id/name_en/name_hi` are back (migration
  `000016_loksabha.sql`, additive/nullable — doesn't touch 000004), shown
  again on the member dashboard, admin member detail, and export columns.
- **You said you'll add your own data here.** The 11 seat names currently
  in `loksabha.ts` are the standard public list (Sarguja, Raigarh,
  Janjgir-Champa, Korba, Bilaspur, Rajnandgaon, Durg, Raipur, Mahasamund,
  Kanker, Bastar) — replace/edit that array with whatever you provide;
  nothing else needs to change since no other file depends on its
  contents beyond `id`/`nameEn`/`nameHi`.

To regenerate `hierarchy.ts` after an updated Excel sheet: read the
sheet's जिला/विधानसभा/मण्डल columns, group into District → Assembly →
Mandal, assign stable `d{n}-a{n}-m{n}` ids, and emit the `HIERARCHY`
array (ask your dev/AI assistant to redo this any time the sheet changes
— it's a mechanical transform).

### Homepage

`src/components/home/HomeClient.tsx` now has, top to bottom: a fixed hero
banner (logo + headline + CTA + live stats, mobile-optimized with
stacked full-width buttons under `sm:`), the campaign slides carousel,
and a CTA band. `src/components/home/CampaignCarousel.tsx` is a
from-scratch carousel (no external dependency) using the 6 provided
slide images: autoplay every 2s, infinite loop (modulo wraparound — a
deliberate simplification over seamless-clone infinite scroll, invisible
at this slide count/speed), swipe support via touch handlers, pause on
hover/touch/interaction with a 5s auto-resume, `next/image` with
`priority` on the first slide and lazy-loading on the rest.

No separate "hero/banner" image was included in the last upload (only
the 6 slides) — the hero section reuses the clean gradient + logo
treatment from before rather than a dedicated banner asset. Send one over
if you have a specific banner and it's a one-line swap in `HomeClient.tsx`.

### Navbar & language switcher

Fully rebuilt (`src/components/common/Navbar.tsx`): official logo + bilingual
org name on the left (switches between Hindi/English based on the active
language), sticky with `env(safe-area-inset-top)` padding for notched
phones, desktop pill nav, and a proper mobile hamburger menu (slide-down
panel, body-scroll-locked while open, closes on route change). The
language switcher (`LanguageSwitcher.tsx`) is now a sliding segmented
toggle (हिन्दी / EN) instead of a plain dropdown — selection persists via
`localStorage` (unchanged from before).

### Membership ID — unlimited length, confirmed

`generate_membership_id()` (migration `000009_functions.sql`) already
handled unlimited growth correctly — Postgres's `lpad()` only *pads up to*
a minimum width, it never truncates, so serial `1000000` naturally
produces `BJYM-CG-2026-1000000` with no code change needed. What *was*
missing: the ID card could visually overflow once IDs grew past 6 digits.
Fixed in `MembershipCard.tsx` — the membership ID now shrinks its own font
size in three steps as the string gets longer (never truncates an
identifier people need to read), so `BJYM-CG-2026-999999` and
`BJYM-CG-2026-12345678` both render cleanly on one line.

### SEO, favicons, manifest, structured data

- `src/app/layout.tsx`: full `Metadata` API — title template, description,
  keywords, canonical, Open Graph, Twitter card (`summary_large_image`),
  JSON-LD (`Organization` + `WebSite` + `WebPage` + `BreadcrumbList`) via
  a `<script type="application/ld+json">`.
- `src/app/icon.png`, `apple-icon.png` (Next.js App Router file-convention
  icons — no manual `<link>` tags needed), plus `public/icons/` with
  16/32/192/512px PNGs and a proper 1200×630 Open Graph image, all
  generated from your official logo.
- `src/app/manifest.ts`, `sitemap.ts`, `robots.ts` — App Router
  file-convention routes, no extra config. `robots.ts` blocks
  `/admin`, `/dashboard`, `/api`, `/login`, `/register`, `/admin-login`
  from indexing, matching your list exactly — note **`/register` is
  your main conversion page**; if you want it discoverable via search
  (many orgs do), remove it from the `disallow` array in `robots.ts`.
- Per-page metadata added to `/register`, `/login`, `/verify`,
  `/privacy-policy`, `/terms-and-conditions`, `/admin-login` (noindex).
  `/login` and `/admin-login` were split into a server `page.tsx`
  (metadata) + a client form component, since a page can't export both
  `"use client"` and `metadata` in the App Router.
- Custom branded `not-found.tsx` (404) and `global-error.tsx` (500-style)
  pages.

### Images & performance

The 6 slide images (originally ~14 MB total) were resized to 1600px wide
and re-encoded as JPEG (~1.1 MB total); the logo was resized and
recompressed (~180 KB). All slides render through `next/image` (automatic
responsive `srcset`, lazy-loading past the first slide). This should move
Lighthouse Performance meaningfully — a literal ≥95 score depends on your
actual Vercel deployment's network/CPU and can't be verified from this
environment; if you fall short after deploying, the next lever is usually
converting `public/slides/*.jpg` to WebP/AVIF (Next.js does this
automatically for images served through `next/image`, so this is likely
already happening at request time on Vercel).

### Mobile-first pass

`globals.css` now sets a 40px minimum touch target on coarse-pointer
devices, disables horizontal overflow at the `body` level as a safety
net, and (via `Input`/`Select`/`Textarea` using `text-base sm:text-sm`)
uses 16px form-field text on mobile — below 16px, iOS Safari
auto-zooms on focus, which is a common source of "broken-feeling" mobile
forms. The hero/CTA sections on the homepage now stack to full-width
buttons under `sm:`. This pass covered the highest-traffic public surfaces
(home, navbar, forms); a few lower-traffic admin screens (some analytics
chart cards, dense tables) still rely on horizontal scroll on very narrow
viewports rather than a bespoke mobile layout — functional, but not yet
redesigned card-per-row on mobile. Flag any specific screen that's still
rough and it's a contained fix.

```

## 14. Phase 4 — hero banner, footer contact/socials, migration fix

- **Hero banner**: `public/hero-banner.jpg` is your uploaded "Join BJYM
  2026" cover image (resized to 1920px wide, re-encoded JPEG, ~1.35 MB →
  ~310 KB). The homepage hero now shows it full-width via `next/image`
  (`priority` load, responsive `sizes="100vw"`) with a subtle bottom
  gradient, followed by the H1/CTA/stats block below it (kept separate
  rather than overlaid, since the banner already has its own baked-in
  text — avoids double text clutter).
- **Footer contact & socials**: real phone (`9109881465`), email
  (`bjym4cg@gmail.com`), and working links to your Facebook, Instagram,
  and X accounts, with proper icon buttons (`lucide-react` for FB/IG, a
  small inline SVG for X since lucide has no X glyph). The same phone/
  email were added to the Privacy Policy and Terms & Conditions contact
  sections for consistency.
- **Migration ordering bug, fixed**: `000007_repair_legacy_tables.sql`
  was creating the `trg_settings_updated_at` trigger immediately, but the
  function it points at (`set_settings_updated_at()`) wasn't defined until
  `000010_triggers.sql` — `CREATE TRIGGER` (unlike a function body) needs
  the target procedure to already exist, so this failed with
  `function public.set_settings_updated_at() does not exist`. Fixed by
  having `000007` only add the missing columns; `000010` still creates
  the function *and* the trigger together, in the correct order, exactly
  as before. Every other migration was re-audited for the same class of
  bug (a function/trigger call before its definition) — none found.
- **`supabase/reset.sql`** (new): drops every table and function this
  project creates, `IF EXISTS`/`CASCADE` throughout, safe to run on a
  brand-new project or a previously-used one. Also drops legacy
  pre-refactor table/function names in case this Supabase project was
  used for an earlier version. Run this before migrating any time you
  want a guaranteed-clean start.
- **`supabase/reset_and_migrate.sql`** (new): `reset.sql` + all 16
  migrations concatenated into one paste, for a single-step setup.
- **`npm run db:reset-remote`** (new script): runs `reset.sql` against
  your linked *remote* project via the Supabase CLI — `supabase db
  reset` (the pre-existing `db:reset` script) only resets a *local*
  Supabase instance started with `supabase start`, which isn't what most
  people running `db:push` against a hosted project actually want.

## 16. Phase 5 — referral fix, role rename, filters, Hindi-only, new ID card

- **Referral system — root cause found and fixed.** The registration
  form never actually captured a referral code (not from the `?ref=`
  link the dashboard generates, not from any input field), so
  `referred_by_code` was always `null` and the entire downstream chain
  (member_referrals rows, referral_count, leaderboard, analytics) was
  silently empty. Fixed: `RegisterWizard` now reads `?ref=CODE` from the
  URL on mount and pre-fills an editable referral code field in the
  Security step; `registerMember` validates it against a real, active
  member (`memberRepository.referralCodeExists`) before crediting it — an
  invalid/mistyped code is dropped rather than blocking registration. The
  DB trigger (`after_member_insert`) was already correct; it just never
  received a value to act on.
- **SUPERVISOR renamed to TEAM_MEMBER, permissions narrowed.** Migration
  `000017_rename_team_member.sql` renames the role and replaces its
  `role_permissions` entirely with just `members.approve` +
  `members.reject` — no dashboard, no member list, no suspend/activate,
  no MPIN reset, no analytics/export/settings/admin-management. A Team
  Member's post-login landing page and any permission-denied redirect
  now resolve via `getDefaultAdminRoute()` (`src/lib/rbac/permissions.ts`)
  instead of a hardcoded `/admin` — otherwise a role with no
  `dashboard.view` would get redirected to a dashboard it also can't see,
  looping.
- **Admin notifications removed.** The bell icon/dropdown are gone from
  `AdminTopbar.tsx`; the admin layout no longer fetches KPI data just for
  that (it wasn't used for anything else).
- **Admin search & filters — reliability fix, not just more filters.**
  The previous implementation used Postgres full-text search
  (`tsvector`/`plainto_tsquery`), which only matches whole lexemes — so
  searching a partial membership ID like "0001" would never match
  "BJYM-CG-2026-000123", and `referral_code` wasn't indexed into the
  search vector at all. Switched to `ILIKE '%term%'` across exactly
  membership ID / name / mobile / email / referral code, backed by
  `pg_trgm` trigram GIN indexes (`000018_search_fix.sql`) so substring
  search still uses an index at 5+ lakh rows instead of a sequential
  scan. Added the missing filters (Lok Sabha, Assembly, Mandal, Jaati,
  Referral status, date range) to both the Members page and the Export
  module, both with an explicit **Search / Apply Filters** button and a
  **Reset Filters** button — filters never auto-apply while you're still
  selecting them. The Members page also now paginates properly (50/page,
  `?page=` in the URL, all active filters preserved across pages) instead
  of a flat 60-row cap.
- **Multilingual support removed — Hindi only.** The visible language
  switcher is gone from the Navbar and the `LanguageSwitcher.tsx`
  component was deleted; `LanguageProvider` now always resolves to
  Hindi with no setter, so every existing `d.<key>` lookup across the
  codebase kept working unchanged (no need to touch every component).
  Registration dropdowns (District/Assembly/Mandal/Lok Sabha/Category)
  that render `nameEn`/`nameHi` based on locale now always render
  `nameHi`, automatically, as a side effect.
- **Age validation: 16–40** (was 18–40) — `MIN_AGE` in `src/data/dob.ts`
  is the single source of truth for both the year-dropdown range and
  the Zod validation, so this one change updates frontend and backend
  together.
- **ID card — rebuilt to match your latest official template**
  (`MembershipCard.tsx`): stacked gradient "भारतीय जनता युवा मोर्चा" /
  "छत्तीसगढ़" heading, rounded-pill green "डिजिटल सदस्यता कार्ड 2026"
  banner, centered photo with a saffron→green gradient ring, label:value
  detail rows (सदस्यता क्रमांक, नाम, जन्मतिथि, जिला, मंडल), a divider,
  then a footer split into the QR code (bottom-left, per spec) and a
  signature block (bottom-right), and the saffron→green gradient bottom
  bar with the portal URL. Long values (names, longer membership IDs)
  shrink their own font in steps rather than truncating.

## 17. Phase 6 — the "filters don't work" bug, loading states, activity log pagination

- **Root cause of "9 of 3 members shown" / filters and search appearing
  to do nothing.** This was never a broken query — `member.repository.ts`'s
  `list()` always applied filters correctly to both the row data and the
  count (they come from the same PostgREST request). The bug was in
  `MembersTable.tsx` (and, less visibly, `AdminUsersClient.tsx` and
  `VerificationQueue.tsx`): each did `const [rows, setRows] = useState(members)`,
  which only seeds state from a prop on that component instance's *first*
  mount. When you changed a filter, the parent Server Component re-ran
  with a freshly-filtered `members` prop, but Next.js reuses the same
  Client Component instance across that navigation rather than
  remounting it — so `rows` stayed frozen at whatever loaded first
  (every member), while `total` (rendered directly from the prop, no
  local state involved) correctly updated to the filtered count. Hence
  "9 of 3": 9 stale rows, 3 correct. Same explanation for membership-ID
  search appearing to do nothing. Fixed with a `useEffect(() =>
  setRows(members), [members])` in all three components (and the
  equivalent for `MemberDetailClient`'s status/verification state, keyed
  additionally off `member.id`) — this is the standard fix for "state
  derived from props" in React; the local state is still needed (for
  optimistic UI after suspend/approve/etc.), it just now resyncs whenever
  the underlying data actually changes.
- **Membership ID padding**: reverted to 6 digits, per your call — you
  don't expect to cross 999,999 members, and since `lpad()` only pads up
  to a minimum width (never truncates), IDs still grow safely past 6
  digits with zero code changes if that ever changes (`BJYM-CG-2026-999999`
  → `BJYM-CG-2026-1000000` automatically, no migration needed to "turn
  on" 7 digits later either — it just happens as soon as the serial
  passes 999,999).
- **Loading states**: added Next.js's native per-segment `loading.tsx`
  for `/admin/members`, `/admin/verification`, `/admin/activity-logs`,
  and `/admin/analytics` — these render automatically while that route's
  Server Component is fetching, including on a filter/pagination
  navigation. Additionally, the Members filter bar's Search/Reset
  buttons and the pagination Prev/Next buttons now show their own
  "लोड हो रहा है…" pending state via `useTransition`, for instant
  feedback even before the route-level loading UI kicks in.
- **Members pagination**: switched from a flat 60-row cap with no
  paging to real pagination — 50 per page, `?page=` in the URL, every
  active filter preserved when moving between pages
  (`MembersPagination.tsx`).
- **Activity Logs pagination**: 25 entries per page (was a flat 100-row
  cap with no paging at all) — `?page=` in the URL via
  `ActivityLogsPagination.tsx`, keeping this page fast regardless of how
  large the log table grows.
- **Topbar member-search hidden from Team Members.** `AdminTopbar.tsx`'s
  quick "सदस्य, ID खोजें…" box was rendered unconditionally for every
  admin, regardless of role — a Team Member (verification-only, no
  `members.view`) could see and use it, even though the destination
  (`/admin/members`) is something they have no reason to be in (they
  can't suspend/activate/browse members — see §16). It now only renders
  when `permissions.includes(PERMISSIONS.MEMBERS_VIEW)`
  (`AdminLayout` → `AdminTopbar`'s new `canSearchMembers` prop).

## 17. Phase 7 — dashboard KPI fix, Supabase Storage for photos

### Dashboard counts

The previous `kpis()` ran **12 separate count queries** from Node.js,
computing "today"/"this week"/"this month" boundaries with `new Date(...)`
in the serverless function's own clock, then comparing against
`created_at` in Postgres. That gap is exactly where an internally
inconsistent result like *"Today: 7535, This Week: 0, This Month: 0"*
(logically impossible — today is always inside this week and this
month) could come from: 12 independent round-trips give no guarantee of
mutual consistency, and any clock/timezone skew between the Node runtime
and Postgres compounds it.

Fixed: `admin_dashboard_kpis()` (migration `000019_dashboard_kpis.sql`) —
**one** SQL function, using `count(*) filter (where ...)` so every metric
is computed from the same single pass over the table, against Postgres's
own `now()`. This can't produce a week-count smaller than a day-count by
construction, and it's 1 round-trip instead of 13 (also meaningfully
faster at 500,000+ rows). `memberRepository.kpis()` now just calls this
RPC.

**If `Total Members` still looks wrong after this fix**, that's a data
issue, not a query issue — run this in SQL Editor to check:
```sql
select count(*) from public.members where deleted_at is not null and status <> 'Deleted';
```
A non-zero result means some rows have `deleted_at` populated without
`status` actually being `'Deleted'` — typically from a bulk import/seed
script that set every column from one template including `deleted_at`.
`total` (and several other KPIs) deliberately exclude soft-deleted rows
(`deleted_at is null`), while `active`/`suspended`/`deleted` key off
`status` directly — that mismatch is what produces a low `total` next to
a much higher `active`.

### Photo storage — moved to Supabase Storage

Member photos were stored as base64 text directly in `members.photo_base64`
— simple early on, but every query that touched a member row (list pages,
exports, KPI-adjacent queries) paid the cost of that blob even when it
never displayed a photo. At 500,000+ members this was the direct cause of
413/oversized-payload errors (see §16's Members-list fix, which stopped
*querying* photo_base64 unnecessarily — this phase goes further and
stops *storing new ones there* at all).

**Non-breaking, additive migration** (`000020_photo_storage.sql`):
- Two new nullable columns: `photo_url`, `photo_storage_path`.
  `photo_base64` is untouched — existing members keep working exactly as
  before.
- A `member-photos` Storage bucket, public-read (a digital membership
  card's photo is meant to be shown/shared — similar sensitivity to a
  LinkedIn photo — so plain public URLs are a deliberately simpler choice
  than signed-URL expiry management; switch `public` to `false` in the
  migration and add signing in `src/lib/storage/photos.ts` if you'd
  rather keep it private), max 2 MB, WebP/JPEG/PNG only.
- RLS policies on `storage.objects`: public **read**, service-role-only
  **write**. This app's Postgres/Storage access is 100% service-role
  (no anon/authenticated client anywhere — see `src/lib/db/client.ts`),
  so these policies are defense-in-depth/documentation, not something
  the app's own requests depend on.

**New registrations** (`src/app/actions/register.ts`): the cropped/
compressed WebP photo (already produced client-side by `PhotoCropper.tsx`
— crop/zoom/rotate to a fixed passport ratio, canvas-encoded to WebP) is
uploaded via `uploadMemberPhoto()` (`src/lib/storage/photos.ts`) instead
of being written straight to `photo_base64`. If the member row creation
fails afterward for any reason, the just-uploaded photo is deleted so it
doesn't become an orphaned Storage object. No new server-side image
library (e.g. `sharp`) was introduced — the client-side canvas
compression is the real compression step; the server just validates size
(2 MB ceiling, matching the bucket's own limit) as a safety net.

**Existing members** keep reading from `photo_base64` until migrated —
nothing forces an immediate cutover.

**On-demand reads, now URL-first**: `photo_url` is lightweight (a short
string) so it's included directly in `LIST_COLUMNS` — new members' photos
show up instantly in lists/detail pages/the dashboard with no extra
round-trip at all. Legacy members (base64-only, no `photo_url` yet) still
use the on-demand fetch pattern from §16 (`getPhotoById` now checks
`photo_url` first, falling back to `photo_base64`) — `DashboardClient`
and `MemberDetailClient` both skip that extra fetch entirely whenever
`photo_url` is already present.

**Backfill script** (`scripts/migrate-photos.mjs`, `npm run migrate-photos`):
reads members where `photo_base64 IS NOT NULL AND photo_url IS NULL`,
uploads each to Storage, and only clears `photo_base64` after the row
update succeeds. Resumable by construction — that same WHERE clause
means already-migrated rows are automatically skipped on any re-run, no
separate checkpoint file needed. Detailed per-row logging to both the
console and a dated log file. Flags: `--batch-size=N` (default 50),
`--limit=N` (process only N rows, for testing), `--dry-run` (log what
would happen, no writes). Run it whenever you're ready — there's no time
pressure, since new registrations already work correctly without it.

### Environment variables

No new environment variables — Storage uploads/reads reuse the existing
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` service-role client
(`src/lib/db/client.ts` already exposes `.storage` via the same
`createClient()` instance used for every Postgres query).

### Follow-up fixes: three spots that still only checked `photo_base64`

A pass through every remaining photo-consuming code path found three
places that were written before `photo_url` existed and hadn't been
updated to the URL-first-with-fallback pattern — meaning a **new**
member (photo_url only, no photo_base64) would have shown no photo at
all in these three specific spots, even though everything else (dashboard,
member detail, ID card) already handled it correctly:

- **`memberRepository.verifyPublic`** (the public `/verify` page) was
  only selecting `photo_base64` — added `photo_url` to the select, and
  `src/app/actions/public.ts` now prefers it, falling back to
  `photo_base64`.
- **`MembersTable.tsx`** (admin Members list) was passing
  `m.photo_base64` to the list avatar — but `photo_base64` is
  deliberately excluded from `LIST_COLUMNS` (see §16), so this always
  rendered initials for *every* member, old or new. Switched to
  `m.photo_url`, which *is* in `LIST_COLUMNS` — new members now get a
  real thumbnail in the list at no extra query cost; pre-migration
  members still show initials here specifically (their full photo still
  loads correctly on the detail page, on demand).
- **`VerificationQueue.tsx`** was passing `m.photo_base64` only, for both
  the table thumbnail and the click-to-enlarge lightbox — a new member
  pending verification would have shown no photo at all, which defeats
  the purpose of a verification review. Now checks `m.photo_url ||
  m.photo_base64` in both places.

Also added the **Rejected** KPI card to the admin Overview page — the
`admin_dashboard_kpis()` SQL function (§17 above) already computed it,
it just hadn't been wired into the grid of `<KPI>` cards.

Built by Techxos · techxos.in
