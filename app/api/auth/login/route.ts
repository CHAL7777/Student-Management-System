import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerSupabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";
import { ROLE_HOME } from "@/utils/roles";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const loginId = String(formData.get("login_id") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  const supabase = createRouteHandlerSupabase(request, response);

  const { data: email, error: resolveError } = await supabase.rpc("resolve_login_email", {
    p_full_name: fullName,
    p_login_id: loginId
  });

  if (resolveError || !email) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Invalid full name, ID, or password")}`,
        request.url
      )
    );
  }

  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !user) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error?.message ?? "Invalid credentials")}`, request.url)
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, login_id, role, student_id, teacher_id")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as UserProfile | null;

  if (!typedProfile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Account profile not found")}`, request.url)
    );
  }

  response.headers.set("Location", new URL(ROLE_HOME[typedProfile.role], request.url).toString());

  return response;
}
