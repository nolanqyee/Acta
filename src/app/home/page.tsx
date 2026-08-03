/**
 * @fileoverview `/home` — the signed-in graph app: full-bleed canvas plus product
 * chrome. Unauthenticated callers are redirected to `/login` by the proxy before
 * this page runs.
 */

import { GraphHome } from "@/features/graph/graph-home";

/**
 * Renders the graph home surface for authenticated users.
 *
 * @returns The graph app surface.
 */
export default function Page() {
  return <GraphHome />;
}
