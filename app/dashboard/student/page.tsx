import Link from "next/link";

import { ReportTable } from "@/components/reports/ReportTable";
import { Button } from "@/components/ui/Button";
import { getDashboardMetrics } from "@/lib/queries";
import { requireRole } from "@/lib/auth";

export default async function StudentDashboardPage() {
  const profile = await requireRole(["student"]);
  const metrics = await getDashboardMetrics(profile);

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Student dashboard</h2>
        <p className="mt-2 text-slate-600">
          Review your academic performance, pass or fail status per subject, and the current
          ranking generated directly from live marks.
        </p>
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/reports">
              <Button variant="secondary">Open my report</Button>
            </Link>
            <Link href="/dashboard/password">
              <Button variant="ghost">Change password</Button>
            </Link>
          </div>
        </div>
      </div>

      {metrics.report ? <ReportTable report={metrics.report} /> : null}
    </section>
  );
}
