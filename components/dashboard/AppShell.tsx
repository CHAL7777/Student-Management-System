"use client";

import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { UserProfile } from "@/types";

const protectedPrefixes = [
  "/dashboard",
  "/students",
  "/teachers",
  "/subjects",
  "/classes",
  "/marks",
  "/reports"
];

interface AppShellProps extends PropsWithChildren {
  profile: UserProfile | null;
}

export function AppShell({ profile, children }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const shouldShowShell = useMemo(() => {
    if (!profile) {
      return false;
    }

    return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }, [pathname, profile]);

  if (!shouldShowShell || !profile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <Sidebar role={profile.role} />
        </div>

        <AnimatePresence>
          {isMobileNavOpen ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-slate-950/55 px-3 py-3 backdrop-blur-sm lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <motion.div
                animate={{ x: 0, opacity: 1 }}
                className="w-full max-w-xs"
                exit={{ x: -24, opacity: 0 }}
                initial={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Sidebar onNavigate={() => setIsMobileNavOpen(false)} role={profile.role} />
              </motion.div>
              <button
                aria-label="Close navigation"
                className="absolute inset-0 -z-10"
                onClick={() => setIsMobileNavOpen(false)}
                type="button"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="space-y-5">
          <Navbar onToggleNavigation={() => setIsMobileNavOpen(true)} profile={profile} />
          <motion.main
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
