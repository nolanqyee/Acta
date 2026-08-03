/**
 * @fileoverview Tests for the pure auth gating policy — the access decision that
 * middleware applies. Covers the public allowlist and the authed/unauthed
 * outcomes for both pages (redirect) and API routes (401).
 */

import { describe, it, expect } from "vitest";
import { isPublicPath, gateDecision } from "./auth-paths";

describe("isPublicPath", () => {
  it("treats the marketing homepage and sign-in flow as public", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/api/health")).toBe(true);
    expect(isPublicPath("/api/meta")).toBe(true);
  });

  it("matches nested sub-paths of a public prefix", () => {
    expect(isPublicPath("/auth/callback/anything")).toBe(true);
  });

  it("treats the graph app and non-public API routes as private", () => {
    expect(isPublicPath("/home")).toBe(false);
    expect(isPublicPath("/settings")).toBe(false);
    expect(isPublicPath("/api/captures")).toBe(false);
  });
});

describe("gateDecision", () => {
  it("allows any public path without a session", () => {
    expect(gateDecision("/", false)).toBe("allow");
    expect(gateDecision("/login", false)).toBe("allow");
    expect(gateDecision("/api/health", false)).toBe("allow");
  });

  it("allows authenticated callers on private paths", () => {
    expect(gateDecision("/home", true)).toBe("allow");
    expect(gateDecision("/api/captures", true)).toBe("allow");
  });

  it("redirects unauthenticated page requests to login", () => {
    expect(gateDecision("/home", false)).toBe("login");
    expect(gateDecision("/settings", false)).toBe("login");
  });

  it("rejects unauthenticated API requests with 401 (no redirect)", () => {
    expect(gateDecision("/api/captures", false)).toBe("unauthorized");
    expect(gateDecision("/api/graph", false)).toBe("unauthorized");
  });

  it("opens the /lab workbenches only when dev paths are explicitly allowed", () => {
    expect(gateDecision("/lab/graph", false, true)).toBe("allow");
    expect(gateDecision("/lab/graph", false)).toBe("login");
    expect(gateDecision("/lab/graph", false, false)).toBe("login");
  });

  it("does not let the dev allowance leak to anything outside /lab", () => {
    expect(gateDecision("/home", false, true)).toBe("login");
    expect(gateDecision("/api/graph", false, true)).toBe("unauthorized");
    expect(gateDecision("/labs", false, true)).toBe("login");
    expect(gateDecision("/lab-notes", false, true)).toBe("login");
  });
});
