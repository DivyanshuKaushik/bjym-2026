"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "@/app/actions/login";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAdmin({ username, password, remember });
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-[390px] rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_20px_55px_rgba(13,18,32,.12)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D1220] to-[#232E4C] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="BJYM Chhattisgarh" className="h-full w-full rounded-lg bg-white object-contain p-0.5" />
          </div>
          <div className="mt-3 text-xl font-black text-heading">Admin Login</div>
          <div className="text-xs text-muted">मास्टर एडमिन / टीम सदस्य के लिए</div>
        </div>
        {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        <div className="grid gap-4">
          <div>
            <Label required>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label required>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-heading">
            <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember Me
          </label>
          <Button type="submit" variant="navy" disabled={pending}>{pending ? "…" : "Sign in →"}</Button>
        </div>
      </form>
    </div>
  );
}
