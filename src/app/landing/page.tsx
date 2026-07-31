/**
 * @fileoverview `/landing` — dev-only marketing landing page built from the Claude
 * Design import. Renders the full Acta waitlist surface (hero graph, how-it-works,
 * importers, outputs, footer CTA) for visual review before it ships on the public
 * homepage. Same production guard as `/lab/design`.
 */

import { notFound } from "next/navigation";
import { LandingPage } from "@/features/landing/landing-page";

/**
 * Renders the marketing landing page outside production.
 *
 * @returns The landing page surface.
 * @throws A Next.js not-found signal when running in production.
 */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LandingPage />;
}
