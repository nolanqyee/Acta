/**
 * @fileoverview Pure projection from stored rows to the canvas `GraphSnapshot`:
 * endeavor/edge/facet rows in, Endeavors-only nodes plus endeavor↔endeavor links
 * out. Kept free of Supabase (the repository does the I/O and calls this) so the
 * row-shaping rules are unit testable.
 *
 * This file owns **reading rows**; how facets become links is the shared rule in
 * `@/lib/graph/derive-endeavor-links`, which the client sample graph uses too.
 */

import "server-only";

import {
  ApplicationTag,
  EndeavorKind,
  EntityStatus,
  GraphNode,
  GraphSnapshot,
  Timeframe,
} from "@/lib/contracts";
import {
  deriveEndeavorLinks,
  type FacetGroup,
  type StructuralLink,
} from "@/lib/graph/derive-endeavor-links";

/** An `endeavors` row, as selected (snake_case, jsonb columns still unparsed). */
export interface EndeavorRow {
  id: string;
  kind: string;
  title: string;
  summary: string | null;
  timeframe: unknown;
  status: string;
  application_tags: unknown;
  primary_parent_id: string | null;
}

/** An `edges` row, as selected. */
export interface EdgeRow {
  id: string;
  type: string;
  from_type: string;
  from_id: string;
  to_type: string;
  to_id: string;
}

/** A row from any name-bearing facet table (`skills`, `people`, `orgs`). */
export interface NamedRow {
  id: string;
  name: string;
}

/** The raw read the repository hands to the projection. */
export interface RawGraphRows {
  endeavors: EndeavorRow[];
  edges: EdgeRow[];
  skills: NamedRow[];
  people: NamedRow[];
  orgs: NamedRow[];
}

/** Knobs for how aggressively derived facet links are drawn. */
export interface ProjectGraphOptions {
  /**
   * Largest shared-facet group that still produces links. Groups bigger than this
   * are treated as hubs and skipped. Defaults to the shared derivation's cap.
   */
  maxSharedFacetGroup?: number;
  /** How many derived facet links one endeavor may carry; containment is exempt. */
  maxFacetLinksPerEndeavor?: number;
  /** Timestamp stamped on the snapshot; injectable so tests are deterministic. */
  generatedAt?: string;
}

/** Which edge type contributes which derived relation, and via which facet table. */
const FACET_EDGE_TYPES = {
  used_skill: { relation: "shared_skill", facet: "skills" },
  involved_person: { relation: "shared_person", facet: "people" },
  at_org: { relation: "shared_org", facet: "orgs" },
} as const satisfies Record<
  string,
  { relation: FacetGroup["relation"]; facet: keyof RawGraphRows }
>;

/**
 * Parses a jsonb value against a schema, falling back to `undefined` rather than
 * throwing. Stored jsonb predates (and can outlive) any given contract version,
 * and a single odd `timeframe` should never blank someone's whole canvas.
 *
 * @param schema - Contract to try.
 * @param value - Raw jsonb value from Postgres.
 * @returns The parsed value, or `undefined` when it doesn't conform.
 */
