/**
 * @fileoverview `/` — public marketing landing (waitlist). Reachable without a
 * session; the graph app moves to `/home` in a follow-up PR.
 */

import { LandingPage } from "@/features/landing/landing-page";

/**
 * Renders the public waitlist landing page.
 *
 * @returns The marketing homepage.
 */
export default function Page() {
  return <LandingPage />;
}
