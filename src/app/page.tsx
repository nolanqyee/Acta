/**
 * @fileoverview `/` — public marketing landing (waitlist). Reachable without a
 * session; the graph app lives at `/home` after sign-in.
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
