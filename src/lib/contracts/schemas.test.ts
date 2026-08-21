/**
 * @fileoverview Contract validation tests — prove the shared schemas parse
 * valid input and reject malformed input. These are the U-J U1 acceptance
 * checks for the shared contracts (enum closure + ExtractProposal
 * happy/edge/error paths); merge/persistence behavior is tested later in the
 * app's route handlers.
 */

import { describe, expect, it } from "vitest";
import { EndeavorKind, EdgeType, ExtractProposal, parseExtractProposalFromLlm } from "./index";
import { ExtractProposalLlm } from "./extract-llm";

describe("enum schemas", () => {
  it("accepts known endeavor kinds and rejects unknown ones", () => {
    expect(EndeavorKind.parse("event")).toBe("event");
    expect(EndeavorKind.parse("leadership")).toBe("leadership");
    expect(() => EndeavorKind.parse("practice")).toThrow();
  });

  it("accepts known edge types and rejects unknown ones", () => {
    expect(EdgeType.parse("part_of")).toBe("part_of");
    expect(() => EdgeType.parse("contains")).toThrow();
  });
});

describe("ExtractProposal", () => {
  it("parses a minimal valid proposal and fills empty collections", () => {
    const parsed = ExtractProposal.parse({
      endeavors: [{ tempId: "e1", kind: "project", title: "Bubble CRM App" }],
    });
    expect(parsed.endeavors).toHaveLength(1);
    expect(parsed.achievements).toEqual([]);
    expect(parsed.edges).toEqual([]);
  });

  it("parses an empty object into fully-defaulted empty collections", () => {
    const parsed = ExtractProposal.parse({});
    expect(parsed.endeavors).toEqual([]);
    expect(parsed.skills).toEqual([]);
  });

  it("rejects an endeavor with a missing title", () => {
    expect(() =>
      ExtractProposal.parse({
        endeavors: [{ tempId: "e1", kind: "project" }],
      }),
    ).toThrow();
  });

  it("rejects an endeavor with an empty-string title", () => {
    expect(() =>
      ExtractProposal.parse({
        endeavors: [{ tempId: "e1", kind: "project", title: "" }],
      }),
    ).toThrow();
  });

  it("coerces ExtractProposalLlm output into the full ExtractProposal shape", () => {
    const llm = ExtractProposalLlm.parse({
      endeavors: [
        {
          tempId: "e1",
          kind: "role",
          title: "Intern",
          summary: null,
          primaryParentTempId: null,
          updateTargetEndeavorId: null,
          existingParentEndeavorId: null,
        },
      ],
      achievements: [],
      skills: [],
      people: [],
      orgs: [],
      metrics: [],
      evidence: [],
      edges: [
        {
          type: "part_of",
          fromTempId: "e2",
          fromType: "endeavor",
          toTempId: "e1",
          toType: "endeavor",
        },
      ],
    });
    const full = parseExtractProposalFromLlm(llm);
    expect(full.endeavors[0]?.title).toBe("Intern");
    expect(full.edges[0]?.type).toBe("part_of");
  });
});
