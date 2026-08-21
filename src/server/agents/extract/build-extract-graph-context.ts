/**
 * @fileoverview Lean graph read for Extract dedup hints (U4-D). Loads active
 * endeavors plus skill/org names through a caller-scoped Supabase client (service
 * role in detached Extract jobs; RLS client is also safe with explicit user_id).
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  emptyExtractGraphContext,
  type ExtractGraphContext,
} from "./extract-prompt";

/** Endeavor lifecycle states included in Extract context. */
const VISIBLE_STATUSES = ["active", "demoted"] as const;

/** Raised when the lean graph read fails. */
export class ExtractGraphContextError extends Error {
  /**
   * @param message - Log-safe context.
   * @param cause - Underlying Supabase error.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ExtractGraphContextError";
    this.cause = cause;
  }
}

/**
 * Maps raw table rows into the {@link ExtractGraphContext} prompt shape.
 *
 * @param rows - Endeavor, skill, and org selects for one user.
 * @returns Serializable context block for the Extract user prompt.
 */
export function mapExtractGraphContext(rows: {
  endeavors: Array<{
    id: string;
    kind: string;
    title: string;
    summary: string | null;
    primary_parent_id: string | null;
  }>;
  skills: Array<{ id: string; name: string }>;
  orgs: Array<{ id: string; name: string }>;
}): ExtractGraphContext {
  if (
    rows.endeavors.length === 0 &&
    rows.skills.length === 0 &&
    rows.orgs.length === 0
  ) {
    return emptyExtractGraphContext();
  }

  return {
    endeavors: rows.endeavors.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      ...(row.summary ? { summary: row.summary } : {}),
      ...(row.primary_parent_id
        ? { primaryParentId: row.primary_parent_id }
        : {}),
    })),
    skills: rows.skills.map((row) => ({ id: row.id, name: row.name })),
    orgs: rows.orgs.map((row) => ({ id: row.id, name: row.name })),
  };
}

/**
 * Loads a lean snapshot of the user's graph for Extract add-vs-update hints.
 *
 * @param supabase - Supabase client (service role or RLS-bound).
 * @param userId - Verified auth subject; always filtered explicitly.
 * @returns Endeavors, skills, and orgs for prompt injection.
 * @throws {ExtractGraphContextError} When any select fails.
 */
export async function buildExtractGraphContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExtractGraphContext> {
  const [endeavors, skills, orgs] = await Promise.all([
    supabase
      .from("endeavors")
      .select("id, kind, title, summary, primary_parent_id")
      .eq("user_id", userId)
      .in("status", [...VISIBLE_STATUSES]),
    supabase.from("skills").select("id, name").eq("user_id", userId),
    supabase.from("orgs").select("id, name").eq("user_id", userId),
  ]);

  for (const [label, result] of [
    ["endeavors", endeavors],
    ["skills", skills],
    ["orgs", orgs],
  ] as const) {
    if (result.error) {
      throw new ExtractGraphContextError(
        `extract graph context read failed: ${label}`,
        result.error,
      );
    }
  }

  return mapExtractGraphContext({
    endeavors: endeavors.data ?? [],
    skills: skills.data ?? [],
    orgs: orgs.data ?? [],
  });
}
