import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
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
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <Image
          src="/images/login-hero.jpeg"
          alt="Students during mentorship session"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/75 to-emerald-700/30" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">Secure academic access</p>
          <h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight">
            Sign in to manage records, enter marks, and publish result reports securely.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="mb-8 space-y-3">
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              Welcome back
            </span>
            <h2 className="text-3xl font-bold text-slate-900">Login to your dashboard</h2>
            <p className="text-slate-500">
              Choose your role first, then sign in using your full name, institution ID, and
              password.
            </p>
          </div>

          <form action="/api/auth/login" method="post" className="grid gap-4">
            <Select
              label="Role access"
              name="role"
              defaultValue="admin"
              options={[
                { label: "Registrar", value: "admin" },
                { label: "Teacher", value: "teacher" },
                { label: "Student", value: "student" }
              ]}
              required
            />
            <Input label="Full name" name="full_name" placeholder="Enter your full name" required />
            <Input label="ID" name="login_id" placeholder="ADM-001 / TCH-101 / STD-001" required />
            <Input label="Password" name="password" type="password" placeholder="••••••••" required />
            {params.error ? (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{params.error}</p>
            ) : null}
            <Button type="submit" variant="secondary" fullWidth>
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Role access</p>
            <p>Registrars manage all records, teachers enter marks, and students can only view reports.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
