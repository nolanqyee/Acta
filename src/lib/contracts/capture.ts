/**
 * @fileoverview HTTP contracts for the Capture intake API (U4-A). Shared by the
 * route handler, client fetch helpers, and the dev lab workbench — same shapes
 * whether the caller is `/home` or `/lab/capture`.
 */

import { z } from "zod";
import { Capture, CaptureSourceType } from "./entities";

/** Body for `POST /api/captures` — a non-empty yap (typed quick-add by default). */
export const CreateCaptureRequest = z.object({
  text: z.string(),
  sourceType: CaptureSourceType.default("typed"),
});
export type CreateCaptureRequest = z.infer<typeof CreateCaptureRequest>;

/** Response after Capture commit and proposal shell creation (U4-C). */
export const CreateCaptureResponse = Capture.extend({
  proposalId: z.uuid(),
});
export type CreateCaptureResponse = z.infer<typeof CreateCaptureResponse>;
