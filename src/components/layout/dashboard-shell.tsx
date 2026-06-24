"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["ADMIN", "RECEPTION", "DEPARTMENT", "TYPIST"],
  },
  {
    href: "/dashboard/reception",
    label: "Reception",
    icon: Users,
    roles: ["ADMIN", "RECEPTION"],
  },
  {
    href: "/dashboard/department",
    label: "Department",
    icon: Activity,
    roles: ["ADMIN", "DEPARTMENT"],
  },
  {
    href: "/dashboard/typist/templates",
    label: "Report Formats",
    icon: LayoutTemplate,
    roles: ["ADMIN", "TYPIST"],
  },
  {
    href: "/dashboard/typist",
    label: "Typist Reports",
    icon: FileText,
    roles: ["ADMIN", "TYPIST"],
  },
  {
    href: "/dashboard/admin",
    label: "Administration",
    icon: Building2,
    roles: ["ADMIN"],
  },
];

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Medi Hospital</p>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
            <button
              className="ml-auto lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1 p-3">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
            <div className="mb-3 rounded-lg bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              {user.departmentName && (
                <p className="mt-1 text-xs text-teal-700">
                  {user.departmentName}
                </p>
              )}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ClipboardList className="h-4 w-4" />
              Hospital workflow dashboard
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
