import type { ReactNode } from "react";

import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { requireUser } from "@/lib/auth";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const { profile } = await getCurrentUserProfile();

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
        <Sidebar role={profile.role} />
        <div className="space-y-6">
          <Navbar profile={profile} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
