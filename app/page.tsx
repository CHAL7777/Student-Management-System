import Link from "next/link";

import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const stats = [
  { label: "Role-ready workspaces", value: "3" },
  { label: "Core academic modules", value: "6" },
  { label: "Live report visibility", value: "100%" }
];

const featureCards = [
  {
    title: "Registrar control",
    description:
      "Manage students, classes, teachers, and subjects from one structured command center."
  },
  {
    title: "Teacher focus",
    description:
      "Enter marks quickly, stay within assigned subject scope, and keep class progress visible."
  },
  {
    title: "Student clarity",
    description:
      "View polished result sheets with totals, averages, rank, and pass or fail status."
  }
];

const pillars = [
  "Clean academic data structure built for real school operations.",
  "Fast dashboards and report views with a polished modern interface.",
  "Secure role-based access for registrar, teacher, and student workflows."
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_28%)]" />

      <section className="mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-12">
        <FadeIn className="max-w-3xl">
          <Badge className="bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20" variant="neutral">
            Student Result System
          </Badge>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
            A polished academic platform for records, class management, and beautiful result
            reporting.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Built for modern schools that want cleaner registrar workflows, structured teacher mark
            entry, and student-friendly reports from one elegant system.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Open dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button
                className="border-white/10 bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10 hover:text-white"
                size="lg"
                variant="ghost"
              >
                Explore login
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur"
              >
                <p className="text-3xl font-semibold tracking-tight text-white">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="lg:justify-self-end" delay={0.08}>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-emerald-500/10 blur-3xl" />

            <Card className="relative overflow-hidden border-white/10 bg-slate-900/75 shadow-[0_25px_80px_rgba(2,6,23,0.45)]">
              <CardHeader className="border-b border-white/10 bg-slate-900/90 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                      Live platform preview
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">Academic operations at a glance</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Status</p>
                    <p className="mt-1 text-sm font-semibold text-white">Active workflow</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewMetric
                    description="Students, classes, and staff in one clean workflow."
                    label="Registrar view"
                    value="Structured"
                  />
                  <PreviewMetric
                    description="Subject-scoped mark entry with class-based visibility."
                    label="Teacher flow"
                    value="Focused"
                  />
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Report readiness</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Dynamic totals, averages, rank, and pass or fail status.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-500/20">
                      Auto calculated
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {[
                      { label: "Academic records", width: "92%" },
                      { label: "Teacher assessment flow", width: "84%" },
                      { label: "Student report visibility", width: "96%" }
                    ].map((item) => (
                      <div key={item.label} className="grid gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-200">{item.label}</span>
                          <span className="text-slate-400">{item.width}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                            style={{ width: item.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  {pillars.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    >
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <p className="text-sm leading-6 text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <StaggerGroup className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <StaggerItem key={feature.title}>
              <Card className="h-full border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(2,6,23,0.35)]">
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                    {feature.title}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <FadeIn delay={0.12}>
          <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-8 text-white shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  Ready to begin
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  Start with a cleaner first impression for your school management workflow.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
                  Sign in and manage classes, students, teachers, marks, and reports from one refined
                  academic system.
                </p>
              </div>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Go to login
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}

function PreviewMetric({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
