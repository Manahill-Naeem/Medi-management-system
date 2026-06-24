import { PatientSelfRegisterForm } from "@/components/reception/patient-self-register-form";

export default function PatientRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Medi Hospital
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Self Registration</h1>
          <p className="mt-2 text-sm text-slate-600">
            Apna ya patient ka form fill karein. Register hone ke baad Patient ID reception
            par dikhayein.
          </p>
        </div>

        <PatientSelfRegisterForm variant="public" />
      </div>
    </div>
  );
}
