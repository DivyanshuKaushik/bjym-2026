import { activityRepository } from "@/lib/repositories/activity.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLogsPagination } from "@/components/admin/ActivityLogsPagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function ActivityLogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  const { rows, total } = await activityRepository.list({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <div className="border-b border-border p-3 text-xs text-muted">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")} entries दिखाए जा रहे हैं
          </div>
          <table className="w-full min-w-[700px] border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-bg text-left">
                {["Time", "Actor", "Action", "Target", ""].map((h) => (
                  <th key={h} className="border-b border-border p-2.5 text-[10.5px] font-extrabold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log.id} className="border-b border-border align-top">
                  <td className="whitespace-nowrap p-2.5 text-muted">{new Date(log.created_at).toLocaleString("en-IN")}</td>
                  <td className="p-2.5"><Badge tone={log.actor_type === "admin" ? "default" : "success"}>{log.actor_type}</Badge> {log.actor_label ?? log.actor_id ?? "—"}</td>
                  <td className="p-2.5 font-bold text-heading">{log.action}</td>
                  <td className="p-2.5 text-muted">{log.target_table ? `${log.target_table}:${log.target_id}` : "—"}</td>
                  <td className="max-w-[220px] truncate p-2.5 text-[11px] text-muted" title={JSON.stringify(log.meta)}>{log.meta ? JSON.stringify(log.meta) : ""}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted">कोई गतिविधि नहीं मिली।</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <ActivityLogsPagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
