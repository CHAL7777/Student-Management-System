import Image from "next/image";
import { redirect } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FadeIn } from "@/components/ui/Motion";
import { getCurrentUserProfile } from "@/lib/auth";

interface LoginPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ user, profile }, resolvedSearchParams] = await Promise.all([
    getCurrentUserProfile(),
    searchParams ?? Promise.resolve({ error: undefined })
  ]);
  const params = resolvedSearchParams as { error?: string };

  if (user && profile) {
    redirect(`/dashboard/${profile.role}`);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <Image
          src="/images/login-hero.jpeg"
          alt="Students during mentorship session"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-emerald-700/40" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="max-w-xl">
            <Badge className="bg-white/10 text-emerald-200" variant="neutral">
              Secure academic access
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Sign in to manage records, enter marks, and publish elegant result reports.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-200">
              Built for registrars, teachers, and students with a clean academic workflow and modern
              reporting experience.
            </p>
          </div>

          <div className="grid max-w-xl gap-4">
            {[
              "Unified navigation across dashboards, records, marks, and reports.",
              "Role-based access with secure academic workflows and clear accountability.",
              "Fast result views with polished tables, micro-interactions, and responsive layouts."
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.75rem] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur"
              >
                <p className="text-sm leading-6 text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <FadeIn className="w-full max-w-xl">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-200/80 bg-white/70">
              <Badge variant="success">Welcome back</Badge>
              <h2 className="text-3xl font-semibold text-slate-950">Login to your dashboard</h2>
              <p className="text-sm leading-6 text-slate-500 md:text-base">
                Sign in with your full name, institution ID, and password.
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              <form action="/api/auth/login" method="post" className="grid gap-4">
                <Input label="Full name" name="full_name" placeholder="Enter your full name" required />
                <Input label="ID" name="login_id" placeholder="ADM-001 / TCH-101 / STD-001" required />
                <Input label="Password" name="password" type="password" placeholder="••••••••" required />
                {params.error ? <Alert variant="danger">{params.error}</Alert> : null}
                <Button fullWidth size="lg" type="submit" variant="secondary">
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      </section>
    </main>
  );
}
