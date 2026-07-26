"use server";

import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { memberRepository, type ExportFilters, type MemberRow } from "@/lib/repositories/member.repository";
import { exportRepository } from "@/lib/repositories/export.repository";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { EXPORT_COLUMNS } from "@/lib/export/columns";
import { CATEGORIES } from "@/data/hierarchy";

/**
 * Every export — regardless of total size — is fetched and downloaded in
 * fixed-size batches of this many rows, one synchronous request per
 * batch. This deliberately replaces an earlier design that queued large
 * exports as a background job processed via Next.js's `after()` API:
 * that API isn't supported when this app is deployed on AWS Amplify
 * Hosting (confirmed against AWS's own Next.js SSR troubleshooting
 * docs), so a "background" export would have silently never finished
 * there. Batches of 3,000 rows keep each response comfortably under
 * Amplify's ~5.72 MB max SSR response size even at the widest column
 * selection, with no background job/polling infrastructure needed at
 * all — every batch is just an ordinary request/response.
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

function buildCsv(rows: MemberRow[], columns: string[]) {
  const selectedCols = EXPORT_COLUMNS.filter((c) => columns.includes(c.key));
  const header = selectedCols.map((c) => c.label).join(",");
  const body = rows.map((r) => selectedCols.map((c) => `"${String(c.get(r)).replace(/"/g, '""')}"`).join(",")).join("\n");
  return "\uFEFF" + header + "\n" + body;
}

function buildXlsxBase64(rows: MemberRow[], columns: string[]) {
  const selectedCols = EXPORT_COLUMNS.filter((c) => columns.includes(c.key));
  const data = rows.map((r) => Object.fromEntries(selectedCols.map((c) => [c.label, c.get(r)])));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  return XLSX.write(wb, { type: "base64", bookType: "xlsx" }) as string;
}

/**
 * Fetches and builds exactly ONE batch (up to BATCH_SIZE rows) as a
 * complete, ready-to-download file — always a plain synchronous
 * request/response, however many total rows match the filters. The
 * client calls this once per batch (batchIndex 0, 1, 2, ...) and
 * triggers a download for each; see ExportClient.tsx.
 */
export async function fetchExportBatch(
  filters: ExportFilters,
  format: "csv" | "xlsx",
  columns: string[],
  batchIndex: number
) {
  const adminId = await requireExportPermission();
  const total = Math.min(await memberRepository.countForExport(filters), HARD_CAP);
  const totalBatches = Math.max(1, Math.ceil(total / BATCH_SIZE));
  const offset = batchIndex * BATCH_SIZE;

  const rows = await memberRepository.forExportPage(filters, offset, BATCH_SIZE);

  const suffix = totalBatches > 1 ? `-batch-${batchIndex + 1}-of-${totalBatches}` : "";
  const fileName = `bjym-members-export${suffix}.${format}`;
  const base64 = format === "csv" ? Buffer.from(buildCsv(rows, columns), "utf-8").toString("base64") : buildXlsxBase64(rows, columns);

  // Log the export once, on the first batch, with the FULL intended row
  // count — not repeated per batch, and not under-counting a multi-batch
  // export as if it were only its first 3,000 rows.
  if (batchIndex === 0) {
    await exportRepository.record({ adminId, format, filters: filters as Record<string, unknown>, columns, recordCount: total });
  }

  return { base64, fileName, rowCount: rows.length, batchIndex, totalBatches };
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
