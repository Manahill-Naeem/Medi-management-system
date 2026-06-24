"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateFromTemplate,
  parseJsonField,
  type KeywordRule,
  type TemplateFieldDefaults,
} from "@/lib/template-engine";
import type { ReportStatus } from "@/lib/types";

export async function getTemplatesAction() {
  await requireRole(["ADMIN", "TYPIST"]);

  const templates = await prisma.reportTemplate.findMany({
    where: { isActive: true },
    include: { testType: true },
    orderBy: { name: "asc" },
  });

  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    testTypeId: t.testTypeId,
    testTypeName: t.testType?.name ?? null,
    content: t.content,
    fieldDefaults: parseJsonField<TemplateFieldDefaults>(t.fieldDefaults, {}),
    keywordRules: parseJsonField<KeywordRule[]>(t.keywordRules, []),
  }));
}

export async function createTemplateAction(formData: FormData) {
  await requireRole(["ADMIN", "TYPIST"]);

  const name = formData.get("name") as string;
  const testTypeId = (formData.get("testTypeId") as string) || null;
  const content = formData.get("content") as string;
  const fieldDefaults = formData.get("fieldDefaults") as string;
  const keywordRules = formData.get("keywordRules") as string;

  if (!name?.trim() || !content?.trim()) {
    return { error: "Template name and format content are required." };
  }

  await prisma.reportTemplate.create({
    data: {
      name: name.trim(),
      testTypeId: testTypeId || null,
      content,
      fieldDefaults: fieldDefaults || "{}",
      keywordRules: keywordRules || "[]",
    },
  });

  revalidatePath("/dashboard/typist/templates");
  revalidatePath("/dashboard/typist");
  return { success: true };
}

export async function updateTemplateAction(formData: FormData) {
  await requireRole(["ADMIN", "TYPIST"]);

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const testTypeId = (formData.get("testTypeId") as string) || null;
  const content = formData.get("content") as string;
  const fieldDefaults = formData.get("fieldDefaults") as string;
  const keywordRules = formData.get("keywordRules") as string;

  if (!id || !name?.trim() || !content?.trim()) {
    return { error: "Template ID, name and content are required." };
  }

  await prisma.reportTemplate.update({
    where: { id },
    data: {
      name: name.trim(),
      testTypeId: testTypeId || null,
      content,
      fieldDefaults: fieldDefaults || "{}",
      keywordRules: keywordRules || "[]",
    },
  });

  revalidatePath("/dashboard/typist/templates");
  revalidatePath("/dashboard/typist");
  return { success: true };
}

export async function deleteTemplateAction(id: string) {
  await requireRole(["ADMIN", "TYPIST"]);

  await prisma.reportTemplate.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/typist/templates");
  revalidatePath("/dashboard/typist");
  return { success: true };
}

export async function generateTemplateReportAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "TYPIST"]);

  const testOrderId = formData.get("testOrderId") as string;
  const templateId = formData.get("templateId") as string;
  const keywords = (formData.get("keywords") as string) || "";
  const fieldValuesJson = (formData.get("fieldValues") as string) || "{}";

  if (!testOrderId || !templateId) {
    return { error: "Test order and template are required." };
  }

  const [testOrder, template] = await Promise.all([
    prisma.testOrder.findUnique({
      where: { id: testOrderId },
      include: { patient: true, testType: true, department: true },
    }),
    prisma.reportTemplate.findUnique({ where: { id: templateId } }),
  ]);

  if (!testOrder) return { error: "Test order not found." };
  if (!template) return { error: "Template not found." };

  const manualFields = parseJsonField<TemplateFieldDefaults>(fieldValuesJson, {});

  const { content, fieldValues } = generateFromTemplate({
    template: {
      id: template.id,
      name: template.name,
      testTypeId: template.testTypeId,
      content: template.content,
      fieldDefaults: parseJsonField<TemplateFieldDefaults>(template.fieldDefaults, {}),
      keywordRules: parseJsonField(template.keywordRules, []),
    },
    patient: {
      patientName: testOrder.patient.name,
      patientNumber: testOrder.patient.patientNumber,
      patientAge: testOrder.patient.age,
      patientGender: testOrder.patient.gender,
      testName: testOrder.testType.name,
      departmentName: testOrder.department.name,
      clinicalNotes: testOrder.clinicalNotes,
    },
    keywords,
    fieldValues: manualFields,
  });

  const report = await prisma.report.upsert({
    where: { testOrderId },
    create: {
      testOrderId,
      templateId,
      typistId: user.id,
      keywords,
      fieldValues: JSON.stringify(fieldValues),
      content,
      status: "DRAFT",
    },
    update: {
      templateId,
      keywords,
      fieldValues: JSON.stringify(fieldValues),
      content,
      typistId: user.id,
    },
  });

  revalidatePath("/dashboard/typist");
  return {
    success: true,
    content: report.content,
    reportId: report.id,
    fieldValues,
  };
}

export async function updateReportAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "TYPIST"]);

  const reportId = formData.get("reportId") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as ReportStatus;
  const fieldValues = formData.get("fieldValues") as string;

  if (!reportId || !content) {
    return { error: "Report content is required." };
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      content,
      status: status || "DRAFT",
      typistId: user.id,
      ...(fieldValues ? { fieldValues } : {}),
    },
  });

  if (status === "FINAL") {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (report) {
      await prisma.testOrder.update({
        where: { id: report.testOrderId },
        data: { status: "COMPLETED" },
      });
    }
  }

  revalidatePath("/dashboard/typist");
  revalidatePath("/dashboard/department");
  return { success: true };
}
