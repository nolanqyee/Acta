/**
 * @fileoverview A sample graph for dogfooding canvas layout before Extract lands
 * (U-J U3 explicitly allows seeding fixture endeavors for layout work). It is
 * client-side only and never written to the database, so the real empty state
 * stays honest: a new user still sees a quiet canvas plus the Capture CTA, and can
 * opt into this preview to judge physics, labels, and crossings on a *filled*
 * graph — the density docs/mockup-synthesis.md asks mocks to show.
 *
 * Only the endeavors and their facets are authored here. Links come from the same
 * `deriveEndeavorLinks` rule the server projection uses, so the fixture keeps
 * predicting what real users see: retuning crossing behaviour changes both at once,
 * and a hand-drawn bridge can't flatter the layout.
 */

import {
  GraphSnapshot,
  type EndeavorKind,
  type GraphNode,
  type Timeframe,
} from "@/lib/contracts";
import {
  deriveEndeavorLinks,
  type DeriveLinksOptions,
  type FacetGroup,
  type StructuralLink,
} from "@/lib/graph/derive-endeavor-links";

/**
 * Builds a stable, contract-valid UUID for sample data so seeded positions (and
 * therefore the layout) are identical on every load.
 *
 * @param index - Distinct small integer per sample node.
 * @returns A v4-shaped UUID string.
 */
