"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("पासवर्ड मेल नहीं खाते");
    if (password.length < 8) return setError("पासवर्ड कम से कम 8 अक्षर का हो");
    startTransition(async () => {
      const res = await updatePassword(password);
      if (res?.error) setError(res.error);
      else router.push("/dashboard");
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_20px_55px_rgba(13,18,32,.1)]">
        <div className="mb-6 text-center text-xl font-black text-heading">नया पासवर्ड सेट करें</div>
        {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        <div className="grid gap-4">
          <div>
            <Label required>नया पासवर्ड</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label required>पासवर्ड की पुष्टि करें</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" disabled={pending}>{pending ? "…" : "पासवर्ड अपडेट करें"}</Button>
        </div>
      </form>
    </div>
  );
}
