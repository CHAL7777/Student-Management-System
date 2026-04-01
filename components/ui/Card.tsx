import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/helpers";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[var(--shadow-card)] backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-6 md:p-7", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("px-6 pb-6 md:px-7 md:pb-7", className)} {...props}>
      {children}
    </div>
  );
}
