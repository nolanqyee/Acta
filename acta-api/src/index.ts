/**
 * @fileoverview acta-api app factory — builds the Hono backend that will host
 * capture, extract, and graph routes. At U-J U1 it only exposes health/meta
 * endpoints so the workspace is runnable and proves `@acta/contracts` resolves
 * on the server. This module is side-effect free (it never binds a port), so
 * tests can exercise routes via `app.request(...)`; the runnable entry point is
 * `server.ts`. All secrets (Supabase service role, LLM keys) live only in this
 * app's deploy env and are never shipped to acta-web. Later milestones add auth
 * (U2), graph bootstrap (U3), capture+extract streaming (U4), and merge (U5).
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { EntityType } from "@acta/contracts";

/**
 * Reads the allowed browser origins for CORS from `WEB_ORIGIN` (comma-separated),
 * defaulting to the local Vite dev server. The acta-web bundle is cross-origin
 * from acta-api, so without this the browser blocks every request.
 *
 * @returns A non-empty list of exact origins permitted to call the API.
 */
function resolveAllowedOrigins(): string[] {
  const raw = (process.env.WEB_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return raw.length > 0 ? raw : ["http://localhost:5173"];
}

/**
 * Builds the Hono app with the routes available at this milestone.
 *
 * @returns A configured Hono instance (no server bound yet), so tests can call
 *   `app.request(...)` without opening a port.
 */
export function createApp(): Hono {
  const app = new Hono();
  const allowedOrigins = resolveAllowedOrigins();

  app.use(
    "*",
    cors({
      origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.get("/", (c) => c.text("acta-api"));

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.get("/meta", (c) =>
    c.json({ service: "acta-api", entityTypes: EntityType.options }),
  );

  return app;
}
