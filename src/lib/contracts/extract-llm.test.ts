/**
 * @fileoverview Guards ExtractProposalLlm JSON Schema against OpenAI strict-mode
 * rejections (optional keys, propertyNames).
 */

import { describe, expect, it } from "vitest";
import { zodSchema } from "ai";
import { ExtractProposalLlm } from "./extract-llm";

/**
 * Collects object properties not listed in `required` and any propertyNames usage.
 *
 * @param schema - JSON Schema node from zodSchema.
 * @param path - Dot path for error messages.
 * @returns Human-readable strict-mode violations.
 */
function findStrictModeViolations(
  schema: unknown,
  path = "root",
): string[] {
  if (!schema || typeof schema !== "object") {
    return [];
  }

  const node = schema as Record<string, unknown>;
  const issues: string[] = [];

  if (node.type === "object" && node.properties) {
    const required = new Set(
      Array.isArray(node.required) ? (node.required as string[]) : [],
    );
    for (const key of Object.keys(node.properties as object)) {
      if (!required.has(key)) {
        issues.push(`${path}.${key} not in required`);
      }
    }
    if ("propertyNames" in node) {
      issues.push(`${path} uses propertyNames`);
    }
    for (const [key, child] of Object.entries(
      node.properties as Record<string, unknown>,
    )) {
      issues.push(...findStrictModeViolations(child, `${path}.${key}`));
    }
  }

  if (node.items) {
    issues.push(...findStrictModeViolations(node.items, `${path}[]`));
  }

  for (const combiner of ["anyOf", "oneOf", "allOf"] as const) {
    const branch = node[combiner];
    if (Array.isArray(branch)) {
      branch.forEach((child, index) => {
        issues.push(
          ...findStrictModeViolations(child, `${path}.${combiner}[${index}]`),
        );
      });
    }
  }

  return issues;
}

describe("ExtractProposalLlm JSON Schema", () => {
  it("has no optional object keys or propertyNames (OpenAI strict mode)", () => {
    const { jsonSchema } = zodSchema(ExtractProposalLlm);
    const violations = findStrictModeViolations(jsonSchema);
    expect(violations).toEqual([]);
  });
});
