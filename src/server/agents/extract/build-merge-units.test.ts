/**
 * @fileoverview Unit tests for Extract merge-unit post-processing (U4-D).
 */

import { describe, expect, it } from "vitest";
import { ExtractProposal } from "@/lib/contracts/extract";
import {
  buildMergeArtifacts,
  bundleTempIdsForEndeavor,
  isEmptyExtract,
} from "./build-merge-units";

describe("isEmptyExtract", () => {
  it("returns true for an all-empty proposal", () => {
    expect(isEmptyExtract(ExtractProposal.parse({}))).toBe(true);
  });

  it("returns false when at least one endeavor exists", () => {
    expect(
      isEmptyExtract(
        ExtractProposal.parse({
          endeavors: [{ tempId: "e1", kind: "role", title: "Intern" }],
        }),
      ),
    ).toBe(false);
  });
});

describe("bundleTempIdsForEndeavor", () => {
  it("bundles achievements and skills linked to the endeavor", () => {
    const payload = ExtractProposal.parse({
      endeavors: [
        { tempId: "ende_role_1", kind: "role", title: "Intern at Bubble" },
      ],
      achievements: [
        {
          tempId: "ach_1",
          statement: "Built Redis cache",
          endeavorTempIds: ["ende_role_1"],
        },
      ],
      skills: [{ tempId: "skill_redis", name: "Redis", skillKind: "tech" }],
      edges: [
        {
          type: "used_skill",
          fromTempId: "ende_role_1",
          fromType: "endeavor",
          toTempId: "skill_redis",
          toType: "skill",
        },
      ],
    });

    expect(bundleTempIdsForEndeavor(payload, "ende_role_1").sort()).toEqual(
      ["ach_1", "ende_role_1", "skill_redis"].sort(),
    );
  });

  it("does not bundle a part_of parent endeavor into the child unit", () => {
    const payload = ExtractProposal.parse({
      endeavors: [
        { tempId: "ende_role_1", kind: "role", title: "Intern" },
        { tempId: "ende_proj_1", kind: "project", title: "Redis cache" },
      ],
      edges: [
        {
          type: "part_of",
          fromTempId: "ende_proj_1",
          fromType: "endeavor",
          toTempId: "ende_role_1",
          toType: "endeavor",
        },
      ],
    });

    const bundled = bundleTempIdsForEndeavor(payload, "ende_proj_1");
    expect(bundled).toContain("ende_proj_1");
    expect(bundled).not.toContain("ende_role_1");
  });
});

describe("buildMergeArtifacts", () => {
  it("creates add merge units and pending previews", () => {
    const payload = ExtractProposal.parse({
      endeavors: [
        { tempId: "ende_role_1", kind: "role", title: "SWE intern at Bubble" },
      ],
      orgs: [{ tempId: "org_bubble", name: "Bubble" }],
      edges: [
        {
          type: "at_org",
          fromTempId: "ende_role_1",
          fromType: "endeavor",
          toTempId: "org_bubble",
          toType: "org",
        },
      ],
    });

    const { mergeUnits, pendingEndeavorPreviews } = buildMergeArtifacts(payload);

    expect(mergeUnits).toHaveLength(1);
    expect(mergeUnits[0]?.op).toBe("add");
    expect(mergeUnits[0]?.disposition).toBe("pending");
    expect(mergeUnits[0]?.bundledTempIds).toContain("org_bubble");
    expect(pendingEndeavorPreviews[0]?.title).toBe("SWE intern at Bubble");
  });

  it("creates update merge units when updateTargetEndeavorId is set", () => {
    const targetId = "44444444-4444-4444-8444-444444444444";
    const payload = ExtractProposal.parse({
      endeavors: [
        {
          tempId: "ende_course_1",
          kind: "course",
          title: "CS229",
          updateTargetEndeavorId: targetId,
        },
      ],
    });

    const { mergeUnits } = buildMergeArtifacts(payload);

    expect(mergeUnits[0]?.op).toBe("update");
    expect(mergeUnits[0]?.targetEndeavorId).toBe(targetId);
  });
});
