import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/utils/helpers";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-slate-800",
  secondary:
    "border border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 hover:bg-emerald-400",
  ghost:
    "border border-slate-200/80 bg-white/85 text-slate-700 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:bg-white hover:text-slate-950",
  danger:
    "border border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 hover:bg-rose-400"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-3.5 text-sm",
  md: "h-11 px-4.5 text-sm",
  lg: "h-12 px-5 text-base"
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
