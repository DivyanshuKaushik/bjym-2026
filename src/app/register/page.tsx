import { createClient } from "@/lib/supabase/server";
import { RegisterWizard } from "@/components/forms/RegisterWizard";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data: districts } = await supabase.from("districts").select("*").order("name_hi");

  return (
    <div className="px-4 py-14 sm:px-8">
      <RegisterWizard districts={districts ?? []} />
    </div>
  );
}
