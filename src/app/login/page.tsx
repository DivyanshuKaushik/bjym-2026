"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginMember } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Chakra } from "@/components/common/Chakra";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginMember({ email, password });
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_20px_55px_rgba(13,18,32,.1)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-primary-dark">
            <Chakra size={30} color="#fff" />
          </div>
          <div className="mt-3 text-xl font-black text-heading">सदस्य लॉगिन</div>
          <div className="text-xs text-muted">Member Login</div>
        </div>
        {error && <div className="mb-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        <div className="grid gap-4">
          <div>
            <Label required>ईमेल</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label required>पासवर्ड</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={pending}>{pending ? "…" : "लॉगिन करें →"}</Button>
          <div className="flex justify-between text-xs">
            <Link href="/forgot-password" className="font-bold text-primary hover:underline">पासवर्ड भूल गए?</Link>
            <Link href="/register" className="font-bold text-secondary hover:underline">नया पंजीकरण</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
