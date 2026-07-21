/**
 * @fileoverview RLS isolation integration test — the DB-level proof of R10:
 * a valid session only ever sees its owner's rows. It needs a real Postgres
 * with our migrations applied, so it AUTO-SKIPS unless the local Supabase
 * credentials are provided via env (set by `supabase start`):
 *   SUPABASE_TEST_URL, SUPABASE_TEST_SERVICE_ROLE_KEY, SUPABASE_TEST_ANON_KEY
 * CI (no DB) runs the pure-logic tests only; run this locally against the
 * option-(a) Docker stack.
 */

import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
const configured = Boolean(url && serviceKey && anonKey);

// Auto-skip when no local DB is configured (e.g. in CI).
const describeIfDb = configured ? describe : describe.skip;

describeIfDb("RLS isolation (endeavors)", () => {
  it("a signed-in user cannot read another user's rows", async () => {
    const admin = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const password = "test-password-123!";
    const stamp = Date.now();
    const emailA = `rls-a-${stamp}@acta.test`;
    const emailB = `rls-b-${stamp}@acta.test`;

    const { data: aUser } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    const { data: bUser } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    const aId = aUser.user!.id;
    const bId = bUser.user!.id;

    try {
      // Service role (bypasses RLS) seeds one endeavor owned by A.
      const { error: insertError } = await admin.from("endeavors").insert({
        user_id: aId,
        kind: "project",
        title: "A's private endeavor",
      });
      expect(insertError).toBeNull();

      // B signs in with the anon (RLS-bound) client.
      const bClient = createClient(url!, anonKey!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: signInError } = await bClient.auth.signInWithPassword({
        email: emailB,
        password,
      });
      expect(signInError).toBeNull();

      // Under RLS, B sees none of A's rows.
      const { data: bView } = await bClient.from("endeavors").select("*");
      expect(bView).toEqual([]);
    } finally {
      await admin.auth.admin.deleteUser(aId);
      await admin.auth.admin.deleteUser(bId);
    }
  });
});
