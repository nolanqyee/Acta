/**
 * @fileoverview Browser client for `GET /api/proposals/open`. Shared by product
 * hydrate paths and `/lab/capture`.
 */

import {
  OpenProposalResponse,
  type OpenProposalResponse as OpenProposalResponseType,
} from "@/lib/contracts/proposal";
import { apiFetch, readJsonBody } from "./http";

/** Result of {@link getOpenProposal} including HTTP status for lab display. */
export interface GetOpenProposalResult {
  ok: boolean;
  status: number;
  data?: OpenProposalResponseType;
  error?: unknown;
}

/**
 * Loads the user's open proposal snapshot, if any.
 *
 * @returns Parsed response plus status; does not throw on HTTP error statuses.
 */
export async function getOpenProposal(): Promise<GetOpenProposalResult> {
  const response = await apiFetch("/api/proposals/open");
  const json = await readJsonBody(response);
  if (!response.ok) {
    return { ok: false, status: response.status, error: json };
  }
  return {
    ok: true,
    status: response.status,
    data: OpenProposalResponse.parse(json),
  };
}
