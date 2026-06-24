import {
  Activity,
  Calendar,
  ClipboardCheck,
  Users,
} from "lucide-react";
import { getDashboardStats } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">
          Real-time view of hospital operations and patient flow
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          title="Pending Tests"
          value={stats.pendingTests}
          icon={Activity}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Final Reports"
          value={stats.completedReports}
          icon={ClipboardCheck}
          color="bg-emerald-100 text-emerald-700"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No test orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Order #</th>
                    <th className="pb-3 pr-4 font-medium">Patient</th>
                    <th className="pb-3 pr-4 font-medium">Test</th>
                    <th className="pb-3 pr-4 font-medium">Department</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50">
                      <td className="py-3 pr-4 font-medium">{order.orderNumber}</td>
                      <td className="py-3 pr-4">{order.patient.name}</td>
                      <td className="py-3 pr-4">{order.testType.name}</td>
                      <td className="py-3 pr-4">{order.department.name}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            order.status === "COMPLETED"
                              ? "success"
                              : order.status === "IN_PROGRESS"
                                ? "info"
                                : order.status === "CANCELLED"
                                  ? "danger"
                                  : "warning"
                          }
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
