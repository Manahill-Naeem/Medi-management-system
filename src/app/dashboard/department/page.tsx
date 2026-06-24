import { requireRole } from "@/lib/auth";
import { getDepartmentData } from "@/lib/queries";
import { DepartmentQueue } from "@/components/department/department-queue";

export default async function DepartmentPage() {
  const user = await requireRole(["ADMIN", "DEPARTMENT"]);
  const data = await getDepartmentData(user.departmentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {user.departmentName ?? "Department"} Queue
        </h1>
        <p className="text-slate-500">
          Test orders from reception appear here automatically — no manual transfer needed
        </p>
      </div>

      <DepartmentQueue testOrders={data.testOrders} />
    </div>
  );
}
