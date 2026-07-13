import { randomUUID } from "crypto";
import { ExtractProposal, type ExtractProposal as ExtractProposalType } from "@/domain";

/**
 * Heuristic / fixture extract for local dogfood (no LLM key required).
 * Replace with LLM call that returns JSON validated by ExtractProposal.
 */
export function extractFromCaptureText(text: string): ExtractProposalType {
  const lower = text.toLowerCase();
  const proposal: ExtractProposalType = {
    endeavors: [],
    achievements: [],
    skills: [],
    people: [],
    orgs: [],
    metrics: [],
    evidence: [],
    edges: [],
  };

  const roleTemp = "e_role";
  const projectTemp = "e_project";

  if (
    lower.includes("intern") ||
    lower.includes("redis") ||
    lower.includes("cache") ||
    lower.includes("bubble")
  ) {
    proposal.orgs.push({
      tempId: "o_bubble",
      name: "Bubble",
      orgKind: "company",
    });
    proposal.endeavors.push({
      tempId: roleTemp,
      kind: "role",
      title: "SWE Intern, Bubble",
      summary: "Internship role inferred from capture",
      applicationTags: [
        { tag: "internship_resume", source: "llm", confidence: 0.9, overridden: false },
        { tag: "interview_story", source: "llm", confidence: 0.8, overridden: false },
      ],
      ext: { employment_type: "internship" },
    });
    proposal.endeavors.push({
      tempId: projectTemp,
      kind: "project",
      title: "Redis caching",
      summary: text.slice(0, 240),
      primaryParentTempId: roleTemp,
      applicationTags: [
        { tag: "internship_resume", source: "llm", confidence: 0.85, overridden: false },
        { tag: "portfolio", source: "llm", confidence: 0.7, overridden: false },
      ],
    });
    proposal.edges.push({
      type: "part_of",
      fromTempId: projectTemp,
      fromType: "endeavor",
      toTempId: roleTemp,
      toType: "endeavor",
    });
    proposal.edges.push({
      type: "at_org",
      fromTempId: roleTemp,
      fromType: "endeavor",
      toTempId: "o_bubble",
      toType: "org",
    });
    proposal.achievements.push({
      tempId: "a1",
      statement:
        "Implemented Redis caching and fixed a lock-scoping race condition",
      detail: text,
      endeavorTempIds: [projectTemp],
      applicationTags: [
        { tag: "internship_resume", source: "llm", confidence: 0.9, overridden: false },
      ],
    });
    for (const [name, kind] of [
      ["Redis", "tech"],
      ["caching", "tech"],
      ["debugging", "soft"],
    ] as const) {
      const tid = `s_${name}`;
      proposal.skills.push({ tempId: tid, name, skillKind: kind });
      proposal.edges.push({
        type: "used_skill",
        fromTempId: projectTemp,
        fromType: "endeavor",
        toTempId: tid,
        toType: "skill",
      });
    }
    const latency = text.match(/(\d+)\s*%/);
    if (latency) {
      proposal.metrics.push({
        tempId: "m1",
        label: "latency reduction",
        value: Number(latency[1]),
        unit: "%",
        direction: "down",
      });
      proposal.edges.push({
        type: "reports_metric",
        fromTempId: "a1",
        fromType: "achievement",
        toTempId: "m1",
        toType: "metric",
      });
    }
  } else if (
    lower.includes("hackathon") ||
    lower.includes("startup school") ||
    lower.includes("yc")
  ) {
    const eventTemp = "e_event";
    proposal.endeavors.push({
      tempId: eventTemp,
      kind: "event",
      title: lower.includes("startup")
        ? "YC Startup School"
        : "Hackathon",
      summary: text.slice(0, 240),
      ext: {
        event_type: lower.includes("startup") ? "program" : "hackathon",
      },
      applicationTags: [
        { tag: "interview_story", source: "llm", confidence: 0.75, overridden: false },
      ],
    });
    if (lower.includes("built") || lower.includes("project")) {
      proposal.endeavors.push({
        tempId: "e_hack_proj",
        kind: "project",
        title: "Hackathon project",
        summary: text.slice(0, 240),
        primaryParentTempId: eventTemp,
        applicationTags: [
          { tag: "portfolio", source: "llm", confidence: 0.8, overridden: false },
        ],
      });
      proposal.edges.push({
        type: "part_of",
        fromTempId: "e_hack_proj",
        fromType: "endeavor",
        toTempId: eventTemp,
        toType: "endeavor",
      });
    }
  } else if (
    lower.includes("paint") ||
    lower.includes("music") ||
    lower.includes("gallery") ||
    lower.includes("creative")
  ) {
    proposal.endeavors.push({
      tempId: "e_creative",
      kind: "creative_work",
      title: "Creative work",
      summary: text.slice(0, 240),
      ext: { medium: lower.includes("music") ? "music" : "visual" },
      applicationTags: [
        { tag: "portfolio", source: "llm", confidence: 0.8, overridden: false },
        { tag: "personal_site", source: "llm", confidence: 0.7, overridden: false },
      ],
    });
    proposal.skills.push({
      tempId: "s_craft",
      name: lower.includes("music") ? "music production" : "painting",
      skillKind: "craft",
    });
    proposal.edges.push({
      type: "used_skill",
      fromTempId: "e_creative",
      fromType: "endeavor",
      toTempId: "s_craft",
      toType: "skill",
    });
  } else {
    // Generic fallback endeavor
    proposal.endeavors.push({
      tempId: `e_${randomUUID().slice(0, 8)}`,
      kind: "project",
      title: text.slice(0, 60) || "Untitled capture",
      summary: text.slice(0, 400),
      applicationTags: [
        { tag: "keep_personal", source: "llm", confidence: 0.5, overridden: false },
      ],
    });
  }

  return ExtractProposal.parse(proposal);
}
