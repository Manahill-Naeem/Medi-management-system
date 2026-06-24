"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createAppointmentAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "RECEPTION"]);

  const patientId = formData.get("patientId") as string;
  const doctorName = formData.get("doctorName") as string;
  const departmentId = formData.get("departmentId") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const type = formData.get("type") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!patientId || !doctorName || !departmentId || !date || !time || !type) {
    return { error: "Please fill all required fields." };
  }

  await prisma.appointment.create({
    data: {
      patientId,
      doctorName,
      departmentId,
      date: new Date(date),
      time,
      type,
      notes,
      createdById: user.id,
    },
  });

  revalidatePath("/dashboard/reception");
  return { success: true };
}
