/**
 * @fileoverview Route tests for the acta-api app factory. Exercises the U1
 * health/meta surface and the CORS boundary via `app.request(...)` (no real
 * socket), establishing the testing pattern later route milestones extend.
 */

import { describe, it, expect } from "vitest";
import { createApp } from "./index.js";
import { EntityType } from "@acta/contracts";

describe("createApp routes", () => {
  it("GET / returns the service name", async () => {
    const app = createApp();
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("acta-api");
  });

  it("GET /health reports ok", async () => {
    const app = createApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /meta echoes the contract's entity types", async () => {
    const app = createApp();
    const res = await app.request("/meta");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      service: string;
      entityTypes: string[];
    };
    expect(body.service).toBe("acta-api");
    expect(body.entityTypes).toEqual(EntityType.options);
  });
});

describe("CORS boundary", () => {
  it("reflects an allowed origin", async () => {
    const app = createApp();
    const res = await app.request("/health", {
      headers: { Origin: "http://localhost:5173" },
    });
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173",
    );
  });

  it("does not reflect a disallowed origin", async () => {
    const app = createApp();
    const res = await app.request("/health", {
      headers: { Origin: "https://evil.example.com" },
    });
    expect(res.headers.get("access-control-allow-origin")).not.toBe(
      "https://evil.example.com",
    );
  });
});
