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
        "relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] md:flex md:items-end md:justify-between md:gap-8 md:p-8",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-blue-600" />
      <div className="relative max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-600">{eyebrow}</p>
        ) : null}
        <h1 className="heading-display mt-3 text-[2.4rem] text-slate-900 md:text-[3.2rem] md:leading-[1.02]">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="relative flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  );
}
