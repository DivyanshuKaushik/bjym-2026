"use server";

import { after } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { memberRepository, type ExportFilters, type MemberRow } from "@/lib/repositories/member.repository";
import { exportRepository } from "@/lib/repositories/export.repository";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { EXPORT_COLUMNS } from "@/lib/export/columns";
import { CATEGORIES } from "@/data/hierarchy";

/** Exports at or below this row count happen synchronously (instant
 *  download). Above it, we queue a background job — this is the
 *  "queue exports exceeding a configurable limit" requirement. */
const EXPORT_SYNC_THRESHOLD = 3000;
const HARD_CAP = 500000; // safety ceiling regardless of filters
const BATCH_SIZE = 2000;

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
  return {
    count,
    willQueue: count > EXPORT_SYNC_THRESHOLD,
    syncThreshold: EXPORT_SYNC_THRESHOLD,
    capped: count > HARD_CAP,
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
 * Small/medium exports: fetch + build the file inline and return it to
 * the client immediately (existing fast path, unchanged behaviour for
 * the common case).
 */
export async function fetchExportDataSync(filters: ExportFilters, format: "csv" | "xlsx", columns: string[]) {
  const adminId = await requireExportPermission();
  const rows = await memberRepository.forExport(filters, EXPORT_SYNC_THRESHOLD);

  await exportRepository.record({ adminId, format, filters: filters as Record<string, unknown>, columns, recordCount: rows.length });

  if (format === "csv") return { base64: Buffer.from(buildCsv(rows, columns), "utf-8").toString("base64"), rowCount: rows.length };
  return { base64: buildXlsxBase64(rows, columns), rowCount: rows.length };
}

/**
 * Large exports: create a queued job, kick off chunked background
 * processing via `after()` (runs once the response has been sent — no
 * external job queue service required), and return the job id
 * immediately so the client can poll `getExportJobStatus`.
 */
export async function startBackgroundExport(filters: ExportFilters, format: "csv" | "xlsx", columns: string[]) {
  const adminId = await requireExportPermission();
  const total = await memberRepository.countForExport(filters);
  const cappedTotal = Math.min(total, HARD_CAP);

  const jobId = await exportRepository.createJob({ adminId, format, filters: filters as Record<string, unknown>, columns });

  after(async () => {
    try {
      await exportRepository.markProcessing(jobId, cappedTotal);
      const allRows: MemberRow[] = [];
      let offset = 0;
      while (offset < cappedTotal) {
        const page = await memberRepository.forExportPage(filters, offset, BATCH_SIZE);
        if (page.length === 0) break;
        allRows.push(...page);
        offset += page.length;
        await exportRepository.updateProgress(jobId, Math.min(offset, cappedTotal));
        if (page.length < BATCH_SIZE) break;
      }

      const fileName = `bjym-members-export-${jobId.slice(0, 8)}.${format}`;
      const base64 = format === "csv" ? Buffer.from(buildCsv(allRows, columns), "utf-8").toString("base64") : buildXlsxBase64(allRows, columns);

      await exportRepository.completeJob(jobId, base64, fileName);
      await exportRepository.record({ adminId, format, filters: filters as Record<string, unknown>, columns, recordCount: allRows.length });
    } catch (err) {
      await exportRepository.failJob(jobId, err instanceof Error ? err.message : "Unknown error");
      await exportRepository.record({ adminId, format, filters: filters as Record<string, unknown>, columns, recordCount: 0, status: "failed" });
    }
  });

  return { jobId };
}

export async function getExportJobStatus(jobId: string) {
  const adminId = await requireExportPermission();
  const job = await exportRepository.getJob(jobId, adminId);
  if (!job) return null;
  return {
    id: job.id,
    status: job.status,
    totalRows: job.total_rows,
    processedRows: job.processed_rows,
    fileName: job.file_name,
    errorMessage: job.error_message,
    hasFile: !!job.file_base64,
  };
}

export async function downloadExportJobFile(jobId: string) {
  const adminId = await requireExportPermission();
  const job = await exportRepository.getJob(jobId, adminId);
  if (!job || job.status !== "completed" || !job.file_base64) return null;
  return { base64: job.file_base64, fileName: job.file_name ?? "export" };
}

export async function listMyExportJobs() {
  const adminId = await requireExportPermission();
  return exportRepository.listJobsForAdmin(adminId, 10);
}

/**
 * PDF is always a filtered SUMMARY (counts by status/gender/category),
 * never a full row dump — so it never needs to be queued regardless of
 * how many rows match the filters. Uses targeted COUNT queries instead
 * of fetching rows, so it stays fast at any scale.
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
