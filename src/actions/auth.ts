"use server";

import { redirect } from "next/navigation";
import {
  destroySession,
  getDashboardPath,
  loginUser,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await loginUser(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  redirect(getDashboardPath(user.role));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
