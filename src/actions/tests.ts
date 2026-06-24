"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import type { Priority } from "@/lib/types";

export async function createTestOrderAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "RECEPTION"]);

  const patientId = formData.get("patientId") as string;
  const testTypeId = formData.get("testTypeId") as string;
  const priority = (formData.get("priority") as Priority) || "ROUTINE";
  const clinicalNotes = (formData.get("clinicalNotes") as string) || null;
  const receptionNotes = (formData.get("receptionNotes") as string) || null;

  if (!patientId || !testTypeId) {
    return { error: "Patient and test type are required." };
  }

  const testType = await prisma.testType.findUnique({
    where: { id: testTypeId },
    include: { department: true },
  });

  if (!testType) {
    return { error: "Test type not found." };
  }

  let orderNumber = generateOrderNumber();
  let exists = await prisma.testOrder.findUnique({ where: { orderNumber } });
  while (exists) {
    orderNumber = generateOrderNumber();
    exists = await prisma.testOrder.findUnique({ where: { orderNumber } });
  }

  const order = await prisma.testOrder.create({
    data: {
      orderNumber,
      patientId,
      testTypeId,
      departmentId: testType.departmentId,
      priority,
      clinicalNotes,
      receptionNotes,
      createdById: user.id,
    },
    include: {
      department: true,
      testType: true,
      patient: true,
    },
  });

  revalidatePath("/dashboard/reception");
  revalidatePath("/dashboard/department");
  revalidatePath("/dashboard/typist");

  return {
    success: true,
    orderNumber: order.orderNumber,
    department: order.department.name,
    testName: order.testType.name,
  };
}

export async function updateTestStatusAction(
  testOrderId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
) {
  await requireRole(["ADMIN", "DEPARTMENT"]);

  await prisma.testOrder.update({
    where: { id: testOrderId },
    data: { status },
  });

  revalidatePath("/dashboard/department");
  revalidatePath("/dashboard/typist");
  return { success: true };
}
