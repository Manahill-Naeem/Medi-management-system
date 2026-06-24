"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white">
          <Stethoscope className="h-7 w-7" />
        </div>
        <CardTitle>Medi Hospital</CardTitle>
        <p className="text-sm text-slate-500">
          Sign in to access the hospital management system
        </p>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="reception@medihospital.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
          <p className="mb-2 font-semibold text-slate-800">Demo accounts:</p>
          <ul className="space-y-1">
            <li>Reception: reception@medihospital.com / reception123</li>
            <li>Radiology: radiology@medihospital.com / dept123</li>
            <li>Typist: typist@medihospital.com / typist123</li>
            <li>Admin: admin@medihospital.com / admin123</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
