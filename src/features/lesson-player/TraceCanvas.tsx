import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { reduceTrace, traceStepAt } from "../../core/trace-engine/reduceTrace";
import type {
  Representation,
  SceneNodeState,
  TraceDefinition,
} from "../../core/trace-engine/types";

interface TraceCanvasProps {
  trace: TraceDefinition;
  stepIndex: number;
  representation: Representation;
  reducedMotion: boolean;
}

const SCENE_WIDTH = 640;
const SCENE_HEIGHT = 360;

function nodeLabel(node: SceneNodeState, representation: Representation) {
  const fallback = node.labels.abstract ?? node.id;
  const label = node.labels[representation] ?? fallback;
  if (node.value === undefined) return label;
  const prefix = node.valueLabels?.[representation] ?? node.valueLabels?.abstract;
  return prefix ? `${prefix}${String(node.value)}` : label;
}

function conceptBubblePosition(
  node: SceneNodeState,
  placement: "top" | "right" | "bottom" | "left",
) {
  const bubbleWidth = 220;
  const bubbleHeight = 108;
  const gap = 18;
  const centerX = node.position.x + node.width / 2;
  const centerY = node.position.y + node.height / 2;

  switch (placement) {
    case "left":
      return {
        left: Math.max(12, node.position.x - bubbleWidth - gap),
        top: Math.max(12, centerY - bubbleHeight / 2),
      };
    case "right":
      return {
        left: Math.min(SCENE_WIDTH - bubbleWidth - 12, node.position.x + node.width + gap),
        top: Math.max(12, centerY - bubbleHeight / 2),
      };
    case "bottom":
      return {
        left: Math.min(SCENE_WIDTH - bubbleWidth - 12, Math.max(12, centerX - bubbleWidth / 2)),
        top: Math.min(SCENE_HEIGHT - bubbleHeight - 12, node.position.y + node.height + gap),
      };
    case "top":
    default:
      return {
        left: Math.min(SCENE_WIDTH - bubbleWidth - 12, Math.max(12, centerX - bubbleWidth / 2)),
        top: Math.max(12, node.position.y - bubbleHeight - gap),
      };
  }
}

export function TraceCanvas({
  trace,
  stepIndex,
  representation,
  reducedMotion,
}: TraceCanvasProps) {
  const stageRef = useRef<HTMLElement>(null);
  const [sceneScale, setSceneScale] = useState(1);
  const scene = useMemo(() => reduceTrace(trace, stepIndex), [trace, stepIndex]);
  const currentStep = traceStepAt(trace, stepIndex);
  const conceptTarget = currentStep.concept?.target ? scene.nodes[currentStep.concept.target] : undefined;
  const conceptPosition = currentStep.concept && conceptTarget
    ? conceptBubblePosition(conceptTarget, currentStep.concept.placement ?? "top")
    : undefined;

  useEffect(() => {
    if (representation === "code") {
      const currentLine = stageRef.current?.querySelector<HTMLElement>(".is-current");
      currentLine?.scrollIntoView?.({ block: "nearest" });
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const updateScale = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(rect.width - 24, 280);
      const height = Math.max(rect.height - 30, 220);
      setSceneScale(Math.min(1, width / SCENE_WIDTH, height / SCENE_HEIGHT));
    };

    updateScale();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [representation, stepIndex, trace.id]);

  if (representation === "code" && trace.code) {
    return (
      <figure
        ref={stageRef}
        className="code-stage"
        aria-label="Código sincronizado com a execução"
        tabIndex={0}
      >
        <ol className="code-lines">
          {trace.code.map((line, index) => (
            <li
              className={index === currentStep.codeLine ? "is-current" : ""}
              key={`${index}-${line}`}
            >
              <code>{line || " "}</code>
            </li>
          ))}
        </ol>
        <figcaption className="sr-only">{currentStep.description}</figcaption>
      </figure>
    );
  }

  return (
    <figure
      ref={stageRef}
      className="trace-stage"
      data-reduced-motion={reducedMotion}
      aria-label={`Cena no modo ${representation}`}
      style={{ "--scene-scale": String(sceneScale) } as CSSProperties}
      tabIndex={0}
    >
      <div className="trace-stage__canvas" aria-hidden="true">
        {Object.values(scene.edges).map((edge) => {
          const from = scene.nodes[edge.from];
          const to = scene.nodes[edge.to];
          const x1 = from.position.x + from.width / 2;
          const y1 = from.position.y + from.height / 2;
          const x2 = to.position.x + to.width / 2;
          const y2 = to.position.y + to.height / 2;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.hypot(dx, dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <span
              className="trace-edge"
              data-directed={edge.directed}
              data-emphasis={edge.emphasis}
              key={edge.id}
              style={{
                width: length,
                opacity: edge.visible ? 1 : 0,
                transform: `translate3d(${x1}px, ${y1}px, 0) rotate(${angle}deg)`,
              }}
            />
          );
        })}

        {Object.values(scene.nodes).map((sceneNode) => (
          <span
            className="trace-node"
            data-kind={sceneNode.kind}
            data-emphasis={sceneNode.emphasis}
            data-node-id={sceneNode.id}
            key={sceneNode.id}
            style={{
              width: sceneNode.width,
              height: sceneNode.height,
              opacity: sceneNode.visible ? 1 : 0,
              transform: `translate3d(${sceneNode.position.x}px, ${sceneNode.position.y}px, 0)`,
            }}
          >
            <span
              className="trace-node__body"
              data-visible={sceneNode.visible}
            >
              {nodeLabel(sceneNode, representation)}
            </span>
          </span>
        ))}
      </div>
      {currentStep.concept && conceptTarget && conceptPosition ? (
        <div
          aria-hidden="true"
          className="trace-stage__overlay"
          style={{ "--scene-scale": String(sceneScale) } as CSSProperties}
        >
          <aside
            className="trace-concept-bubble"
            data-placement={currentStep.concept.placement ?? "top"}
            style={{
              left: conceptPosition.left,
              top: conceptPosition.top,
            }}
          >
            <strong>{currentStep.concept.title}</strong>
            <p>{currentStep.concept.body}</p>
          </aside>
        </div>
      ) : null}
      <figcaption className="sr-only">{currentStep.description}</figcaption>
    </figure>
  );
}
