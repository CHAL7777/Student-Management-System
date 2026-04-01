import { NextRequest, NextResponse } from "next/server";

import { createRouteHandlerSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const supabase = createRouteHandlerSupabase(request, response);

  await supabase.auth.signOut();

  return response;
}
