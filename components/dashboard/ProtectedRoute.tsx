import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth";
import type { Role } from "@/types";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: ReactNode;
}

export async function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  await requireRole(allowedRoles);

  return <>{children}</>;
}
