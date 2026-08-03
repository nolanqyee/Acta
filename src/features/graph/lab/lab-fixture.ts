/**
 * @fileoverview A synthetic graph of arbitrary size, for judging the canvas at scales
 * the hand-authored sample can't reach.
 *
 * "The graph should read as a circle" is not a meaningful test on nineteen nodes —
 * shape only becomes visible once there are enough bodies for a silhouette. This
 * generator produces graphs of any size with the same *structure* real data has (roles
 * that contain projects, plus shared-facet links between them) so tuning against it
 * transfers.
 *
 * Deterministic for a given size, so two screenshots of "the 120-node graph" are
 * comparable.
 */

import type { EndeavorKind, GraphNode, GraphSnapshot } from "@/lib/contracts";
import {
  deriveEndeavorLinks,
  type FacetGroup,
  type StructuralLink,
} from "@/lib/graph/derive-endeavor-links";

/** Kinds used for generated children, cycled for variety. */
const CHILD_KINDS: EndeavorKind[] = [
  "project",
  "project",
  "course",
  "creative_work",
  "event",
];

/** Skill pool; overlaps between groups become the cross-cluster links. */
const SKILLS = [
  "TypeScript",
  "Postgres",
  "React",
  "Rust",
  "Python",
  "Design",
  "Writing",
  "Statistics",
  "Distributed systems",
  "Teaching",
  "Photography",
  "Guitar",
];

/**
 * A tiny deterministic pseudo-random generator (mulberry32), so a given size always
 * produces the same graph without pulling in a dependency.
 *
 * @param seed - Any integer.
 * @returns A function returning successive values in [0, 1).
 */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a UUID-shaped id so generated nodes satisfy the `GraphSnapshot` contract.
 *
 * @param index - Distinct integer per node.
 * @returns A v4-shaped UUID string.
 */
function labId(index: number): string {
  return `1ab00000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

/**
 * Generates a structurally realistic graph of roughly the requested size.
 *
 * @param size - Target node count (clamped to 4–600).
 * @returns A contract-valid snapshot whose links come from the same derivation rule
 *   the server projection uses.
 */
export function buildLabFixture(size: number): GraphSnapshot {
  const total = Math.max(4, Math.min(600, Math.floor(size)));
  const rng = random(total * 7919);

  const nodes: GraphNode[] = [];
  const structural: StructuralLink[] = [];
  const skillsByNode = new Map<string, string[]>();

  let index = 0;
  while (nodes.length < total) {
    const rootId = labId(index++);
    const groupSize = Math.min(total - nodes.length, 2 + Math.floor(rng() * 6));

    nodes.push({
      id: rootId,
      kind: "role",
      title: `Role ${nodes.length + 1}`,
      summary: "Generated fixture node.",
      status: "active",
      applicationTags: [],
      primaryParentId: null,
      facets: { skills: [], people: [], orgs: [] },
      state: "committed",
    });
    skillsByNode.set(rootId, pickSkills(rng, 3));

    for (let child = 1; child < groupSize; child++) {
      const childId = labId(index++);
      nodes.push({
        id: childId,
        kind: CHILD_KINDS[child % CHILD_KINDS.length]!,
        title: `${CHILD_KINDS[child % CHILD_KINDS.length]} ${nodes.length + 1}`,
        summary: "Generated fixture node.",
        status: "active",
        applicationTags: [],
        primaryParentId: rootId,
        facets: { skills: [], people: [], orgs: [] },
        state: "committed",
      });
      structural.push({ from: childId, to: rootId, relation: "part_of" });
      skillsByNode.set(childId, pickSkills(rng, 2));
    }
  }

  const facetGroups: FacetGroup[] = SKILLS.map((skill) => ({
    key: `skills:${skill}`,
    relation: "shared_skill" as const,
    memberIds: [...skillsByNode.entries()]
      .filter(([, skills]) => skills.includes(skill))
      .map(([id]) => id),
  })).filter((group) => group.memberIds.length >= 2);

  const links = deriveEndeavorLinks({
    nodeIds: nodes.map((node) => node.id),
    structural,
    facetGroups,
  });

  return {
    nodes: nodes.map((node) => ({
      ...node,
      facets: { ...node.facets, skills: skillsByNode.get(node.id) ?? [] },
    })),
    links,
    generatedAt: new Date(0).toISOString(),
  };
}

/**
 * Picks a few distinct skills.
 *
 * @param rng - Seeded generator.
 * @param count - How many skills to pick.
 * @returns Distinct skill names.
 */
function pickSkills(rng: () => number, count: number): string[] {
  const picked = new Set<string>();
  while (picked.size < count)
    picked.add(SKILLS[Math.floor(rng() * SKILLS.length)]!);
  return [...picked];
}