function sampleId(index: number): string {
  return `5a1e0000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

/** Terse spec for one sample endeavor, expanded into a `GraphNode` below. */
interface SampleSpec {
  index: number;
  kind: EndeavorKind;
  title: string;
  summary: string;
  timeframe?: Timeframe;
  parent?: number;
  skills?: string[];
  people?: string[];
  orgs?: string[];
}

const SAMPLE_SPECS: SampleSpec[] = [
  {
    index: 1,
    kind: "role",
    title: "SWE Intern, Bubble",
    summary:
      "Backend internship on the billing and growth pods; owned two services end to end.",
    timeframe: {
      start: { year: 2025, month: 6 },
      end: { year: 2025, month: 9 },
    },
    skills: ["TypeScript", "Postgres", "Redis"],
    people: ["Amir Haddad", "Priya Raman"],
    orgs: ["Bubble"],
  },
  {
    index: 2,
    kind: "project",
    title: "Redis caching layer",
    summary:
      "Cut p95 latency ~60% on the billing read path; debugged a lock-scoping race under load.",
    timeframe: {
      start: { year: 2025, month: 7 },
      end: { year: 2025, month: 8 },
    },
    parent: 1,
    skills: ["Redis", "Postgres", "Go"],
    people: ["Amir Haddad"],
    orgs: ["Bubble"],
  },
  {
    index: 3,
    kind: "project",
    title: "Billing webhook refactor",
    summary:
      "Replaced retry-on-timer with idempotent handlers; removed a class of duplicate charges.",
    timeframe: { start: { year: 2025, month: 8 } },
    parent: 1,
    skills: ["TypeScript", "Postgres"],
    people: ["Priya Raman"],
    orgs: ["Bubble"],
  },
  {
    index: 4,
    kind: "project",
    title: "Onboarding funnel experiment",
    summary: "Shipped an A/B test on first-run activation; wrote the readout.",
    timeframe: {
      start: { year: 2025, month: 8 },
      end: { year: 2025, month: 9 },
    },
    parent: 1,
    skills: ["TypeScript", "React", "Figma"],
    orgs: ["Bubble"],
  },
  {
    index: 5,
    kind: "education",
    title: "BS Computer Science, Northwestern",
    summary: "Systems-leaning coursework with an HCI minor thread.",
    timeframe: { start: { year: 2023, month: 9 }, end: "ongoing" },
    skills: ["Python", "C++"],
    orgs: ["Northwestern University"],
  },
  {
    index: 6,
    kind: "course",
    title: "Distributed Systems",
    summary:
      "Built a Raft-backed key-value store; wrote the partition-tolerance report.",
    timeframe: {
      start: { year: 2025, month: 1 },
      end: { year: 2025, month: 3 },
    },
    parent: 5,
    skills: ["Go", "Docker"],
    orgs: ["Northwestern University"],
  },
  {
    index: 7,
    kind: "course",
    title: "Database Systems",
    summary: "Implemented a query planner for a teaching database engine.",
    timeframe: {
      start: { year: 2024, month: 9 },
      end: { year: 2024, month: 12 },
    },
    parent: 5,
    skills: ["Postgres", "C++"],
    orgs: ["Northwestern University"],
  },
  {
    index: 8,
    kind: "course",
    title: "Human–Computer Interaction",
    summary: "Ran a five-person usability study on a campus scheduling tool.",
    timeframe: {
      start: { year: 2025, month: 3 },
      end: { year: 2025, month: 6 },
    },
    parent: 5,
    skills: ["Figma", "Public speaking"],
    orgs: ["Northwestern University"],
  },
  {
    index: 9,
    kind: "leadership",
    title: "President, Robotics Club",
    summary:
      "Led a 24-person club: budget, competition entry, and a first-year mentoring track.",
    timeframe: { start: { year: 2024, month: 9 }, end: "ongoing" },
    skills: ["Public speaking", "C++"],
    people: ["Sam Ortiz"],
    orgs: ["Northwestern Robotics"],
  },
  {
    index: 10,
    kind: "project",
    title: "Autonomous rover",
    summary:
      "Navigation stack for the regional competition entry; placed third.",
    timeframe: {
      start: { year: 2025, month: 1 },
      end: { year: 2025, month: 5 },
    },
    parent: 9,
    skills: ["ROS", "C++", "Python"],
    people: ["Sam Ortiz"],
    orgs: ["Northwestern Robotics"],
  },
  {
    index: 11,
    kind: "event",
    title: "Middle-school robotics workshop",
    summary: "Designed and taught a two-day intro build for 30 students.",
    timeframe: { start: { year: 2025, month: 4 } },
    parent: 9,
    skills: ["Public speaking"],
    orgs: ["Northwestern Robotics"],
  },
  {
    index: 12,
    kind: "role",
    title: "Research Assistant, Ardent Lab",
    summary:
      "Graph-representation work under Dr. Okafor; two internal write-ups.",
    timeframe: { start: { year: 2024, month: 9 }, end: "ongoing" },
    skills: ["Python", "Postgres"],
    people: ["Dr. Lin Okafor"],
    orgs: ["Ardent Lab"],
  },
  {
    index: 13,
    kind: "project",
    title: "Graph embedding study",
    summary:
      "Compared node2vec variants on a citation set; owned the eval harness.",
    timeframe: { start: { year: 2025, month: 2 } },
    parent: 12,
    skills: ["Python", "Docker"],
    people: ["Dr. Lin Okafor"],
    orgs: ["Ardent Lab"],
  },
  {
    index: 14,
    kind: "event",
    title: "HackNU 2025",
    summary: "36-hour hackathon; team of four, transit-data track.",
    timeframe: { start: { year: 2025, month: 2 } },
    skills: ["React", "TypeScript"],
    orgs: ["HackNU"],
  },
  {
    index: 15,
    kind: "project",
    title: "Trailmap",
    summary:
      "Offline-first trail tracker built at HackNU; won the transit-data prize.",
    timeframe: { start: { year: 2025, month: 2 } },
    parent: 14,
    skills: ["React", "TypeScript", "Figma"],
    orgs: ["HackNU"],
  },
  {
    index: 16,
    kind: "volunteer",
    title: "Habitat build weekends",
    summary:
      "Framing and finish crew across six builds; ran the tool check-out.",
    timeframe: { start: { year: 2023, month: 10 }, end: "ongoing" },
    people: ["Sam Ortiz"],
    orgs: ["Habitat for Humanity"],
  },
  {
    index: 17,
    kind: "hobby",
    title: "Analog photography",
    summary:
      "Shooting and developing black-and-white 35mm; built a closet darkroom.",
    timeframe: { start: { year: 2022, month: 5 }, end: "ongoing" },
    skills: ["Darkroom"],
  },
  {
    index: 18,
    kind: "creative_work",
    title: "Static (zine, issue 3)",
    summary: "Self-published photo zine; laid out and printed a run of 80.",
    timeframe: { start: { year: 2025, month: 3 } },
    skills: ["Darkroom", "Figma"],
  },
  {
    index: 19,
    kind: "hobby",
    title: "Jazz quartet, rhythm guitar",
    summary: "Weekly rehearsals and two campus sets a term.",
    timeframe: { start: { year: 2023, month: 11 }, end: "ongoing" },
    skills: ["Public speaking"],
    people: ["Priya Raman"],
  },
];

/**
 * Expands a sample spec into a canvas node.
 *
 * @param spec - The terse sample definition.
 * @returns A committed `GraphNode` with sorted facet names.
 */
function toNode(spec: SampleSpec): GraphNode {
  return {
    id: sampleId(spec.index),
    kind: spec.kind,
    title: spec.title,
    summary: spec.summary,
    timeframe: spec.timeframe,
    status: "active",
    applicationTags: [],
    primaryParentId: spec.parent ? sampleId(spec.parent) : null,
    facets: {
      skills: [...(spec.skills ?? [])].sort(),
      people: [...(spec.people ?? [])].sort(),
      orgs: [...(spec.orgs ?? [])].sort(),
    },
    state: "committed",
  };
}

/** Facet kind → the derived relation a shared value of it produces. */
const FACET_RELATIONS = {
  skills: "shared_skill",
  people: "shared_person",
  orgs: "shared_org",
} as const satisfies Record<string, FacetGroup["relation"]>;

/**
 * Collects the sample specs into facet groups — every distinct skill, person, and
 * org value with the endeavors that share it — exactly the shape the server hands
 * the derivation after reading `used_skill` / `involved_person` / `at_org` edges.
 *
 * @returns One group per facet value, in stable key order.
 */
function sampleFacetGroups(): FacetGroup[] {
  const groups = new Map<string, FacetGroup>();

  for (const spec of SAMPLE_SPECS) {
    for (const facet of ["skills", "people", "orgs"] as const) {
      for (const value of spec[facet] ?? []) {
        const key = `${facet}:${value}`;
        const group = groups.get(key);
        if (group) group.memberIds.push(sampleId(spec.index));
        else {
          groups.set(key, {
            key,
            relation: FACET_RELATIONS[facet],
            memberIds: [sampleId(spec.index)],
          });
        }
      }
    }
  }

  return [...groups.values()];
}

/**
 * Builds the sample snapshot: authored endeavors plus links derived by the shared
 * rule (containment from `parent`, stars from shared facets).
 *
 * @param options - Derivation overrides. The canvas never passes these; they exist
 *   so layout work can measure how link density changes the settled layout.
 * @returns A validated `GraphSnapshot` safe to hand straight to the canvas.
 * @throws {z.ZodError} If the fixtures ever drift from the shared contract —
 *   which is the point: the sample graph is also a contract smoke test.
 */
export function buildSampleGraph(
  options: DeriveLinksOptions = {},
): GraphSnapshot {
  const nodes = SAMPLE_SPECS.map(toNode);

  const structural: StructuralLink[] = SAMPLE_SPECS.filter(
    (spec) => spec.parent !== undefined,
  ).map((spec) => ({
    from: sampleId(spec.index),
    to: sampleId(spec.parent!),
    relation: "part_of",
  }));

  const links = deriveEndeavorLinks(
    {
      nodeIds: nodes.map((node) => node.id),
      structural,
      facetGroups: sampleFacetGroups(),
    },
    options,
  );

  return GraphSnapshot.parse({
    nodes,
    links,
    generatedAt: new Date().toISOString(),
  });
}
