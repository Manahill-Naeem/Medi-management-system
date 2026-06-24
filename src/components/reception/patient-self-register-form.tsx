"use client";

import { useState } from "react";
import { registerPatientSelfAction } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  variant?: "public" | "staff";
};

export function PatientSelfRegisterForm({ variant = "public" }: Props) {
  const [success, setSuccess] = useState<{
    patientNumber: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await registerPatientSelfAction(formData);
    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if ("success" in result && result.success) {
      setSuccess({
        patientNumber: result.patientNumber,
        name: result.name,
      });
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="space-y-4 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registration Complete</h2>
            <p className="mt-2 text-slate-600">
              {success.name} is registered successfully.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white px-4 py-5">
            <p className="text-sm text-slate-500">Your Patient ID</p>
            <p className="mt-1 text-3xl font-bold tracking-wide text-teal-700">
              {success.patientNumber}
            </p>
          </div>
          <p className="text-sm text-slate-600">
            Reception counter par jayein aur ye Patient ID batayein. Wahan appointment,
            test order aur payment hogi.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setSuccess(null);
              setError(null);
            }}
          >
            Register Another Patient
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {variant === "public" ? "Patient Registration" : "Register New Patient"}
        </CardTitle>
        {variant === "public" && (
          <p className="text-sm text-slate-500">
            Patient khud ya attendant mobile se form fill kar sakta hai.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <Input label="Full Name *" name="name" required placeholder="Patient ka naam" />
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
            <Input label="Address" name="address" placeholder="Ghar ka address" />
          </div>
          {error && (
            <div className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Registering..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