function looseParse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
  value: unknown,
): T | undefined {
  if (value === null || value === undefined) return undefined;
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

/**
 * Converts one endeavor row into a canvas node, attaching its flattened facet
 * names.
 *
 * @param row - The endeavor row.
 * @param facets - Display names of skills/people/orgs linked to this endeavor.
 * @returns A validated `GraphNode`, or `null` when the row's `kind`/`status` is
 *   outside the current contract (skip rather than fail the whole snapshot).
 */
function toGraphNode(
  row: EndeavorRow,
  facets: { skills: string[]; people: string[]; orgs: string[] },
): GraphNode | null {
  const kind = EndeavorKind.safeParse(row.kind);
  if (!kind.success) return null;

  const status = EntityStatus.safeParse(row.status);
  if (!status.success) return null;

  const parsed = GraphNode.safeParse({
    id: row.id,
    kind: kind.data,
    title: row.title,
    summary: row.summary ?? undefined,
    timeframe: looseParse(Timeframe, row.timeframe),
    status: status.data,
    applicationTags:
      looseParse(ApplicationTag.array(), row.application_tags) ?? [],
    primaryParentId: row.primary_parent_id,
    facets: {
      skills: [...facets.skills].sort(),
      people: [...facets.people].sort(),
      orgs: [...facets.orgs].sort(),
    },
    state: "committed",
  });

  return parsed.success ? parsed.data : null;
}

/**
 * Projects stored rows into the canvas snapshot: Endeavors become nodes, stored
 * containment/relation edges and shared skills/people/orgs become links via the
 * shared derivation.
 *
 * @param rows - Endeavor, edge, and facet rows for one user (already RLS-scoped).
 * @param options - Hub cap and injectable timestamp.
 * @returns A validated `GraphSnapshot` with deterministic ordering, so an
 *   unchanged graph always projects byte-identically.
 * @throws {z.ZodError} If the assembled snapshot violates the shared contract,
 *   which would mean a projection bug rather than bad data.
 */
export function projectGraph(
  rows: RawGraphRows,
  options: ProjectGraphOptions = {},
): GraphSnapshot {
  const endeavorIds = new Set(rows.endeavors.map((e) => e.id));

  const facetNames = new Map<string, string>();
  for (const table of ["skills", "people", "orgs"] as const) {
    for (const row of rows[table])
      facetNames.set(`${table}:${row.id}`, row.name);
  }

  const nodeFacets = new Map<
    string,
    { skills: string[]; people: string[]; orgs: string[] }
  >();
  for (const id of endeavorIds) {
    nodeFacets.set(id, { skills: [], people: [], orgs: [] });
  }

  // facetKey ("skills:<id>") → endeavors sharing it, for the derived-link pass.
  const facetMembers = new Map<
    string,
    { relation: FacetGroup["relation"]; endeavorIds: Set<string> }
  >();

  for (const edge of rows.edges) {
    const facetEdge =
      FACET_EDGE_TYPES[edge.type as keyof typeof FACET_EDGE_TYPES];
    if (!facetEdge) continue;
    if (edge.from_type !== "endeavor" || !endeavorIds.has(edge.from_id))
      continue;

    const facetKey = `${facetEdge.facet}:${edge.to_id}`;
    const name = facetNames.get(facetKey);
    if (!name) continue;

    nodeFacets.get(edge.from_id)?.[facetEdge.facet].push(name);

    const group = facetMembers.get(facetKey) ?? {
      relation: facetEdge.relation,
      endeavorIds: new Set<string>(),
    };
    group.endeavorIds.add(edge.from_id);
    facetMembers.set(facetKey, group);
  }

  const nodes = rows.endeavors
    .map((row) =>
      toGraphNode(
        row,
        nodeFacets.get(row.id) ?? { skills: [], people: [], orgs: [] },
      ),
    )
    .filter((node): node is GraphNode => node !== null)
    .sort((a, b) => a.id.localeCompare(b.id));

  const structural: StructuralLink[] = [];
  for (const edge of rows.edges) {
    if (edge.type !== "part_of" && edge.type !== "related_to") continue;
    if (edge.from_type !== "endeavor" || edge.to_type !== "endeavor") continue;
    structural.push({
      from: edge.from_id,
      to: edge.to_id,
      relation: edge.type,
    });
  }

  // A soft primary parent is structure even without a materialized part_of edge.
  for (const row of rows.endeavors) {
    if (row.primary_parent_id) {
      structural.push({
        from: row.id,
        to: row.primary_parent_id,
        relation: "part_of",
      });
    }
  }

  const facetGroups: FacetGroup[] = [...facetMembers].map(([key, group]) => ({
    key,
    relation: group.relation,
    memberIds: [...group.endeavorIds],
  }));

  const links = deriveEndeavorLinks(
    { nodeIds: nodes.map((node) => node.id), structural, facetGroups },
    {
      maxSharedFacetGroup: options.maxSharedFacetGroup,
      maxFacetLinksPerEndeavor: options.maxFacetLinksPerEndeavor,
    },
  );

  return GraphSnapshot.parse({
    nodes,
    links,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
  });
}
