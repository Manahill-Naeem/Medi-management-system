import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Role } from "@/lib/types";

const SESSION_COOKIE = "medi_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  departmentId: string | null;
  departmentName: string | null;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "medi-hospital-dev-secret";
}

function encodeSession(user: SessionUser): string {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const signature = Buffer.from(
    `${payload}.${getSessionSecret()}`
  ).toString("base64url");
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

function decodeSession(token: string): SessionUser | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [payload, signature] = decoded.split("|");
    const expected = Buffer.from(
      `${payload}.${getSessionSecret()}`
    ).toString("base64url");

    if (signature !== expected) return null;

    const data = JSON.parse(payload) as SessionUser & { exp: number };
    if (data.exp < Date.now()) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  });

  if (!user) return null;

  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    departmentId: user.departmentId,
    departmentName: user.department?.name ?? null,
  };

  await createSession(sessionUser);
  return sessionUser;
}

export function getRoleLabel(role: Role) {
  const labels: Record<Role, string> = {
    ADMIN: "Administrator",
    RECEPTION: "Reception",
    DEPARTMENT: "Department Staff",
    TYPIST: "Typist",
  };
  return labels[role];
}

export function getDashboardPath(role: Role) {
  const paths: Record<Role, string> = {
    ADMIN: "/dashboard/admin",
    RECEPTION: "/dashboard/reception",
    DEPARTMENT: "/dashboard/department",
    TYPIST: "/dashboard/typist",
  };
  return paths[role];
}
