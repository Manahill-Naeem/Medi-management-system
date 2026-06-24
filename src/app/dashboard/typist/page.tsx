import { requireRole } from "@/lib/auth";
import { getTypistData, getTemplatesForTypist } from "@/lib/queries";
import { TypistReportPanel } from "@/components/typist/typist-report-panel";

export default async function TypistPage() {
  await requireRole(["ADMIN", "TYPIST"]);
  const [data, templates] = await Promise.all([
    getTypistData(),
    getTemplatesForTypist(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Typist Report Center</h1>
        <p className="text-slate-500">
          Apna format select karein, keywords ya organ values dalen — report usi format mein khud ban jayegi
        </p>
      </div>

      <TypistReportPanel testOrders={data.testOrders} templates={templates} />
    </div>
  );
}
