import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { parseJsonField, type KeywordRule, type TemplateFieldDefaults } from "@/lib/template-engine";

export async function getDashboardStats() {
  const user = await requireSession();

  const [
    totalPatients,
    todayAppointments,
    pendingTests,
    completedReports,
    inProgressTests,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.testOrder.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "FINAL" } }),
    prisma.testOrder.count({ where: { status: "IN_PROGRESS" } }),
  ]);

  const recentOrders = await prisma.testOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      testType: true,
      department: true,
    },
    where:
      user.role === "DEPARTMENT" && user.departmentId
        ? { departmentId: user.departmentId }
        : undefined,
  });

  return {
    totalPatients,
    todayAppointments,
    pendingTests,
    completedReports,
    inProgressTests,
    recentOrders,
  };
}

export async function getReceptionData() {
  await requireSession();

  const [patients, appointments, testOrders, departments, testTypes] =
    await Promise.all([
      prisma.patient.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
      prisma.appointment.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { patient: true, department: true },
      }),
      prisma.testOrder.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { patient: true, testType: true, department: true },
      }),
      prisma.department.findMany({ orderBy: { name: "asc" } }),
      prisma.testType.findMany({
        include: { department: true },
        orderBy: { name: "asc" },
      }),
    ]);

  return { patients, appointments, testOrders, departments, testTypes };
}

export async function getDepartmentData(departmentId: string | null) {
  if (!departmentId) return { testOrders: [] };

  const testOrders = await prisma.testOrder.findMany({
    where: { departmentId },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: {
      patient: true,
      testType: true,
      department: true,
      report: true,
    },
  });

  return { testOrders };
}

export async function getTypistData() {
  const testOrders = await prisma.testOrder.findMany({
    where: {
      status: { in: ["IN_PROGRESS", "COMPLETED", "PENDING"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      testType: true,
      department: true,
      report: true,
    },
  });

  return { testOrders };
}

export async function getTemplatesForTypist() {
  await requireSession();

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

export async function getTestTypesList() {
  await requireSession();
  return prisma.testType.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getAdminData() {
  const [departments, testTypes, users] = await Promise.all([
    prisma.department.findMany({
      include: { _count: { select: { testOrders: true, users: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.testType.findMany({
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      include: { department: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { departments, testTypes, users };
}
