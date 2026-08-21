/**
 * @fileoverview Browser client for `POST /api/captures`. Imported by product
 * surfaces and `/lab/capture` alike — one code path, cookie session, no dev shortcuts.
 */

import {
  CreateCaptureRequest,
  CreateCaptureResponse,
  type CreateCaptureRequest as CreateCaptureRequestType,
} from "@/lib/contracts/capture";
import { apiFetch, readJsonBody } from "./http";

/** Result of {@link createCapture} including HTTP status for lab display. */
export interface CreateCaptureResult {
  ok: boolean;
  status: number;
  data?: CreateCaptureResponse;
  error?: unknown;
}

/**
 * Submits a yap to `POST /api/captures` using the same fetch the product will use.
 *
 * @param body - Capture text and optional source type.
 * @returns Parsed response plus status; does not throw on HTTP error statuses.
 */
export async function createCapture(
  body: CreateCaptureRequestType,
): Promise<CreateCaptureResult> {
  const payload = CreateCaptureRequest.parse(body);
  const response = await apiFetch("/api/captures", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const json = await readJsonBody(response);
  if (!response.ok) {
    return { ok: false, status: response.status, error: json };
  }
  return {
    ok: true,
    status: response.status,
    data: CreateCaptureResponse.parse(json),
  };
}
