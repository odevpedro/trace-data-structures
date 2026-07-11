import { useMemo } from "react";
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

function nodeLabel(node: SceneNodeState, representation: Representation) {
  const fallback = node.labels.abstract ?? node.id;
  const label = node.labels[representation] ?? fallback;
  if (node.value === undefined) return label;
  const prefix = node.valueLabels?.[representation] ?? node.valueLabels?.abstract;
  return prefix ? `${prefix}${String(node.value)}` : label;
}

export function TraceCanvas({
  trace,
  stepIndex,
  representation,
  reducedMotion,
}: TraceCanvasProps) {
  const scene = useMemo(() => reduceTrace(trace, stepIndex), [trace, stepIndex]);
  const currentStep = traceStepAt(trace, stepIndex);

  if (representation === "code" && trace.code) {
    return (
      <figure className="code-stage" aria-label="Código sincronizado com a execução">
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
      className="trace-stage"
      data-reduced-motion={reducedMotion}
      aria-label={`Cena no modo ${representation}`}
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
              transform: `translate3d(${sceneNode.position.x}px, ${sceneNode.position.y}px, 0) scale(${sceneNode.visible ? 1 : 0.86})`,
            }}
          >
            {nodeLabel(sceneNode, representation)}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">{currentStep.description}</figcaption>
    </figure>
  );
}
