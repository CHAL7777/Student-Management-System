import Link from "next/link";

import { Button } from "@/components/ui/Button";
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
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 p-6 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Registrar Command Center</p>
        <h2 className="mt-3 text-3xl font-bold">Academic analytics, charts, and registrar oversight</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Track student volume, staff coverage, class load, and reporting readiness from one
          registrar-focused dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Students" value={metrics.totalStudents} />
        <MetricCard label="Teachers" value={metrics.totalTeachers} />
        <MetricCard label="Subjects" value={metrics.totalSubjects} />
        <MetricCard label="Classes" value={metrics.totalClasses} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Institution analytics graph</h3>
              <p className="mt-1 text-sm text-slate-500">
                Live registrar view of the main academic entities currently tracked in the system.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total tracked assets</p>
              <p className="text-2xl font-bold text-slate-900">{totalAcademicAssets}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
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
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Registrar workflow</h2>
          <p className="mt-2 text-slate-600">
            Manage core master data, assign student primary IDs, keep teacher and class records up
            to date, and monitor academic reporting without storing derived totals or ranks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/students/add">
              <Button variant="secondary">Add student</Button>
            </Link>
            <Link href="/teachers/add">
              <Button variant="ghost">Add teacher</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">View reports</Button>
            </Link>
          </div>
        </div>
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

      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Access model</p>
        <ul className="mt-4 grid gap-3 text-sm text-slate-200">
          <li>Registrar users create and manage students, teachers, classes, and subjects.</li>
          <li>Teachers enter marks through composite-key upserts.</li>
          <li>Students can only access their own reports.</li>
        </ul>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </article>
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
    <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      {data.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="mt-6 grid gap-4">
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
    </article>
  );
}
