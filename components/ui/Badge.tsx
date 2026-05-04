import type { HTMLAttributes } from "react";

import { cn } from "@/utils/helpers";

type BadgeVariant = "neutral" | "success" | "danger" | "warning" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "border border-slate-200 bg-slate-50 text-slate-700 shadow-sm",
  success: "border border-green-200 bg-green-50 text-green-700 shadow-sm",
  danger: "border border-red-200 bg-red-50 text-red-700 shadow-sm",
  warning: "border border-amber-200 bg-amber-50 text-amber-700 shadow-sm",
  accent: "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
