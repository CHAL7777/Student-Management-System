import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  CoursesIcon,
  DashboardIcon,
  ReportsIcon,
  SparklesIcon,
  StudentsIcon,
  TrendUpIcon
} from "@/components/ui/Icons";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";

const heroStats = [
  { label: "Student onboarding", value: "01 min" },
  { label: "Core workspaces", value: "04" },
  { label: "Responsive coverage", value: "100%" }
];

const productModules = [
  {
    title: "Students",
    description: "Create polished learner profiles, assign classes, and manage academic identity without friction.",
    icon: StudentsIcon
  },
  {
    title: "Courses",
    description: "Organize the curriculum, align teacher ownership, and keep marks tied to the right subject context.",
    icon: CoursesIcon
  },
  {
    title: "Reports",
    description: "Surface totals, averages, and rankings with clean, report-ready summaries.",
    icon: ReportsIcon
  }
];

const workflowSteps = [
  "Registrar adds a student, class assignment, and secure starter login.",
  "Teachers work inside subject and class scope without admin clutter.",
  "Students open clean reports with totals, averages, ranking, and pass status."
];

const roleHighlights = [
  {
    title: "Admin",
    description: "Institution-wide control over records, staffing, classes, and reporting workflows."
  },
  {
    title: "Teacher",
    description: "Focused assessment flow with student visibility limited to assigned subject and class context."
  },
  {
    title: "Student",
    description: "A calm portal for checking results, rank, and academic progress without navigation noise."
  }
];

const flowPreview = [
  { label: "Admissions queue", value: "24", width: "72%" },
  { label: "Results published", value: "91%", width: "91%" },
  { label: "Reports reviewed", value: "68%", width: "68%" }
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-transparent">
      <section className="relative px-4 pt-4 sm:px-6 lg:pt-6">
        <div className="absolute inset-x-0 top-0 -z-20 h-[44rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_24%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.7rem] bg-[linear-gradient(135deg,#020617_0%,#0f172a_42%,#172554_100%)] text-white shadow-[0_40px_120px_rgba(15,23,42,0.28)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.2),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_32%)]" />
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.04),transparent)] lg:block" />

            <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:p-10 xl:p-12">
              <FadeIn className="max-w-3xl">
                <Badge className="border-white/10 bg-white/10 text-sky-100" variant="neutral">
                  Student Management Suite
                </Badge>

                <h1 className="heading-display mt-6 max-w-4xl text-5xl leading-[0.98] text-white md:text-7xl">
                  School operations that feel like premium software, not a spreadsheet.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  Bring student records, course structure, results, and reporting workflows into
                  one sharp, modern dashboard built for real academic teams.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login">
                    <Button size="lg" variant="primary">
                      Open dashboard
                    </Button>
                  </Link>
                  <Link href="/students">
                    <Button
                      className="border-white/10 bg-white/[0.06] text-slate-100 hover:border-white/15 hover:bg-white/10 hover:text-white"
                      size="lg"
                      variant="ghost"
                    >
                      Preview student flow
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {heroStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] px-5 py-5 backdrop-blur"
                    >
                      <p className="heading-display text-4xl text-white">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn className="lg:justify-self-end" delay={0.08}>
                <div className="relative mx-auto w-full max-w-2xl">
                  <div className="absolute -right-6 top-12 h-40 w-40 rounded-full bg-blue-500/18 blur-3xl" />
                  <div className="absolute -left-4 bottom-8 h-44 w-44 rounded-full bg-blue-400/12 blur-3xl" />

                  <Card className="relative overflow-hidden border-white/10 bg-slate-950/78 shadow-[0_30px_100px_rgba(2,6,23,0.42)]">
                    <CardHeader className="border-b border-white/10 bg-slate-950/92 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                            Live interface preview
                          </p>
                          <h2 className="heading-display mt-3 text-[2rem] text-white">
                            Academic control room
                          </h2>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Workspace</p>
                          <p className="mt-1 text-sm font-semibold text-white">Dashboard active</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grid gap-5 pt-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <PreviewTile
                          description="Track admissions, growth, and roster movement in one place."
                          icon={<StudentsIcon className="h-5 w-5" />}
                          label="Students"
                          value="1,284"
                        />
                        <PreviewTile
                          description="Review which academic and operational tasks still need attention."
                          icon={<DashboardIcon className="h-5 w-5" />}
                          label="Tasks"
                          value="18 open"
                        />
                      </div>

                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">Today&apos;s school flow</p>
                            <p className="mt-1 text-sm text-slate-400">
                              Designed for the rhythm of student intake, reporting, and daily review.
                            </p>
                          </div>
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-blue-500/20">
                            Production-ready UI
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {flowPreview.map((item) => (
                            <div key={item.label} className="grid gap-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-200">{item.label}</span>
                                <span className="text-slate-400">{item.value}</span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                                  style={{ width: item.width }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          {
                            label: "Students",
                            text: "Profiles, search, filters, onboarding."
                          },
                          {
                            label: "Courses",
                            text: "Subjects, marks, class-scoped teaching."
                          },
                          {
                            label: "Reports",
                            text: "Totals, averages, rank, clean result views."
                          }
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[1.45rem] border border-white/10 bg-slate-950/45 p-4"
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6">
        <StaggerGroup className="grid gap-4 lg:grid-cols-3">
          {productModules.map((module) => {
            const Icon = module.icon;

            return (
              <StaggerItem key={module.title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-[0_14px_30px_rgba(37,99,235,0.12)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-blue-600">
                      {module.title}
                    </p>
                    <h3 className="heading-display text-[1.7rem] text-slate-950">{module.title} workspace</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-500">{module.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <FadeIn>
            <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(238,246,255,0.94))]">
              <CardHeader>
                <Badge variant="accent">Product rhythm</Badge>
                <h3 className="heading-display text-[2rem] text-slate-950">
                  Built around the daily movement of a real school.
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  The front page now reflects the same product structure users expect after login:
                  intake, teaching, reporting, and daily operations.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-[1.6rem] border border-slate-200/80 bg-white/80 px-4 py-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-slate-600">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <div className="grid gap-6">
            <FadeIn delay={0.06}>
              <Card className="overflow-hidden bg-slate-950 text-white">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-sky-200">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                        Role-based clarity
                      </p>
                      <h3 className="heading-display mt-2 text-[1.8rem] text-white">
                        Three roles, one consistent visual system.
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {roleHighlights.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="rounded-[2rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <TrendUpIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-600">
                      Ready to use
                    </p>
                    <h3 className="heading-display mt-2 text-[1.8rem] text-slate-950">
                      Step into the redesigned dashboard.
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                      Open the workspace and move through students, courses, reports, and classes
                      from a cleaner front door.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href="/login">
                        <Button variant="primary">Go to login</Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="ghost">Dashboard route</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewTile({
  label,
  value,
  description,
  icon
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.55rem] border border-white/10 bg-slate-950/45 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="heading-display mt-2 text-[2rem] text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
