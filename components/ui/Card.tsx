import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/helpers";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-[color:var(--border)] bg-white shadow-[var(--shadow-card)]",
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
    <div className={cn("flex flex-col gap-2 p-6 md:p-8", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("px-6 pb-6 md:px-8 md:pb-8", className)} {...props}>
      {children}
    </div>
  );
}
