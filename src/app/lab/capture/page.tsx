/**
 * @fileoverview `/lab/capture` — dev workbench for Capture API QA (U4-A).
 *
 * Uses the same browser client (`src/lib/api/captures`) as product code will.
 * Returns 404 in production like `/lab/graph`.
 */

import { notFound } from "next/navigation";
import { CaptureLab } from "@/features/lab/capture-lab";

/**
 * Renders the Capture API lab outside production.
 *
 * @returns The workbench page.
 * @throws A Next.js not-found signal when running in production.
 */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CaptureLab />;
}
