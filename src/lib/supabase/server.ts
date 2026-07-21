/**
 * @fileoverview Server-side Supabase clients — the two halves of the dual-client
 * model (KTD9/KTD12). This module is `server-only`: importing it from a client
 * component is a build error, which is what keeps the service-role key out of
 * the browser bundle.
 *
 * Two clients, two jobs:
 *  - `createServerSupabase()` — user-scoped + RLS. Built per request from the
 *    httpOnly cookie session; used for interactive reads/writes where a real
 *    logged-in user is acting on their own rows. RLS is the safety net.
 *  - `createServiceRoleClient()` — bypasses RLS. Used only by background work
 *    with no live session (Extract job persistence, confirm merge). It has NO
 *    RLS net, so callers MUST filter by an already-verified `user_id`.
 */

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Creates a request-scoped, RLS-bound Supabase client from the current cookie
 * session. Use this for anything a signed-in user does to their own data
 * (reads, PATCHes) — RLS scopes every query to `auth.uid() = user_id`.
 *
 * A fresh client is created per request because it closes over that request's
 * cookies; this is intentional and cheap (it just configures a fetch).
 *
 * @returns A Supabase client wired to read/write the session cookies.
 * @throws If called outside a request scope where `next/headers` cookies are
 *   unavailable (e.g. at module load), Next throws when `cookies()` is awaited.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, which can't write cookies. Safe to
            // ignore: the proxy in middleware refreshes + persists the session.
          }
        },
      },
    },
  );
}

/**
 * Creates a service-role Supabase client that BYPASSES RLS. Reserve this for
 * server jobs that must write on a user's behalf when there is no live session
 * to satisfy RLS — Extract stream persistence and confirm merge (KTD9).
 *
 * Safety contract (RLS is off, so you enforce ownership yourself):
 *  - Only ever call this from `server-only` code (this module already is).
 *  - ALWAYS constrain reads/writes to a `user_id` you verified from a real
 *    session earlier in the flow — never trust a client-supplied id.
 *
 * Session persistence is disabled: this client is stateless and identity-less
 * by design; identity comes from the explicit `user_id` filter.
 *
 * @returns A Supabase client authenticated with the service-role key.
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
