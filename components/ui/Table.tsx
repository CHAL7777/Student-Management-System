import type { ReactNode } from "react";

import { cn } from "@/utils/helpers";

interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyState?: string;
}

export function Table<T>({ columns, data, emptyState = "No records found." }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[var(--shadow-card)] backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80 text-left text-sm">
          <thead className="bg-slate-100/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                    column.className
                  )}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90">
            {data.length === 0 ? (
              <tr>
                <td className="px-5 py-12 text-center text-sm text-slate-500" colSpan={columns.length}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-slate-50/60 transition hover:bg-emerald-50/40">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4 align-top text-slate-700">
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
