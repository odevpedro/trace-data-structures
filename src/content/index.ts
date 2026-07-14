import { lessons, moduleLabels as origModuleLabels, difficultyLabels } from "./lessons";
import { linearLessons } from "./linear";
import { indexedLessons } from "./indexed";
import { hierarchicalLessons } from "./hierarchical";
import { graphLessons } from "./graphs";
import { systemsLessons } from "./systems";
import { backendLessons } from "./backend";
import { createGeneratedFlowScene } from "./generatedFlowScenes";
import type { LessonDefinition, Representation } from "../core/trace-engine/types";
import type { FlowSceneDefinition } from "../core/flow-scene/types";

export const learningPath: LessonDefinition[] = [
  ...lessons,
  ...linearLessons,
  ...indexedLessons,
  ...hierarchicalLessons,
  ...graphLessons,
  ...systemsLessons,
  ...backendLessons,
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

export function flowSceneForLesson(
  lesson: LessonDefinition,
  inputs: Record<string, number>,
  representation: Representation,
): FlowSceneDefinition | undefined {
  const explicitFlowScene = lesson.createFlowScene?.(inputs, representation) ?? lesson.flowScene;
  if (explicitFlowScene) return explicitFlowScene;
  const trace = traceForLesson(lesson, inputs);
  return createGeneratedFlowScene(lesson, trace, representation);
}
