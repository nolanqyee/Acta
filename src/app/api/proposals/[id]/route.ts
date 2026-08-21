/**
 * @fileoverview `GET /api/proposals/:id` — full proposal snapshot for reattach
 * after refresh (U4-E).
 */

import { ProposalSnapshotResponse } from "@/lib/contracts/proposal";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  findProposalById,
  ProposalReadError,
} from "@/server/proposal/proposal-repository";
import { withRateLimitContext } from "@/server/rate-limit";

/**
 * Returns one proposal snapshot owned by the signed-in user.
 *
 * @param _request - Unused; auth comes from cookies.
 * @param context - Route params with proposal id.
 * @returns 200 with snapshot, 401, 404, 429, or 500.
 */
export const GET = withRateLimitContext(
  async (
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params;
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
      const proposal = await findProposalById(supabase, userId, id);
      if (!proposal) {
        return Response.json({ error: "proposal_not_found" }, { status: 404 });
      }

      const response = ProposalSnapshotResponse.parse({ proposal });
      return Response.json(response, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof ProposalReadError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "proposal_lookup_failed" }, { status: 500 });
      }
      throw error;
    }
  },
  { limit: 120, windowMs: 60_000 },
);
