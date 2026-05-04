import type { StudentReportData } from "@/types";
import { formatNumber } from "@/utils/helpers";

export function ReportTable({ report }: { report: StudentReportData }) {
  const overallStatus = report.summary.average >= 50 ? "Pass" : "Fail";

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-800 p-6 text-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-200">Student Result Sheet</p>
            <h2 className="heading-display mt-4 text-[2.3rem] text-white">{report.summary.student_name}</h2>
            <p className="mt-2 text-sm text-slate-200">
              {report.summary.grade} • {report.summary.academic_year} • {report.summary.semester} •{" "}
              {report.summary.class_name ?? "Unassigned class"}
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] ${
              overallStatus === "Pass" ? "bg-green-500 text-white" : "bg-red-500 text-white"
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

      <div className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="heading-display text-[1.5rem] text-slate-900">Subject performance breakdown</h3>
          <p className="text-sm leading-6 text-slate-500">
            Each stored mark is shown dynamically with a clear pass or fail state.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Mark</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.subjects.map((subject) => (
                <tr key={subject.subject_id} className="odd:bg-white even:bg-slate-50/80 hover:bg-blue-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-700">{subject.subject_name}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      subject.status === "Pass" ? "text-slate-700" : "text-red-500"
                    }`}
                  >
                    {formatNumber(subject.mark)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        subject.status === "Pass"
                          ? "rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-green-700"
                          : "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-700"
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
    <article className="rounded-[1.8rem] border border-[color:var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="heading-display mt-3 text-[2rem] text-slate-900">{value}</p>
    </article>
  );
}
