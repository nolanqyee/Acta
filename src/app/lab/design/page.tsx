/**
 * @fileoverview `/lab/design` — Neubrutalism chrome workbench: the live graph canvas
 * full-bleed with the complete product chrome mocked on top. Dev-only, same
 * reasoning as `/lab/graph`: nothing here reads user data, but a workbench
 * shouldn't be reachable on a deployed app.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DesignLab } from "@/features/design-lab/design-lab";

/**
 * Renders the design-system workbench outside production.
 *
 * @returns The workbench surface.
 * @throws A Next.js not-found signal when running in production.
 */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <DesignLab />
    </Suspense>
  );
}
