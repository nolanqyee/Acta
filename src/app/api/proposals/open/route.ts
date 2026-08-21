/**
 * @fileoverview `GET /api/proposals/open` — hydrates the user's blocking proposal
 * (0..1 in v1) for panel reattach and the dev lab. Returns `null` when Capture+
 * may proceed.
 */

import { OpenProposalResponse } from "@/lib/contracts/proposal";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  findOpenProposalSnapshot,
  ProposalReadError,
} from "@/server/proposal/proposal-repository";
import { withRateLimit } from "@/server/rate-limit";

/**
 * Returns the newest open ExtractProposal snapshot for the signed-in user.
 *
 * @returns 200 with `{ proposal }` (nullable), 401 when unauthenticated, 429 when
 *   rate limited, or 500 when the read fails.
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
      const proposal = await findOpenProposalSnapshot(supabase, userId);
      const response = OpenProposalResponse.parse({ proposal });
      return Response.json(response, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof ProposalReadError) {
        console.error(error.message, error.cause);
        return Response.json({ error: "open_proposal_lookup_failed" }, { status: 500 });
      }
      throw error;
    }
  },
  { limit: 120, windowMs: 60_000 },
);
