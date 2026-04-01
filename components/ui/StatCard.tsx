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
        "rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[var(--shadow-card)] backdrop-blur",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div> : null}
      </div>
      {description ? <p className="mt-3 text-sm text-slate-500">{description}</p> : null}
    </article>
  );
}
