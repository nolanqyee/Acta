/**
 * @fileoverview `GET /api/graph` — the canvas bootstrap route (U3). Returns the
 * signed-in user's Endeavors-only `GraphSnapshot` for the force canvas. This is a
 * convenience read, not a U-D agent tool: it exists so Graph home can paint in one
 * round trip instead of composing `list_endeavors` + edges client-side (R7).
 *
 * Auth: the proxy already gates `/api/*`, but the handler re-verifies the session
 * (`getClaims()`) and reads through the RLS-bound client, so identity is checked
 * at the route and enforced again at the database.
 */

import { createServerSupabase } from "@/lib/supabase/server";
import {
  GraphReadError,
  readGraphSnapshot,
} from "@/server/graph/graph-repository";
import { withRateLimit } from "@/server/rate-limit";

/**
 * Returns the authenticated user's canvas snapshot.
 *
 * @returns 200 with a `GraphSnapshot`, 401 when there is no valid session, 429
 *   when rate limited, or 500 when the graph read fails.
 */
export const GET = withRateLimit(
  async () => {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
      const snapshot = await readGraphSnapshot(supabase, userId);
      return Response.json(snapshot, {
        // The graph is per-user and changes on every merge — never cache it.
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof GraphReadError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "graph_read_failed" }, { status: 500 });
      }
      throw error;
    }
  },
  { limit: 120, windowMs: 60_000 },
);
