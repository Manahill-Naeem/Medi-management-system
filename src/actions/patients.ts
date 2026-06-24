"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePatientNumber } from "@/lib/utils";
import type { Gender } from "@/lib/types";

export async function createPatientAction(formData: FormData) {
  await requireRole(["ADMIN", "RECEPTION"]);

  const name = formData.get("name") as string;
  const age = parseInt(formData.get("age") as string, 10);
  const gender = formData.get("gender") as Gender;
  const phone = formData.get("phone") as string;
  const address = (formData.get("address") as string) || null;
  const bloodGroup = (formData.get("bloodGroup") as string) || null;
  const cnic = (formData.get("cnic") as string) || null;

  if (!name || !age || !gender || !phone) {
    return { error: "Please fill all required fields." };
  }

  let patientNumber = generatePatientNumber();
  let exists = await prisma.patient.findUnique({ where: { patientNumber } });
  while (exists) {
    patientNumber = generatePatientNumber();
    exists = await prisma.patient.findUnique({ where: { patientNumber } });
  }

  const patient = await prisma.patient.create({
    data: {
      patientNumber,
      name,
      age,
      gender,
      phone,
      address,
      bloodGroup,
      cnic,
    },
  });

  revalidatePath("/dashboard/reception");
  return { success: true, patientId: patient.id, patientNumber: patient.patientNumber };
}

export async function searchPatientsAction(query: string) {
  await requireRole(["ADMIN", "RECEPTION", "DEPARTMENT", "TYPIST"]);

  if (!query.trim()) return [];

  return prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { patientNumber: { contains: query } },
        { phone: { contains: query } },
        { cnic: { contains: query } },
      ],
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
}
