import Link from "next/link";

import type { Role } from "@/types";
import { cn } from "@/utils/helpers";

interface SidebarProps {
  role: Role;
}

const navByRole: Record<Role, Array<{ href: string; label: string }>> = {
  admin: [
    { href: "/dashboard/admin", label: "Registrar Overview" },
    { href: "/students", label: "Students" },
    { href: "/teachers", label: "Teachers" },
    { href: "/subjects", label: "Subjects" },
    { href: "/classes", label: "Classes" },
    { href: "/reports", label: "Reports" }
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Overview" },
    { href: "/students", label: "Students" },
    { href: "/marks", label: "Marks" },
    { href: "/reports", label: "Reports" },
    { href: "/dashboard/password", label: "Change Password" }
  ],
  student: [
    { href: "/dashboard/student", label: "Overview" },
    { href: "/reports", label: "My Report" },
    { href: "/dashboard/password", label: "Change Password" }
  ]
};

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-6 rounded-3xl bg-slate-900 p-6 text-slate-100 shadow-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Student Result System</p>
        <h2 className="mt-3 text-xl font-semibold">
          {role === "admin" ? "Registrar Analytics Center" : "Academic Control Center"}
        </h2>
      </div>

      <nav className="grid gap-2">
        {navByRole[role].map((item) => (
          <Link
            key={item.href}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            )}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
