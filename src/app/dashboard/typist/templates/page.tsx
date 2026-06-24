import { requireRole } from "@/lib/auth";
import { getTemplatesForTypist, getTestTypesList } from "@/lib/queries";
import { TemplateManager } from "@/components/typist/template-manager";

export default async function TemplatesPage() {
  await requireRole(["ADMIN", "TYPIST"]);
  const [templates, testTypes] = await Promise.all([
    getTemplatesForTypist(),
    getTestTypesList(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report Format Templates</h1>
        <p className="text-slate-500">
          Apna normal whole abdomen (ya koi bhi) report format yahan save karein — baad mein sirf keywords change karein
        </p>
      </div>

      <TemplateManager templates={templates} testTypes={testTypes} />
    </div>
  );
}
