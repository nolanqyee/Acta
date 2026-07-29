/**
 * @fileoverview `/lab/design` — a design-system workbench for the future Acta
 * homepage: the live graph canvas full-bleed, with the complete product chrome
 * mocked on top, where every chrome surface's visual treatment (fill, blur,
 * shadow) can be swapped between named systems via `?design=`.
 *
 * This exists to judge design systems (starting with `opaque` vs `liquid-glass`)
 * against a realistic screen instead of an isolated swatch — see
 * docs/archive/mockup-synthesis.md for the chrome inventory being mocked. Dev-only,
 * same reasoning as `/lab/graph`: nothing here reads user data, but a workbench
 * shouldn't be reachable on a deployed app.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DesignLab } from "@/features/design-lab/design-lab";

/**
 * Renders the design-system workbench outside production.
 *
 * @returns The workbench surface, wrapped in `Suspense` because `DesignLab` reads
 *   the initial system from `useSearchParams()`.
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
