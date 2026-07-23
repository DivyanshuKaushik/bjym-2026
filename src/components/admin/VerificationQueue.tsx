"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveMember, rejectMember } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";
import type { MemberRow } from "@/lib/repositories/member.repository";

export function VerificationQueue({
  members, total, page, pageSize,
}: { members: MemberRow[]; total: number; page: number; pageSize: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState(members);
  useEffect(() => setRows(members), [members]);

  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [lightboxPhoto, setLightboxPhoto] = useState<{ src: string; name: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [navPending, startNav] = useTransition();

  const approve = (id: string) => {
    startTransition(async () => {
      const res = await approveMember(id);
      if (!res?.error) setRows((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const reject = (id: string) => {
    if (!reason.trim()) return;
    startTransition(async () => {
      const res = await rejectMember(id, reason);
      if (!res?.error) { setRows((prev) => prev.filter((r) => r.id !== id)); setReasonFor(null); setReason(""); }
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    startNav(() => router.push(`/admin/verification?${params.toString()}`));
  };

  if (rows.length === 0) {
    return <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted">🎉 कोई pending सदस्य नहीं — सब कुछ up to date है।</div>;
  }

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-bg text-left">
                {["फोटो", "सदस्यता ID", "नाम", "मोबाइल", "जिला", "पंजीकरण", "कार्रवाई"].map((h) => (
                  <th key={h} className="border-b border-border p-3 text-[10.5px] font-extrabold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-b border-border align-middle">
                  <td className="p-2.5">
                    <button
                      onClick={() => {
                        const src = m.photo_url || m.photo_base64;
                        if (src) setLightboxPhoto({ src, name: m.full_name });
                      }}
                      title="बड़ा करके देखें"
                    >
                      <Avatar name={m.full_name} photo={m.photo_url || m.photo_base64} size={44} square />
                    </button>
                  </td>
                  <td className="whitespace-nowrap p-2.5 font-bold text-navy">{m.membership_id}</td>
                  <td className="p-2.5 font-bold text-heading">{m.full_name}</td>
                  <td className="whitespace-nowrap p-2.5">{m.mobile}</td>
                  <td className="p-2.5">{m.district_name_hi}</td>
                  <td className="whitespace-nowrap p-2.5 text-muted">{formatDate(m.created_at)}</td>
                  <td className="whitespace-nowrap p-2.5">
                    {reasonFor === m.id ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          className="h-8 w-40 text-xs"
                          placeholder="कारण"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          autoFocus
                        />
                        <Button size="sm" variant="danger" disabled={pending || !reason.trim()} onClick={() => reject(m.id)}>पुष्टि</Button>
                        <button className="text-xs font-bold text-muted" onClick={() => { setReasonFor(null); setReason(""); }}>✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="secondary" disabled={pending} onClick={() => approve(m.id)}>✓ Approve</Button>
                        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setReasonFor(m.id)}>✕ Reject</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <span className="text-xs text-muted">{navPending ? "लोड हो रहा है…" : `पृष्ठ ${page} / ${totalPages}`}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" disabled={navPending || page <= 1} onClick={() => goTo(page - 1)}>← पिछला</Button>
            <Button size="sm" variant="ghost" disabled={navPending || page >= totalPages} onClick={() => goTo(page + 1)}>अगला →</Button>
          </div>
        </div>
      )}

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="max-w-[90vw] rounded-2xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxPhoto.src} alt={lightboxPhoto.name} className="max-h-[80vh] max-w-full rounded-xl object-contain" />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-heading">{lightboxPhoto.name}</span>
              <button className="rounded-full border border-border px-3 py-1 text-xs font-bold" onClick={() => setLightboxPhoto(null)}>बंद करें ✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
