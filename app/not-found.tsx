import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Not found</p>
          <h1 className="text-3xl font-semibold text-slate-950">The page you requested does not exist</h1>
          <p className="text-sm leading-6 text-slate-500">
            The record or route may have moved, or the URL may be incorrect. Return to the dashboard
            to continue browsing the academic system.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Go to home</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
