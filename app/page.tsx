import Link from "next/link";

import { Button } from "@/components/ui/Button";

const featureCards = [
  "Role-based dashboards for administrators, teachers, and students.",
  "Dynamic subject, class, and mark management backed by normalized PostgreSQL tables.",
  "Live report generation with totals, averages, ranks, and pass/fail status."
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center">
      <section className="max-w-2xl space-y-6">
        <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
          Next.js + Supabase Academic Platform
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
          Manage student results, teacher workflows, and academic reports from one secure system.
        </h1>
        <p className="text-lg text-slate-600">
          Streamline student records, mark entry, subject management, and report generation with a
          production-ready role-based portal.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
          <Link href="/reports">
            <Button variant="ghost">View reports area</Button>
          </Link>
        </div>
      </section>

      <section className="grid max-w-xl gap-4">
        {featureCards.map((feature) => (
          <article
            key={feature}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-base leading-7 text-slate-700">{feature}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
