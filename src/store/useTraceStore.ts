import { create } from "zustand";
import type {
  MotionPreference,
  ProgressSnapshot,
  ReviewRating,
  ThemePreference,
} from "../core/progress/types";
import { createEmptyProgress } from "../core/progress/types";
import { scheduleReview } from "../core/spaced-repetition/scheduleReview";
import type {
  Representation,
  TraceStatus,
} from "../core/trace-engine/types";

interface OpenLessonOptions {
  id: string;
  representations: Representation[];
  defaultInputs: Record<string, number>;
  maxStep: number;
}

interface TraceStore extends ProgressSnapshot {
  hydrated: boolean;
  player: {
    lessonId: string;
    stepIndex: number;
    status: TraceStatus;
    representation: Representation;
  };
  hydrate: (progress: ProgressSnapshot) => void;
  openLesson: (options: OpenLessonOptions) => void;
  setStep: (stepIndex: number, maxStep: number) => void;
  setRepresentation: (representation: Representation) => void;
  setStatus: (status: TraceStatus) => void;
  setSpeed: (speed: number) => void;
  setLessonInput: (lessonId: string, inputId: string, value: number) => void;
  answerChallenge: (lessonId: string, choiceId: string, correct: boolean) => void;
  reviewFlashcard: (flashcardId: string, rating: ReviewRating, now?: Date) => void;
  setTheme: (theme: ThemePreference) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  dismissAchievement: (id: string) => void;
  reset: () => void;
}

function initialStoreState() {
  return {
    ...createEmptyProgress(),
    hydrated: false,
    player: {
      lessonId: "array",
      stepIndex: 0,
      status: "idle" as TraceStatus,
      representation: "abstract" as Representation,
    },
  };
}

export const useTraceStore = create<TraceStore>((set, get) => ({
  ...initialStoreState(),
  hydrate: (progress) =>
    set({
      ...progress,
      hydrated: true,
      player: {
        lessonId: progress.lastLessonId,
        stepIndex: progress.lessonSteps[progress.lastLessonId] ?? 0,
        status: "idle",
        representation:
          progress.lessonRepresentations[progress.lastLessonId] ?? "abstract",
      },
    }),
  openLesson: ({ id, representations, defaultInputs, maxStep }) => {
    const state = get();
    const storedRepresentation = state.lessonRepresentations[id];
    const representation = representations.includes(storedRepresentation)
      ? storedRepresentation
      : representations[0];
    const stepIndex = Math.min(state.lessonSteps[id] ?? 0, maxStep);
    set({
      lastLessonId: id,
      startedLessonIds: state.startedLessonIds.includes(id)
        ? state.startedLessonIds
        : [...state.startedLessonIds, id],
      lessonInputs: state.lessonInputs[id]
        ? state.lessonInputs
        : { ...state.lessonInputs, [id]: defaultInputs },
      player: { lessonId: id, stepIndex, status: "idle", representation },
    });
  },
  setStep: (stepIndex, maxStep) => {
    const state = get();
    const clamped = Math.min(Math.max(stepIndex, 0), maxStep);
    set({
      lessonSteps: { ...state.lessonSteps, [state.player.lessonId]: clamped },
      player: {
        ...state.player,
        stepIndex: clamped,
        status: clamped === maxStep ? "completed" : "paused",
      },
    });
  },
  setRepresentation: (representation) => {
    const state = get();
    set({
      lessonRepresentations: {
        ...state.lessonRepresentations,
        [state.player.lessonId]: representation,
      },
      player: { ...state.player, representation, status: "paused" },
    });
  },
  setStatus: (status) => set((state) => ({ player: { ...state.player, status } })),
  setSpeed: (speed) => set({ speed }),
  setLessonInput: (lessonId, inputId, value) => {
    const state = get();
    const inputs = { ...(state.lessonInputs[lessonId] ?? {}), [inputId]: value };
    set({
      lessonInputs: { ...state.lessonInputs, [lessonId]: inputs },
      lessonSteps: { ...state.lessonSteps, [lessonId]: 0 },
      player:
        state.player.lessonId === lessonId
          ? { ...state.player, stepIndex: 0, status: "idle" }
          : state.player,
    });
  },
  answerChallenge: (lessonId, choiceId, correct) => {
    const state = get();
    const previous = state.challengeAttempts[lessonId];
    const completedLessonIds =
      correct && !state.completedLessonIds.includes(lessonId)
        ? [...state.completedLessonIds, lessonId]
        : state.completedLessonIds;
    const firstCompletion = correct && state.completedLessonIds.length === 0;
    set({
      challengeAttempts: {
        ...state.challengeAttempts,
        [lessonId]: {
          choiceId,
          correct,
          attempts: (previous?.attempts ?? 0) + 1,
        },
      },
      completedLessonIds,
      achievementIds:
        firstCompletion && !state.achievementIds.includes("first-trace")
          ? [...state.achievementIds, "first-trace"]
          : state.achievementIds,
    });
  },
  reviewFlashcard: (flashcardId, rating, now) => {
    const state = get();
    set({
      flashcards: {
        ...state.flashcards,
        [flashcardId]: scheduleReview(state.flashcards[flashcardId], rating, now),
      },
    });
  },
  setTheme: (theme) => set({ theme }),
  setMotionPreference: (motionPreference) => set({ motionPreference }),
  dismissAchievement: (id) => set((state) => ({
    dismissedAchievementIds: state.dismissedAchievementIds.includes(id)
      ? state.dismissedAchievementIds
      : [...state.dismissedAchievementIds, id],
  })),
  reset: () => set(initialStoreState()),
}));

export function selectProgressSnapshot(state: TraceStore): ProgressSnapshot {
  return {
    version: 1,
    lastLessonId: state.lastLessonId,
    lessonSteps: state.lessonSteps,
    lessonRepresentations: state.lessonRepresentations,
    lessonInputs: state.lessonInputs,
    startedLessonIds: state.startedLessonIds,
    completedLessonIds: state.completedLessonIds,
    challengeAttempts: state.challengeAttempts,
    flashcards: state.flashcards,
    achievementIds: state.achievementIds,
    dismissedAchievementIds: state.dismissedAchievementIds,
    theme: state.theme,
    motionPreference: state.motionPreference,
    speed: state.speed,
  };
}

export function resetTraceStoreForTests() {
  useTraceStore.setState({ ...initialStoreState(), hydrated: true });
}
