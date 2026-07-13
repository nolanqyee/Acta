import { describe, expect, it } from "vitest";
import { EndeavorKind, ExtractProposal, EdgeType } from "@/domain";
import { extractFromCaptureText } from "@/server/extract/extract-capture";
import { InMemoryGraphRepository } from "@/server/graph/memory-repository";
import { simpleEmbed, cosineSimilarity } from "@/server/graph/embeddings";
import { randomUUID } from "crypto";

describe("domain schemas", () => {
  it("accepts endeavor kinds", () => {
    expect(EndeavorKind.parse("event")).toBe("event");
    expect(EndeavorKind.parse("leadership")).toBe("leadership");
    expect(() => EndeavorKind.parse("practice")).toThrow();
  });

  it("accepts edge types without contains", () => {
    expect(EdgeType.parse("part_of")).toBe("part_of");
    expect(() => EdgeType.parse("contains")).toThrow();
  });
});

describe("extract + merge", () => {
  it("extracts redis capture and merges graph", async () => {
    const repo = new InMemoryGraphRepository();
    const userId = randomUUID();
    const text =
      "Today I implemented Redis caching at Bubble. Reduced latency ~60%.";
    const proposal = extractFromCaptureText(text);
    expect(ExtractProposal.parse(proposal).endeavors.length).toBeGreaterThan(0);

    const capture = await repo.createCapture({
      id: randomUUID(),
      userId,
      text,
      sourceType: "typed",
      capturedAt: new Date().toISOString(),
    });

    const { idMap } = await repo.mergeExtractProposal(
      userId,
      capture.id,
      proposal,
    );
    expect(Object.keys(idMap).length).toBeGreaterThan(0);

    const endeavors = await repo.listEndeavors(userId);
    expect(endeavors.some((e) => e.kind === "role")).toBe(true);
    expect(endeavors.some((e) => e.kind === "project")).toBe(true);

    const project = endeavors.find((e) => e.kind === "project")!;
    const subgraph = await repo.getEndeavorSubgraph(userId, project.id);
    expect(subgraph?.parents.length).toBeGreaterThan(0);
    expect(subgraph?.skills.some((s) => s.name === "Redis")).toBe(true);
  });
});

describe("embeddings", () => {
  it("ranks similar text higher", () => {
    const q = simpleEmbed("Redis caching latency");
    const a = simpleEmbed("Implemented Redis cache reduced latency");
    const b = simpleEmbed("oil painting gallery spring show");
    expect(cosineSimilarity(q, a)).toBeGreaterThan(cosineSimilarity(q, b));
  });
});
