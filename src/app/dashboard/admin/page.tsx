import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/auth";
import type { Role } from "@/lib/types";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);
  const data = await getAdminData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
        <p className="text-slate-500">
          Manage departments, test types, and staff accounts
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Departments ({data.departments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.departments.map((dept) => (
              <div
                key={dept.id}
                className="rounded-lg border border-slate-100 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <Badge variant="info">{dept.code}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {dept._count.users} staff · {dept._count.testOrders} orders
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Types ({data.testTypes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.testTypes.map((test) => (
              <div
                key={test.id}
                className="rounded-lg border border-slate-100 p-3 text-sm"
              >
                <p className="font-medium">{test.name}</p>
                <p className="text-xs text-teal-700">{test.department.name}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff ({data.users.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.users.map((u) => (
              <div
                key={u.id}
                className="rounded-lg border border-slate-100 p-3 text-sm"
              >
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge>{getRoleLabel(u.role as Role)}</Badge>
                  {u.department && (
                    <Badge variant="purple">{u.department.name}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
