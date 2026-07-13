import { randomUUID } from "crypto";
import { ExtractProposal } from "@/domain";
import type {
  Capture,
  Edge,
  Endeavor,
  EndeavorKind,
  EntityStatus,
  Lesson,
  Story,
  ApplicationTagName,
} from "@/domain";
import type {
  ExploreHit,
  GraphRepository,
  SeedPayload,
  SkillHub,
  EndeavorSubgraph,
} from "./types";
import { simpleEmbed, cosineSimilarity } from "./embeddings";

type Store = SeedPayload & {
  embeddings: Record<string, number[]>; // `${type}:${id}` -> vector
};

function emptyStore(): Store {
  return {
    captures: [],
    endeavors: [],
    achievements: [],
    skills: [],
    people: [],
    orgs: [],
    metrics: [],
    evidence: [],
    stories: [],
    lessons: [],
    edges: [],
    embeddings: {},
  };
}

/** Process-local store keyed by user — works without Supabase for local dogfood */
const globalStore = globalThis as unknown as {
  __stilvaGraph?: Map<string, Store>;
};

function stores() {
  if (!globalStore.__stilvaGraph) {
    globalStore.__stilvaGraph = new Map();
  }
  return globalStore.__stilvaGraph;
}

function userStore(userId: string): Store {
  const map = stores();
  if (!map.has(userId)) map.set(userId, emptyStore());
  return map.get(userId)!;
}

function now() {
  return new Date().toISOString();
}

function embKey(type: string, id: string) {
  return `${type}:${id}`;
}

export class InMemoryGraphRepository implements GraphRepository {
  async createCapture(
    input: Omit<Capture, "id" | "createdAt"> & { id?: string },
  ): Promise<Capture> {
    const store = userStore(input.userId);
    const capture: Capture = {
      ...input,
      id: input.id ?? randomUUID(),
      createdAt: now(),
    };
    store.captures.push(capture);
    return capture;
  }

  async getCapture(userId: string, id: string) {
    return userStore(userId).captures.find((c) => c.id === id) ?? null;
  }

  async createEndeavor(
    input: Omit<Endeavor, "createdAt" | "updatedAt">,
  ): Promise<Endeavor> {
    const store = userStore(input.userId);
    const endeavor: Endeavor = {
      ...input,
      status: input.status ?? "active",
      applicationTags: input.applicationTags ?? [],
      createdAt: now(),
      updatedAt: now(),
    };
    store.endeavors.push(endeavor);
    await this.upsertEmbedding(
      input.userId,
      "endeavor",
      endeavor.id,
      `${endeavor.title} ${endeavor.summary ?? ""}`,
    );
    return endeavor;
  }

  async updateEndeavor(userId: string, id: string, patch: Partial<Endeavor>) {
    const store = userStore(userId);
    const idx = store.endeavors.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    const updated = {
      ...store.endeavors[idx],
      ...patch,
      id,
      userId,
      updatedAt: now(),
    };
    store.endeavors[idx] = updated;
    await this.upsertEmbedding(
      userId,
      "endeavor",
      id,
      `${updated.title} ${updated.summary ?? ""}`,
    );
    return updated;
  }

  async getEndeavor(userId: string, id: string) {
    return userStore(userId).endeavors.find((e) => e.id === id) ?? null;
  }

  async listEndeavors(
    userId: string,
    opts?: {
      kind?: EndeavorKind;
      tag?: ApplicationTagName;
      status?: EntityStatus;
    },
  ) {
    let list = [...userStore(userId).endeavors];
    if (opts?.kind) list = list.filter((e) => e.kind === opts.kind);
    if (opts?.status) list = list.filter((e) => e.status === opts.status);
    else list = list.filter((e) => e.status !== "archived");
    if (opts?.tag) {
      list = list.filter((e) =>
        e.applicationTags.some((t) => t.tag === opts.tag),
      );
    }
    return list.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }

  async addEdge(
    edge: Omit<Edge, "id" | "createdAt"> & { id?: string },
  ): Promise<Edge> {
    const store = userStore(edge.userId);
    const row: Edge = {
      ...edge,
      id: edge.id ?? randomUUID(),
      createdAt: now(),
    };
    store.edges.push(row);
    return row;
  }

