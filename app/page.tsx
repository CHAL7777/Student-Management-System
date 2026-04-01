import Link from "next/link";

import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const featureCards = [
  "Role-based dashboards for registrars, teachers, and students.",
  "Dynamic subject, class, and mark management backed by a normalized academic schema.",
  "Live report generation with totals, averages, ranks, and pass or fail status."
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-14">
      <FadeIn className="max-w-3xl">
        <Badge variant="accent">Next.js + Supabase Academic Platform</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          Modern student records, academic reporting, and teacher workflows in one refined portal.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
          Streamline student records, class management, mark entry, and result publishing with a
          polished, role-based academic system built for real school operations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Sign in to continue
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="ghost">
              Preview the experience
            </Button>
          </Link>
        </div>
      </FadeIn>

      <StaggerGroup className="grid max-w-xl flex-1 gap-4">
        {featureCards.map((feature) => (
          <StaggerItem key={feature}>
            <Card>
              <CardHeader>
                <p className="text-base leading-7 text-slate-700">{feature}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-1.5 w-16 rounded-full bg-emerald-500/70" />
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </main>
  );
}
