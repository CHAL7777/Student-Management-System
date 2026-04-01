import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { AppShell } from "@/components/dashboard/AppShell";
import { getCurrentUserProfile } from "@/lib/auth";
import { APP_NAME } from "@/utils/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Production-ready student academic record management platform."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile } = await getCurrentUserProfile();

  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppShell profile={profile}>{children}</AppShell>
      </body>
    </html>
  );
}
