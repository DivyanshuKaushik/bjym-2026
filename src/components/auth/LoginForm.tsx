"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginMember } from "@/app/actions/login";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [mpin, setMpin] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginMember({ identifier, mpin, remember });
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_20px_55px_rgba(13,18,32,.1)]">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="BJYM Chhattisgarh" className="mx-auto h-14 w-auto object-contain" />
          <div className="mt-3 text-xl font-black text-heading">सदस्य लॉगिन</div>
          <div className="text-xs text-muted">मोबाइल नंबर / ईमेल और MPIN से लॉगिन करें</div>
        </div>
        {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        <div className="grid gap-4">
          <div>
            <Label required>मोबाइल नंबर या ईमेल</Label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div>
            <Label required>MPIN</Label>
            <Input type="password" inputMode="numeric" maxLength={6} value={mpin} onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))} required />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-heading">
            <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            मुझे याद रखें (Remember Me)
          </label>
          <Button type="submit" disabled={pending}>{pending ? "…" : "लॉगिन करें →"}</Button>
          <div className="flex justify-between text-xs">
            <span className="text-muted">MPIN भूल गए? तकनीकी सहायता हेतु संपर्क करें।</span>
            <Link href="/register" className="font-bold text-secondary hover:underline">नया पंजीकरण</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
