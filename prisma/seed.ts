import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding Medi Hospital database...");

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: "RAD" },
      update: {},
      create: {
        name: "Radiology",
        code: "RAD",
        description: "X-Ray, CT Scan, MRI imaging",
      },
    }),
    prisma.department.upsert({
      where: { code: "USG" },
      update: {},
      create: {
        name: "Ultrasound",
        code: "USG",
        description: "Ultrasonography and doppler studies",
      },
    }),
    prisma.department.upsert({
      where: { code: "LAB" },
      update: {},
      create: {
        name: "Laboratory",
        code: "LAB",
        description: "Blood tests and pathology",
      },
    }),
    prisma.department.upsert({
      where: { code: "CARD" },
      update: {},
      create: {
        name: "Cardiology",
        code: "CARD",
        description: "ECG and cardiac diagnostics",
      },
    }),
    prisma.department.upsert({
      where: { code: "OPD" },
      update: {},
      create: {
        name: "Outpatient (OPD)",
        code: "OPD",
        description: "General consultations",
      },
    }),
  ]);

  const [radiology, ultrasound, lab, cardiology] = departments;

  const testTypes = [
    { name: "Chest X-Ray", departmentId: radiology.id },
    { name: "Abdominal X-Ray", departmentId: radiology.id },
    { name: "CT Scan Brain", departmentId: radiology.id },
    { name: "MRI Spine", departmentId: radiology.id },
    { name: "Abdominal Ultrasound", departmentId: ultrasound.id },
    { name: "Obstetric Ultrasound", departmentId: ultrasound.id },
    { name: "Complete Blood Count (CBC)", departmentId: lab.id },
    { name: "Liver Function Test (LFT)", departmentId: lab.id },
    { name: "Blood Sugar (RBS)", departmentId: lab.id },
    { name: "12-Lead ECG", departmentId: cardiology.id },
    { name: "Echocardiography", departmentId: cardiology.id },
  ];

  for (const test of testTypes) {
    const existing = await prisma.testType.findFirst({
      where: { name: test.name, departmentId: test.departmentId },
    });
    if (!existing) {
      await prisma.testType.create({ data: test });
    }
  }

  const users = [
    {
      email: "admin@medihospital.com",
      password: "admin123",
      name: "System Admin",
      role: "ADMIN" as const,
      departmentId: null,
    },
    {
      email: "reception@medihospital.com",
      password: "reception123",
      name: "Sara Ahmed",
      role: "RECEPTION" as const,
      departmentId: null,
    },
    {
      email: "radiology@medihospital.com",
      password: "dept123",
      name: "Dr. Hassan Ali",
      role: "DEPARTMENT" as const,
      departmentId: radiology.id,
    },
    {
      email: "lab@medihospital.com",
      password: "dept123",
      name: "Dr. Fatima Noor",
      role: "DEPARTMENT" as const,
      departmentId: lab.id,
    },
    {
      email: "typist@medihospital.com",
      password: "typist123",
      name: "Ayesha Khan",
      role: "TYPIST" as const,
      departmentId: null,
    },
  ];

  for (const user of users) {
    const hashed = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashed,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
      },
    });
  }

  const abdominalUsg = await prisma.testType.findFirst({
    where: { name: "Abdominal Ultrasound" },
  });

  const {
    WHOLE_ABDOMEN_USG_TEMPLATE,
    WHOLE_ABDOMEN_FIELD_DEFAULTS,
    WHOLE_ABDOMEN_KEYWORD_RULES,
  } = await import("../src/lib/default-templates");

  const existingTemplate = await prisma.reportTemplate.findFirst({
    where: { name: "Whole Abdomen USG - Standard Format" },
  });

  const templateData = {
    name: "Whole Abdomen USG - Standard Format",
    testTypeId: abdominalUsg?.id ?? null,
    content: WHOLE_ABDOMEN_USG_TEMPLATE,
    fieldDefaults: JSON.stringify(WHOLE_ABDOMEN_FIELD_DEFAULTS),
    keywordRules: JSON.stringify(WHOLE_ABDOMEN_KEYWORD_RULES),
  };

  if (existingTemplate) {
    await prisma.reportTemplate.update({
      where: { id: existingTemplate.id },
      data: templateData,
    });
  } else {
    await prisma.reportTemplate.create({ data: templateData });
  }

  console.log("Seed completed successfully!");
  console.log("\nDemo login accounts:");
  users.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
