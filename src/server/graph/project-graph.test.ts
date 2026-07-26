/**
 * @fileoverview Tests for the canvas projection. These lock the graph-shaping rules
 * that keep the plane legible: only endeavors become nodes, a shared facet radiates
 * from one hub rather than forming a clique, each endeavor carries a bounded number
 * of derived links, hub facets are dropped, the strongest relation wins per pair,
 * and identical input projects identically (so a refresh doesn't reshuffle).
 */

import { describe, expect, it } from "vitest";
import { projectGraph, type EdgeRow, type EndeavorRow } from "./project-graph";

/** Builds a valid UUID from a small integer, for readable fixtures. */
function id(n: number): string {
  return `11111111-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

/**
 * Builds an endeavor row with sane defaults.
 *
 * @param n - Index used for the row's id.
 * @param overrides - Fields to override.
 * @returns An endeavor row.
 */
function endeavor(
  n: number,
  overrides: Partial<EndeavorRow> = {},
): EndeavorRow {
  return {
    id: id(n),
    kind: "project",
    title: `Endeavor ${n}`,
    summary: null,
    timeframe: null,
    status: "active",
    application_tags: [],
    primary_parent_id: null,
    ...overrides,
  };
}

/**
 * Builds an edge row.
 *
 * @param type - Edge type.
 * @param from - Source endeavor index.
 * @param to - Target id (endeavor index or facet id string).
 * @param toType - Endpoint entity type.
 * @returns An edge row.
 */
function edge(
  type: string,
  from: number,
  to: string,
  toType = "endeavor",
): EdgeRow {
  return {
    id: `${type}-${from}-${to}`,
    type,
    from_type: "endeavor",
    from_id: id(from),
    to_type: toType,
    to_id: to,
  };
}

const FIXED_TIME = "2026-07-25T00:00:00.000Z";

/**
 * Wraps rows with empty facet tables.
 *
 * @param endeavors - Endeavor rows.
 * @param edges - Edge rows.
 * @param facets - Facet tables to include.
 * @returns Arguments for `projectGraph`.
 */
function rows(
  endeavors: EndeavorRow[],
  edges: EdgeRow[] = [],
  facets: Partial<{
    skills: { id: string; name: string }[];
    people: { id: string; name: string }[];
    orgs: { id: string; name: string }[];
  }> = {},
) {
  return {
    endeavors,
    edges,
    skills: facets.skills ?? [],
    people: facets.people ?? [],
    orgs: facets.orgs ?? [],
  };
}

describe("projectGraph", () => {
  it("projects endeavors into nodes and ignores non-endeavor endpoints", () => {
    const skillId = id(90);
    const snapshot = projectGraph(
      rows([endeavor(1)], [edge("used_skill", 1, skillId, "skill")], {
        skills: [{ id: skillId, name: "Redis" }],
      }),
      { generatedAt: FIXED_TIME },
    );

    expect(snapshot.nodes).toHaveLength(1);
    expect(snapshot.nodes[0]?.facets.skills).toEqual(["Redis"]);
    // The skill is data on the node, never a node of its own.
    expect(snapshot.links).toHaveLength(0);
  });

  it("links a primary parent even without a materialized part_of edge", () => {
    const snapshot = projectGraph(
      rows([endeavor(1), endeavor(2, { primary_parent_id: id(1) })]),
      { generatedAt: FIXED_TIME },
    );

    expect(snapshot.links).toHaveLength(1);
    expect(snapshot.links[0]).toMatchObject({
      relation: "part_of",
      source: id(1),
      target: id(2),
      weight: 1,
    });
  });

  it("radiates a shared facet from one hub instead of building a clique", () => {
    const skillId = id(91);
    const snapshot = projectGraph(
      rows(
        [endeavor(1), endeavor(2), endeavor(3), endeavor(4)],
        [1, 2, 3, 4].map((n) => edge("used_skill", n, skillId, "skill")),
        { skills: [{ id: skillId, name: "Go" }] },
      ),
      { generatedAt: FIXED_TIME },
    );

    // A clique across four endeavors would be six links. This is a star, and the
    // per-endeavor budget stops even the hub from wiring the whole group.
    expect(snapshot.links).toHaveLength(2);
    expect(
      snapshot.links.every((link) => link.relation === "shared_skill"),
    ).toBe(true);

    // Every link shares an endpoint — that is what makes them uncrossable.
    const endpoints = snapshot.links.flatMap((link) => [
      link.source,
      link.target,
    ]);
    const hub = endpoints.find(
      (candidate) =>
        endpoints.filter((other) => other === candidate).length > 1,
    );
    expect(hub).toBeDefined();
  });

  it("caps how many derived facet links one endeavor can carry", () => {
    const skills = [94, 95, 96, 97].map((n) => id(n));
    const snapshot = projectGraph(
      rows(
        [1, 2, 3, 4, 5].map((n) => endeavor(n)),
        skills.flatMap((skillId, index) =>
          // Endeavor 1 shares a different skill with each of the others.
          [1, index + 2].map((n) => edge("used_skill", n, skillId, "skill")),
        ),
        {
          skills: skills.map((skillId, i) => ({
            id: skillId,
            name: `Skill ${i}`,
          })),
        },
      ),
      { generatedAt: FIXED_TIME, maxFacetLinksPerEndeavor: 2 },
    );

    const degree = snapshot.links.filter(
      (link) => link.source === id(1) || link.target === id(1),
    );
    expect(degree).toHaveLength(2);
  });

  it("drops hub facets shared by more endeavors than the cap", () => {
    const skillId = id(92);
    const snapshot = projectGraph(
      rows(
        [1, 2, 3, 4].map((n) => endeavor(n)),
        [1, 2, 3, 4].map((n) => edge("used_skill", n, skillId, "skill")),
        { skills: [{ id: skillId, name: "Python" }] },
      ),
      { generatedAt: FIXED_TIME, maxSharedFacetGroup: 3 },
    );

    expect(snapshot.links).toHaveLength(0);
    // The facet is still attached to every node, it just doesn't draw edges.
    expect(
      snapshot.nodes.every((node) => node.facets.skills.includes("Python")),
    ).toBe(true);
  });

  it("keeps the strongest relation for a pair and never stacks duplicates", () => {
    const skillId = id(93);
    const snapshot = projectGraph(
      rows(
        [endeavor(1), endeavor(2)],
        [
          edge("part_of", 1, id(2)),
          edge("used_skill", 1, skillId, "skill"),
          edge("used_skill", 2, skillId, "skill"),
        ],
        { skills: [{ id: skillId, name: "Redis" }] },
      ),
      { generatedAt: FIXED_TIME },
    );

    expect(snapshot.links).toHaveLength(1);
    expect(snapshot.links[0]?.relation).toBe("part_of");
  });

  it("skips self-links and links to endeavors outside the visible set", () => {
    const snapshot = projectGraph(
      rows(
        [endeavor(1)],
        [edge("related_to", 1, id(1)), edge("part_of", 1, id(77))],
      ),
      { generatedAt: FIXED_TIME },
    );

    expect(snapshot.links).toEqual([]);
  });

  it("skips rows whose kind is outside the contract rather than failing the graph", () => {
    const snapshot = projectGraph(
      rows([endeavor(1), endeavor(2, { kind: "not_a_kind" })]),
      { generatedAt: FIXED_TIME },
    );

    expect(snapshot.nodes.map((node) => node.id)).toEqual([id(1)]);
  });

  it("tolerates malformed jsonb instead of blanking the canvas", () => {
    const snapshot = projectGraph(
      rows([
        endeavor(1, {
          timeframe: { start: "not-a-year" },
          application_tags: "nonsense",
        }),
      ]),
      { generatedAt: FIXED_TIME },
    );

    expect(snapshot.nodes[0]?.timeframe).toBeUndefined();
    expect(snapshot.nodes[0]?.applicationTags).toEqual([]);
  });

  it("is deterministic: the same rows project identically", () => {
    const input = rows(
      [endeavor(3), endeavor(1), endeavor(2, { primary_parent_id: id(1) })],
      [edge("related_to", 3, id(1))],
    );

    const first = projectGraph(input, { generatedAt: FIXED_TIME });
    const second = projectGraph(input, { generatedAt: FIXED_TIME });

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.nodes.map((n) => n.id)).toEqual([id(1), id(2), id(3)]);
  });
});
