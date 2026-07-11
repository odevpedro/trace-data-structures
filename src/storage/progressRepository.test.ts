import { describe, expect, it } from "vitest";
import { createEmptyProgress } from "../core/progress/types";
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
});
