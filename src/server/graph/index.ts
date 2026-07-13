import { InMemoryGraphRepository } from "./memory-repository";
import type { GraphRepository } from "./types";

const globalForGraph = globalThis as unknown as {
  __stilvaRepo?: GraphRepository;
};

/** Default: in-memory graph (local dogfood). Wire Supabase repo when env is set. */
export function getGraphRepository(): GraphRepository {
  if (!globalForGraph.__stilvaRepo) {
    globalForGraph.__stilvaRepo = new InMemoryGraphRepository();
  }
  return globalForGraph.__stilvaRepo;
}

export * from "./types";
