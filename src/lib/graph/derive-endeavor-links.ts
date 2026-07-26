/**
 * @fileoverview The one rule for turning endeavor structure + shared facets into the
 * links the canvas draws. Isomorphic and pure so the server projection and the
 * client sample graph derive links identically — tuning crossing behaviour in one
 * place has to change what every surface renders, or the fixture stops predicting
 * what users see.
 *
 * The two shaping rules exist to serve docs/graph-canvas.md ("minimize crossings
 * first, then render them gracefully"):
 *
 *  1. **A shared facet becomes a star, not a clique or a chain.** A clique of k
 *     endeavors is k(k−1)/2 edges — an instant crossing storm. A chain is only k−1
 *     edges but wires them in an arbitrary order, so the path snakes across the
 *     plane and each hop is a fresh crossing. A star is also k−1 edges, and because
 *     every edge shares the hub endpoint, no two of them can cross each other.
 *  2. **Hub facets are dropped.** A skill shared by more endeavors than the cap
 *     (say "Python" on everything) says nothing about structure and only adds noise.
 *
 * The hub is chosen structurally: an endeavor that already contains other members of
 * the group wins, so an org group collapses onto the role it belongs to and adds no
 * new edges at all.
 */

import {
  GRAPH_LINK_WEIGHT,
  type GraphLink,
  type GraphLinkRelation,
} from "@/lib/contracts";

/** A stored endeavor→endeavor edge (containment or loose association). */
export interface StructuralLink {
  from: string;
  to: string;
  relation: Extract<GraphLinkRelation, "part_of" | "related_to">;
}

/** A set of endeavors that share one facet value (one skill, person, or org). */
export interface FacetGroup {
  /** Stable identity of the facet, e.g. `skills:<id>`; used in link ids. */
  key: string;
  relation: Extract<
    GraphLinkRelation,
    "shared_skill" | "shared_person" | "shared_org"
  >;
  memberIds: string[];
}

/** Everything the derivation needs, already normalised by the caller. */
export interface DeriveLinksInput {
  /** Ids of endeavors that will actually be drawn. */
  nodeIds: Iterable<string>;
  structural: StructuralLink[];
  facetGroups: FacetGroup[];
}

/** Knobs on how aggressively facet links are drawn. */
export interface DeriveLinksOptions {
  /**
   * Largest shared-facet group that still produces links; bigger groups are
   * treated as hubs and skipped.
   */
  maxSharedFacetGroup?: number;
  /**
   * How many derived facet links a single endeavor may carry. Containment is never
   * capped — real structure always draws.
   */
  maxFacetLinksPerEndeavor?: number;
}

/**
 * Groups larger than this are noise rather than structure. Eight is small enough
 * that a common skill stops wiring the whole graph together, and large enough that
 * a genuine cluster (a role and its projects) survives intact.
 */
export const DEFAULT_MAX_SHARED_FACET_GROUP = 8;

/**
 * Derived facet links each endeavor may keep, hubs included.
 *
 * Every facet link is a bridge between two parts of the plane, and bridges are what
 * crossings are made of: uncapped, the sample graph settles with about five
 * crossings; at two it reaches zero. Two is enough cross-cluster texture to show
 * that a life's threads touch, and the *complete* facet story stays available where
 * it is actually readable — the node's facet list, the hover card, the filter menu.
 *
 * The consequence is deliberate: a big facet group draws its two strongest spokes
 * rather than a full star. Structure is never capped; only these derived hints are.
 */
export const DEFAULT_MAX_FACET_LINKS_PER_ENDEAVOR = 2;

/**
 * Orders a pair so the same two endeavors always produce the same link id, however
 * the underlying edge pointed.
 *
 * @param a - One endeavor id.
 * @param b - The other endeavor id.
 * @returns `[source, target]` in stable lexical order.
 */
function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Picks the endeavor a facet group should radiate from.
 *
 * Preference order, each a proxy for "most central to this group": it already
 * contains or associates with the most other members (so the star lands on top of
 * real structure and often adds no new edges at all), then it shares the most facets
 * overall, then lexical id so the choice is deterministic.
 *
 * @param members - Drawable member ids of this group.
 * @param structuralDegreeWithin - Structural links each member has inside the group.
 * @param facetGroupCount - How many facet groups each member belongs to.
 * @returns The hub id.
 */
function chooseHub(
  members: string[],
  structuralDegreeWithin: Map<string, number>,
  facetGroupCount: Map<string, number>,
): string {
  return [...members].sort((a, b) => {
    const byStructure =
      (structuralDegreeWithin.get(b) ?? 0) -
      (structuralDegreeWithin.get(a) ?? 0);
    if (byStructure !== 0) return byStructure;

    const byFacets =
      (facetGroupCount.get(b) ?? 0) - (facetGroupCount.get(a) ?? 0);
    if (byFacets !== 0) return byFacets;

    return a.localeCompare(b);
  })[0]!;
}

/**
 * Derives every link the canvas should draw between endeavors.
 *
 * @param input - Drawable node ids, stored structural edges, and facet groups.
 * @param options - Hub cap for facet groups.
 * @returns Links sorted by id, one per pair, carrying the strongest relation that
 *   connects that pair — so an unchanged graph derives identically every time.
 */
