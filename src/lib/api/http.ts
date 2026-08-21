/**
 * @fileoverview Same-origin JSON fetch helpers for browser callers (`/home`,
 * `/lab/*`). Uses cookie session auth like production — no lab-only headers or
 * alternate API hosts.
 */

/**
 * Performs an authenticated same-origin `fetch` with JSON defaults.
 *
 * @param path - App-relative API path (e.g. `/api/captures`).
 * @param init - Optional fetch init; body should be pre-stringified when using POST.
 * @returns The raw `Response` for the caller to parse or display.
 */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(path, {
    ...init,
    cache: "no-store",
    headers,
  });
}

/**
 * Parses a JSON response body, surfacing non-JSON failures as thrown errors.
 *
 * @param response - Response from {@link apiFetch}.
 * @returns Parsed JSON body.
 * @throws When the body is not valid JSON.
 */
export async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Expected JSON body (HTTP ${response.status})`);
  }
}
