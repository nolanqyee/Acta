/**
 * @fileoverview One-off fetcher for Claude Design project files. Reads the
 * design OAuth token from the macOS Keychain (written by Claude Code
 * `/design-login`) and writes project files into `.design-import/` without
 * printing credentials.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API = "https://api.anthropic.com/v1/design";
const PROJECT_ID = "ad648b85-4c7f-4340-b3b2-21de0961c5e9";
const OUT_DIR = join(process.cwd(), ".design-import");

/** @returns {string} Bearer access token from Keychain. */
function designToken() {
  const r = spawnSync(
    "security",
    ["find-generic-password", "-s", "Claude Code-credentials", "-w"],
    { encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(
      "Could not read Claude Code credentials. Run /design-login in Claude Code first.",
    );
  }
  const creds = JSON.parse(r.stdout.trim());
  const token = creds.designOauth?.accessToken;
  const expiresAt = creds.designOauth?.expiresAt ?? 0;
  if (!token) {
    throw new Error("No designOauth token. Run /design-login in Claude Code first.");
  }
  if (expiresAt < Date.now()) {
    throw new Error("Design token expired. Run /design-login in Claude Code first.");
  }
  return token;
}

/**
 * @param {string} path
 * @returns {Promise<unknown>}
 */
async function designFetch(path) {
  const resp = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${designToken()}` },
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Design API ${path} → ${resp.status}: ${body.slice(0, 300)}`);
  }
  const ct = resp.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? resp.json() : resp.text();
}

mkdirSync(OUT_DIR, { recursive: true });

const meta = await designFetch(`/projects/${PROJECT_ID}`);
writeFileSync(join(OUT_DIR, "_meta.json"), JSON.stringify(meta, null, 2));

const filesResp = await designFetch(`/projects/${PROJECT_ID}/files`);
const entries = (filesResp.entries ?? []).filter((e) => e.type === "file");
writeFileSync(
  join(OUT_DIR, "_files.json"),
  JSON.stringify(
    entries.map((e) => ({ path: e.path, size: e.size })),
    null,
    2,
  ),
);

for (const entry of entries) {
  const content = await designFetch(
    `/projects/${PROJECT_ID}/download?path=${encodeURIComponent(entry.path)}`,
  );
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const safe = entry.path.replace(/\//g, "__");
  writeFileSync(join(OUT_DIR, safe), text);
  console.log(`wrote ${safe} (${text.length} chars)`);
}

console.log(`\nDone — ${entries.length} files in ${OUT_DIR}`);
