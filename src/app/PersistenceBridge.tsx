import { useEffect } from "react";
import type { ProgressRepository } from "../storage/progressRepository";
import { selectProgressSnapshot, useTraceStore } from "../store/useTraceStore";

interface PersistenceBridgeProps {
  repository: ProgressRepository;
}

export function PersistenceBridge({ repository }: PersistenceBridgeProps) {
  useEffect(() => {
    let cancelled = false;
    let saveTimer: number | undefined;
    let unsubscribe: (() => void) | undefined;

    repository
      .load()
      .then((progress) => {
        if (cancelled) return;
        useTraceStore.getState().hydrate(progress);
        unsubscribe = useTraceStore.subscribe((state) => {
          if (!state.hydrated) return;
          window.clearTimeout(saveTimer);
          saveTimer = window.setTimeout(() => {
            void repository.save(selectProgressSnapshot(useTraceStore.getState()));
          }, 120);
        });
      })
      .catch(() => {
        if (!cancelled) {
          useTraceStore.getState().hydrate({
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
          });
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(saveTimer);
      unsubscribe?.();
    };
  }, [repository]);

  return null;
}
