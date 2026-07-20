/**
 * @fileoverview `/generate` route — the adapter picker users reach from the
 * top-left hamburger menu (per surfaces-and-flows § Generate). Choosing an
 * adapter navigates to its own page at `/adapters/[kind]`. Placeholder for now;
 * thin Generate routing is sketched at U6 and full adapter editors land in U-F.
 */

import { PlaceholderSurface } from "@/components/placeholder-surface";

/**
 * Generate / adapter-picker surface placeholder.
 *
 * @returns The reserved `/generate` route shell.
 */
export default function GeneratePage() {
  return (
    <PlaceholderSurface
      title="Generate"
      note="Pick an adapter (resume, interview, app Q) to open its workspace at /adapters/[kind]. Thin routing at U6; editors in U-F."
    />
  );
}
