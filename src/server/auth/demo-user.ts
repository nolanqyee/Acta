/** Demo user for local dogfood without Supabase Auth */
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export function getCurrentUserId(): string {
  return process.env.STILVA_DEMO_USER_ID ?? DEMO_USER_ID;
}
