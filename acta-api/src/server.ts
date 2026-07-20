/**
 * @fileoverview acta-api runnable entry point — the only module with server
 * side effects. It builds the app from `createApp()` and binds it to an HTTP
 * port via `@hono/node-server`. Kept separate from `index.ts` so the app
 * factory stays importable in tests without opening a socket.
 */

import { serve } from "@hono/node-server";
import { createApp } from "./index.js";

/**
 * Reads the HTTP port from the environment, falling back to 8787.
 *
 * @returns A valid port number; ignores non-numeric or non-positive `PORT`
 *   values so a malformed env var can't silently bind port 0.
 */
function resolvePort(): number {
  const parsed = Number.parseInt(process.env.PORT ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8787;
}

const app = createApp();

serve({ fetch: app.fetch, port: resolvePort() }, (info) => {
  console.log(`acta-api listening on http://localhost:${info.port}`);
});
