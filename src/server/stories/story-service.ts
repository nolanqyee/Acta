import { createHash, randomUUID } from "crypto";
import type { EndeavorSubgraph, GraphRepository } from "@/server/graph";
import type { Story } from "@/domain";

export function fingerprintSubgraph(subgraph: EndeavorSubgraph): string {
  const parts = [
    subgraph.endeavor.title,
    subgraph.endeavor.summary ?? "",
    ...subgraph.achievements.map((a) => `${a.statement}|${a.detail ?? ""}`),
    ...subgraph.metrics.map((m) => `${m.label}|${m.value}|${m.unit ?? ""}`),
    ...subgraph.skills.map((s) => s.name).sort(),
  ];
  return createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 32);
}

export async function proposeStoryFromEndeavor(
  repo: GraphRepository,
  userId: string,
  endeavorId: string,
): Promise<Story> {
  const subgraph = await repo.getEndeavorSubgraph(userId, endeavorId);
  if (!subgraph) throw new Error("Endeavor not found");

  const achievement = subgraph.achievements[0];
  const metric = subgraph.metrics[0];
  const skills = subgraph.skills.map((s) => s.name).join(", ");

  const story = await repo.createStory({
    id: randomUUID(),
    userId,
    title: `Story: ${subgraph.endeavor.title}`,
    situation: `While working on ${subgraph.endeavor.title}${subgraph.parents[0] ? ` under ${subgraph.parents[0].title}` : ""}.`,
    task: achievement?.statement ?? `Deliver meaningful progress on ${subgraph.endeavor.title}.`,
    action:
      achievement?.detail ??
      subgraph.endeavor.summary ??
      `Applied ${skills || "relevant skills"} to move the work forward.`,
    result: metric
      ? `Outcome: ${metric.label} ${metric.value}${metric.unit ?? ""}.`
      : "Outcome captured in the graph; deepen for a sharper metric.",
    body: undefined,
    synthesisStatus: "draft",
    sourcedFromEntityIds: [
      subgraph.endeavor.id,
      ...subgraph.achievements.map((a) => a.id),
      ...subgraph.skills.map((s) => s.id),
      ...subgraph.metrics.map((m) => m.id),
    ],
    sourceFingerprint: fingerprintSubgraph(subgraph),
    applicationTags: [
      {
        tag: "interview_story",
        source: "llm",
        confidence: 0.85,
        overridden: false,
      },
      {
        tag: "app_question",
        source: "llm",
        confidence: 0.7,
        overridden: false,
      },
    ],
    status: "active",
  });

  return story;
}

/** Grounded app-question draft from stamped/draft stories + subgraph */
export async function draftAppQuestionAnswer(
  repo: GraphRepository,
  userId: string,
  question: string,
  endeavorId?: string,
): Promise<{
  draft: string;
  citations: { entityType: string; entityId: string; title: string }[];
}> {
  const hits = await repo.exploreNl(userId, question, { limit: 5 });
  const stories = await repo.listStories(userId);
  const relevantStories = stories.filter(
    (s) =>
      s.synthesisStatus !== "stale" &&
      (endeavorId
        ? s.sourcedFromEntityIds.includes(endeavorId)
        : hits.some((h) => s.sourcedFromEntityIds.includes(h.entityId))),
  );

  const story = relevantStories[0];
  const top = hits[0];

  let draft: string;
  const citations: { entityType: string; entityId: string; title: string }[] =
    [];

  if (story) {
    draft = [
      `Question: ${question}`,
      "",
      story.situation,
      story.task,
      story.action,
      story.result,
      "",
      "(Draft grounded in your graph — edit before submitting.)",
    ]
      .filter(Boolean)
      .join("\n");
    citations.push({
      entityType: "story",
      entityId: story.id,
      title: story.title,
    });
  } else if (endeavorId || top) {
    const id = endeavorId ?? top!.entityId;
    const subgraph = await repo.getEndeavorSubgraph(userId, id);
    if (subgraph) {
      draft = [
        `Question: ${question}`,
        "",
        `From your graph node “${subgraph.endeavor.title}” (${subgraph.endeavor.kind}):`,
        subgraph.endeavor.summary ?? "",
        subgraph.achievements[0]
          ? `Key claim: ${subgraph.achievements[0].statement}`
          : "",
        "",
        "(No stamped story yet — propose a story from this endeavor for a stronger draft.)",
      ]
        .filter(Boolean)
        .join("\n");
      citations.push({
        entityType: "endeavor",
        entityId: subgraph.endeavor.id,
        title: subgraph.endeavor.title,
      });
    } else {
      draft = `No matching graph nodes for: ${question}`;
    }
  } else {
    draft = `No matching graph nodes for: ${question}`;
  }

  return { draft, citations };
}
