import { settingsRepository } from "@/lib/repositories/settings.repository";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await settingsRepository.getAll();
  return (
    <SettingsForm
      signatoryName={(settings.signatory_name as string) || ""}
      signatoryTitleHi={(settings.signatory_title_hi as string) || ""}
      portalNameHi={(settings.portal_name_hi as string) || ""}
      portalWebsite={(settings.portal_website as string) || ""}
    />
  );
}
