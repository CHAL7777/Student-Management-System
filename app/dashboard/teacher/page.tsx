import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { getDashboardMetrics } from "@/lib/queries";
import { requireRole } from "@/lib/auth";

export default async function TeacherDashboardPage() {
  const profile = await requireRole(["teacher"]);
  const metrics = await getDashboardMetrics(profile);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Students" value={metrics.totalStudents} />
        <MetricCard label="Subjects" value={metrics.totalSubjects} />
        <MetricCard label="Classes" value={metrics.totalClasses} />
        <MetricCard label="Teachers" value={metrics.totalTeachers} />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Teaching workspace</h2>
        <p className="mt-2 text-slate-600">
          Enter or update student marks, review report standings, and keep student progress visible
          without duplicating derived statistics in the database.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/marks">
            <Button variant="secondary">Enter marks</Button>
          </Link>
          <Link href="/students">
            <Button variant="ghost">Browse students</Button>
          </Link>
          <Link href="/reports">
            <Button variant="ghost">Review reports</Button>
          </Link>
          <Link href="/dashboard/password">
            <Button variant="ghost">Change password</Button>
          </Link>
        </div>
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
