import type { Role } from "@/types";

export const ROLES: Role[] = ["admin", "teacher", "student"];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Registrar",
  teacher: "Teacher",
  student: "Student"
};

export const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard/admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student"
};
