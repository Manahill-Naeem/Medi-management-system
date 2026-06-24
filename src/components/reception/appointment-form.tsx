"use client";

import { useState } from "react";
import { createAppointmentAction } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Patient = { id: string; patientNumber: string; name: string };
type Department = { id: string; name: string };

export function AppointmentForm({
  patients,
  departments,
}: {
  patients: Patient[];
  departments: Department[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await createAppointmentAction(formData);
    if (result.error) setError(result.error);
    else {
      setMessage("Appointment scheduled successfully.");
      (document.getElementById("appointment-form") as HTMLFormElement)?.reset();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Doctor Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="appointment-form" action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
          <Input label="Doctor Name *" name="doctorName" required placeholder="Dr. Ahmed Khan" />
          <Select
            label="Department *"
            name="departmentId"
            options={[
              { value: "", label: "Select department" },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
          <Input label="Date *" name="date" type="date" required />
          <Input label="Time *" name="time" type="time" required />
          <Select
            label="Appointment Type *"
            name="type"
            options={[
              { value: "Consultation", label: "Consultation" },
              { value: "Follow-up", label: "Follow-up" },
              { value: "Emergency", label: "Emergency" },
              { value: "Check-up", label: "Check-up" },
            ]}
          />
          <div className="sm:col-span-2">
            <Textarea label="Notes" name="notes" rows={2} placeholder="Additional notes" />
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
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
