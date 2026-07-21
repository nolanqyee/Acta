/**
 * @fileoverview The Supabase session proxy used by Next middleware. On every
 * matched request it rebuilds a cookie-bound server client, calls
 * `getClaims()` to (a) locally verify the JWT via JWKS/WebCrypto and (b) refresh
 * the token when it's near expiry, then writes any rotated cookies onto a
 * response. This is the mechanism that keeps httpOnly cookie sessions alive
 * without the browser ever touching the token. Gating policy lives in
 * `./auth-paths`; the wiring that combines them is in `src/middleware.ts`.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session for a request and reports whether the caller
 * is authenticated. Must be called on every protected request so expiring
 * tokens are rotated and re-persisted to cookies (otherwise reads start
 * returning empty the moment a token expires).
 *
 * @param request - The incoming middleware request (source of session cookies).
 * @returns `response` carrying any refreshed `Set-Cookie`s (pass it through or
 *   copy its cookies onto a redirect), and `isAuthenticated` from local JWT
 *   verification.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; isAuthenticated: boolean }> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims verifies the JWT locally (asymmetric keys → WebCrypto + cached
  // JWKS) and refreshes the session if it's about to expire. Never trust
  // getSession() here — it isn't re-verified against the signing key.
  const { data } = await supabase.auth.getClaims();

  return { response, isAuthenticated: Boolean(data?.claims) };
}
