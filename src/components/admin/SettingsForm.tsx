"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/app/actions/admin";

export function SettingsForm({
  signatoryName, signatoryTitleHi, portalNameHi, portalWebsite,
}: { signatoryName: string; signatoryTitleHi: string; portalNameHi: string; portalWebsite: string }) {
  const [name, setName] = useState(signatoryName);
  const [title, setTitle] = useState(signatoryTitleHi);
  const [portal, setPortal] = useState(portalNameHi);
  const [website, setWebsite] = useState(portalWebsite);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setMsg(null); setError(null);
    startTransition(async () => {
      const res = await updateSettings({ signatoryName: name, signatoryTitleHi: title, portalNameHi: portal, portalWebsite: website });
      if (res?.error) setError(res.error);
      else setMsg("Settings save हो गईं ✓");
    });
  };

  return (
    <Card className="max-w-[520px]">
      <CardHeader><CardTitle>ID Card &amp; Portal Settings</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
        {error && <div className="rounded-xl border border-danger/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-danger">{error}</div>}
        {msg && <div className="rounded-xl border border-secondary/30 bg-secondary-light px-4 py-2.5 text-sm font-bold text-secondary-dark">{msg}</div>}
        <div>
          <Label>Signatory Name (ID Card पर हस्ताक्षर)</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Signatory Title (Hindi)</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Portal Name (Hindi)</Label>
          <Input value={portal} onChange={(e) => setPortal(e.target.value)} />
        </div>
        <div>
          <Label>Portal Website</Label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <Button onClick={save} disabled={pending}>{pending ? "…" : "Save Settings"}</Button>
      </CardContent>
    </Card>
  );
}
