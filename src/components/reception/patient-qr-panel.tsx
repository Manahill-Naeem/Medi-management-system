"use client";

import QRCode from "react-qr-code";

type Props = {
  registrationUrl: string;
};

export function PatientQrPanel({ registrationUrl }: Props) {
  return (
    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-slate-50 p-6">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="mx-auto rounded-2xl border border-white bg-white p-4 shadow-sm">
          <QRCode
            value={registrationUrl}
            size={180}
            style={{ height: "auto", maxWidth: "100%", width: "180px" }}
            viewBox="0 0 256 256"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Self Registration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Rush ke waqt patient ya attendant QR scan karke khud register ho jaye.
              Aap sirf appointment, test order aur payment handle karein.
            </p>
          </div>

          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="font-semibold text-teal-700">1.</span>
              Patient QR code scan kare
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-teal-700">2.</span>
              Mobile par details fill kare
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-teal-700">3.</span>
              Patient ID reception par bataye — baqi aap karein
            </li>
          </ol>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Registration Link
            </p>
            <p className="mt-1 break-all text-sm text-teal-700">{registrationUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
