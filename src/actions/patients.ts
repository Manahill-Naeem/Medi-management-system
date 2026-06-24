"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePatientNumber } from "@/lib/utils";
import type { Gender } from "@/lib/types";

type PatientInput = {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  address: string | null;
  bloodGroup: string | null;
  cnic: string | null;
};

function parsePatientForm(formData: FormData): PatientInput | { error: string } {
  const name = (formData.get("name") as string)?.trim();
  const ageRaw = formData.get("age") as string;
  const age = parseInt(ageRaw, 10);
  const gender = formData.get("gender") as Gender;
  const phone = (formData.get("phone") as string)?.trim();
  const address = ((formData.get("address") as string) || "").trim() || null;
  const bloodGroup = ((formData.get("bloodGroup") as string) || "").trim() || null;
  const cnic = ((formData.get("cnic") as string) || "").trim() || null;

  if (!name || !ageRaw || Number.isNaN(age) || !gender || !phone) {
    return { error: "Please fill all required fields." };
  }

  if (age < 0 || age > 150) {
    return { error: "Please enter a valid age." };
  }

  return { name, age, gender, phone, address, bloodGroup, cnic };
}

async function createPatientRecord(input: PatientInput) {
  let patientNumber = generatePatientNumber();
  let exists = await prisma.patient.findUnique({ where: { patientNumber } });
  while (exists) {
    patientNumber = generatePatientNumber();
    exists = await prisma.patient.findUnique({ where: { patientNumber } });
  }

  const patient = await prisma.patient.create({
    data: {
      patientNumber,
      name: input.name,
      age: input.age,
      gender: input.gender,
      phone: input.phone,
      address: input.address,
      bloodGroup: input.bloodGroup,
      cnic: input.cnic,
    },
  });

  return patient;
}

export async function createPatientAction(formData: FormData) {
  await requireRole(["ADMIN", "RECEPTION"]);

  const parsed = parsePatientForm(formData);
  if ("error" in parsed) return parsed;

  const patient = await createPatientRecord(parsed);

  revalidatePath("/dashboard/reception");
  return { success: true, patientId: patient.id, patientNumber: patient.patientNumber };
}

export async function registerPatientSelfAction(formData: FormData) {
  const honeypot = (formData.get("website") as string)?.trim();
  if (honeypot) {
    return { error: "Unable to submit registration." };
  }

  const parsed = parsePatientForm(formData);
  if ("error" in parsed) return parsed;

  const patient = await createPatientRecord(parsed);

  revalidatePath("/dashboard/reception");
  revalidatePath("/register");

  return {
    success: true,
    patientId: patient.id,
    patientNumber: patient.patientNumber,
    name: patient.name,
  };
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
