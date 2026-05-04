import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/helpers";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-dashed border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,249,255,0.94))]",
        className
      )}
    >
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center md:px-10">
        {icon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,rgba(59,130,246,0.14),rgba(14,165,233,0.1))] text-sky-600 shadow-[0_16px_36px_rgba(37,99,235,0.14)]">
            {icon}
          </div>
        ) : null}
        <div className="max-w-xl">
          <h3 className="heading-display text-[1.7rem] text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">{description}</p>
        </div>
        {action ? (
          action.href ? (
            <Link href={action.href}>
              <Button variant="primary">{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} type="button" variant="primary">
              {action.label}
            </Button>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
