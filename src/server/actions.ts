"use server";

import { randomUUID } from "crypto";
import { ExtractProposal } from "@/domain";
import { getCurrentUserId } from "@/server/auth/demo-user";
import { extractFromCaptureText } from "@/server/extract/extract-capture";
import { getGraphRepository } from "@/server/graph";
import { buildDogfoodSeed } from "@/server/graph/seed";
import {
  draftAppQuestionAnswer,
  proposeStoryFromEndeavor,
} from "@/server/stories/story-service";
import type { EndeavorKind, ApplicationTagName, EntityStatus } from "@/domain";

export async function actionSeedDogfood() {
  const userId = getCurrentUserId();
  const repo = getGraphRepository();
  await repo.seedUser(userId, buildDogfoodSeed(userId));
  return { ok: true as const };
}

export async function actionListEndeavors(opts?: {
  kind?: EndeavorKind;
  tag?: ApplicationTagName;
  status?: EntityStatus;
}) {
  const userId = getCurrentUserId();
  return getGraphRepository().listEndeavors(userId, opts);
}

export async function actionGetSubgraph(id: string) {
  const userId = getCurrentUserId();
  return getGraphRepository().getEndeavorSubgraph(userId, id);
}

export async function actionListSkills() {
  return getGraphRepository().listSkills(getCurrentUserId());
}

export async function actionGetSkillHub(skillId: string) {
  return getGraphRepository().getSkillHub(getCurrentUserId(), skillId);
}

export async function actionCreateCaptureAndExtract(text: string) {
  const userId = getCurrentUserId();
  const repo = getGraphRepository();
  const capture = await repo.createCapture({
    id: randomUUID(),
    userId,
    text,
    sourceType: "typed",
    capturedAt: new Date().toISOString(),
  });
  const proposal = extractFromCaptureText(text);
  return { capture, proposal };
}

export async function actionMergeProposal(
  captureId: string,
  proposalJson: unknown,
) {
  const userId = getCurrentUserId();
  const proposal = ExtractProposal.parse(proposalJson);
  return getGraphRepository().mergeExtractProposal(
    userId,
    captureId,
    proposal,
  );
}

export async function actionExploreNl(query: string, kind?: EndeavorKind) {
  return getGraphRepository().exploreNl(getCurrentUserId(), query, {
    kind,
    limit: 12,
  });
}

export async function actionProposeStory(endeavorId: string) {
  return proposeStoryFromEndeavor(
    getGraphRepository(),
    getCurrentUserId(),
    endeavorId,
  );
}

export async function actionStampStory(storyId: string) {
  return getGraphRepository().stampStory(getCurrentUserId(), storyId);
}

export async function actionListStories() {
  return getGraphRepository().listStories(getCurrentUserId());
}

export async function actionDraftAppAnswer(
  question: string,
  endeavorId?: string,
) {
  return draftAppQuestionAnswer(
    getGraphRepository(),
    getCurrentUserId(),
    question,
    endeavorId,
  );
}

export async function actionExportGraph() {
  return getGraphRepository().exportUserGraph(getCurrentUserId());
}
