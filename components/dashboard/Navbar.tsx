import { Button } from "@/components/ui/Button";
import type { UserProfile } from "@/types";
import { ROLE_LABELS } from "@/utils/roles";

interface NavbarProps {
  profile: UserProfile;
}

export function Navbar({ profile }: NavbarProps) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-slate-500">Signed in as</p>
        <h1 className="text-xl font-semibold text-slate-900">{profile.full_name}</h1>
        <p className="text-sm text-slate-500">
          {ROLE_LABELS[profile.role]}
          {profile.login_id ? ` • ${profile.login_id}` : ""}
        </p>
      </div>

      <form action="/api/auth/logout" method="post">
        <Button type="submit" variant="ghost">
          Sign out
        </Button>
      </form>
    </header>
  );
}
