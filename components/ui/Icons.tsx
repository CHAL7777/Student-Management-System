import type { SVGProps } from "react";

import { cn } from "@/utils/helpers";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ className, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5.5h7.5V12H4z" />
      <path d="M12.5 5.5H20v5h-7.5z" />
      <path d="M12.5 11H20v7.5h-7.5z" />
      <path d="M4 13.5h7.5V20H4z" />
    </IconBase>
  );
}

export function StudentsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20" />
      <circle cx="10" cy="8" r="3.2" />
      <path d="M20 20v-1.1a3 3 0 0 0-2.1-2.9" />
      <path d="M15.2 5.3a3 3 0 0 1 0 5.4" />
    </IconBase>
  );
}

export function CoursesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6.5 12 4l8 2.5v11L12 20l-8-2.5z" />
      <path d="M12 4v16" />
      <path d="M4 6.5 12 9l8-2.5" />
    </IconBase>
  );
}


export function TeachersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="7.5" r="3.2" />
      <path d="M5 20v-1.3A4.7 4.7 0 0 1 9.7 14h4.6a4.7 4.7 0 0 1 4.7 4.7V20" />
      <path d="m17.5 4.5 1 1 2-2" />
    </IconBase>
  );
}

export function ClassesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7.5h16" />
      <path d="M6.5 4.5v6" />
      <path d="M17.5 4.5v6" />
      <rect x="4" y="6.5" width="16" height="13" rx="2.5" />
      <path d="M8 12h3" />
      <path d="M13 12h3" />
      <path d="M8 16h3" />
      <path d="M13 16h3" />
    </IconBase>
  );
}

export function ReportsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 19.5h13" />
      <path d="M8.5 16V10" />
      <path d="M12 16V6.5" />
      <path d="M15.5 16v-4" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconBase>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20v-1.4A4.6 4.6 0 0 1 9.6 14h4.8a4.6 4.6 0 0 1 4.6 4.6V20" />
    </IconBase>
  );
}

export function IdCardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M7.5 10h4" />
      <path d="M7.5 14h6" />
      <circle cx="16.5" cy="11.5" r="1.8" />
    </IconBase>
  );
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 9 9-4 9 4-9 4z" />
      <path d="M7 11.5V15c0 1.8 2.2 3 5 3s5-1.2 5-3v-3.5" />
      <path d="M21 10v5" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M4 9.5h16" />
    </IconBase>
  );
}

export function SchoolIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 10 9-5 9 5" />
      <path d="M6 10v8" />
      <path d="M18 10v8" />
      <path d="M4 18h16" />
      <path d="M10 18v-4h4v4" />
    </IconBase>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M8 10V7.8A4 4 0 0 1 12 4a4 4 0 0 1 4 3.8V10" />
    </IconBase>
  );
}


export function CheckCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.3 2.3 4.7-5" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 2" />
    </IconBase>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3L7.5 7.5l3.3-1.2z" />
      <path d="m18.5 13 .7 1.8L21 15.5l-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
      <path d="m5.5 13 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h12" />
      <path d="M4 17h8" />
    </IconBase>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 6H7a2.5 2.5 0 0 0-2.5 2.5v7A2.5 2.5 0 0 0 7 18h3" />
      <path d="m14 8 4 4-4 4" />
      <path d="M9.5 12H18" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m11 6-6 6 6 6" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function TrendUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4 16 5-5 3.5 3.5L20 7" />
      <path d="M14.5 7H20v5.5" />
    </IconBase>
  );
}
