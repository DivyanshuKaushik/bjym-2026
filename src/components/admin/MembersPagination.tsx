"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MembersPagination({ total, page, pageSize }: { total: number; page: number; pageSize: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    startTransition(() => router.push(`/admin/members?${params.toString()}`));
  };

  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
      <span className="text-xs text-muted">
        {pending ? "लोड हो रहा है…" : `${from.toLocaleString("en-IN")}–${to.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")} सदस्य दिखाए जा रहे हैं`}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" disabled={pending || page <= 1} onClick={() => goTo(page - 1)}>← पिछला</Button>
        <span className="text-xs font-bold text-heading">पृष्ठ {page} / {totalPages}</span>
        <Button size="sm" variant="ghost" disabled={pending || page >= totalPages} onClick={() => goTo(page + 1)}>अगला →</Button>
      </div>
    </div>
  );
}
