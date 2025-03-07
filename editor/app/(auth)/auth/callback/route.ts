import type { Database } from "@/database.types";
import { resolve_next } from "@/lib/forms/url";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const redirect_uri = requestUrl.searchParams.get("redirect_uri");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // return

  if (redirect_uri) {
    return NextResponse.redirect(redirect_uri);
  }

  if (next) {
    return NextResponse.redirect(resolve_next(requestUrl.origin, next));
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
