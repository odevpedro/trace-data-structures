import { useEffect, useMemo, useRef, useState } from "react";
import { reduceFlowScene } from "../../core/flow-scene/reduceFlowScene";
import type { FlowSceneDefinition } from "../../core/flow-scene/types";
import { PipelineSceneRenderer, pipelineFocusStyle } from "./renderers/PipelineSceneRenderer";
import { QueueSceneRenderer } from "./renderers/QueueSceneRenderer";
import { TreeSceneRenderer } from "./renderers/TreeSceneRenderer";
import { graphFocusStyle, WeightedGraphSceneRenderer } from "./renderers/WeightedGraphSceneRenderer";

interface FlowSceneCanvasProps {
  scene: FlowSceneDefinition;
  stepIndex: number;
  reducedMotion: boolean;
  speed: number;
}

export function FlowSceneCanvas({
  scene,
  stepIndex,
  reducedMotion,
  speed,
}: FlowSceneCanvasProps) {
  const stageRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const snapshot = useMemo(() => reduceFlowScene(scene, stepIndex), [scene, stepIndex]);
  const currentStep = scene.steps[Math.min(Math.max(stepIndex, 0), scene.steps.length - 1)];
  const mobile = size.width > 0 && size.width <= 560;
  const sceneKind = scene.sceneKind ?? "pipeline";
  const treeScene = scene.sceneKind === "tree" ? scene : null;
  const queueScene = scene.sceneKind === "queue" ? scene : null;
  const graphScene = scene.sceneKind === "graph" ? scene : null;
  const pipelineScene = scene.sceneKind === "tree" || scene.sceneKind === "queue" || scene.sceneKind === "graph" ? null : scene;
  const bubbleStyle = pipelineScene
    ? pipelineFocusStyle(
      pipelineScene,
      size.width || 640,
      size.height || 380,
      mobile,
      currentStep.focusNodeId,
    )
    : graphScene
      ? graphFocusStyle(
        graphScene,
        size.width || 640,
        size.height || 420,
        mobile,
        currentStep.focusNodeId,
      )
      : undefined;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const rect = stage.getBoundingClientRect();
      setSize({
        width: Math.max(300, rect.width),
        height: Math.max(320, rect.height),
      });
    };

    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={stageRef}
      className="flow-scene"
      data-mobile={mobile}
      data-reduced-motion={reducedMotion}
      data-scene-kind={sceneKind}
      aria-label={scene.title}
      tabIndex={0}
    >
      {treeScene ? (
        <TreeSceneRenderer
          scene={treeScene}
          snapshot={snapshot}
          width={size.width || 640}
          height={size.height || 420}
          mobile={mobile}
        />
      ) : null}

      {queueScene ? (
        <QueueSceneRenderer
          scene={queueScene}
          snapshot={snapshot}
          width={size.width || 640}
          height={size.height || 420}
          mobile={mobile}
        />
      ) : null}

      {graphScene ? (
        <WeightedGraphSceneRenderer
          scene={graphScene}
          snapshot={snapshot}
          width={size.width || 640}
          height={size.height || 420}
          mobile={mobile}
        />
      ) : null}

      {pipelineScene ? (
        <PipelineSceneRenderer
          scene={pipelineScene}
          snapshot={snapshot}
          width={size.width || 640}
          height={size.height || 380}
          mobile={mobile}
          reducedMotion={reducedMotion}
          speed={speed}
          stepKey={currentStep.id}
        />
      ) : null}

      <aside className="flow-scene__bubble" style={bubbleStyle} aria-hidden="true">
        <span className="flow-scene__bubble-kicker">Etapa {stepIndex + 1} de {scene.steps.length}</span>
        <strong>{currentStep.concept.title}</strong>
        <p>{currentStep.concept.bubble}</p>
      </aside>

      <div className="flow-scene__caption" aria-hidden="true">
        <span className="eyebrow">Trace</span>
        <strong>{currentStep.title}</strong>
        <p>{currentStep.caption}</p>
      </div>

      <figcaption className="sr-only">{currentStep.caption}</figcaption>
    </figure>
  );
}
