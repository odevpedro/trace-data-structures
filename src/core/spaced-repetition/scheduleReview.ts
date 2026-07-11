import type {
  FlashcardProgress,
  ReviewRating,
} from "../progress/types";

const DAY = 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export function scheduleReview(
  current: FlashcardProgress | undefined,
  rating: ReviewRating,
  now = new Date(),
): FlashcardProgress {
  const previousBox = current?.box ?? 0;
  let box = previousBox;
  let interval = TEN_MINUTES;

  if (rating === "again") {
    box = 0;
  } else if (rating === "hard") {
    box = Math.max(1, previousBox);
    interval = DAY;
  } else {
    box = Math.min(5, previousBox + 1);
    interval = [0, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY][box];
  }

  return {
    box,
    dueAt: new Date(now.getTime() + interval).toISOString(),
    lastReviewedAt: now.toISOString(),
    reviews: (current?.reviews ?? 0) + 1,
  };
}
