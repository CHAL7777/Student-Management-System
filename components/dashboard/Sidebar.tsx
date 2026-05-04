"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

import type { Role } from "@/types";
import { Badge } from "@/components/ui/Badge";
import {
  ClassesIcon,
  CoursesIcon,
  DashboardIcon,
  LockIcon,
  ReportsIcon,
  StudentsIcon,
  TeachersIcon
} from "@/components/ui/Icons";
import { cn } from "@/utils/helpers";

interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: typeof DashboardIcon;
}

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", description: "School-wide overview", icon: DashboardIcon },
    { href: "/students", label: "Students", description: "Admissions and records", icon: StudentsIcon },
    { href: "/subjects", label: "Courses", description: "Curriculum catalog", icon: CoursesIcon },
    { href: "/teachers", label: "Teachers", description: "Faculty management", icon: TeachersIcon },
    { href: "/classes", label: "Classes", description: "Cohorts and sections", icon: ClassesIcon },
    { href: "/reports", label: "Reports", description: "Academic performance", icon: ReportsIcon }
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Dashboard", description: "Teaching snapshot", icon: DashboardIcon },
    { href: "/students", label: "Students", description: "Assigned learners", icon: StudentsIcon },
    { href: "/marks", label: "Courses", description: "Marks and grading", icon: CoursesIcon },
    { href: "/reports", label: "Reports", description: "Class performance", icon: ReportsIcon },
    { href: "/dashboard/password", label: "Security", description: "Password settings", icon: LockIcon }
  ],
  student: [
    { href: "/dashboard/student", label: "Dashboard", description: "Personal overview", icon: DashboardIcon },
    { href: "/reports", label: "Courses", description: "Results and rankings", icon: CoursesIcon },
    { href: "/dashboard/password", label: "Security", description: "Account access", icon: LockIcon }
  ]
};

const workspaceCopy: Record<Role, { eyebrow: string; title: string; description: string; pulse: string }> = {
  admin: {
    eyebrow: "Operations",
    title: "Student management, reporting, and operations in one clean command center.",
    description:
      "A modern registrar workspace with faster navigation, clearer actions, and better visual hierarchy.",
    pulse: "6 core workspaces"
  },
  teacher: {
    eyebrow: "Teaching",
    title: "Focus on marks, learners, and progress without admin clutter.",
    description:
      "Everything on this sidebar is scoped to your subject and assigned classes so daily work stays efficient.",
    pulse: "Subject-scoped access"
  },
  student: {
    eyebrow: "Student",
    title: "A calm academic dashboard with your latest progress at a glance.",
    description:
      "Check rankings, review course outcomes, and manage your account from a simplified student view.",
    pulse: "Personal workspace"
  }
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const workspace = workspaceCopy[role];

  return (
    <aside className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-700 bg-slate-800 p-6 text-slate-100 shadow-[0_26px_60px_rgba(15,23,42,0.22)]">
      <motion.div
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, x: [0, 14, 0], y: [0, 22, 0], scale: [1, 1.08, 1] }
        }
        className="pointer-events-none absolute -right-12 top-10 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl"
        initial={{ opacity: 0 }}
        transition={{ duration: 14, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, x: [0, -10, 0], y: [0, -18, 0], scale: [1, 1.06, 1] }
        }
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl"
        initial={{ opacity: 0 }}
        transition={{ duration: 17, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <Badge className="w-fit border-white/10 bg-white/10 text-slate-100" variant="neutral">
          Student SaaS
        </Badge>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-200">
          {workspace.eyebrow}
        </p>
        <h2 className="heading-display mt-3 text-[1.85rem] leading-tight text-white">{workspace.title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{workspace.description}</p>
      </div>

      <nav aria-label="Primary navigation" className="relative mt-8 grid gap-2">
        {navByRole[role].map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              transition={{ duration: 0.2 }}
              whileHover={shouldReduceMotion ? undefined : { x: 4 }}
            >
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative block overflow-hidden rounded-[1.55rem] border p-4 transition duration-200",
                  active
                    ? "border-blue-500/30 bg-blue-600/10 text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)]"
                    : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/14 hover:bg-white/[0.07] hover:text-white"
                )}
                href={item.href}
                onClick={onNavigate}
              >
                {active ? (
                  <motion.span
                    layoutId="sidebar-active-panel"
                    className="absolute inset-0 rounded-[1.55rem] bg-[linear-gradient(135deg,rgba(37,99,235,0.28),rgba(37,99,235,0.16),rgba(30,41,59,0.96))]"
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  />
                ) : null}

                <span className="relative flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                      active
                        ? "border-blue-400/20 bg-blue-500/10 text-blue-100"
                        : "border-white/10 bg-white/5 text-slate-300"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={cn("mt-1 block text-xs leading-6", active ? "text-slate-100/75" : "text-slate-400")}>
                      {item.description}
                    </span>
                  </span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="relative mt-auto rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200">Workspace pulse</p>
        <p className="mt-2 text-xl font-semibold text-white">{workspace.pulse}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The dashboard uses focused modules so users can move faster without losing context.
        </p>
      </div>
    </aside>
  );
}
