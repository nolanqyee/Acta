import { randomUUID } from "crypto";
import type { SeedPayload } from "@/server/graph";
import { DEMO_USER_ID } from "@/server/auth/demo-user";

export function buildDogfoodSeed(userId = DEMO_USER_ID): SeedPayload {
  const roleId = randomUUID();
  const projectId = randomUUID();
  const eventId = randomUUID();
  const hackProjId = randomUUID();
  const creativeId = randomUUID();
  const educationId = randomUUID();
  const courseId = randomUUID();
  const leadershipId = randomUUID();

  const skillRedis = randomUUID();
  const skillDebug = randomUUID();
  const skillPaint = randomUUID();
  const orgBubble = randomUUID();
  const orgSchool = randomUUID();
  const achievementId = randomUUID();
  const metricId = randomUUID();
  const captureId = randomUUID();
  const ts = new Date().toISOString();

  return {
    captures: [
      {
        id: captureId,
        userId,
        text: "Today I implemented Redis caching. Had to debug a race condition. Reduced latency ~60%.",
        sourceType: "typed",
        capturedAt: ts,
        createdAt: ts,
      },
    ],
    endeavors: [
      {
        id: roleId,
        userId,
        kind: "role",
        title: "SWE Intern, Bubble",
        summary: "Backend internship",
        status: "active",
        applicationTags: [
          {
            tag: "internship_resume",
            source: "user",
            overridden: true,
          },
        ],
        ext: { employment_type: "internship" },
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: projectId,
        userId,
        kind: "project",
        title: "Redis caching",
        summary: "Caching layer with lock-scope fix; ~60% latency drop",
        status: "active",
        primaryParentId: roleId,
        applicationTags: [
          { tag: "internship_resume", source: "user", overridden: true },
          { tag: "portfolio", source: "user", overridden: true },
        ],
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: eventId,
        userId,
        kind: "event",
        title: "YC Startup School",
        summary: "Program — not under a job or project parent",
        status: "active",
        ext: { event_type: "program" },
        applicationTags: [
          { tag: "interview_story", source: "user", overridden: true },
        ],
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: hackProjId,
        userId,
        kind: "project",
        title: "Health triage bot",
        summary: "HackMIT build",
        status: "active",
        primaryParentId: eventId,
        applicationTags: [
          { tag: "portfolio", source: "user", overridden: true },
        ],
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: creativeId,
        userId,
        kind: "creative_work",
        title: "Spring painting series",
        summary: "Three pieces for Grove Gallery",
        status: "active",
        ext: { medium: "painting", venue_or_show: "Grove Gallery" },
        applicationTags: [
          { tag: "portfolio", source: "user", overridden: true },
          { tag: "personal_site", source: "user", overridden: true },
        ],
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: educationId,
        userId,
        kind: "education",
        title: "BS Computer Science",
        summary: "State University",
        status: "active",
        ext: { degree: "BS", major: "Computer Science" },
        applicationTags: [
          { tag: "internship_resume", source: "user", overridden: true },
        ],
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: courseId,
        userId,
        kind: "course",
        title: "CS229",
        summary: "Machine learning",
        status: "active",
        primaryParentId: educationId,
        applicationTags: [],
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: leadershipId,
        userId,
        kind: "leadership",
        title: "President, Hack Club",
        summary: "Campus club leadership",
        status: "active",
        applicationTags: [
          { tag: "interview_story", source: "user", overridden: true },
        ],
        ext: { title_in_org: "President" },
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    achievements: [
      {
        id: achievementId,
        userId,
        statement:
          "Implemented Redis cache; fixed lock scoping race; ~60% latency reduction",
        status: "active",
        applicationTags: [
          { tag: "internship_resume", source: "user", overridden: true },
        ],
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    skills: [
      {
        id: skillRedis,
        userId,
        name: "Redis",
        skillKind: "tech",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: skillDebug,
        userId,
        name: "Debugging",
        skillKind: "soft",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: skillPaint,
        userId,
        name: "Oil painting",
        skillKind: "craft",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    people: [],
    orgs: [
      {
        id: orgBubble,
        userId,
        name: "Bubble",
        orgKind: "company",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: orgSchool,
        userId,
        name: "State University",
        orgKind: "school",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    metrics: [
      {
        id: metricId,
        userId,
        label: "latency reduction",
        value: 60,
        unit: "%",
        direction: "down",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    evidence: [],
    stories: [],
    lessons: [],
    edges: [
      {
        id: randomUUID(),
        userId,
        type: "part_of",
        fromType: "endeavor",
        fromId: projectId,
        toType: "endeavor",
        toId: roleId,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "part_of",
        fromType: "endeavor",
        fromId: hackProjId,
        toType: "endeavor",
        toId: eventId,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "part_of",
        fromType: "endeavor",
        fromId: courseId,
        toType: "endeavor",
        toId: educationId,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "part_of",
        fromType: "achievement",
        fromId: achievementId,
        toType: "endeavor",
        toId: projectId,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "used_skill",
        fromType: "endeavor",
        fromId: projectId,
        toType: "skill",
        toId: skillRedis,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "used_skill",
        fromType: "endeavor",
        fromId: projectId,
        toType: "skill",
        toId: skillDebug,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "used_skill",
        fromType: "endeavor",
        fromId: creativeId,
        toType: "skill",
        toId: skillPaint,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "at_org",
        fromType: "endeavor",
        fromId: roleId,
        toType: "org",
        toId: orgBubble,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "at_org",
        fromType: "endeavor",
        fromId: educationId,
        toType: "org",
        toId: orgSchool,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "reports_metric",
        fromType: "achievement",
        fromId: achievementId,
        toType: "metric",
        toId: metricId,
        createdAt: ts,
      },
      {
        id: randomUUID(),
        userId,
        type: "sourced_from_capture",
        fromType: "endeavor",
        fromId: projectId,
        toType: "capture",
        toId: captureId,
        createdAt: ts,
      },
    ],
  };
}
