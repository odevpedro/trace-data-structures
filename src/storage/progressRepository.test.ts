import { describe, expect, it } from "vitest";
import { createEmptyProgress, normalizeProgressSnapshot } from "../core/progress/types";
import { IndexedDbProgressRepository } from "./progressRepository";

describe("IndexedDbProgressRepository", () => {
  it("salva e recupera o progresso estruturado", async () => {
    const repository = new IndexedDbProgressRepository(indexedDB);
    const snapshot = {
      ...createEmptyProgress(),
      lastLessonId: "linear-search",
      completedLessonIds: ["array"],
      lessonSteps: { array: 4 },
      achievementIds: ["first-trace"],
    };

    await repository.save(snapshot);
    await expect(repository.load()).resolves.toEqual(snapshot);
  });

  it("normaliza snapshots antigos sem quebrar a hidratação", () => {
    const legacy = {
      version: 1,
      lastLessonId: "array",
      lessonSteps: { array: 1 },
      lessonRepresentations: { array: "abstract" },
      lessonInputs: {},
      startedLessonIds: [],
      completedLessonIds: [],
      challengeAttempts: {},
      flashcards: {},
      achievementIds: [],
      theme: "dark",
      motionPreference: "reduced",
      speed: 1.5,
    };

    expect(normalizeProgressSnapshot(legacy)).toEqual({
      ...createEmptyProgress(),
      ...legacy,
      dismissedAchievementIds: [],
    });
  });
});
