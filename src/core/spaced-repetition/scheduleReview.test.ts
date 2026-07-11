import { describe, expect, it } from "vitest";
import { scheduleReview } from "./scheduleReview";

describe("scheduleReview", () => {
  const now = new Date("2026-07-11T12:00:00.000Z");

  it("avança a caixa e o intervalo quando o card foi lembrado", () => {
    const first = scheduleReview(undefined, "good", now);
    const second = scheduleReview(first, "good", now);

    expect(first.box).toBe(1);
    expect(first.dueAt).toBe("2026-07-12T12:00:00.000Z");
    expect(second.box).toBe(2);
    expect(second.dueAt).toBe("2026-07-14T12:00:00.000Z");
  });

  it("reinicia a caixa e agenda dez minutos após um erro", () => {
    const progress = scheduleReview(
      {
        box: 4,
        dueAt: now.toISOString(),
        lastReviewedAt: now.toISOString(),
        reviews: 8,
      },
      "again",
      now,
    );

    expect(progress.box).toBe(0);
    expect(progress.dueAt).toBe("2026-07-11T12:10:00.000Z");
    expect(progress.reviews).toBe(9);
  });

  it("hard agenda para o dia seguinte", () => {
    const progress = scheduleReview(
      {
        box: 4,
        dueAt: now.toISOString(),
        lastReviewedAt: now.toISOString(),
        reviews: 8,
      },
      "hard",
      now,
    );

    expect(progress.box).toBe(4);
    expect(progress.dueAt).toBe("2026-07-12T12:00:00.000Z");
    expect(progress.reviews).toBe(9);
  });

  it("good avança uma caixa e dobra o intervalo", () => {
    const progress = scheduleReview(
      {
        box: 2,
        dueAt: now.toISOString(),
        lastReviewedAt: now.toISOString(),
        reviews: 3,
      },
      "good",
      now,
    );

    expect(progress.box).toBe(3);
    expect(progress.dueAt).toBe("2026-07-18T12:00:00.000Z");
    expect(progress.reviews).toBe(4);
  });

  it("dueAt é sempre ISO string futura", () => {
    const ratings = ["again", "hard", "good"] as const;
    for (const rating of ratings) {
      const progress = scheduleReview(undefined, rating, now);
      expect(progress.dueAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(progress.dueAt).getTime()).toBeGreaterThanOrEqual(now.getTime());
    }
  });
});
