"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  const shouldShowShell = Boolean(profile && protectedPrefixes.some((prefix) => pathname.startsWith(prefix)));

  if (!shouldShowShell || !profile) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-5 sm:py-5">
      <motion.div
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, x: [0, 30, 0], y: [0, -24, 0], scale: [1, 1.06, 1] }
        }
        className="pointer-events-none absolute -left-28 top-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
        initial={{ opacity: 0 }}
        transition={{ duration: 15, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, x: [0, -24, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }
        }
        className="pointer-events-none absolute bottom-6 right-0 h-96 w-96 rounded-full bg-blue-400/8 blur-3xl"
        initial={{ opacity: 0 }}
        transition={{ duration: 18, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1680px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <Sidebar role={profile.role} />
        </div>

        <AnimatePresence>
          {isMobileNavOpen ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-slate-950/45 px-3 py-3 backdrop-blur-md lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <motion.div
                animate={{ x: 0, opacity: 1 }}
                className="w-full max-w-xs"
                exit={{ x: -30, opacity: 0 }}
                initial={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="relative space-y-5">
          <Navbar onToggleNavigation={() => setIsMobileNavOpen(true)} profile={profile} />
          <motion.main
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            className="relative min-h-[calc(100vh-12rem)] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-50 p-4 shadow-[var(--shadow-soft)] sm:p-5"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">{children}</div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
