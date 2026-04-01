import type { HTMLAttributes } from "react";

import { cn } from "@/utils/helpers";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)}
      {...props}
    />
  );
}
