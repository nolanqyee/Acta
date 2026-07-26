/**
 * @fileoverview Starting positions for new nodes.
 *
 * Where a node starts decides which arrangement the simulation falls into — random
 * starts tangle and never fully untangle. Two cheap rules do most of the work:
 *
 *  1. Members of the same containment group start together, so a role and its
 *     projects settle as a visible group.
 *  2. Groups are placed on a spiral from the centre outward, which is already the
 *     round shape gravity wants (docs/graph-canvas.md R1) — so the first frame is
 *     close to the answer instead of collapsing inward from a ring.
 *
 * Deterministic: the same graph always seeds identically, so a refresh doesn't
 * reshuffle the user's mental map.
 */

import type { GraphSnapshot } from "@/lib/contracts";

/** A starting position in world units. */
export interface Seed {
  x: number;
  y: number;
}

/** Golden angle — spreads points evenly with no visible spokes or rings. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Follows `primaryParentId` to the top of a containment chain.
 *
 * @param id - Node to resolve.
 * @param parentOf - Child id → parent id (or null).
 * @returns The root ancestor's id; the node itself when it has no parent. Cycles are
 *   broken by a depth limit rather than trusted not to exist.
 */
function rootOf(id: string, parentOf: Map<string, string | null>): string {
  let current = id;
  for (let depth = 0; depth < 32; depth++) {
    const parent = parentOf.get(current);
    if (!parent || !parentOf.has(parent)) return current;
    current = parent;
  }
  return current;
}

/**
 * Computes a starting position for every node in the snapshot.
 *
 * @param snapshot - The graph to seed.
 * @param linkDistance - Current spring length; seeds scale with it so nodes start
 *   near their eventual spacing and barely have to travel.
 * @returns Node id → seed position.
 */
export function seedPositions(
  snapshot: GraphSnapshot,
  linkDistance: number,
): Map<string, Seed> {
  const seeds = new Map<string, Seed>();
  if (snapshot.nodes.length === 0) return seeds;

  const parentOf = new Map<string, string | null>(
    snapshot.nodes.map((node) => [node.id, node.primaryParentId ?? null]),
  );

  const groups = new Map<string, string[]>();
  for (const node of snapshot.nodes) {
    const key = rootOf(node.id, parentOf);
    const members = groups.get(key);
    if (members) members.push(node.id);
    else groups.set(key, [node.id]);
  }

  // Sorting by size puts big groups near the centre, which is where the crowding is
  // anyway; alphabetical within a size keeps it deterministic.
  const ordered = [...groups.entries()].sort(
    ([keyA, a], [keyB, b]) => b.length - a.length || keyA.localeCompare(keyB),
  );

  const spread = linkDistance * 1.9;
  ordered.forEach(([, members], groupIndex) => {
    const groupRadius = spread * Math.sqrt(groupIndex);
    const groupAngle = groupIndex * GOLDEN_ANGLE;
    const centerX = Math.cos(groupAngle) * groupRadius;
    const centerY = Math.sin(groupAngle) * groupRadius;

    members.forEach((id, memberIndex) => {
      if (members.length === 1) {
        seeds.set(id, { x: centerX, y: centerY });
        return;
      }
      const memberRadius =
        linkDistance *
        0.6 *
        Math.sqrt((memberIndex + 0.5) / members.length) *
        Math.sqrt(members.length);
      const memberAngle = memberIndex * GOLDEN_ANGLE + groupAngle;
      seeds.set(id, {
        x: centerX + Math.cos(memberAngle) * memberRadius,
        y: centerY + Math.sin(memberAngle) * memberRadius,
      });
    });
  });

  return seeds;
}
