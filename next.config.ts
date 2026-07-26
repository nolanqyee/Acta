/**
 * @fileoverview Next.js configuration for the Acta app. Intentionally minimal at
 * U1 — the App Router, TypeScript, and route handlers work with zero custom
 * config. This is where future concerns land (image domains, headers, redirects,
 * experimental flags) so they stay in one reviewed place rather than scattered.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev-tools badge sits over the canvas and lands in every screenshot
  // taken by scripts/shoot-graph.mjs, which is how front-end work is reviewed here.
  devIndicators: false,
};

export default nextConfig;
