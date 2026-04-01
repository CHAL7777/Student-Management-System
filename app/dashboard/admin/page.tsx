import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";
import { getDashboardMetrics, listClasses, listStudents } from "@/lib/queries";
import { requireRole } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const profile = await requireRole(["admin"]);
  const [metrics, students, classes] = await Promise.all([
    getDashboardMetrics(profile),
    listStudents(),
    listClasses()
  ]);

  const analyticsSeries = [
    { label: "Students", value: metrics.totalStudents, color: "bg-emerald-500" },
    { label: "Teachers", value: metrics.totalTeachers, color: "bg-sky-500" },
    { label: "Subjects", value: metrics.totalSubjects, color: "bg-violet-500" },
    { label: "Classes", value: metrics.totalClasses, color: "bg-amber-500" },
    { label: "Marks", value: metrics.totalMarks, color: "bg-rose-500" }
  ];

  const highestMetric = Math.max(...analyticsSeries.map((item) => item.value), 1);

  const gradeDistribution = Array.from(
    students.reduce((map, student) => {
      map.set(student.grade, (map.get(student.grade) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([grade, count]) => ({ label: grade, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const classLoad = classes
    .map((classRoom) => ({
      label: classRoom.class_name,
      value: students.filter((student) => student.class_id === classRoom.class_id).length
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const totalAcademicAssets =
    metrics.totalStudents + metrics.totalTeachers + metrics.totalSubjects + metrics.totalClasses;

  return (
    <section className="grid gap-6">
      <FadeIn>
        <PageHeader
          actions={
            <>
              <Link href="/students/add">
                <Button variant="secondary">Add student</Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost">Open reports</Button>
              </Link>
            </>
          }
          description="Track student volume, staffing coverage, class load, and reporting readiness from one polished registrar command center."
          eyebrow="Registrar Command Center"
          title="Academic analytics and registrar oversight"
        />
      </FadeIn>

      <StaggerGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard description="All learners currently registered." label="Students" value={metrics.totalStudents} />
        </StaggerItem>
        <StaggerItem>
          <StatCard description="Teachers attached to the school." label="Teachers" value={metrics.totalTeachers} />
        </StaggerItem>
        <StaggerItem>
          <StatCard description="Active subjects in the curriculum." label="Subjects" value={metrics.totalSubjects} />
        </StaggerItem>
        <StaggerItem>
          <StatCard description="Class groups available this term." label="Classes" value={metrics.totalClasses} />
        </StaggerItem>
      </StaggerGroup>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Institution analytics</h3>
              <p className="text-sm text-slate-500">
                Live registrar view of the main academic entities currently tracked in the system.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total tracked assets</p>
              <p className="text-2xl font-bold text-slate-900">{totalAcademicAssets}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {analyticsSeries.map((item) => (
                <div key={item.label} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(item.value / highestMetric) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Registrar workflow</h2>
            <p className="text-sm leading-6 text-slate-300">
              Manage core master data, assign IDs, and keep academic reporting accurate without
              storing derived totals or ranks.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/students/add">
                <Button variant="secondary">Add student</Button>
              </Link>
              <Link href="/teachers/add">
                <Button variant="ghost">Add teacher</Button>
              </Link>
              <Link href="/classes/add">
                <Button variant="ghost">Create class</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsPanel
          title="Grade distribution chart"
          description="Shows where the registrar currently has the most student concentration."
          data={gradeDistribution}
          accentClassName="bg-emerald-500"
          emptyMessage="No students yet. Add students to generate grade analytics."
        />
        <AnalyticsPanel
          title="Class load graph"
          description="Highlights class groups with the highest enrolled student load."
          data={classLoad}
          accentClassName="bg-sky-500"
          emptyMessage="No classes or student assignments yet."
        />
      </div>

      <Card className="overflow-hidden bg-slate-950 text-white">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Access model</p>
          <h3 className="text-xl font-semibold text-white">Role permissions overview</h3>
          <p className="text-sm leading-6 text-slate-300">
            Each user role has a focused experience designed to reduce clutter and keep academic
            workflows secure.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 md:grid-cols-3">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Registrar
              </span>
              <span className="mt-2 block">
                Create and manage students, teachers, classes, and subjects.
              </span>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Teacher
              </span>
              <span className="mt-2 block">Enter marks through composite-key upserts.</span>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Student
              </span>
              <span className="mt-2 block">Access only their own reports.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

function AnalyticsPanel({
  title,
  description,
  data,
  accentClassName,
  emptyMessage
}: {
  title: string;
  description: string;
  data: Array<{ label: string; value: number }>;
  accentClassName: string;
  emptyMessage: string;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">{emptyMessage}</div>
        ) : (
          <div className="grid gap-4">
            {data.map((item) => (
              <div key={item.label} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${accentClassName}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
