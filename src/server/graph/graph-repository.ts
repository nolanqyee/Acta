/**
 * @fileoverview GraphRepository — the only place that reads the graph tables for
 * canvas bootstrap. It performs the I/O (five small user-scoped selects) and
 * delegates all shaping to `projectGraph`, so the query layer stays dumb and the
 * graph rules stay testable.
 *
 * Ownership: reads go through the caller's RLS-bound client (KTD9), so this
 * module never needs the service role. Archived endeavors are excluded here
 * because Graph home shows the active graph by default (docs/surfaces-and-flows.md
 * Flow 5); surfacing them is a later filter, not a different read path.
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GraphSnapshot } from "@/lib/contracts";
import {
  projectGraph,
  type EdgeRow,
  type EndeavorRow,
  type NamedRow,
} from "./project-graph";

/** Endeavor lifecycle states drawn on the canvas (archived is hidden by default). */
const VISIBLE_STATUSES = ["active", "demoted"] as const;

/** Raised when a bootstrap read fails, so the route can answer 500 with context. */
export class GraphReadError extends Error {
  /**
   * @param message - Which read failed and why (safe to log, not user copy).
   * @param cause - The underlying Supabase error.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "GraphReadError";
    this.cause = cause;
  }
}

/**
 * Reads one user's full canvas snapshot: visible endeavors, their edges, and the
 * facet names (skills/people/orgs) their hover cards and the filter menu need.
 *
 * All five selects are filtered by `user_id` explicitly *and* run under RLS —
 * belt and braces, so the query is still correct if it is ever handed a
 * service-role client.
 *
 * @param supabase - A Supabase client (normally the RLS-bound, cookie-scoped one).
 * @param userId - The verified auth subject whose graph to read.
 * @returns The projected snapshot; empty `nodes`/`links` for a new user.
 * @throws {GraphReadError} When any of the underlying selects fails.
 */
export async function readGraphSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<GraphSnapshot> {
  const [endeavors, edges, skills, people, orgs] = await Promise.all([
    supabase
      .from("endeavors")
      .select(
        "id, kind, title, summary, timeframe, status, application_tags, primary_parent_id",
      )
      .eq("user_id", userId)
      .in("status", VISIBLE_STATUSES),
    supabase
      .from("edges")
      .select("id, type, from_type, from_id, to_type, to_id")
      .eq("user_id", userId)
      .in("type", [
        "part_of",
        "related_to",
        "used_skill",
        "involved_person",
        "at_org",
      ]),
    supabase.from("skills").select("id, name").eq("user_id", userId),
    supabase.from("people").select("id, name").eq("user_id", userId),
    supabase.from("orgs").select("id, name").eq("user_id", userId),
  ]);

  for (const [label, result] of [
    ["endeavors", endeavors],
    ["edges", edges],
    ["skills", skills],
    ["people", people],
    ["orgs", orgs],
  ] as const) {
    if (result.error) {
      throw new GraphReadError(
        `graph bootstrap read failed: ${label}`,
        result.error,
      );
    }
  }

  return projectGraph({
    endeavors: (endeavors.data ?? []) as EndeavorRow[],
    edges: (edges.data ?? []) as EdgeRow[],
    skills: (skills.data ?? []) as NamedRow[],
    people: (people.data ?? []) as NamedRow[],
    orgs: (orgs.data ?? []) as NamedRow[],
  });
}
