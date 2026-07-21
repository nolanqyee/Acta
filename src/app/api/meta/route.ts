/**
 * @fileoverview Meta route handler (`GET /api/meta`). Echoes the shared
 * contract's closed set of entity types, proving that `@/lib/contracts` resolves
 * on the server runtime (the same module the browser bundle imports). Handy as a
 * quick contract-drift smoke check. Wrapped with the baseline rate limiter as a
 * concrete example of the U2 abuse control on a public route.
 */

import { EntityType } from "@/lib/contracts";
import { withRateLimit } from "@/server/rate-limit";

/**
 * Returns the service name and the canonical entity-type list from contracts.
 *
 * @returns 200 JSON `{ service, entityTypes }`, or 429 when rate limited.
 */
export const GET = withRateLimit(
  () => Response.json({ service: "acta", entityTypes: EntityType.options }),
  { limit: 60, windowMs: 60_000 },
);
