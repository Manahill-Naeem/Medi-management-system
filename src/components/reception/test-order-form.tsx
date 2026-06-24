"use client";

import { useState } from "react";
import { createTestOrderAction } from "@/actions/tests";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Patient = { id: string; patientNumber: string; name: string };
type TestType = {
  id: string;
  name: string;
  department: { name: string; code: string };
};

export function TestOrderForm({
  patients,
  testTypes,
}: {
  patients: Patient[];
  testTypes: TestType[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>("");

  const selected = testTypes.find((t) => t.id === selectedTest);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await createTestOrderAction(formData);
    if (result.error) setError(result.error);
    else if (result.success) {
      setMessage(
        `Test order ${result.orderNumber} sent to ${result.department} (${result.testName})`
      );
      (document.getElementById("test-order-form") as HTMLFormElement)?.reset();
      setSelectedTest("");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Diagnostic Test</CardTitle>
        <p className="text-sm text-slate-500">
          Test information is automatically routed to the correct department
        </p>
      </CardHeader>
      <CardContent>
        <form id="test-order-form" action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Patient *"
            name="patientId"
            options={[
              { value: "", label: "Select patient" },
              ...patients.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.patientNumber})`,
              })),
            ]}
          />
          <Select
            label="Test Type *"
            name="testTypeId"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            options={[
              { value: "", label: "Select test" },
              ...testTypes.map((t) => ({
                value: t.id,
                label: `${t.name} → ${t.department.name}`,
              })),
            ]}
          />
          {selected && (
            <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
              Auto-routing to:
              <Badge variant="info">{selected.department.name}</Badge>
              <span className="text-teal-600">({selected.department.code})</span>
            </div>
          )}
          <Select
            label="Priority"
            name="priority"
            options={[
              { value: "ROUTINE", label: "Routine" },
              { value: "URGENT", label: "Urgent" },
              { value: "STAT", label: "STAT (Emergency)" },
            ]}
          />
          <div />
          <div className="sm:col-span-2">
            <Textarea
              label="Clinical Notes"
              name="clinicalNotes"
              rows={2}
              placeholder="Doctor's clinical indication"
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Reception Notes"
              name="receptionNotes"
              rows={2}
              placeholder="Notes from reception desk"
            />
          </div>
          {message && (
            <div className="sm:col-span-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Sending to department..." : "Send Test Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
