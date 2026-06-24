import { headers } from "next/headers";

export async function getPatientRegistrationUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return `${configured}/register`;
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) {
    return "/register";
  }

  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}/register`;
}
