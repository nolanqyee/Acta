/**
 * @fileoverview Meta route handler (`GET /api/meta`). Echoes the shared
 * contract's closed set of entity types, proving that `@/lib/contracts` resolves
 * on the server runtime (the same module the browser bundle imports). Handy as a
 * quick contract-drift smoke check.
 */

import { EntityType } from "@/lib/contracts";

/**
 * Returns the service name and the canonical entity-type list from contracts.
 *
 * @returns 200 JSON `{ service, entityTypes }`.
 */
export function GET(): Response {
  return Response.json({ service: "acta", entityTypes: EntityType.options });
}
