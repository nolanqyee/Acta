/**
 * @fileoverview Browser (client-component) Supabase client. This is the
 * user-scoped, RLS-bound client that runs in the browser bundle: it carries
 * only the publishable/anon key and the user's httpOnly cookie session, so
 * every query it makes is silently scoped by RLS to `auth.uid() = user_id`.
 *
 * Safe to import from client components — it holds no secrets. Never put the
 * service role here (that lives in `./server`, guarded by `server-only`).
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates the browser Supabase client for use inside client components
 * (e.g. to start a magic-link sign-in or subscribe to realtime).
 *
 * `createBrowserClient` is a singleton under the hood, so calling this on every
 * render is cheap — it returns the same instance per browser context.
 *
 * @returns A Supabase client bound to the anon key + the browser cookie session.
 */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
