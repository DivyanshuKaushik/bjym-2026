"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chakra } from "@/components/common/Chakra";
import { Avatar } from "@/components/common/Avatar";
import type { VerifyResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function VerifyClient() {
  const { d } = useLang();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("id") ?? "");
  const [result, setResult] = useState<VerifyResult | null | "notfound">(null);
  const [loading, setLoading] = useState(false);

  const search = async (idOverride?: string) => {
    const id = (idOverride ?? query).trim();
    if (!id) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("verify_membership", { p_membership_id: id });
    setResult(data && data.length > 0 ? (data[0] as VerifyResult) : "notfound");
    setLoading(false);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) search(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-[540px] animate-fadeUp">
      <div className="mb-6 text-center">
        <div className="inline-block rounded-full bg-[#EEEEFC] px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-navy">
          QR / ID Verification
        </div>
        <div className="mt-2.5 font-serif text-[28px] font-black text-heading">{d.verify.title}</div>
        <div className="mt-1 text-sm text-muted">{d.verify.subtitle}</div>
      </div>

      <div className="flex gap-2.5">
        <Input
          className="rounded-full px-5 py-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={d.verify.placeholder}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <Button variant="navy" onClick={() => search()} disabled={loading}>
          {loading ? "…" : d.verify.button}
        </Button>
      </div>

      {result === "notfound" && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-bold text-danger">
          ✕ {d.verify.notFound}
        </div>
      )}

      {result && result !== "notfound" && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_18px_50px_rgba(13,18,32,.12)]">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #F36B21, #fff, #1F6B3B)" }} />
          <div className="p-6 text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary-light px-4 py-1.5 text-xs font-black text-secondary-dark">
              <Chakra size={15} color="#14532D" /> {d.verify.verified}
            </div>
            <div className="flex justify-center">
              <Avatar name={result.full_name} photo={result.photo_base64} size={88} ring="#1F6B3B" />
            </div>
            <div className="mt-3 text-xl font-black text-heading">{result.full_name}</div>
            <div className="mt-0.5 bg-gradient-to-r from-primary-dark to-navy bg-clip-text text-sm font-black text-transparent">
              {result.membership_id}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-bg p-4 text-left text-[13px]">
              <span>
                <b>स्थिति:</b>{" "}
                <Badge tone={result.status === "Active" ? "success" : result.status === "Suspended" ? "warning" : "danger"}>
                  {result.status}
                </Badge>
              </span>
              <span><b>जिला:</b> {result.district_name_hi}</span>
              <span><b>मंडल:</b> {result.mandal_name_hi}</span>
              <span><b>पंजीकरण:</b> {formatDate(result.joined_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
