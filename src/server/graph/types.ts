import type {
  Achievement,
  Capture,
  Edge,
  Endeavor,
  EndeavorKind,
  EntityStatus,
  Evidence,
  ExtractProposal,
  Lesson,
  Metric,
  Org,
  Person,
  Skill,
  Story,
  ApplicationTagName,
} from "@/domain";

export type EndeavorSubgraph = {
  endeavor: Endeavor;
  parents: Endeavor[];
  children: Endeavor[];
  achievements: Achievement[];
  skills: Skill[];
  people: Person[];
  orgs: Org[];
  metrics: Metric[];
  evidence: Evidence[];
  edges: Edge[];
};

export type ExploreHit = {
  entityType: string;
  entityId: string;
  title: string;
  snippet?: string;
  score: number;
};

export type SkillHub = {
  skill: Skill;
  endeavors: Endeavor[];
  achievements: Achievement[];
};

export interface GraphRepository {
  createCapture(
    input: Omit<Capture, "id" | "createdAt"> & { id?: string },
  ): Promise<Capture>;
  getCapture(userId: string, id: string): Promise<Capture | null>;

  createEndeavor(
    input: Omit<Endeavor, "createdAt" | "updatedAt">,
  ): Promise<Endeavor>;
  updateEndeavor(
    userId: string,
    id: string,
    patch: Partial<Endeavor>,
  ): Promise<Endeavor | null>;
  getEndeavor(userId: string, id: string): Promise<Endeavor | null>;
  listEndeavors(
    userId: string,
    opts?: {
      kind?: EndeavorKind;
      tag?: ApplicationTagName;
      status?: EntityStatus;
    },
  ): Promise<Endeavor[]>;

  addEdge(edge: Omit<Edge, "id" | "createdAt"> & { id?: string }): Promise<Edge>;
  getEndeavorSubgraph(userId: string, id: string): Promise<EndeavorSubgraph | null>;
  getSkillHub(userId: string, skillId: string): Promise<SkillHub | null>;
  listSkills(userId: string): Promise<Skill[]>;

  mergeExtractProposal(
    userId: string,
    captureId: string,
    proposal: ExtractProposal,
  ): Promise<{ idMap: Record<string, string> }>;

  exploreNl(
    userId: string,
    query: string,
    opts?: { kind?: EndeavorKind; limit?: number },
  ): Promise<ExploreHit[]>;

  upsertEmbedding(
    userId: string,
    entityType: string,
    entityId: string,
    text: string,
  ): Promise<void>;

  createStory(story: Omit<Story, "createdAt" | "updatedAt">): Promise<Story>;
  getStory(userId: string, id: string): Promise<Story | null>;
  listStories(userId: string): Promise<Story[]>;
  stampStory(userId: string, id: string): Promise<Story | null>;
  markStoryStale(userId: string, id: string): Promise<Story | null>;
  updateStory(
    userId: string,
    id: string,
    patch: Partial<Story>,
  ): Promise<Story | null>;

  createLesson(lesson: Omit<Lesson, "createdAt" | "updatedAt">): Promise<Lesson>;
  listLessons(userId: string): Promise<Lesson[]>;

  /** Dev/dogfood: replace user graph */
  seedUser(userId: string, data: SeedPayload): Promise<void>;
  exportUserGraph(userId: string): Promise<SeedPayload>;
}

export type SeedPayload = {
  captures: Capture[];
  endeavors: Endeavor[];
  achievements: Achievement[];
  skills: Skill[];
  people: Person[];
  orgs: Org[];
  metrics: Metric[];
  evidence: Evidence[];
  stories: Story[];
  lessons: Lesson[];
  edges: Edge[];
};
