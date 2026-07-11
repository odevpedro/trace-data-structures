import { lessons, moduleLabels as origModuleLabels, difficultyLabels } from "./lessons";
import { linearLessons } from "./linear";
import { indexedLessons } from "./indexed";
import { hierarchicalLessons } from "./hierarchical";
import { graphLessons } from "./graphs";
import { systemsLessons } from "./systems";
import type { LessonDefinition } from "../core/trace-engine/types";

export const learningPath: LessonDefinition[] = [
  ...lessons,
  ...linearLessons,
  ...indexedLessons,
  ...hierarchicalLessons,
  ...graphLessons,
  ...systemsLessons,
];

export const lessonById = Object.fromEntries(
  learningPath.map((lesson) => [lesson.id, lesson]),
) as Record<string, LessonDefinition>;

export const moduleLabels: Record<LessonDefinition["module"], string> = {
  ...origModuleLabels,
};

export { difficultyLabels };

export function defaultInputsFor(lesson: LessonDefinition) {
  return Object.fromEntries(
    (lesson.controls ?? []).map((control) => [control.id, control.defaultValue]),
  );
}

export function traceForLesson(
  lesson: LessonDefinition,
  inputs: Record<string, number>,
) {
  return lesson.createTrace?.(inputs) ?? lesson.trace;
}
