import type { MouseEventHandler } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { UserProfile } from "@/types";
import { ROLE_LABELS } from "@/utils/roles";

interface NavbarProps {
  profile: UserProfile;
  onToggleNavigation?: MouseEventHandler<HTMLButtonElement>;
}

export function Navbar({ profile, onToggleNavigation }: NavbarProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 shadow-[var(--shadow-card)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        {onToggleNavigation ? (
          <Button
            aria-label="Open navigation"
            className="lg:hidden"
            onClick={onToggleNavigation}
            size="sm"
            type="button"
            variant="ghost"
          >
            Menu
          </Button>
        ) : null}

        <div>
          <Badge variant="accent">{ROLE_LABELS[profile.role]}</Badge>
          <h1 className="mt-3 text-xl font-semibold text-slate-950 md:text-2xl">{profile.full_name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile.login_id ? `Access ID: ${profile.login_id}` : "Academic access account"}
          </p>
        </div>
      </div>

      <form action="/api/auth/logout" method="post" className="flex items-center gap-3">
        <div className="hidden rounded-2xl bg-slate-100 px-4 py-3 text-right md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Session</p>
          <p className="mt-1 text-sm font-medium text-slate-700">Authenticated</p>
        </div>
        <Button type="submit" variant="ghost">
          Sign out
        </Button>
      </form>
    </header>
  );
}
