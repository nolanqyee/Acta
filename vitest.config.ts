/**
 * @fileoverview Vitest configuration. Mirrors the Next `@/*` path alias so tests
 * import shared modules (e.g. `@/lib/contracts`) the same way app code does, and
 * runs in the Node environment since our current tests cover pure schemas and
 * route handlers (no DOM). Component/DOM tests can add jsdom later per-file.
 * `server-only` is aliased to an empty stub so server modules that guard
 * themselves with `import "server-only"` remain unit-testable under Node.
 */

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/server-only-stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
