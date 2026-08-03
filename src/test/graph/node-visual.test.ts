/**
 * @fileoverview Regression tests for design-system node paint resolution (§07).
 */

import { describe, expect, it } from "vitest";
import {
  NODE_DIAMETER_DEFAULT,
  NODE_DIAMETER_HOVER,
  NODE_DIAMETER_SELECTED,
  NODE_DIM_OPACITY,
  isThinEndeavor,
  resolveNodePaint,
} from "@/features/graph/engine/node-visual";

const palette = {
  node: "#f4f1e9",
  nodeStrong: "#10120f",
  accent: "#6fb3e8",
  secondary: "#ff2861",
};

describe("isThinEndeavor", () => {
  it("treats missing summary as thin", () => {
    expect(
      isThinEndeavor({
        summary: "",
        timeframe: { start: { year: 2024, month: 1 } },
        facets: { skills: ["X"], people: [], orgs: [] },
      }),
    ).toBe(true);
  });

  it("treats rich endeavors as default", () => {
    expect(
      isThinEndeavor({
        summary: "Has a summary",
        timeframe: { start: { year: 2024, month: 1 } },
        facets: { skills: ["TypeScript"], people: [], orgs: [] },
      }),
    ).toBe(false);
  });
});

describe("resolveNodePaint", () => {
  const base = {
    id: "a",
    thin: false,
    pending: false,
    lit: 1,
    primaryId: null as string | null,
    primaryAmount: 0,
    secondaryId: null as string | null,
    secondaryAmount: 0,
    dragged: false,
    palette,
  };

  it("draws default paper dot at 8px", () => {
    const paint = resolveNodePaint(base);
    expect(paint.radius).toBe(NODE_DIAMETER_DEFAULT / 2);
    expect(paint.fill).toBe(palette.node);
    expect(paint.stroke).toBe(palette.nodeStrong);
  });

  it("dims to design-system opacity", () => {
    const paint = resolveNodePaint({ ...base, lit: NODE_DIM_OPACITY });
    expect(paint.alpha).toBe(NODE_DIM_OPACITY);
  });

  it("scales hover to 12px primary", () => {
    const paint = resolveNodePaint({
      ...base,
      secondaryId: "a",
      secondaryAmount: 1,
    });
    expect(paint.radius).toBe(NODE_DIAMETER_HOVER / 2);
    expect(paint.fill).toBe(palette.accent);
  });

  it("scales selection to 15px primary", () => {
    const paint = resolveNodePaint({
      ...base,
      primaryId: "a",
      primaryAmount: 1,
    });
    expect(paint.radius).toBe(NODE_DIAMETER_SELECTED / 2);
    expect(paint.fill).toBe(palette.accent);
  });

  it("draws pending nodes with ink border and secondary fill", () => {
    const paint = resolveNodePaint({ ...base, pending: true });
    expect(paint.radius).toBe(NODE_DIAMETER_DEFAULT / 2);
    expect(paint.fill).toBe(palette.secondary);
    expect(paint.stroke).toBe(palette.nodeStrong);
  });

  it("draws deepen backlog nodes like pending — secondary fill, ink border", () => {
    const paint = resolveNodePaint({ ...base, thin: true });
    expect(paint.radius).toBe(NODE_DIAMETER_DEFAULT / 2);
    expect(paint.fill).toBe(palette.secondary);
    expect(paint.stroke).toBe(palette.nodeStrong);
  });
});
