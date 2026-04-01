"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">Something went wrong</p>
          <h1 className="text-3xl font-semibold text-slate-950">The page could not finish loading</h1>
          <p className="text-sm leading-6 text-slate-500">
            An unexpected error interrupted this view. Try reloading the section or return to the
            dashboard and continue working.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
          <a href="/dashboard">
            <Button variant="ghost">Go to dashboard</Button>
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
