/**
 * @fileoverview Health route handler (`GET /api/health`). A dependency-free
 * liveness probe used by the U1 shell and future uptime checks to confirm the
 * app's server runtime is responding. Lives inside the Next app (same origin as
 * the UI), so there is no CORS boundary to cross.
 */

/**
 * Reports that the API layer is alive.
 *
 * @returns 200 JSON `{ status: "ok" }`.
 */
export function GET(): Response {
  return Response.json({ status: "ok" });
}
