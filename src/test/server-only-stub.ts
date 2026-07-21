/**
 * @fileoverview Test stub for the `server-only` package. Under plain Node
 * (vitest) the real `server-only` module throws, because its default export is
 * meant to fail when pulled into a client bundle. Aliasing it to this empty
 * module in `vitest.config.ts` lets us unit-test server modules (which correctly
 * `import "server-only"`) without tripping that guard. Not a test file itself.
 */

export {};
