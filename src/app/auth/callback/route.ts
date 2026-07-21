/**
 * @fileoverview `/auth/callback` route handler — the landing point for the
 * magic-link email. Supabase redirects here with a one-time `code`; we exchange
 * it for a session, which sets the httpOnly cookies via the cookie-bound server
 * client, then redirect the user into the app. On failure we bounce back to
 * `/login`. This route is public (on the allowlist) because it runs before a
 * session exists.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Completes sign-in by exchanging the magic-link `code` for a cookie session.
 *
 * @param request - The redirect request from Supabase, carrying `?code=` and an
 *   optional `?next=` destination path.
 * @returns A redirect to `next` (default `/`) on success, or to `/login?error=`
 *   when the code is missing or the exchange fails.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
