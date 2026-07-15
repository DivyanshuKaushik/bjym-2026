import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select("key,value");
  const get = (k: string) => (settings?.find((s) => s.key === k)?.value as string) || "";

  return (
    <SettingsForm
      signatoryName={get("signatory_name")}
      signatoryTitleHi={get("signatory_title_hi")}
      portalNameHi={get("portal_name_hi")}
    />
  );
}
