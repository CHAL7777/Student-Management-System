import Link from "next/link";

import type { HomeroomReportData } from "@/types";
import { formatNumber } from "@/utils/helpers";

interface HomeroomReportTableProps {
  data: HomeroomReportData;
  selectedStudentId?: string;
}

export function HomeroomReportTable({ data, selectedStudentId }: HomeroomReportTableProps) {
  if (data.rows.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[color:var(--border)] bg-white p-6 text-slate-500 shadow-[var(--shadow-card)]">
        No homeroom report data yet. Add students, subjects, and marks first.
      </div>
    );
  }

  const totalPassed = data.rows.filter((row) => row.overall_status === "Pass").length;
  const highestAverage = Math.max(...data.rows.map((row) => row.average), 0);

  return (
    <section className="grid gap-5">
      <div className="rounded-[2.2rem] border border-slate-200 bg-slate-800 p-6 text-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-200">Homeroom Report View</p>
            <h3 className="heading-display mt-4 text-[2.2rem] text-white">Class performance matrix</h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-200">
              Dynamic subject columns, totals, averages, rank, and pass or fail status in one upgraded
              academic report view.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatChip label="Students" value={String(data.rows.length)} />
            <StatChip label="Subjects" value={String(data.subjects.length)} />
            <StatChip label="Highest avg" value={formatNumber(highestAverage)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniCard label="Pass rate" value={`${formatNumber((totalPassed / data.rows.length) * 100)}%`} />
        <MiniCard label="Passed students" value={String(totalPassed)} />
        <MiniCard label="Review focus" value={String(data.rows.length - totalPassed)} />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="sticky left-0 z-20 border-b border-slate-200 bg-slate-50 px-4 py-4 text-left font-semibold">
                  Student Name
                </th>
                <th className="border-b border-slate-200 px-4 py-4 text-left font-semibold">Gender</th>
                <th className="border-b border-slate-200 px-4 py-4 text-left font-semibold">ID</th>
                <th
                  className="border-b border-slate-200 px-4 py-4 text-center font-semibold"
                  colSpan={Math.max(data.subjects.length, 1)}
                >
                  Subjects
                </th>
                <th className="border-b border-slate-200 px-4 py-4 text-center font-semibold">Total</th>
                <th className="border-b border-slate-200 px-4 py-4 text-center font-semibold">Avg</th>
                <th className="border-b border-slate-200 px-4 py-4 text-center font-semibold">Rank</th>
                <th className="border-b border-slate-200 px-4 py-4 text-center font-semibold">Status</th>
              </tr>
              <tr className="bg-slate-50/80 text-slate-500">
                <th className="sticky left-0 z-20 border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Learner
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Gender
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Login ID
                </th>
                {data.subjects.length > 0 ? (
                  data.subjects.map((subject) => (
                    <th
                      key={subject.subject_id}
                      className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
                    >
                      {subject.subject_name}
                    </th>
                  ))
                ) : (
                  <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em]">
                    No subjects
                  </th>
                )}
                <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Total
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Average
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Rank
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Result
                </th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((row) => {
                const isSelected = selectedStudentId === row.student_id;

                return (
                  <tr
                    key={row.student_id}
                    className={isSelected ? "bg-blue-50/80" : "odd:bg-white even:bg-slate-50/70"}
                  >
                    <td className="sticky left-0 z-10 border-b border-slate-100 bg-inherit px-4 py-3">
                      <Link
                        className="font-semibold text-slate-900 transition hover:text-blue-700"
                        href={`/reports?studentId=${row.student_id}`}
                      >
                        {row.student_name}
                      </Link>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                      {row.gender.slice(0, 1).toUpperCase()}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 font-mono text-xs text-slate-600">
                      {row.student_id}
                    </td>
                    {data.subjects.length > 0 ? (
                      data.subjects.map((subject) => {
                        const mark = row.marks[subject.subject_id];

                        return (
                          <td
                            key={subject.subject_id}
                            className={`border-b border-slate-100 px-4 py-3 text-center font-semibold ${
                              mark?.status === "Fail" ? "text-red-500" : "text-slate-700"
                            }`}
                          >
                            {mark ? formatNumber(mark.mark) : "-"}
                          </td>
                        );
                      })
                    ) : (
                      <td className="border-b border-slate-100 px-4 py-3 text-center text-slate-400">-</td>
                    )}
                    <td className="border-b border-slate-100 px-4 py-3 text-center font-semibold text-slate-900">
                      {formatNumber(row.total)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-center font-semibold text-slate-900">
                      {formatNumber(row.average)}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-center font-semibold text-slate-700">
                      {row.rank}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-center">
                      <span
                        className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                          row.overall_status === "Pass"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {row.overall_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.45rem] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200">{label}</p>
      <p className="heading-display mt-2 text-[1.85rem] text-white">{value}</p>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.8rem] border border-[color:var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="heading-display mt-3 text-[2rem] text-slate-900">{value}</p>
    </article>
  );
}
