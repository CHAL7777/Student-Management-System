import type { StudentReportData } from "@/types";
import { formatNumber } from "@/utils/helpers";

export function ReportTable({ report }: { report: StudentReportData }) {
  const overallStatus = report.summary.average >= 50 ? "Pass" : "Fail";

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Student Result Sheet</p>
            <h2 className="mt-3 text-2xl font-bold">{report.summary.student_name}</h2>
            <p className="mt-2 text-sm text-slate-200">
              {report.summary.grade} • {report.summary.academic_year} • {report.summary.semester} •{" "}
              {report.summary.class_name ?? "Unassigned class"}
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide ${
              overallStatus === "Pass" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}
          >
            {overallStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total" value={formatNumber(report.summary.total)} />
        <MetricCard label="Average" value={formatNumber(report.summary.average)} />
        <MetricCard label="Rank" value={String(report.summary.rank)} />
        <MetricCard label="Class" value={report.summary.class_name ?? "Unassigned"} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Subject performance breakdown</h3>
          <p className="text-sm text-slate-500">
            Each stored mark is shown dynamically with a clear pass or fail state.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mark</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.subjects.map((subject) => (
                <tr key={subject.subject_id} className="odd:bg-white even:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-700">{subject.subject_name}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      subject.status === "Pass" ? "text-slate-700" : "text-rose-600"
                    }`}
                  >
                    {formatNumber(subject.mark)}
                  </td>
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
