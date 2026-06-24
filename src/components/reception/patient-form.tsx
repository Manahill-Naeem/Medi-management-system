"use client";

import { useState } from "react";
import { createPatientAction } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientRegistrationForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await createPatientAction(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setMessage(`Patient registered: ${result.patientNumber}`);
      (document.getElementById("patient-form") as HTMLFormElement)?.reset();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="patient-form" action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name *" name="name" required placeholder="Patient name" />
          <Input label="Age *" name="age" type="number" min="0" max="150" required />
          <Select
            label="Gender *"
            name="gender"
            options={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
            ]}
          />
          <Input label="Phone *" name="phone" required placeholder="03xx-xxxxxxx" />
          <Input label="CNIC" name="cnic" placeholder="xxxxx-xxxxxxx-x" />
          <Input label="Blood Group" name="bloodGroup" placeholder="e.g. B+" />
          <div className="sm:col-span-2">
            <Input label="Address" name="address" placeholder="Home address" />
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
              {loading ? "Registering..." : "Register Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
