import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/helpers";

type AlertVariant = "info" | "success" | "danger";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: AlertVariant;
  children: ReactNode;
}

const variants: Record<AlertVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800"
};

export function Alert({ title, children, className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      aria-live="polite"
      className={cn("rounded-2xl border px-4 py-3 text-sm", variants[variant], className)}
      role="status"
      {...props}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title && "mt-1")}>{children}</div>
    </div>
  );
}
