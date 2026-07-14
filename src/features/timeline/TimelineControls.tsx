import type { TraceStatus } from "../../core/trace-engine/types";

interface TimelineControlsProps {
  stepIndex: number;
  maxStep: number;
  status: TraceStatus;
  speed: number;
  onStepChange: (step: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onReplay?: () => void;
}

export function TimelineControls({
  stepIndex,
  maxStep,
  status,
  speed,
  onStepChange,
  onPlayToggle,
  onSpeedChange,
  onReplay,
}: TimelineControlsProps) {
  const playing = status === "playing";

  return (
    <div className="timeline" aria-label="Controles da linha do tempo">
      <div className="timeline__buttons">
        <button
          className="icon-button"
          type="button"
          aria-label="Passo anterior"
          disabled={stepIndex === 0}
          onClick={() => onStepChange(stepIndex - 1)}
        >
          ←
        </button>
        <button
          className="icon-button icon-button--primary"
          type="button"
          aria-label={playing ? "Pausar" : "Reproduzir"}
          aria-pressed={playing}
          onClick={onPlayToggle}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Próximo passo"
          disabled={stepIndex === maxStep}
          onClick={() => onStepChange(stepIndex + 1)}
        >
          →
        </button>
        {onReplay ? (
          <button
            className="icon-button"
            type="button"
            aria-label="Reiniciar"
            onClick={onReplay}
          >
            ↺
          </button>
        ) : null}
      </div>

      <label className="timeline__range">
        <span className="sr-only">Passo da linha do tempo</span>
        <input
          type="range"
          min="0"
          max={maxStep}
          value={stepIndex}
          onChange={(event) => onStepChange(Number(event.target.value))}
        />
      </label>

      <span className="timeline__count" aria-label={`Passo ${stepIndex} de ${maxStep}`}>
        {String(stepIndex).padStart(2, "0")} / {String(maxStep).padStart(2, "0")}
      </span>

      <label className="speed-control">
        <span>Velocidade</span>
        <select value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))}>
          <option value={0.75}>0,75×</option>
          <option value={1}>1×</option>
          <option value={1.5}>1,5×</option>
        </select>
      </label>
    </div>
  );
}