export function deriveEndeavorLinks(
  { nodeIds, structural, facetGroups }: DeriveLinksInput,
  options: DeriveLinksOptions = {},
): GraphLink[] {
  const maxGroup =
    options.maxSharedFacetGroup ?? DEFAULT_MAX_SHARED_FACET_GROUP;
  const maxFacetLinks =
    options.maxFacetLinksPerEndeavor ?? DEFAULT_MAX_FACET_LINKS_PER_ENDEAVOR;
  const drawable = new Set(nodeIds);
  const linksByPair = new Map<string, GraphLink>();

  /**
   * Records a link for a pair, keeping the higher-weight relation on collision.
   *
   * @param a - One endeavor id.
   * @param b - The other endeavor id.
   * @param relation - Why the two are connected.
   * @param idSuffix - Extra id qualifier (the facet key) for derived links.
   */
  function addLink(
    a: string,
    b: string,
    relation: GraphLinkRelation,
    idSuffix?: string,
  ): void {
    if (a === b) return;
    if (!drawable.has(a) || !drawable.has(b)) return;

    const [source, target] = orderPair(a, b);
    const pairKey = `${source}>${target}`;
    const weight = GRAPH_LINK_WEIGHT[relation];
    const existing = linksByPair.get(pairKey);
    if (existing && existing.weight >= weight) return;

    linksByPair.set(pairKey, {
      id: idSuffix
        ? `${relation}:${idSuffix}:${pairKey}`
        : `${relation}:${pairKey}`,
      source,
      target,
      relation,
      weight,
    });
  }

  for (const link of structural) addLink(link.from, link.to, link.relation);

  const structuralNeighbors = new Map<string, Set<string>>();

  /**
   * Records an undirected structural adjacency, used only to find group hubs.
   *
   * @param a - One endeavor id.
   * @param b - The other endeavor id.
   */
  function noteAdjacency(a: string, b: string): void {
    const existing = structuralNeighbors.get(a);
    if (existing) existing.add(b);
    else structuralNeighbors.set(a, new Set([b]));
  }

  for (const link of structural) {
    if (!drawable.has(link.from) || !drawable.has(link.to)) continue;
    noteAdjacency(link.from, link.to);
    noteAdjacency(link.to, link.from);
  }

  const drawableGroups = facetGroups
    .map((group) => ({
      ...group,
      memberIds: [...new Set(group.memberIds)]
        .filter((id) => drawable.has(id))
        .sort(),
    }))
    .filter(
      (group) =>
        group.memberIds.length >= 2 && group.memberIds.length <= maxGroup,
    )
    .sort((a, b) => a.key.localeCompare(b.key));

  const facetGroupCount = new Map<string, number>();
  for (const group of drawableGroups) {
    for (const member of group.memberIds) {
      facetGroupCount.set(member, (facetGroupCount.get(member) ?? 0) + 1);
    }
  }

  const candidates: {
    hub: string;
    member: string;
    relation: FacetGroup["relation"];
    key: string;
  }[] = [];

  for (const group of drawableGroups) {
    const members = new Set(group.memberIds);
    const structuralDegreeWithin = new Map<string, number>();
    for (const member of group.memberIds) {
      const neighbors = structuralNeighbors.get(member);
      const inside = neighbors
        ? [...neighbors].filter((id) => members.has(id)).length
        : 0;
      structuralDegreeWithin.set(member, inside);
    }

    const hub = chooseHub(
      group.memberIds,
      structuralDegreeWithin,
      facetGroupCount,
    );
    for (const member of group.memberIds) {
      if (member === hub) continue;
      candidates.push({
        hub,
        member,
        relation: group.relation,
        key: group.key,
      });
    }
  }

  // Strongest relations claim the per-endeavor budget first, so what survives the
  // cap is the most meaningful bridge rather than whichever facet sorted first.
  candidates.sort(
    (a, b) =>
      GRAPH_LINK_WEIGHT[b.relation] - GRAPH_LINK_WEIGHT[a.relation] ||
      a.key.localeCompare(b.key) ||
      a.member.localeCompare(b.member),
  );

  const facetDegree = new Map<string, number>();

  /**
   * Reads how many derived facet links an endeavor already carries.
   *
   * @param id - Endeavor id.
   * @returns Current derived-link count.
   */
  const usedBudget = (id: string): number => facetDegree.get(id) ?? 0;

  for (const candidate of candidates) {
    const [source, target] = orderPair(candidate.hub, candidate.member);
    const existing = linksByPair.get(`${source}>${target}`);
    // Already connected structurally: the star lands on real structure and the
    // facet link would be discarded anyway, so it shouldn't spend anyone's budget.
    if (existing) continue;

    // The budget binds the hub too. Spokes of one star can't cross each other, but
    // they cross everything else, so an unbounded hub is its own crossing storm
    // (measured: capping only the spoke side takes the sample graph from zero
    // crossings to seven, and the denser fixture to fifty-nine).
    if (
      usedBudget(candidate.hub) >= maxFacetLinks ||
      usedBudget(candidate.member) >= maxFacetLinks
    ) {
      continue;
    }

    addLink(candidate.hub, candidate.member, candidate.relation, candidate.key);
    facetDegree.set(candidate.hub, usedBudget(candidate.hub) + 1);
    facetDegree.set(candidate.member, usedBudget(candidate.member) + 1);
  }

  return [...linksByPair.values()].sort((a, b) => a.id.localeCompare(b.id));
}
