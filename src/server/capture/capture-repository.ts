/**
 * @fileoverview CaptureRepository — persists immutable intake rows (`captures`
 * table). Extract and proposals are separate units (U4-C+); this module only
 * validates yap text and inserts under RLS.
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Capture } from "@/lib/contracts";

/** Raised when yap text fails validation before any DB write. */
export class CaptureValidationError extends Error {
  /**
   * @param message - Safe client-facing reason (e.g. empty text).
   */
  constructor(message: string) {
    super(message);
    this.name = "CaptureValidationError";
  }
}

/** Raised when the Supabase insert fails. */
export class CaptureWriteError extends Error {
  /**
   * @param message - Log-safe context for the route handler.
   * @param cause - Underlying Supabase error.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "CaptureWriteError";
    this.cause = cause;
  }
}

/**
 * Normalizes and validates capture text before insert.
 *
 * @param text - Raw yap from the client.
 * @returns Trimmed non-empty text.
 * @throws {CaptureValidationError} When text is empty or whitespace-only.
 */
export function normalizeCaptureText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new CaptureValidationError("capture_text_empty");
  }
  return trimmed;
}

/**
 * Maps a `captures` table row to the {@link Capture} contract shape.
 *
 * @param row - Raw Supabase select row for one capture.
 * @returns Capture with `createdAt` normalized to UTC ISO (`Z` suffix).
 */
export function mapCaptureRow(row: {
  id: string;
  user_id: string;
  text: string;
  source_type: string;
  source_meta: unknown;
  created_at: string;
}): Capture {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    sourceType: row.source_type as Capture["sourceType"],
    sourceMeta: (row.source_meta as Capture["sourceMeta"]) ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * Inserts one immutable Capture row for the signed-in user.
 *
 * @param supabase - RLS-bound client scoped to the session.
 * @param userId - Verified auth subject (also enforced by RLS).
 * @param text - Non-empty yap text (call {@link normalizeCaptureText} first).
 * @param sourceType - Intake channel; defaults to typed quick-add at the route.
 * @returns The persisted Capture contract shape.
 * @throws {CaptureWriteError} When the insert fails.
 */
export async function createCaptureRow(
  supabase: SupabaseClient,
  userId: string,
  text: string,
  sourceType: Capture["sourceType"] = "typed",
): Promise<Capture> {
  const { data, error } = await supabase
    .from("captures")
    .insert({
      user_id: userId,
      text,
      source_type: sourceType,
    })
    .select("id, user_id, text, source_type, source_meta, created_at")
    .single();

  if (error || !data) {
    throw new CaptureWriteError("capture_insert_failed", error);
  }

  return mapCaptureRow(data);
}
