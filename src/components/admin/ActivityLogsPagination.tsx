"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ActivityLogsPagination({ total, page, pageSize }: { total: number; page: number; pageSize: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goTo = (p: number) => startTransition(() => router.push(`/admin/activity-logs?page=${p}`));

  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
      <span className="text-xs text-muted">{pending ? "लोड हो रहा है…" : `पृष्ठ ${page} / ${totalPages}`}</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" disabled={pending || page <= 1} onClick={() => goTo(page - 1)}>← पिछला</Button>
        <Button size="sm" variant="ghost" disabled={pending || page >= totalPages} onClick={() => goTo(page + 1)}>अगला →</Button>
      </div>
    </div>
  );
}
