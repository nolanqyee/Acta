/**
 * @fileoverview `/lab/graph` — a development workbench for the canvas.
 *
 * It renders the sample fixture with the physics HUD and no authentication, no
 * database read, and no product chrome, so the engine can be looked at directly: by a
 * human, or by `scripts/shoot-graph.mjs` taking screenshots. Being able to see the
 * thing is the whole point — the first canvas was tuned blind and it showed.
 *
 * Returns 404 in production. Nothing here reads user data, but a workbench shouldn't
 * be reachable on a deployed app.
 */

import { notFound } from "next/navigation";
import { GraphLab } from "@/features/graph/lab/graph-lab";

/**
 * Renders the canvas workbench outside production.
 *
 * @returns The workbench surface.
 * @throws A Next.js not-found signal when running in production.
 */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <GraphLab />;
}
