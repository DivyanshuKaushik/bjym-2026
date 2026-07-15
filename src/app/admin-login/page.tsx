"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Chakra } from "@/components/common/Chakra";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAdmin({ email, password });
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-[390px] rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_20px_55px_rgba(13,18,32,.12)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D1220] to-[#232E4C]">
            <Chakra size={34} color="#fff" />
          </div>
          <div className="mt-3 text-xl font-black text-heading">Admin Login</div>
          <div className="text-xs text-muted">Master Admin access only</div>
        </div>
        {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        <div className="grid gap-4">
          <div>
            <Label required>Username / Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label required>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" variant="navy" disabled={pending}>{pending ? "…" : "Sign in →"}</Button>
        </div>
      </form>
    </div>
  );
}
