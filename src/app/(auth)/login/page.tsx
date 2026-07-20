/**
 * @fileoverview `/login` route (inside the `(auth)` route group) — the sign-in
 * surface. The `(auth)` group keeps auth routes organized without adding a URL
 * segment. Placeholder for now; real Supabase sign-in (`@supabase/ssr`, cookie
 * sessions) plus the `/auth/callback` handler are built in U2.
 */

import { PlaceholderSurface } from "@/components/placeholder-surface";

/**
 * Sign-in surface placeholder.
 *
 * @returns The reserved `/login` route shell.
 */
export default function LoginPage() {
  return (
    <PlaceholderSurface
      title="Sign in"
      note="Supabase auth with httpOnly cookie sessions (@supabase/ssr) and the /auth/callback handler arrive in U2."
    />
  );
}
