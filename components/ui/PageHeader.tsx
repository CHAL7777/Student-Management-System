import type { ReactNode } from "react";

import { cn } from "@/utils/helpers";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-[2rem] border border-slate-200/80 bg-white/75 p-6 shadow-[var(--shadow-card)] backdrop-blur md:flex-row md:items-end md:justify-between md:p-7",
        className
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  );
}
