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
});
