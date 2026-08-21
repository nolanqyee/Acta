/**
 * @fileoverview Unit tests for capture text validation — the U4-A gate before
 * Extract or any DB write runs.
 */

import { describe, expect, it } from "vitest";
import {
  CaptureValidationError,
  mapCaptureRow,
  normalizeCaptureText,
} from "./capture-repository";

describe("normalizeCaptureText", () => {
  it("returns trimmed text for a non-empty yap", () => {
    expect(normalizeCaptureText("  hello world  ")).toBe("hello world");
  });

  it("rejects empty and whitespace-only input", () => {
    expect(() => normalizeCaptureText("")).toThrow(CaptureValidationError);
    expect(() => normalizeCaptureText("   \n\t  ")).toThrow(
      CaptureValidationError,
    );
  });
});

describe("mapCaptureRow", () => {
  it("normalizes Postgres timestamptz offsets to ISO Z for Zod", () => {
    const capture = mapCaptureRow({
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "22222222-2222-4222-8222-222222222222",
      text: "hello",
      source_type: "typed",
      source_meta: null,
      created_at: "2026-08-13T16:10:54.123456+00:00",
    });

    expect(capture.createdAt).toBe("2026-08-13T16:10:54.123Z");
  });
});
