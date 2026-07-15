"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res?.error) setError(res.error);
      else setMsg("Password reset link आपके ईमेल पर भेज दिया गया है।");
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_20px_55px_rgba(13,18,32,.1)]">
        <div className="mb-6 text-center text-xl font-black text-heading">पासवर्ड रीसेट करें</div>
        {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        {msg && <div className="mb-4 rounded-xl border border-secondary/30 bg-secondary-light px-4 py-2.5 text-sm font-bold text-secondary-dark">{msg}</div>}
        <div className="grid gap-4">
          <div>
            <Label required>ईमेल</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" disabled={pending}>{pending ? "…" : "Reset Link भेजें"}</Button>
        </div>
      </form>
    </div>
  );
}
