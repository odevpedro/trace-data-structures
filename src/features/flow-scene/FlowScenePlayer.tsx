import type { FlowSceneDefinition, FlowSceneLegendItem } from "../../core/flow-scene/types";
import { FlowSceneCanvas } from "./FlowSceneCanvas";
import { FlowConceptPanel } from "./FlowConceptPanel";

const defaultLegend: FlowSceneLegendItem[] = [
  { semantic: "request", label: "Requisição" },
  { semantic: "response", label: "Resposta" },
  { semantic: "processing", label: "Processamento" },
  { semantic: "storage", label: "Persistência" },
];

interface FlowScenePlayerProps {
  scene: FlowSceneDefinition;
  stepIndex: number;
  reducedMotion: boolean;
  speed: number;
  onStepSelect: (stepIndex: number) => void;
}

export function FlowScenePlayer({
  scene,
  stepIndex,
  reducedMotion,
  speed,
  onStepSelect,
}: FlowScenePlayerProps) {
  const currentStep = scene.steps[Math.min(Math.max(stepIndex, 0), scene.steps.length - 1)];
  const legend = scene.legend ?? defaultLegend;

  return (
    <div className="flow-scene-shell">
      <FlowSceneCanvas
        scene={scene}
        stepIndex={stepIndex}
        reducedMotion={reducedMotion}
        speed={speed}
      />
      <div className="flow-scene-shell__meta">
        <div className="flow-scene-shell__legend" aria-label="Legenda da cena">
          {legend.map((item) => (
            <span key={`${scene.id}-${item.semantic}-${item.label}`} className="flow-legend-item">
              <i data-semantic={item.semantic} />
              {item.label}
            </span>
          ))}
        </div>
        <div className="flow-scene-progress" aria-hidden="true">
          <span
            className="flow-scene-progress__value"
            style={{ width: `${((stepIndex + 1) / scene.steps.length) * 100}%` }}
          />
        </div>
        <div className="flow-scene-timeline" aria-label="Etapas da cena">
          {scene.steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className="flow-step-chip"
              data-active={index === stepIndex}
              data-done={index < stepIndex}
              onClick={() => onStepSelect(index)}
            >
              <span className="flow-step-chip__number">{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
            </button>
          ))}
        </div>
      </div>
      <FlowConceptPanel concept={currentStep.concept} />
    </div>
  );
}
