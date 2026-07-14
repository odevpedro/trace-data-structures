import type { Representation } from "../trace-engine/types";

export type ThemePreference = "light" | "dark";
export type MotionPreference = "system" | "reduced" | "full";
export type ReviewRating = "again" | "hard" | "good";

export interface ChallengeAttempt {
  choiceId: string;
  correct: boolean;
  attempts: number;
}

export interface FlashcardProgress {
  box: number;
  dueAt: string;
  lastReviewedAt: string | null;
  reviews: number;
}

export interface ProgressSnapshot {
  version: 1;
  lastLessonId: string;
  lessonSteps: Record<string, number>;
  lessonRepresentations: Record<string, Representation>;
  lessonInputs: Record<string, Record<string, number>>;
  startedLessonIds: string[];
  completedLessonIds: string[];
  challengeAttempts: Record<string, ChallengeAttempt>;
  flashcards: Record<string, FlashcardProgress>;
  achievementIds: string[];
  dismissedAchievementIds: string[];
  theme: ThemePreference;
  motionPreference: MotionPreference;
  speed: number;
}

type ProgressSnapshotLike = Partial<ProgressSnapshot> & {
  version?: number;
};

export function createEmptyProgress(): ProgressSnapshot {
  return {
    version: 1,
    lastLessonId: "array",
    lessonSteps: {},
    lessonRepresentations: {},
    lessonInputs: {},
    startedLessonIds: [],
    completedLessonIds: [],
    challengeAttempts: {},
    flashcards: {},
    achievementIds: [],
    dismissedAchievementIds: [],
    theme: "light",
    motionPreference: "system",
    speed: 1,
  };
}

export function normalizeProgressSnapshot(value: unknown): ProgressSnapshot {
  const fallback = createEmptyProgress();
  if (!value || typeof value !== "object") return fallback;

  const candidate = value as ProgressSnapshotLike;
  if (candidate.version !== 1) return fallback;

  return {
    ...fallback,
    ...candidate,
    lessonSteps: candidate.lessonSteps ?? fallback.lessonSteps,
    lessonRepresentations: candidate.lessonRepresentations ?? fallback.lessonRepresentations,
    lessonInputs: candidate.lessonInputs ?? fallback.lessonInputs,
    startedLessonIds: candidate.startedLessonIds ?? fallback.startedLessonIds,
    completedLessonIds: candidate.completedLessonIds ?? fallback.completedLessonIds,
    challengeAttempts: candidate.challengeAttempts ?? fallback.challengeAttempts,
    flashcards: candidate.flashcards ?? fallback.flashcards,
    achievementIds: candidate.achievementIds ?? fallback.achievementIds,
    dismissedAchievementIds: candidate.dismissedAchievementIds ?? fallback.dismissedAchievementIds,
    theme: candidate.theme ?? fallback.theme,
    motionPreference: candidate.motionPreference ?? fallback.motionPreference,
    speed: candidate.speed ?? fallback.speed,
  };
}
