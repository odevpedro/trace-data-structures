import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { comparisonById } from "../content/comparisons";
import { lessonById, traceForLesson, defaultInputsFor } from "../content";
import type { TraceStatus } from "../core/trace-engine/types";
import { TraceCanvas } from "../features/lesson-player/TraceCanvas";
import { TimelineControls } from "../features/timeline/TimelineControls";
import { useReducedMotion } from "../shared/hooks/useReducedMotion";

export function ComparePage() {
  const { comparisonId = "" } = useParams();
  const definition = comparisonById[comparisonId];
  const reducedMotion = useReducedMotion();
  const representation = definition?.representation ?? "abstract";

  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<TraceStatus>("idle");
  const [speed, setSpeed] = useState(1);

  if (!definition) return <Navigate replace to="/app/learn" />;

  const lessonA = lessonById[definition.lessonIdA];
  const lessonB = lessonById[definition.lessonIdB];
  if (!lessonA || !lessonB) return <Navigate replace to="/app/learn" />;

  const traceA = definition.traceA ?? traceForLesson(lessonA, defaultInputsFor(lessonA));
  const traceB = definition.traceB ?? traceForLesson(lessonB, defaultInputsFor(lessonB));
  const maxStep = Math.max(traceA.steps.length, traceB.steps.length) - 1;
  const stepIndexA = Math.min(stepIndex, traceA.steps.length - 1);
  const stepIndexB = Math.min(stepIndex, traceB.steps.length - 1);

  const stepA = traceA.steps[stepIndexA];
  const stepB = traceB.steps[stepIndexB];

  const handleStep = (next: number) => {
    setStatus("paused");
    setStepIndex(Math.min(next, maxStep));
  };

  const togglePlay = () => {
    if (status === "playing") {
      setStatus("paused");
      return;
    }
    if (stepIndex >= maxStep) setStepIndex(0);
    setStatus("playing");
  };

  const replay = () => {
    setStepIndex(0);
    setStatus("idle");
  };

  useEffect(() => {
    if (status !== "playing") return;
    if (stepIndex >= maxStep) {
      setStatus("completed");
      return;
    }
    const timer = window.setTimeout(() => {
      const next = stepIndex + 1;
      handleStep(next);
      if (next < maxStep) setStatus("playing");
    }, 1250 / speed);
    return () => window.clearTimeout(timer);
  }, [status, stepIndex, maxStep, speed]);

  return (
    <main className="compare-page">
      <nav className="lesson-breadcrumb" aria-label="Navegação da comparação">
        <Link to="/app/learn">Jornada</Link>
        <span>/</span>
        <span>{definition.title}</span>
      </nav>

      <header className="compare-header">
        <h1>{definition.title}</h1>
        <p>
          <strong>{definition.labelA}</strong> vs{" "}
          <strong>{definition.labelB}</strong>
        </p>
        {definition.description ? <p>{definition.description}</p> : null}
      </header>

      <div className="compare-stages">
        <section className="compare-stage" aria-label={definition.labelA}>
          <div className="compare-stage-header">
            <span className="compare-stage-label">{definition.labelA}</span>
            <span className="event-chip">{stepA?.eventLabel}</span>
          </div>
          <TraceCanvas
            trace={traceA}
            stepIndex={stepIndexA}
            representation={representation}
            reducedMotion={reducedMotion}
          />
          <div className="narration-row">
            <p>
              {stepA?.captions[representation] ?? stepA?.description}
            </p>
            <span className="complexity-chip">{stepA?.metrics.complexity}</span>
          </div>
          <div className="metrics-grid">
            <div>
              <span>Operações</span>
              <strong>{stepA?.metrics.operations}</strong>
            </div>
            <div>
              <span>Tocados</span>
              <strong>{stepA?.metrics.touched}</strong>
            </div>
          </div>
        </section>

        <section className="compare-stage" aria-label={definition.labelB}>
          <div className="compare-stage-header">
            <span className="compare-stage-label">{definition.labelB}</span>
            <span className="event-chip">{stepB?.eventLabel}</span>
          </div>
          <TraceCanvas
            trace={traceB}
            stepIndex={stepIndexB}
            representation={representation}
            reducedMotion={reducedMotion}
          />
          <div className="narration-row">
            <p>
              {stepB?.captions[representation] ?? stepB?.description}
            </p>
            <span className="complexity-chip">{stepB?.metrics.complexity}</span>
          </div>
          <div className="metrics-grid">
            <div>
              <span>Operações</span>
              <strong>{stepB?.metrics.operations}</strong>
            </div>
            <div>
              <span>Tocados</span>
              <strong>{stepB?.metrics.touched}</strong>
            </div>
          </div>
        </section>
      </div>

      <TimelineControls
        stepIndex={stepIndex}
        maxStep={maxStep}
        status={status}
        speed={speed}
        onStepChange={handleStep}
        onPlayToggle={togglePlay}
        onSpeedChange={setSpeed}
        onReplay={replay}
      />

      <div className="compare-summary">
        <div
          className={`compare-card${definition.summaryResult === "good-left" ? " compare-card--good" : ""}`}
        >
          <strong>{definition.labelA}</strong>
          <p>{definition.summaryA}</p>
        </div>
        <div
          className={`compare-card${definition.summaryResult === "good-right" ? " compare-card--good" : ""}`}
        >
          <strong>{definition.labelB}</strong>
          <p>{definition.summaryB}</p>
        </div>
      </div>
    </main>
  );
}
