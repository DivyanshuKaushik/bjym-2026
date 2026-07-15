import { createClient } from "@/lib/supabase/server";
import { HierarchyManager } from "@/components/admin/HierarchyManager";

export const dynamic = "force-dynamic";

export default async function HierarchyPage() {
  const supabase = await createClient();
  const [{ data: districts }, { data: assemblies }, { data: mandals }] = await Promise.all([
    supabase.from("districts").select("*").order("name_hi"),
    supabase.from("assemblies").select("*").order("name_hi"),
    supabase.from("mandals").select("*").order("name_hi"),
  ]);

  return (
    <HierarchyManager
      districts={districts ?? []}
      assemblies={assemblies ?? []}
      mandals={mandals ?? []}
    />
  );
}
