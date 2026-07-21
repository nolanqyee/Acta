/**
 * @fileoverview Next Proxy entry (Next 16's `proxy.ts`, formerly `middleware.ts`)
 * — the first auth gate for every matched request. It refreshes the Supabase
 * cookie session (`updateSession`) and then applies the gating policy
 * (`gateDecision`): public paths and authenticated callers pass through with
 * refreshed cookies; unauthenticated callers are redirected to `/login` (pages)
 * or rejected with 401 (`/api/*`). This is defense-in-depth, not the sole
 * boundary — protected routes still re-check and RLS remains the real per-user
 * gate at the DB. Runs on the Node.js runtime (Edge is not supported in proxy).
 */

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { gateDecision } from "@/lib/supabase/auth-paths";

/**
 * Runs on every matched request (see `config.matcher`): refresh session, then
 * gate.
 *
 * @param request - The incoming request.
 * @returns The pass-through response (with refreshed cookies), a redirect to
 *   `/login`, or a 401 JSON response.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, isAuthenticated } = await updateSession(request);
  const decision = gateDecision(request.nextUrl.pathname, isAuthenticated);

  if (decision === "allow") return response;

  if (decision === "unauthorized") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

/**
 * Matcher: run the proxy on everything except Next internals and static asset
 * files (which need no session and shouldn't pay the verification cost).
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
