import Link from "next/link";

import { ReportTable } from "@/components/reports/ReportTable";
import { BackButton } from "@/components/ui/BackButton";
import { Table } from "@/components/ui/Table";
import { requireRole } from "@/lib/auth";
import { getStudentReport, listVisibleReports } from "@/lib/queries";
import { formatNumber } from "@/utils/helpers";

interface ReportsPageProps {
  searchParams?: Promise<{
    studentId?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const [profile, resolvedSearchParams] = await Promise.all([
    requireRole(["admin", "teacher", "student"]),
    searchParams ?? Promise.resolve({ studentId: undefined })
  ]);
  const params = resolvedSearchParams as { studentId?: string };

  const reports = await listVisibleReports(profile);
  const selectedId =
    profile.role === "student" ? profile.student_id : params.studentId ?? reports[0]?.student_id;

  const selectedReport = selectedId ? await getStudentReport(selectedId) : null;

  return (
    <section className="grid gap-6">
      <BackButton fallbackHref="/dashboard" label="Back to dashboard" />
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Academic reports</h2>
        <p className="text-slate-500">
          Totals, averages, rank, and pass or fail status are calculated dynamically from stored
          subject marks.
        </p>
      </div>

      {profile.role !== "student" ? (
        <Table
          data={reports}
          columns={[
            {
              key: "student",
              header: "Student",
              render: (report) => (
                <Link className="font-semibold text-emerald-700" href={`/reports?studentId=${report.student_id}`}>
                  {report.student_name}
                </Link>
              )
            },
            { key: "total", header: "Total", render: (report) => formatNumber(report.total) },
            { key: "average", header: "Average", render: (report) => formatNumber(report.average) },
            { key: "rank", header: "Rank", render: (report) => report.rank }
          ]}
        />
      ) : null}

      {selectedReport ? (
        <ReportTable report={selectedReport} />
      ) : (
        <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm ring-1 ring-slate-200">
          No reports are available yet. Add students, subjects, and marks first.
        </div>
      )}
    </section>
  );
}
