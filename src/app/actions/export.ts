"use server";

import { auth } from "@/lib/auth";
import { memberRepository, type ExportFilters } from "@/lib/repositories/member.repository";
import { exportRepository } from "@/lib/repositories/export.repository";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { CATEGORIES } from "@/data/hierarchy";

/**
 * Every export — regardless of total size — is fetched in fixed-size
 * batches of this many rows, one synchronous request per batch. This
 * deliberately replaces an earlier design that queued large exports as
 * a background job processed via Next.js's `after()` API: that API
 * isn't supported when this app is deployed on AWS Amplify Hosting
 * (confirmed against AWS's own Next.js SSR troubleshooting docs), so a
 * "background" export would have silently never finished there.
 * Batches of 3,000 rows keep each response comfortably under Amplify's
 * ~5.72 MB max SSR response size, with no background job/polling
 * infrastructure needed at all — every batch is just an ordinary
 * request/response.
 *
 * The batches only ever carry raw row JSON now (never a pre-built
 * CSV/XLSX file) — the client accumulates rows across every batch and
 * builds ONE file at the end, triggering exactly one download. Browsers
 * (Chrome in particular) silently block automatic downloads after the
 * first one in a burst, so a loop that downloaded each batch as its own
 * file only ever produced one visible file to the user regardless of
 * how many batches actually ran.
 */
const BATCH_SIZE = 3000;
const HARD_CAP = 500000; // safety ceiling regardless of filters

async function requireExportPermission() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") throw new Error("Not authenticated");
  const permissions = session.user.permissions ?? [];
  if (!permissions.includes(PERMISSIONS.MEMBERS_EXPORT)) throw new Error("Not authorized");
  return session.user.id;
}

export async function previewExportCount(filters: ExportFilters) {
  await requireExportPermission();
  const count = await memberRepository.countForExport(filters);
  const capped = count > HARD_CAP;
  const effectiveCount = Math.min(count, HARD_CAP);
  return {
    count,
    batchSize: BATCH_SIZE,
    totalBatches: Math.max(1, Math.ceil(effectiveCount / BATCH_SIZE)),
    capped,
    hardCap: HARD_CAP,
  };
}

/**
 * Fetches exactly ONE batch (up to BATCH_SIZE rows) of raw row data —
 * always a plain synchronous request/response, however many total rows
 * match the filters. The client calls this once per batch (batchIndex
 * 0, 1, 2, ...), accumulates the rows, and builds a single CSV/XLSX
 * file client-side once every batch has arrived; see ExportClient.tsx.
 */
export async function fetchExportRows(filters: ExportFilters, format: "csv" | "xlsx", columns: string[], batchIndex: number) {
  const adminId = await requireExportPermission();
  const total = Math.min(await memberRepository.countForExport(filters), HARD_CAP);
  const totalBatches = Math.max(1, Math.ceil(total / BATCH_SIZE));
  const offset = batchIndex * BATCH_SIZE;

  const rows = await memberRepository.forExportPage(filters, offset, BATCH_SIZE);

  // Log the export once, on the first batch, with the FULL intended row
  // count — not repeated per batch, and not under-counting a multi-batch
  // export as if it were only its first 3,000 rows.
  if (batchIndex === 0) {
    await exportRepository.record({ adminId, format, filters: filters as Record<string, unknown>, columns, recordCount: total });
  }

  return { rows, rowCount: rows.length, batchIndex, totalBatches };
}

/**
 * PDF is always a filtered SUMMARY (counts by status/gender/category),
 * never a full row dump — so it never needs batching regardless of how
 * many rows match the filters. Uses targeted COUNT queries instead of
 * fetching rows, so it stays fast at any scale.
 */
export async function getExportSummary(filters: ExportFilters) {
  await requireExportPermission();

  const [total, active, suspended, deleted, male, female, other] = await Promise.all([
    memberRepository.countForExport(filters),
    memberRepository.countForExport({ ...filters, status: "Active" }),
    memberRepository.countForExport({ ...filters, status: "Suspended" }),
    memberRepository.countForExport({ ...filters, status: "Deleted" }),
    memberRepository.countForExport({ ...filters, gender: "Male" }),
    memberRepository.countForExport({ ...filters, gender: "Female" }),
    memberRepository.countForExport({ ...filters, gender: "Other" }),
  ]);

  const categoryCounts = await Promise.all(
    CATEGORIES.map(async (c) => ({ label: c.nameEn, count: await memberRepository.countForExport({ ...filters, category: c.id }) }))
  );

  return {
    total,
    byStatus: { Active: active, Suspended: suspended, Deleted: deleted },
    byGender: { Male: male, Female: female, Other: other },
    byCategory: categoryCounts,
  };
}

export async function getExportHistory() {
  await requireExportPermission();
  return exportRepository.history(10);
}
