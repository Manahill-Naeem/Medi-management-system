export const Roles = {
  ADMIN: "ADMIN",
  RECEPTION: "RECEPTION",
  DEPARTMENT: "DEPARTMENT",
  TYPIST: "TYPIST",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const Genders = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export const AppointmentStatuses = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatuses)[keyof typeof AppointmentStatuses];

export const TestStatuses = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type TestStatus = (typeof TestStatuses)[keyof typeof TestStatuses];

export const ReportStatuses = {
  DRAFT: "DRAFT",
  FINAL: "FINAL",
} as const;

export type ReportStatus = (typeof ReportStatuses)[keyof typeof ReportStatuses];

export const Priorities = {
  ROUTINE: "ROUTINE",
  URGENT: "URGENT",
  STAT: "STAT",
} as const;

export type Priority = (typeof Priorities)[keyof typeof Priorities];
