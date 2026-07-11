import { useEffect, useState } from "react";
import type { LessonDefinition } from "../../core/trace-engine/types";
import { useTraceStore } from "../../store/useTraceStore";

interface PredictionPanelProps {
  lesson: LessonDefinition;
  inputs: Record<string, number>;
}

export function PredictionPanel({ lesson, inputs }: PredictionPanelProps) {
  const setLessonInput = useTraceStore((state) => state.setLessonInput);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setPrediction(null);
    setResult(null);
  }, [lesson.id, inputs]);

  if (!lesson.controls?.length && !lesson.prediction) return null;

  return (
    <section className="prediction-panel" aria-label="Laboratório de previsão">
      <div className="input-controls">
        {lesson.controls?.map((control) => (
          <label key={control.id}>
            <span>{control.label}</span>
            <input
              type="number"
              min={control.min}
              max={control.max}
              value={inputs[control.id] ?? control.defaultValue}
              onChange={(event) => {
                const next = Math.min(
                  control.max,
                  Math.max(control.min, Number(event.target.value)),
                );
                setLessonInput(lesson.id, control.id, next);
              }}
            />
          </label>
        ))}
      </div>
      {lesson.prediction ? (
        <div className="prediction-question">
          <strong>{lesson.prediction.prompt}</strong>
          <div>
            {lesson.prediction.options.map((option) => (
              <button
                className="text-button"
                type="button"
                aria-pressed={prediction === option.id}
                key={option.id}
                onClick={() => {
                  setPrediction(option.id);
                  setResult(
                    option.id === lesson.prediction?.evaluate(inputs)
                      ? "Previsão correta. Agora confirme no trace."
                      : "Hipótese registrada. Avance e compare com a execução.",
                  );
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          {result ? <span role="status">{result}</span> : null}
        </div>
      ) : null}
    </section>
  );
}
