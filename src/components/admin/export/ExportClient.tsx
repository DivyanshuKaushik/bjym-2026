"use client";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, getAssemblies, getMandals, type District } from "@/data/hierarchy";
import { LOKSABHA_CONSTITUENCIES } from "@/data/loksabha";
import {
  previewExportCount, fetchExportDataSync, startBackgroundExport,
  getExportJobStatus, downloadExportJobFile, getExportSummary, listMyExportJobs,
} from "@/app/actions/export";
import type { ExportFilters } from "@/lib/repositories/member.repository";
import { EXPORT_COLUMNS, DEFAULT_EXPORT_COLUMNS } from "@/lib/export/columns";
import { formatDate } from "@/lib/utils";

const STORAGE_KEY = "bjym_export_columns";

type HistoryRow = { id: string; format: string; recordCount: number; status: string; createdAt: string; adminName: string };
type JobRow = { id: string; format: string; status: string; total_rows: number; processed_rows: number; file_name: string | null; created_at: string; completed_at: string | null };

function downloadBase64(base64: string, fileName: string, mime: string) {
  const a = document.createElement("a");
  a.href = `data:${mime};base64,${base64}`;
  a.download = fileName;
  a.click();
}

export function ExportClient({ history, districts }: { history: HistoryRow[]; districts: District[] }) {
  const [filters, setFilters] = useState<ExportFilters>({});
  const [columns, setColumns] = useState<string[]>(DEFAULT_EXPORT_COLUMNS);
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("xlsx");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewExportCount>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<{ id: string; status: string; total: number; processed: number } | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setColumns(JSON.parse(saved)); } catch { /* ignore */ } }
    refreshJobs();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(columns)); }, [columns]);

  const refreshJobs = async () => setJobs((await listMyExportJobs()) as JobRow[]);

  const setFilter = <K extends keyof ExportFilters>(k: K, v: ExportFilters[K]) => setFilters((p) => ({ ...p, [k]: v || undefined }));
  const toggleColumn = (key: string) => setColumns((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));

  const runPreview = async () => setPreview(await previewExportCount(filters));

  const pollJob = (jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const status = await getExportJobStatus(jobId);
      if (!status) return;
      setActiveJob({ id: status.id, status: status.status, total: status.totalRows, processed: status.processedRows });
      if (status.status === "completed" || status.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setBusy(false);
        refreshJobs();
        if (status.status === "failed") setError(status.errorMessage || "Export विफल हुआ");
        else setDone(`Export तैयार है — नीचे Job History से Download करें ✓`);
      }
    }, 1500);
  };

  const runExport = async () => {
    setBusy(true); setDone(null); setError(null); setActiveJob(null);
    try {
      if (format === "pdf") {
        const summary = await getExportSummary(filters);
        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text("BJYM Chhattisgarh — Membership Export Summary", 14, 18);
        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 26);
        pdf.text(`Total records matching filters: ${summary.total}`, 14, 34);
        let y = 46;
        pdf.setFontSize(12); pdf.text("By Status", 14, y); y += 6; pdf.setFontSize(10);
        Object.entries(summary.byStatus).forEach(([k, v]) => { pdf.text(`${k}: ${v}`, 18, y); y += 5.5; });
        y += 4;
        pdf.setFontSize(12); pdf.text("By Gender", 14, y); y += 6; pdf.setFontSize(10);
        Object.entries(summary.byGender).forEach(([k, v]) => { pdf.text(`${k}: ${v}`, 18, y); y += 5.5; });
        y += 4;
        pdf.setFontSize(12); pdf.text("By Category", 14, y); y += 6; pdf.setFontSize(10);
        summary.byCategory.forEach(({ label, count }) => { pdf.text(`${label}: ${count}`, 18, y); y += 5.5; });
        pdf.save("bjym-members-summary.pdf");
        setDone("PDF summary डाउनलोड हो गई ✓");
        setBusy(false);
        return;
      }

      const check = await previewExportCount(filters);
      if (check.willQueue) {
        const { jobId } = await startBackgroundExport(filters, format, columns);
        setActiveJob({ id: jobId, status: "queued", total: check.count, processed: 0 });
        pollJob(jobId);
        setDone(null);
      } else {
        const res = await fetchExportDataSync(filters, format, columns);
        const mime = format === "csv" ? "text/csv;charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        downloadBase64(res.base64, `bjym-members-export.${format}`, mime);
        setDone(`${res.rowCount} records exported ✓`);
        setBusy(false);
        refreshJobs();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export में त्रुटि हुई");
      setBusy(false);
    }
  };

  const downloadJob = async (jobId: string, fileName: string | null, jobFormat: string) => {
    const res = await downloadExportJobFile(jobId);
    if (!res) return;
    const mime = jobFormat === "csv" ? "text/csv;charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    downloadBase64(res.base64, fileName || res.fileName, mime);
  };

  const jobStatusTone = (s: string) => (s === "completed" ? "success" : s === "failed" ? "danger" : "warning");

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Filter sidebar */}
      <Card className="h-fit">
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <Select value={filters.status ?? ""} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">सभी Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Deleted">Deleted</option>
          </Select>
          <Select value={filters.verificationStatus ?? ""} onChange={(e) => setFilter("verificationStatus", e.target.value)}>
            <option value="">सभी Verification</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </Select>
          <Select value={filters.gender ?? ""} onChange={(e) => setFilter("gender", e.target.value)}>
            <option value="">सभी Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
          <Select value={filters.category ?? ""} onChange={(e) => setFilter("category", e.target.value)}>
            <option value="">सभी Category</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </Select>
          <Input placeholder="जाति" value={filters.jaati ?? ""} onChange={(e) => setFilter("jaati", e.target.value)} />
          <Select value={filters.loksabhaId ?? ""} onChange={(e) => setFilter("loksabhaId", e.target.value)}>
            <option value="">सभी Lok Sabha</option>
            {LOKSABHA_CONSTITUENCIES.map((l) => <option key={l.id} value={l.id}>{l.nameHi}</option>)}
          </Select>
          <Select value={filters.districtId ?? ""} onChange={(e) => { setFilter("districtId", e.target.value); setFilter("assemblyId", ""); setFilter("mandalId", ""); }}>
            <option value="">सभी District</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
          </Select>
          <Select value={filters.assemblyId ?? ""} disabled={!filters.districtId} onChange={(e) => { setFilter("assemblyId", e.target.value); setFilter("mandalId", ""); }}>
            <option value="">सभी Assembly</option>
            {(filters.districtId ? getAssemblies(filters.districtId) : []).map((a) => <option key={a.id} value={a.id}>{a.nameHi}</option>)}
          </Select>
          <Select value={filters.mandalId ?? ""} disabled={!filters.assemblyId} onChange={(e) => setFilter("mandalId", e.target.value)}>
            <option value="">सभी Mandal</option>
            {(filters.districtId && filters.assemblyId ? getMandals(filters.districtId, filters.assemblyId) : []).map((m) => <option key={m.id} value={m.id}>{m.nameHi}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-xs font-bold text-heading">
            <Checkbox checked={!!filters.hasReferral} onChange={(e) => setFilter("hasReferral", e.target.checked)} />
            केवल Referral वाले सदस्य
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={filters.dateFrom ?? ""} onChange={(e) => setFilter("dateFrom", e.target.value)} />
            <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => setFilter("dateTo", e.target.value)} />
          </div>
          <Input placeholder="Search (ID/name/phone/email/referral code)" value={filters.q ?? ""} onChange={(e) => setFilter("q", e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setFilters({}); setPreview(null); }}>Reset Filters</Button>
            <Button size="sm" variant="ghost" onClick={runPreview}>Preview Count</Button>
          </div>
          {preview && (
            <div className="rounded-xl bg-bg p-3 text-center text-xs font-bold text-heading">
              {preview.count.toLocaleString("en-IN")} records match
              {preview.willQueue && (
                <div className="mt-1 text-[10.5px] font-normal text-primary-dark">
                  {preview.count.toLocaleString("en-IN")} &gt; {preview.syncThreshold.toLocaleString("en-IN")} — यह background में queue होगा (progress bar दिखेगा)।
                </div>
              )}
              {preview.capped && <div className="mt-1 text-[10.5px] font-normal text-danger">Hard cap: {preview.hardCap.toLocaleString("en-IN")} rows — इससे ज़्यादा filters और narrow करें।</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Columns + format + export */}
      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Columns ({columns.length}/{EXPORT_COLUMNS.length})</CardTitle>
            <div className="flex gap-2">
              <button className="text-xs font-bold text-primary-dark hover:underline" onClick={() => setColumns(EXPORT_COLUMNS.map((c) => c.key))}>Select All</button>
              <button className="text-xs font-bold text-muted hover:underline" onClick={() => setColumns([])}>Clear All</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXPORT_COLUMNS.map((c) => (
                <label key={c.key} className="flex items-center gap-1.5 text-[12px] font-semibold text-heading">
                  <Checkbox checked={columns.includes(c.key)} onChange={() => toggleColumn(c.key)} />
                  {c.label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="w-auto">
                <option value="csv">CSV (complete records)</option>
                <option value="xlsx">Excel .xlsx (complete records)</option>
                <option value="pdf">PDF (filtered summary only)</option>
              </Select>
              <Button onClick={runExport} disabled={busy || (format !== "pdf" && columns.length === 0)}>{busy ? "Processing…" : "⬇ Export"}</Button>
              {error && <span className="text-xs font-bold text-danger">{error}</span>}
              {done && <span className="text-xs font-bold text-secondary-dark">{done}</span>}
            </div>

            {activeJob && activeJob.status !== "completed" && activeJob.status !== "failed" && (
              <div>
                <div className="mb-1 flex justify-between text-[11px] font-bold text-muted">
                  <span>{activeJob.status === "queued" ? "Queued…" : "Processing…"}</span>
                  <span>{activeJob.processed.toLocaleString("en-IN")} / {activeJob.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${activeJob.total > 0 ? Math.min(100, (activeJob.processed / activeJob.total) * 100) : 5}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Background Job History</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="text-sm text-muted">अभी तक कोई background export नहीं हुआ।</div>
            ) : (
              <table className="w-full min-w-[560px] border-collapse text-[12px]">
                <thead>
                  <tr className="bg-bg text-left">
                    {["Date", "Format", "Status", "Rows", "Download"].map((h) => (
                      <th key={h} className="border-b border-border p-2 text-[10px] font-extrabold uppercase tracking-wide text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b border-border">
                      <td className="p-2 text-muted">{formatDate(j.created_at)}</td>
                      <td className="p-2 uppercase">{j.format}</td>
                      <td className="p-2"><Badge tone={jobStatusTone(j.status)}>{j.status}</Badge></td>
                      <td className="p-2">{j.processed_rows.toLocaleString("en-IN")} / {j.total_rows.toLocaleString("en-IN")}</td>
                      <td className="p-2">
                        {j.status === "completed" ? (
                          <button className="text-xs font-bold text-primary-dark hover:underline" onClick={() => downloadJob(j.id, j.file_name, j.format)}>⬇ Download</button>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Export History (audit log)</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {history.length === 0 ? (
              <div className="text-sm text-muted">अभी तक कोई export नहीं हुआ।</div>
            ) : (
              <table className="w-full min-w-[520px] border-collapse text-[12px]">
                <thead>
                  <tr className="bg-bg text-left">
                    {["Date", "By", "Format", "Records", "Status"].map((h) => (
                      <th key={h} className="border-b border-border p-2 text-[10px] font-extrabold uppercase tracking-wide text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-border">
                      <td className="p-2 text-muted">{formatDate(h.createdAt)}</td>
                      <td className="p-2 font-bold text-heading">{h.adminName}</td>
                      <td className="p-2 uppercase">{h.format}</td>
                      <td className="p-2">{h.recordCount.toLocaleString("en-IN")}</td>
                      <td className="p-2">{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
