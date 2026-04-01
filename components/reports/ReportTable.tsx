import type { StudentReportData } from "@/types";
import { formatNumber } from "@/utils/helpers";

export function ReportTable({ report }: { report: StudentReportData }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total" value={formatNumber(report.summary.total)} />
        <MetricCard label="Average" value={formatNumber(report.summary.average)} />
        <MetricCard label="Rank" value={String(report.summary.rank)} />
        <MetricCard label="Class" value={report.summary.class_name ?? "Unassigned"} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{report.summary.student_name}</h2>
          <p className="text-sm text-slate-500">
            {report.summary.grade} | {report.summary.academic_year} | {report.summary.semester}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mark</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.subjects.map((subject) => (
                <tr key={subject.subject_id}>
                  <td className="px-4 py-3 text-slate-700">{subject.subject_name}</td>
                  <td className="px-4 py-3 text-slate-700">{formatNumber(subject.mark)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        subject.status === "Pass"
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                      }
                    >
                      {subject.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
