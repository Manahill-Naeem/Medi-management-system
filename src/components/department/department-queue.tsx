"use client";

import { useState, useTransition } from "react";
import { updateTestStatusAction } from "@/actions/tests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type TestOrder = {
  id: string;
  orderNumber: string;
  priority: string;
  status: string;
  clinicalNotes: string | null;
  receptionNotes: string | null;
  createdAt: Date;
  patient: { name: string; patientNumber: string; age: number; gender: string };
  testType: { name: string };
  department: { name: string };
  report: { status: string } | null;
};

export function DepartmentQueue({ testOrders }: { testOrders: TestOrder[] }) {
  const [orders, setOrders] = useState(testOrders);
  const [isPending, startTransition] = useTransition();

  function updateStatus(id: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    startTransition(async () => {
      await updateTestStatusAction(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    });
  }

  const priorityVariant = (p: string) => {
    if (p === "STAT") return "danger";
    if (p === "URGENT") return "warning";
    return "default";
  };

  const statusVariant = (s: string) => {
    if (s === "COMPLETED") return "success";
    if (s === "IN_PROGRESS") return "info";
    if (s === "CANCELLED") return "danger";
    return "warning";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Test Queue</CardTitle>
        <p className="text-sm text-slate-500">
          Tests automatically routed from reception appear here
        </p>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No test orders in queue.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 p-4 hover:border-teal-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <Badge variant={priorityVariant(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge variant={statusVariant(order.status)}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.patient.name} ({order.patient.patientNumber}) ·{" "}
                      {order.patient.age}y · {order.patient.gender}
                    </p>
                    <p className="text-sm font-medium text-teal-700">
                      {order.testType.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Received: {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(order.id, "IN_PROGRESS")}
                        disabled={isPending}
                      >
                        Start Test
                      </Button>
                    )}
                    {order.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(order.id, "COMPLETED")}
                        disabled={isPending}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(order.id, "CANCELLED")}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                {(order.clinicalNotes || order.receptionNotes) && (
                  <div className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
                    {order.clinicalNotes && (
                      <div>
                        <span className="font-medium text-slate-700">Clinical: </span>
                        {order.clinicalNotes}
                      </div>
                    )}
                    {order.receptionNotes && (
                      <div>
                        <span className="font-medium text-slate-700">Reception: </span>
                        {order.receptionNotes}
                      </div>
                    )}
                  </div>
                )}
                {order.report && (
                  <p className="mt-2 text-xs text-emerald-700">
                    Report status: {order.report.status}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