  async getEndeavorSubgraph(
    userId: string,
    id: string,
  ): Promise<EndeavorSubgraph | null> {
    const store = userStore(userId);
    const endeavor = store.endeavors.find((e) => e.id === id);
    if (!endeavor) return null;

    const edges = store.edges.filter(
      (e) =>
        (e.fromId === id || e.toId === id) &&
        (e.fromType === "endeavor" ||
          e.toType === "endeavor" ||
          e.type === "part_of" ||
          e.type === "used_skill" ||
          e.type === "involved_person" ||
          e.type === "at_org" ||
          e.type === "reports_metric" ||
          e.type === "supported_by"),
    );

    const parentIds = store.edges
      .filter(
        (e) =>
          e.type === "part_of" &&
          e.fromType === "endeavor" &&
          e.fromId === id &&
          e.toType === "endeavor",
      )
      .map((e) => e.toId);

    const childIds = store.edges
      .filter(
        (e) =>
          e.type === "part_of" &&
          e.toType === "endeavor" &&
          e.toId === id &&
          e.fromType === "endeavor",
      )
      .map((e) => e.fromId);

    const achievementIds = new Set(
      store.edges
        .filter(
          (e) =>
            e.type === "part_of" &&
            e.fromType === "achievement" &&
            e.toId === id,
        )
        .map((e) => e.fromId),
    );

    const skillIds = new Set(
      store.edges
        .filter(
          (e) =>
            e.type === "used_skill" &&
            e.fromId === id &&
            e.toType === "skill",
        )
        .map((e) => e.toId),
    );

    const personIds = new Set(
      store.edges
        .filter(
          (e) =>
            e.type === "involved_person" &&
            e.fromId === id &&
            e.toType === "person",
        )
        .map((e) => e.toId),
    );

    const orgIds = new Set(
      store.edges
        .filter(
          (e) => e.type === "at_org" && e.fromId === id && e.toType === "org",
        )
        .map((e) => e.toId),
    );

    const metricIds = new Set(
      store.edges
        .filter(
          (e) =>
            e.type === "reports_metric" &&
            e.toType === "metric" &&
            (e.fromId === id || achievementIds.has(e.fromId)),
        )
        .map((e) => e.toId),
    );

    const evidenceIds = new Set(
      store.edges
        .filter(
          (e) =>
            e.type === "supported_by" &&
            e.fromId === id &&
            e.toType === "evidence",
        )
        .map((e) => e.toId),
    );

    return {
      endeavor,
      parents: store.endeavors.filter((e) => parentIds.includes(e.id)),
      children: store.endeavors.filter((e) => childIds.includes(e.id)),
      achievements: store.achievements.filter((a) => achievementIds.has(a.id)),
      skills: store.skills.filter((s) => skillIds.has(s.id)),
      people: store.people.filter((p) => personIds.has(p.id)),
      orgs: store.orgs.filter((o) => orgIds.has(o.id)),
      metrics: store.metrics.filter((m) => metricIds.has(m.id)),
      evidence: store.evidence.filter((ev) => evidenceIds.has(ev.id)),
      edges,
    };
  }

  async getSkillHub(userId: string, skillId: string): Promise<SkillHub | null> {
    const store = userStore(userId);
    const skill = store.skills.find((s) => s.id === skillId);
    if (!skill) return null;
    const fromIds = store.edges
      .filter(
        (e) =>
          e.type === "used_skill" &&
          e.toId === skillId &&
          e.toType === "skill",
      )
      .map((e) => ({ type: e.fromType, id: e.fromId }));
    return {
      skill,
      endeavors: store.endeavors.filter((e) =>
        fromIds.some((f) => f.type === "endeavor" && f.id === e.id),
      ),
      achievements: store.achievements.filter((a) =>
        fromIds.some((f) => f.type === "achievement" && f.id === a.id),
      ),
    };
  }

  async listSkills(userId: string) {
    return [...userStore(userId).skills];
  }

