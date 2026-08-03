/**
 * @fileoverview `/landing` — permanent alias for the public homepage at `/`.
 */

import { redirect } from "next/navigation";

/**
 * Redirects legacy `/landing` links to `/`.
 *
 * @returns Never — always redirects.
 */
export default function LandingRedirectPage() {
  redirect("/");
}
