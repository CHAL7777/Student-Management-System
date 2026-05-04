import type { ReactNode } from "react";

import { cn } from "@/utils/helpers";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, description, icon, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.85rem] border border-[color:var(--border)] bg-white p-5 shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-blue-600" />
      <div className="flex items-start justify-between gap-3">
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="heading-display mt-3 text-[2.15rem] text-slate-950">{value}</p>
        </div>
        {icon ? (
          <div className="relative rounded-[1.3rem] bg-blue-50 p-3 text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.1)]">
            {icon}
          </div>
        ) : null}
      </div>
      {description ? <p className="relative mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
    </article>
  );
}
