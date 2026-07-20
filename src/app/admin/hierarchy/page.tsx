import { HIERARCHY } from "@/data/hierarchy";
import { HierarchyViewer } from "@/components/admin/HierarchyViewer";

export default function HierarchyPage() {
  const totalAssemblies = HIERARCHY.reduce((sum, d) => sum + d.assemblies.length, 0);
  const totalMandals = HIERARCHY.reduce((sum, d) => sum + d.assemblies.reduce((s, a) => s + a.mandals.length, 0), 0);

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border bg-white p-4 text-[13px] text-muted">
        संगठनात्मक hierarchy अब <code className="rounded bg-bg px-1.5 py-0.5 text-[12px]">src/data/hierarchy.ts</code> में
        code के रूप में रहती है, Database में नहीं — इसे edit करने के लिए वह file बदलें (या Excel से दोबारा generate करें) और redeploy करें।
        <div className="mt-2 flex flex-wrap gap-4 font-bold text-heading">
          <span>{HIERARCHY.length} जिले</span>
          <span>{totalAssemblies} विधानसभा</span>
          <span>{totalMandals} मंडल</span>
        </div>
      </div>
      <HierarchyViewer />
    </div>
  );
}
