import { activityRepository } from "@/lib/repositories/activity.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  const { rows, total } = await activityRepository.list({ limit: 100 });

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <div className="border-b border-border p-3 text-xs text-muted">Showing latest {rows.length} of {total} entries</div>
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
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
