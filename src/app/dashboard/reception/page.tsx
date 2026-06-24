import { requireRole } from "@/lib/auth";
import { getReceptionData } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";
import { PatientRegistrationForm } from "@/components/reception/patient-form";
import { AppointmentForm } from "@/components/reception/appointment-form";
import { TestOrderForm } from "@/components/reception/test-order-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReceptionPage() {
  await requireRole(["ADMIN", "RECEPTION"]);
  const data = await getReceptionData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reception Desk</h1>
        <p className="text-slate-500">
          Register patients, schedule appointments, and order tests — information
          routes automatically to departments
        </p>
      </div>

      <PatientRegistrationForm />

      <div className="grid gap-6 xl:grid-cols-2">
        <AppointmentForm
          patients={data.patients}
          departments={data.departments}
        />
        <TestOrderForm patients={data.patients} testTypes={data.testTypes} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-2 pr-3">ID</th>
                    <th className="pb-2 pr-3">Name</th>
                    <th className="pb-2 pr-3">Phone</th>
                    <th className="pb-2">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {data.patients.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50">
                      <td className="py-2 pr-3 font-medium">{p.patientNumber}</td>
                      <td className="py-2 pr-3">{p.name}</td>
                      <td className="py-2 pr-3">{p.phone}</td>
                      <td className="py-2">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Test Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="pb-2 pr-3">Order</th>
                    <th className="pb-2 pr-3">Patient</th>
                    <th className="pb-2 pr-3">Department</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.testOrders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-50">
                      <td className="py-2 pr-3 font-medium">{o.orderNumber}</td>
                      <td className="py-2 pr-3">{o.patient.name}</td>
                      <td className="py-2 pr-3">{o.department.name}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            o.status === "COMPLETED"
                              ? "success"
                              : o.status === "IN_PROGRESS"
                                ? "info"
                                : "warning"
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
