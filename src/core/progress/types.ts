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
