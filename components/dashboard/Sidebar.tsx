"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Role } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/helpers";

interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
}

const navByRole: Record<Role, Array<{ href: string; label: string; description: string }>> = {
  admin: [
    { href: "/dashboard/admin", label: "Registrar Overview", description: "Live institution analytics" },
    { href: "/students", label: "Students", description: "Manage learners and classes" },
    { href: "/teachers", label: "Teachers", description: "Assign teachers to subjects" },
    { href: "/subjects", label: "Subjects", description: "Keep curriculum records current" },
    { href: "/classes", label: "Classes", description: "Organize homeroom structure" },
    { href: "/reports", label: "Reports", description: "Review performance summaries" }
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Overview", description: "Teaching performance snapshot" },
    { href: "/students", label: "Students", description: "Browse assigned learners" },
    { href: "/marks", label: "Marks", description: "Record and update marks" },
    { href: "/reports", label: "Reports", description: "Track class performance" },
    { href: "/dashboard/password", label: "Change Password", description: "Keep your account secure" }
  ],
  student: [
    { href: "/dashboard/student", label: "Overview", description: "Personal academic dashboard" },
    { href: "/reports", label: "My Report", description: "View your current report" },
    { href: "/dashboard/password", label: "Change Password", description: "Update your credentials" }
  ]
};

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 text-slate-100 shadow-[0_28px_70px_rgba(2,6,23,0.55)] backdrop-blur">
      <div>
        <Badge className="bg-emerald-500/15 text-emerald-300" variant="neutral">
          Student Result System
        </Badge>
        <h2 className="mt-4 text-xl font-semibold text-white">
          {role === "admin" ? "Registrar Analytics Center" : "Academic Control Center"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Consistent navigation, cleaner workflows, and focused access for every role.
        </p>
      </div>

      <nav aria-label="Primary navigation" className="grid gap-2">
        {navByRole[role].map((item) => (
          <Link
            key={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "rounded-2xl border px-4 py-3 transition duration-200",
              pathname === item.href
                ? "border-emerald-500/30 bg-white/10 text-white shadow-lg shadow-emerald-950/30"
                : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
            )}
            href={item.href}
            onClick={onNavigate}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-1 text-xs text-slate-400">{item.description}</p>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
