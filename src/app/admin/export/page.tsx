import { getExportHistory } from "@/app/actions/export";
import { ExportClient } from "@/components/admin/export/ExportClient";
import { HIERARCHY } from "@/data/hierarchy";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const history = await getExportHistory();
  const districts = HIERARCHY;
  return <ExportClient history={history} districts={districts} />;
}
