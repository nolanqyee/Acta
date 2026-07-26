/**
 * @fileoverview `/` — the graph surface. A one-line Server Component while the canvas
 * is being rebuilt slice by slice; the proxy has already redirected unauthenticated
 * callers to `/login`, so there is no gate to repeat here.
 *
 * It used to pass the signed-in user's email down for a profile control. That control
 * is gone with the rest of the first attempt's chrome and will come back with the
 * slice that needs it (docs/graph-canvas.md § Deliberately deferred).
 */

import { GraphView } from "@/features/graph/graph-view";

/**
 * Renders the graph canvas.
 *
 * @returns The graph surface.
 */
export default function Page() {
  return <GraphView />;
}
