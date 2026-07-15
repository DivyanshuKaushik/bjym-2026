"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSetting } from "@/app/actions/admin";

export function SettingsForm({
  signatoryName, signatoryTitleHi, portalNameHi,
}: { signatoryName: string; signatoryTitleHi: string; portalNameHi: string }) {
  const [name, setName] = useState(signatoryName);
  const [title, setTitle] = useState(signatoryTitleHi);
  const [portal, setPortal] = useState(portalNameHi);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      await Promise.all([
        updateSetting("signatory_name", JSON.stringify(name)),
        updateSetting("signatory_title_hi", JSON.stringify(title)),
        updateSetting("portal_name_hi", JSON.stringify(portal)),
      ]);
      setMsg("Settings save हो गईं ✓");
    });
  };

  return (
    <Card className="max-w-[520px]">
      <CardHeader><CardTitle>ID Card & Portal Settings</CardTitle></CardHeader>
      <CardContent className="grid gap-4">
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
        <Button onClick={save} disabled={pending}>{pending ? "…" : "Save Settings"}</Button>
      </CardContent>
    </Card>
  );
}
