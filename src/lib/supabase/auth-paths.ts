/**
 * @fileoverview Pure route-gating policy for auth. Kept dependency-free (no
 * Supabase, Next, or Node imports) so the access decision is trivially unit
 * testable and safe to import from the edge middleware runtime. The actual
 * session read lives in `./middleware`; this module only answers "given a path
 * and whether the caller is authenticated, what should happen?".
 */

/**
 * Paths reachable without a session. Everything else requires authentication.
 * `/login` + `/auth/callback` are the sign-in flow; `/api/health` + `/api/meta`
 * are unauthenticated liveness/contract probes.
 */
export const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/api/health",
  "/api/meta",
] as const;

/**
 * Whether a pathname is public (exact match or a nested sub-path).
 *
 * @param pathname - The request pathname (e.g. `/api/health`).
 * @returns True if the path is on the public allowlist and needs no session.
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Paths reachable without a session **only outside production**.
 *
 * `/lab/*` holds front-end workbenches that render fixtures and touch no user data
 * (see `src/app/lab/graph`). They are open in development so a browser — or a
 * screenshot script — can look at the canvas without a magic-link round trip. The
 * routes themselves also 404 in production, so this allowance can't expose anything
 * on its own.
 */
export const DEV_ONLY_PUBLIC_PATHS = ["/lab"] as const;

/**
 * Whether a pathname is one of the development-only workbench paths.
 *
 * @param pathname - The request pathname.
 * @returns True for `/lab` and anything beneath it.
 */
export function isDevOnlyPath(pathname: string): boolean {
  return DEV_ONLY_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** What the middleware should do with a request after reading its session. */
export type GateDecision = "allow" | "login" | "unauthorized";

/**
 * Decides how to handle a request given its path and auth state. Public paths
 * and authenticated callers pass; an unauthenticated caller is sent to `/login`
 * for a page, or rejected with 401 for an `/api/*` route (APIs shouldn't
 * redirect).
 *
 * @param pathname - The request pathname.
 * @param isAuthenticated - Whether a valid session/JWT was verified.
 * @param allowDevPaths - Whether development-only workbench paths are open; callers
 *   pass `process.env.NODE_ENV !== "production"`. Defaults to false so forgetting it
 *   fails closed.
 * @returns `allow` to proceed, `login` to redirect, `unauthorized` for a 401.
 */
export function gateDecision(
  pathname: string,
  isAuthenticated: boolean,
  allowDevPaths = false,
): GateDecision {
  if (isPublicPath(pathname) || isAuthenticated) return "allow";
  if (allowDevPaths && isDevOnlyPath(pathname)) return "allow";
  if (pathname.startsWith("/api/")) return "unauthorized";
  return "login";
}
