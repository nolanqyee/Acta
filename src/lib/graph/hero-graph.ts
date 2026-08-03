/**
 * @fileoverview Marketing hero graph fixture — generic endeavors and derived links
 * for the landing page background. Client-only; never written to the database.
 * Uses the same link derivation as the live graph so the hero reads like Acta, not
 * a hand-placed SVG constellation.
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

/** Stable id for hero fixture nodes (distinct from the dogfood sample graph). */
function heroId(index: number): string {
  return `6a1e0000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

/** Terse spec for one generic hero endeavor. */
interface HeroSpec {
  index: number;
  kind: EndeavorKind;
  title: string;
  summary?: string;
  timeframe?: Timeframe;
  parent?: number;
  skills?: string[];
  people?: string[];
  orgs?: string[];
}

/** Generic endeavors — no real names, companies, or product-specific titles. */
const HERO_SPECS: HeroSpec[] = [
  {
    index: 0,
    kind: "education",
    title: "B.A. Design",
    summary: "Studio coursework with a research minor.",
    timeframe: { start: { year: 2021, month: 9 }, end: { year: 2025, month: 5 } },
  },
  {
    index: 1,
    kind: "project",
    title: "Capstone build",
    summary: "Two-term team project with a public demo.",
    parent: 0,
    timeframe: { start: { year: 2024, month: 9 }, end: { year: 2025, month: 4 } },
    skills: ["React", "TypeScript", "Figma"],
  },
  {
    index: 2,
    kind: "course",
    title: "Interface design",
    summary: "Weekly critiques and a final prototype.",
    parent: 0,
    timeframe: { start: { year: 2024, month: 1 }, end: { year: 2024, month: 5 } },
    skills: ["Figma", "Research"],
  },
  {
    index: 3,
    kind: "course",
    title: "Data visualization",
    summary: "Charts, maps, and a term project.",
    parent: 0,
    timeframe: { start: { year: 2023, month: 9 }, end: { year: 2024, month: 1 } },
    skills: ["TypeScript", "Research"],
  },
  {
    index: 4,
    kind: "role",
    title: "Design internship",
    summary: "Summer product design on a small team.",
    timeframe: { start: { year: 2024, month: 6 }, end: { year: 2024, month: 8 } },
    skills: ["Figma", "Research"],
    orgs: ["Northwind Studio"],
  },
  {
    index: 5,
    kind: "project",
    title: "Research dashboard",
    summary: "Internal tool for study coordinators.",
    parent: 2,
    timeframe: { start: { year: 2024, month: 3 } },
    skills: ["React", "TypeScript"],
    orgs: ["Northwind Studio"],
  },
  {
    index: 6,
    kind: "event",
    title: "Design sprint weekend",
    summary: "Forty-eight hour build with three teammates.",
    timeframe: { start: { year: 2025, month: 2 } },
    skills: ["React", "Figma"],
    orgs: ["Campus makerspace"],
  },
  {
    index: 7,
    kind: "project",
    title: "Wayfinding prototype",
    summary: "Paper and digital flows for a campus map.",
    parent: 6,
    timeframe: { start: { year: 2025, month: 2 } },
    skills: ["Figma", "Research"],
  },
  {
    index: 8,
    kind: "volunteer",
    title: "Peer tutoring",
    summary: "Weekly sessions for first-year design students.",
    timeframe: { start: { year: 2023, month: 10 }, end: "ongoing" },
    people: ["Jordan Lee"],
    orgs: ["Design department"],
  },
  {
    index: 9,
    kind: "creative_work",
    title: "Process zine, issue 2",
    summary: "Printed a short run for a studio show.",
    timeframe: { start: { year: 2024, month: 11 } },
    skills: ["Figma"],
  },
  {
    index: 10,
    kind: "role",
    title: "Teaching assistant",
    summary: "Graded prototypes and ran lab sections.",
    parent: 2,
    timeframe: { start: { year: 2024, month: 9 }, end: { year: 2025, month: 5 } },
    orgs: ["Design department"],
  },
  {
    index: 11,
    kind: "project",
    title: "Open source docs pass",
    summary: "Rewrote onboarding for a charting library.",
    timeframe: { start: { year: 2023, month: 7 } },
    skills: ["TypeScript"],
  },
  {
    index: 12,
    kind: "event",
    title: "Conference talk",
    summary: "Lightning talk on research ops for students.",
    timeframe: { start: { year: 2024, month: 10 } },
    skills: ["Research", "Public speaking"],
  },
  {
    index: 13,
    kind: "project",
    title: "Survey tooling",
    summary: "Scripted exports for a lab study.",
    parent: 3,
    timeframe: { start: { year: 2023, month: 11 } },
    skills: ["TypeScript", "Research"],
    people: ["Jordan Lee"],
  },
  {
    index: 14,
    kind: "role",
    title: "Freelance brand work",
    summary: "Identity and deck templates for a nonprofit.",
    timeframe: { start: { year: 2023, month: 3 }, end: { year: 2023, month: 8 } },
    skills: ["Figma"],
    orgs: ["River nonprofit"],
  },
  {
    index: 15,
    kind: "project",
    title: "Portfolio site",
    summary: "Case studies with process notes.",
    timeframe: { start: { year: 2022, month: 12 }, end: "ongoing" },
    skills: ["React", "Figma"],
  },
  {
    index: 16,
    kind: "course",
    title: "Design systems",
    summary: "Tokens, components, and documentation.",
    parent: 0,
    timeframe: { start: { year: 2025, month: 1 }, end: { year: 2025, month: 5 } },
    skills: ["Figma", "TypeScript"],
  },
  {
    index: 17,
    kind: "project",
    title: "Component audit",
    summary: "Mapped drift across three product surfaces.",
    parent: 16,
    timeframe: { start: { year: 2025, month: 3 } },
    skills: ["Figma", "Research"],
    orgs: ["Northwind Studio"],
  },
  {
    index: 18,
    kind: "volunteer",
    title: "Mentor office hours",
    summary: "Monthly portfolio reviews for sophomores.",
    timeframe: { start: { year: 2024, month: 1 }, end: "ongoing" },
    people: ["Alex Kim"],
  },
  {
    index: 19,
    kind: "hobby",
    title: "Film photography",
    timeframe: { start: { year: 2022, month: 5 }, end: "ongoing" },
    skills: ["Darkroom"],
  },
  {
    index: 20,
    kind: "hobby",
    title: "Community choir",
    timeframe: { start: { year: 2023, month: 9 }, end: "ongoing" },
    people: ["Alex Kim"],
  },
  {
    index: 21,
    kind: "creative_work",
    title: "Poster series",
    summary: "Screen-printed run for a local gallery.",
    timeframe: { start: { year: 2024, month: 4 } },
    skills: ["Figma"],
  },
  {
    index: 22,
    kind: "event",
    title: "Studio showcase",
    summary: "End-of-term exhibition with live demos.",
    timeframe: { start: { year: 2024, month: 5 } },
    orgs: ["Design department"],
  },
  {
    index: 23,
    kind: "project",
    title: "Accessibility review",
    summary: "Heuristic pass on a registration flow.",
    parent: 4,
    timeframe: { start: { year: 2024, month: 7 } },
    skills: ["Research", "Figma"],
  },
  {
    index: 24,
    kind: "role",
    title: "Research assistant",
    summary: "Recruiting and session notes for a lab study.",
    timeframe: { start: { year: 2023, month: 1 }, end: { year: 2023, month: 12 } },
    skills: ["Research"],
    people: ["Jordan Lee"],
    orgs: ["Design department"],
  },
  {
    index: 25,
    kind: "project",
    title: "Notebook templates",
    summary: "Shared Obsidian starter for the cohort.",
    parent: 8,
    timeframe: { start: { year: 2024, month: 8 } },
    skills: ["Research"],
  },
  {
    index: 26,
    kind: "event",
    title: "Workshop series",
    summary: "Three evenings on typography basics.",
    timeframe: { start: { year: 2023, month: 4 } },
    orgs: ["Campus makerspace"],
  },
  {
    index: 27,
    kind: "project",
    title: "Side app experiment",
    summary: "Evenings-only habit tracker, shelved after beta.",
    timeframe: { start: { year: 2022, month: 8 }, end: { year: 2023, month: 2 } },
    skills: ["React", "TypeScript"],
  },
  {
    index: 28,
    kind: "project",
    title: "Design tokens draft",
    summary: "Mapped colour and type for a student product team.",
    parent: 16,
    timeframe: { start: { year: 2025, month: 2 } },
    skills: ["Figma", "TypeScript"],
    orgs: ["Northwind Studio"],
  },
  {
    index: 29,
    kind: "course",
    title: "Human-computer interaction",
    summary: "Weekly labs and a diary study final.",
    parent: 0,
    timeframe: { start: { year: 2023, month: 1 }, end: { year: 2023, month: 5 } },
    skills: ["Research", "Figma"],
  },
  {
    index: 30,
    kind: "project",
    title: "Diary study kit",
    summary: "Templates and consent copy for a methods class.",
    parent: 29,
    timeframe: { start: { year: 2023, month: 4 } },
    skills: ["Research"],
    people: ["Jordan Lee"],
  },
  {
    index: 31,
    kind: "role",
    title: "Campus lab assistant",
    summary: "Set up sessions and maintained participant logs.",
    timeframe: { start: { year: 2022, month: 9 }, end: { year: 2023, month: 5 } },
    skills: ["Research"],
    orgs: ["Design department"],
    people: ["Alex Kim"],
  },
  {
    index: 32,
    kind: "project",
    title: "Prototype library",
    summary: "Shared Figma components for the cohort.",
    parent: 2,
    timeframe: { start: { year: 2024, month: 2 } },
    skills: ["Figma", "Research"],
    orgs: ["Design department"],
  },
  {
    index: 33,
    kind: "event",
    title: "Hack weekend",
    summary: "Built a map overlay in forty-eight hours.",
    timeframe: { start: { year: 2023, month: 10 } },
    skills: ["React", "TypeScript", "Figma"],
    orgs: ["Campus makerspace"],
    people: ["Alex Kim"],
  },
  {
    index: 34,
    kind: "project",
    title: "Transit overlay",
    summary: "Live route layer on a campus basemap.",
    parent: 33,
    timeframe: { start: { year: 2023, month: 10 } },
    skills: ["TypeScript", "Research"],
  },
  {
    index: 35,
    kind: "creative_work",
    title: "Type specimen",
    summary: "Printed one-sheet for a typography critique.",
    parent: 29,
    timeframe: { start: { year: 2023, month: 3 } },
    skills: ["Figma"],
  },
  {
    index: 36,
    kind: "volunteer",
    title: "Gallery install crew",
    summary: "Hung and labelled work for a senior show.",
    timeframe: { start: { year: 2024, month: 4 } },
    orgs: ["Campus makerspace"],
    people: ["Jordan Lee"],
  },
  {
    index: 37,
    kind: "project",
    title: "Onboarding audit",
    summary: "Heuristic review for a nonprofit signup flow.",
    parent: 14,
    timeframe: { start: { year: 2023, month: 6 } },
    skills: ["Research", "Figma"],
    orgs: ["River nonprofit"],
  },
  {
    index: 38,
    kind: "hobby",
    title: "Long-distance running",
    timeframe: { start: { year: 2021, month: 6 }, end: "ongoing" },
    skills: ["Public speaking"],
  },
  {
    index: 39,
    kind: "project",
    title: "Charting docs PR",
    summary: "Examples and API notes for a viz library.",
    parent: 11,
    timeframe: { start: { year: 2023, month: 8 } },
    skills: ["TypeScript"],
    people: ["Alex Kim"],
  },
  {
    index: 40,
    kind: "role",
    title: "Product design contract",
    summary: "Six-week sprint on settings and billing screens.",
    timeframe: { start: { year: 2025, month: 1 }, end: { year: 2025, month: 3 } },
    skills: ["Figma", "Research"],
    orgs: ["Northwind Studio"],
  },
  {
    index: 41,
    kind: "project",
    title: "Settings refresh",
    summary: "Reduced nested panels in account preferences.",
    parent: 40,
    timeframe: { start: { year: 2025, month: 2 } },
    skills: ["Figma", "TypeScript"],
    orgs: ["Northwind Studio"],
  },
];

/** Selected hero node — reads as the focal accent on the landing illustration. */
export const HERO_GRAPH_SELECTED_ID = heroId(1);

const FACET_RELATIONS = {
  skills: "shared_skill",
  people: "shared_person",
  orgs: "shared_org",
} as const satisfies Record<string, FacetGroup["relation"]>;

/**
 * Expands a hero spec into a contract-valid node.
 *
 * @param spec - One hero endeavor definition.
 * @returns A committed `GraphNode`.
 */
function toNode(spec: HeroSpec): GraphNode {
  return {
    id: heroId(spec.index),
    kind: spec.kind,
    title: spec.title,
    summary: spec.summary ?? "",
    timeframe: spec.timeframe,
    status: "active",
    applicationTags: [],
    primaryParentId: spec.parent !== undefined ? heroId(spec.parent) : null,
    facets: {
      skills: [...(spec.skills ?? [])].sort(),
      people: [...(spec.people ?? [])].sort(),
      orgs: [...(spec.orgs ?? [])].sort(),
    },
    state: "committed",
  };
}

/**
 * Collects hero specs into facet groups for link derivation.
 *
 * @returns Facet groups in stable key order.
 */
function heroFacetGroups(): FacetGroup[] {
  const groups = new Map<string, FacetGroup>();

  for (const spec of HERO_SPECS) {
    for (const facet of ["skills", "people", "orgs"] as const) {
      for (const value of spec[facet] ?? []) {
        const key = `${facet}:${value}`;
        const group = groups.get(key);
        if (group) group.memberIds.push(heroId(spec.index));
        else {
          groups.set(key, {
            key,
            relation: FACET_RELATIONS[facet],
            memberIds: [heroId(spec.index)],
          });
        }
      }
    }
  }

  return [...groups.values()];
}

/**
 * Builds the hero snapshot: generic endeavors plus derived links.
 *
 * @param options - Optional derivation overrides for layout experiments.
 * @returns Validated snapshot for the landing hero canvas.
 */
export function buildHeroGraph(
  options: DeriveLinksOptions = {},
): GraphSnapshot {
  const nodes = HERO_SPECS.map(toNode);

  const structural: StructuralLink[] = HERO_SPECS.filter(
    (spec) => spec.parent !== undefined,
  ).map((spec) => ({
    from: heroId(spec.index),
    to: heroId(spec.parent!),
    relation: "part_of",
  }));

  const links = deriveEndeavorLinks(
    {
      nodeIds: nodes.map((node) => node.id),
      structural,
      facetGroups: heroFacetGroups(),
    },
    options,
  );

  return GraphSnapshot.parse({
    nodes,
    links,
    generatedAt: new Date().toISOString(),
  });
}

/** Node and link counts for the hero fixture copy line. */
export function heroGraphStats(snapshot: GraphSnapshot): {
  nodes: number;
  links: number;
} {
  return { nodes: snapshot.nodes.length, links: snapshot.links.length };
}