  async mergeExtractProposal(
    userId: string,
    captureId: string,
    proposal: ExtractProposal,
  ) {
    const parsed = ExtractProposal.parse(proposal);
    const store = userStore(userId);
    const idMap: Record<string, string> = {};
    const ts = now();

    for (const o of parsed.orgs) {
      const id = randomUUID();
      idMap[o.tempId] = id;
      store.orgs.push({
        id,
        userId,
        name: o.name,
        orgKind: o.orgKind,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const s of parsed.skills) {
      const existing = store.skills.find(
        (x) =>
          x.name.toLowerCase() === s.name.toLowerCase() ||
          x.aliases?.some((a) => a.toLowerCase() === s.name.toLowerCase()),
      );
      if (existing) {
        idMap[s.tempId] = existing.id;
        continue;
      }
      const id = randomUUID();
      idMap[s.tempId] = id;
      store.skills.push({
        id,
        userId,
        name: s.name,
        skillKind: s.skillKind,
        aliases: s.aliases,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
      await this.upsertEmbedding(userId, "skill", id, s.name);
    }

    for (const p of parsed.people) {
      const id = randomUUID();
      idMap[p.tempId] = id;
      store.people.push({
        id,
        userId,
        name: p.name,
        notes: p.notes,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const m of parsed.metrics) {
      const id = randomUUID();
      idMap[m.tempId] = id;
      store.metrics.push({
        id,
        userId,
        label: m.label,
        value: m.value,
        unit: m.unit,
        direction: m.direction,
        context: m.context,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const ev of parsed.evidence) {
      const id = randomUUID();
      idMap[ev.tempId] = id;
      store.evidence.push({
        id,
        userId,
        evidenceKind: ev.evidenceKind,
        title: ev.title,
        uri: ev.uri,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
    }

    for (const e of parsed.endeavors) {
      const id = randomUUID();
      idMap[e.tempId] = id;
      store.endeavors.push({
        id,
        userId,
        kind: e.kind,
        title: e.title,
        summary: e.summary,
        ext: e.ext,
        applicationTags: e.applicationTags ?? [],
        primaryParentId: e.primaryParentTempId
          ? (idMap[e.primaryParentTempId] ?? null)
          : null,
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
      await this.upsertEmbedding(
        userId,
        "endeavor",
        id,
        `${e.title} ${e.summary ?? ""}`,
      );
      store.edges.push({
        id: randomUUID(),
        userId,
        type: "sourced_from_capture",
        fromType: "endeavor",
        fromId: id,
        toType: "capture",
        toId: captureId,
        createdAt: ts,
      });
    }

    // Resolve primary parents after all endeavors exist
    for (const e of parsed.endeavors) {
      if (!e.primaryParentTempId) continue;
      const id = idMap[e.tempId];
      const parentId = idMap[e.primaryParentTempId];
      const row = store.endeavors.find((x) => x.id === id);
      if (row && parentId) row.primaryParentId = parentId;
    }

    for (const a of parsed.achievements) {
      const id = randomUUID();
      idMap[a.tempId] = id;
      store.achievements.push({
        id,
        userId,
        statement: a.statement,
        detail: a.detail,
        applicationTags: a.applicationTags ?? [],
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      });
      await this.upsertEmbedding(userId, "achievement", id, a.statement);
      for (const et of a.endeavorTempIds) {
        const endeavorId = idMap[et];
        if (!endeavorId) continue;
        store.edges.push({
          id: randomUUID(),
          userId,
          type: "part_of",
          fromType: "achievement",
          fromId: id,
          toType: "endeavor",
          toId: endeavorId,
          createdAt: ts,
        });
      }
      store.edges.push({
        id: randomUUID(),
        userId,
        type: "sourced_from_capture",
        fromType: "achievement",
        fromId: id,
        toType: "capture",
        toId: captureId,
        createdAt: ts,
      });
    }

    for (const edge of parsed.edges) {
      const fromId = idMap[edge.fromTempId];
      const toId = idMap[edge.toTempId];
      if (!fromId || !toId) continue;
      store.edges.push({
        id: randomUUID(),
        userId,
        type: edge.type,
        fromType: edge.fromType,
        fromId,
        toType: edge.toType,
        toId,
        attrs: edge.attrs,
        createdAt: ts,
      });
    }

    return { idMap };
  }

  async upsertEmbedding(
    userId: string,
    entityType: string,
    entityId: string,
    text: string,
  ) {
    const store = userStore(userId);
    store.embeddings[embKey(entityType, entityId)] = simpleEmbed(text);
  }

  async exploreNl(
    userId: string,
    query: string,
    opts?: { kind?: EndeavorKind; limit?: number },
  ): Promise<ExploreHit[]> {
    const store = userStore(userId);
    const q = simpleEmbed(query);
    const limit = opts?.limit ?? 10;
    const hits: ExploreHit[] = [];

    for (const e of store.endeavors) {
      if (opts?.kind && e.kind !== opts.kind) continue;
      if (e.status === "archived") continue;
      const vec = store.embeddings[embKey("endeavor", e.id)] ?? simpleEmbed(
        `${e.title} ${e.summary ?? ""}`,
      );
      hits.push({
        entityType: "endeavor",
        entityId: e.id,
        title: e.title,
        snippet: e.summary,
        score: cosineSimilarity(q, vec),
      });
    }

    for (const a of store.achievements) {
      if (a.status === "archived") continue;
      const vec =
        store.embeddings[embKey("achievement", a.id)] ??
        simpleEmbed(a.statement);
      hits.push({
        entityType: "achievement",
        entityId: a.id,
        title: a.statement.slice(0, 80),
        snippet: a.detail,
        score: cosineSimilarity(q, vec),
      });
    }

    for (const s of store.skills) {
      const vec =
        store.embeddings[embKey("skill", s.id)] ?? simpleEmbed(s.name);
      hits.push({
        entityType: "skill",
        entityId: s.id,
        title: s.name,
        score: cosineSimilarity(q, vec),
      });
    }

    for (const st of store.stories) {
      if (st.status === "archived") continue;
      const text = `${st.title} ${st.body ?? ""} ${st.situation ?? ""} ${st.action ?? ""}`;
      const vec =
        store.embeddings[embKey("story", st.id)] ?? simpleEmbed(text);
      hits.push({
        entityType: "story",
        entityId: st.id,
        title: st.title,
        snippet: st.body ?? st.result,
        score: cosineSimilarity(q, vec),
      });
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async createStory(story: Omit<Story, "createdAt" | "updatedAt">) {
    const store = userStore(story.userId);
    const row: Story = {
      ...story,
      synthesisStatus: story.synthesisStatus ?? "draft",
      sourcedFromEntityIds: story.sourcedFromEntityIds ?? [],
      applicationTags: story.applicationTags ?? [],
      status: story.status ?? "active",
      createdAt: now(),
      updatedAt: now(),
    };
    store.stories.push(row);
    await this.upsertEmbedding(
      story.userId,
      "story",
      row.id,
      `${row.title} ${row.body ?? ""} ${row.situation ?? ""} ${row.action ?? ""} ${row.result ?? ""}`,
    );
    return row;
  }

  async getStory(userId: string, id: string) {
    return userStore(userId).stories.find((s) => s.id === id) ?? null;
  }

  async listStories(userId: string) {
    return [...userStore(userId).stories];
  }

  async stampStory(userId: string, id: string) {
    return this.updateStory(userId, id, { synthesisStatus: "stamped" });
  }

  async markStoryStale(userId: string, id: string) {
    return this.updateStory(userId, id, { synthesisStatus: "stale" });
  }

  async updateStory(userId: string, id: string, patch: Partial<Story>) {
    const store = userStore(userId);
    const idx = store.stories.findIndex((s) => s.id === id);
    if (idx < 0) return null;
    const updated = {
      ...store.stories[idx],
      ...patch,
      id,
      userId,
      updatedAt: now(),
    };
    store.stories[idx] = updated;
    return updated;
  }

  async createLesson(lesson: Omit<Lesson, "createdAt" | "updatedAt">) {
    const store = userStore(lesson.userId);
    const row: Lesson = {
      ...lesson,
      synthesisStatus: lesson.synthesisStatus ?? "draft",
      sourcedFromEntityIds: lesson.sourcedFromEntityIds ?? [],
      applicationTags: lesson.applicationTags ?? [],
      status: lesson.status ?? "active",
      createdAt: now(),
      updatedAt: now(),
    };
    store.lessons.push(row);
    return row;
  }

  async listLessons(userId: string) {
    return [...userStore(userId).lessons];
  }

  async seedUser(userId: string, data: SeedPayload) {
    stores().set(userId, { ...structuredClone(data), embeddings: {} });
    const store = userStore(userId);
    for (const e of store.endeavors) {
      await this.upsertEmbedding(
        userId,
        "endeavor",
        e.id,
        `${e.title} ${e.summary ?? ""}`,
      );
    }
    for (const a of store.achievements) {
      await this.upsertEmbedding(userId, "achievement", a.id, a.statement);
    }
    for (const s of store.skills) {
      await this.upsertEmbedding(userId, "skill", s.id, s.name);
    }
  }

  async exportUserGraph(userId: string): Promise<SeedPayload> {
    const s = userStore(userId);
    return {
      captures: structuredClone(s.captures),
      endeavors: structuredClone(s.endeavors),
      achievements: structuredClone(s.achievements),
      skills: structuredClone(s.skills),
      people: structuredClone(s.people),
      orgs: structuredClone(s.orgs),
      metrics: structuredClone(s.metrics),
      evidence: structuredClone(s.evidence),
      stories: structuredClone(s.stories),
      lessons: structuredClone(s.lessons),
      edges: structuredClone(s.edges),
    };
  }
}
