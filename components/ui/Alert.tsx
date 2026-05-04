import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/helpers";

type AlertVariant = "info" | "success" | "danger" | "warning";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: AlertVariant;
  children: ReactNode;
}

const variants: Record<AlertVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-green-200 bg-green-50 text-green-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900"
};

export function Alert({ title, children, className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-[1.55rem] border px-4 py-3.5 text-sm shadow-[0_14px_28px_rgba(15,23,42,0.04)]",
        variants[variant],
        className
      )}
      role="status"
      {...props}
    >
      {title ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">{title}</p> : null}
      <div className={cn("leading-6", title && "mt-1.5")}>{children}</div>
    </div>
  );
}
