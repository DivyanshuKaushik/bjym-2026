"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAdminUser, setAdminActive } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";

type AdminRow = {
  id: string; username: string; fullName: string; roleId: string;
  roleName: string; isActive: boolean; lastLogin: string | null; createdAt: string;
};

export function AdminUsersClient({ admins, roles }: { admins: AdminRow[]; roles: { id: string; name: string }[] }) {
  const [rows, setRows] = useState(admins);
  useEffect(() => setRows(admins), [admins]);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState<"MASTER_ADMIN" | "TEAM_MEMBER">("TEAM_MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createAdminUser({ username, fullName, password, roleName });
      if (res?.error) setError(res.error);
      else {
        setRows((prev) => [{ id: crypto.randomUUID(), username, fullName, roleId: "", roleName, isActive: true, lastLogin: null, createdAt: new Date().toISOString() }, ...prev]);
        setUsername(""); setFullName(""); setPassword("");
      }
    });
  };

  const toggleActive = (id: string, next: boolean) => {
    startTransition(async () => {
      const res = await setAdminActive(id, next);
      if (!res?.error) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: next } : r)));
    });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader><CardTitle>नया Admin बनाएं</CardTitle></CardHeader>
        <CardContent>
          {error && <div className="mb-3 rounded-xl border border-danger/30 bg-red-50 px-3 py-2 text-xs font-bold text-danger">{error}</div>}
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input placeholder="पूरा नाम" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Select value={roleName} onChange={(e) => setRoleName(e.target.value as typeof roleName)}>
              <option value="TEAM_MEMBER">टीम सदस्य</option>
              <option value="MASTER_ADMIN">मास्टर एडमिन</option>
            </Select>
            <Button type="submit" disabled={pending} className="sm:col-span-2">{pending ? "…" : "Admin बनाएं"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>सभी Admin Users ({rows.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-bg text-left">
                {["Username", "नाम", "Role", "Status", "Last Login", ""].map((h) => (
                  <th key={h} className="border-b border-border p-2.5 text-[10.5px] font-extrabold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border">
                  <td className="p-2.5 font-bold text-heading">{a.username}</td>
                  <td className="p-2.5">{a.fullName}</td>
                  <td className="p-2.5">{a.roleName}</td>
                  <td className="p-2.5"><Badge tone={a.isActive ? "success" : "danger"}>{a.isActive ? "Active" : "Inactive"}</Badge></td>
                  <td className="p-2.5">{a.lastLogin ? formatDate(a.lastLogin) : "—"}</td>
                  <td className="p-2.5">
                    <button onClick={() => toggleActive(a.id, !a.isActive)} disabled={pending} className="text-xs font-bold text-primary-dark hover:underline">
                      {a.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
