import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareSupabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";
import { ROLE_HOME } from "@/utils/roles";

const protectedPrefixes = [
  "/dashboard",
  "/students",
  "/teachers",
  "/subjects",
  "/classes",
  "/marks",
  "/reports"
];

const adminOnlyPrefixes = ["/teachers", "/subjects", "/classes"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isLoginPage = pathname === "/login";

  if (!isProtected && !isLoginPage) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareSupabase(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, login_id, role, student_id, teacher_id")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as UserProfile | null;

  if (!typedProfile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL(ROLE_HOME[typedProfile.role], request.url));
  }

  if (adminOnlyPrefixes.some((prefix) => pathname.startsWith(prefix)) && typedProfile.role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_HOME[typedProfile.role], request.url));
  }

  if (pathname.startsWith("/marks") && typedProfile.role !== "teacher") {
    return NextResponse.redirect(new URL(ROLE_HOME[typedProfile.role], request.url));
  }

  if (pathname.startsWith("/students") && !["admin", "teacher"].includes(typedProfile.role)) {
    return NextResponse.redirect(new URL(ROLE_HOME[typedProfile.role], request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"]
};
