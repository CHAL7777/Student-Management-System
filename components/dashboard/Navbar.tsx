import type { MouseEventHandler } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LogoutIcon, MenuIcon, SparklesIcon } from "@/components/ui/Icons";
import type { UserProfile } from "@/types";
import { ROLE_LABELS } from "@/utils/roles";

interface NavbarProps {
  profile: UserProfile;
  onToggleNavigation?: MouseEventHandler<HTMLButtonElement>;
}

const roleDescriptions = {
  admin: "Registrar-grade overview with clear control over students, courses, and reporting.",
  teacher: "A streamlined teaching workspace for marks, class insight, and academic follow-up.",
  student: "A focused student portal built around progress, rank, and report visibility."
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Navbar({ profile, onToggleNavigation }: NavbarProps) {
  return (
    <header className="relative overflow-hidden rounded-[2.3rem] border border-slate-700 bg-slate-800 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.18)] md:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          {onToggleNavigation ? (
            <Button
              aria-label="Open navigation"
              className="rounded-[1.1rem] px-3 lg:hidden"
              onClick={onToggleNavigation}
              size="sm"
              type="button"
              variant="ghost"
            >
              <MenuIcon className="h-4 w-4" />
              Menu
            </Button>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-blue-500/20 bg-blue-500/15 text-blue-100" variant="accent">
                {ROLE_LABELS[profile.role]}
              </Badge>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200">
                <SparklesIcon className="h-3.5 w-3.5" />
                Student Management
              </span>
            </div>
            <h1 className="heading-display mt-4 text-3xl text-white md:text-[2.35rem]">
              Modern dashboard workspace
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {roleDescriptions[profile.role]}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-[1.6rem] border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]">
              {getInitials(profile.full_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profile.full_name}</p>
              <p className="truncate text-xs text-slate-300">
                {profile.login_id ? `${profile.login_id} • ${ROLE_LABELS[profile.role]}` : ROLE_LABELS[profile.role]}
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="secondary">
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
