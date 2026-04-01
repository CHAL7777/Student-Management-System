import { cache } from "react";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase";
import type { Role, UserProfile } from "@/types";
import { ROLE_HOME } from "@/utils/roles";

export const getCurrentUserProfile = cache(async () => {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null as UserProfile | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, login_id, role, student_id, teacher_id")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile: (profile as UserProfile | null) ?? null
  };
});

export async function requireUser() {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect(ROLE_HOME[profile.role]);
  }

  return profile;
}

export async function redirectToDashboardHome() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  redirect(ROLE_HOME[profile.role]);
}
