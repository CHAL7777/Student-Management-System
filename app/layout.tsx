import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { APP_NAME } from "@/utils/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Production-ready student academic record management platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
