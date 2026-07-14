import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { LessonDefinition, Representation } from "../../core/trace-engine/types";
import {
  defaultInputsFor,
  difficultyLabels,
  flowSceneForLesson,
  moduleLabels,
  traceForLesson,
} from "../../content/lessons";
import { useReducedMotion } from "../../shared/hooks/useReducedMotion";
import { useTraceStore } from "../../store/useTraceStore";
import { TimelineControls } from "../timeline/TimelineControls";
import { ChallengePanel } from "./ChallengePanel";
import { PredictionPanel } from "./PredictionPanel";
import { TraceCanvas } from "./TraceCanvas";
import { Drawer } from "../drawer/Drawer";
import { FlowScenePlayer } from "../flow-scene/FlowScenePlayer";

const representationLabels: Record<Representation, string> = {
  abstract: "Abstrato",
  practical: "Aplicação prática",
  memory: "Memória",
  code: "Código",
};

interface LessonPlayerProps {
  lesson: LessonDefinition;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const hydrated = useTraceStore((state) => state.hydrated);
  const player = useTraceStore((state) => state.player);
  const speed = useTraceStore((state) => state.speed);
  const storedInputs = useTraceStore((state) => state.lessonInputs[lesson.id]);
  const openLesson = useTraceStore((state) => state.openLesson);
  const setStep = useTraceStore((state) => state.setStep);
  const setStatus = useTraceStore((state) => state.setStatus);
  const setRepresentation = useTraceStore((state) => state.setRepresentation);
  const setSpeed = useTraceStore((state) => state.setSpeed);
  const reducedMotion = useReducedMotion();

  const defaults = useMemo(() => defaultInputsFor(lesson), [lesson]);
  const inputs = storedInputs ?? defaults;
  const trace = useMemo(() => traceForLesson(lesson, inputs), [lesson, inputs]);
  const activePlayer = player.lessonId === lesson.id;
  const representation = activePlayer && lesson.representations.includes(player.representation)
    ? player.representation
    : lesson.representations[0];
  const flowScene = useMemo(
    () => flowSceneForLesson(lesson, inputs, representation),
    [inputs, lesson, representation],
  );
  const maxStep = (flowScene?.steps.length ?? trace.steps.length) - 1;
  const stepIndex = activePlayer ? Math.min(player.stepIndex, maxStep) : 0;
  const traceStepIndex = Math.min(stepIndex, Math.max(0, trace.steps.length - 1));
  const currentStep = trace.steps[traceStepIndex];
  const currentSceneStep = flowScene?.steps[stepIndex];

  useEffect(() => {
    if (!hydrated) return;
    openLesson({
      id: lesson.id,
      representations: lesson.representations,
      defaultInputs: defaults,
      maxStep,
    });
  }, [defaults, hydrated, lesson.id, lesson.representations, maxStep, openLesson]);

  useEffect(() => {
    if (!activePlayer || player.status !== "playing") return;
    if (stepIndex >= maxStep) {
      setStatus("completed");
      return;
    }
    const timer = window.setTimeout(() => {
      const next = stepIndex + 1;
      setStep(next, maxStep);
      if (next < maxStep) setStatus("playing");
    }, 1250 / speed);
    return () => window.clearTimeout(timer);
  }, [activePlayer, maxStep, player.status, reducedMotion, setStatus, setStep, speed, stepIndex]);

  const changeStep = (next: number) => {
    setStatus("paused");
    setStep(next, maxStep);
  };

  const togglePlay = () => {
    if (player.status === "playing") {
      setStatus("paused");
      return;
    }
    if (stepIndex >= maxStep) setStep(0, maxStep);
    setStatus("playing");
  };

  const replay = () => {
    setStep(0, maxStep);
    setStatus("idle");
  };

  const handleKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    const tagName = (event.target as HTMLElement).tagName;
    if (["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(tagName)) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeStep(Math.min(maxStep, stepIndex + 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeStep(Math.max(0, stepIndex - 1));
    } else if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    } else if (/^[1-4]$/.test(event.key)) {
      const next = lesson.representations[Number(event.key) - 1];
      if (next) setRepresentation(next);
    }
  };

  if (!hydrated) {
    return <div className="loading-card" role="status">Recuperando seu último passo…</div>;
  }

  return (
    <article className="lesson-player" tabIndex={0} onKeyDown={handleKeyboard} data-focus={focusMode}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {lesson.title}. Passo {stepIndex} de {maxStep}. {currentSceneStep?.caption ?? currentStep.description}
      </div>

      <header className="lesson-header">
        <div>
          <span className="eyebrow">{moduleLabels[lesson.module]} · {difficultyLabels[lesson.difficulty]}</span>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <div className="example-note">
            <span>{lesson.example.label}</span>
            <p>{lesson.example.note}</p>
          </div>
        </div>
        <span className="event-chip">{currentStep.eventLabel}</span>
      </header>

      <div className="lesson-actions">
        {lesson.comparisonId ? (
          <Link
            className="text-button"
            to={`/app/compare/${lesson.comparisonId}`}
          >
            Comparar com alternativa →
          </Link>
        ) : null}
        {lesson.limitation ? (
          <button
            className="text-button"
            type="button"
            onClick={() => setDrawerOpen(true)}
          >
            Ver limitação
          </button>
        ) : null}
      </div>

      <PredictionPanel lesson={lesson} inputs={inputs} />

      <section className="player-card" aria-label="Visualização da lição">
        <div className="player-toolbar">
          <div className="representation-toggle" role="group" aria-label="Representação">
            {lesson.representations.map((item, index) => (
              <button
                type="button"
                aria-pressed={item === representation}
                key={item}
                onClick={() => setRepresentation(item)}
              >
                {representationLabels[item]}
                <kbd>{index + 1}</kbd>
              </button>
            ))}
          </div>
          <span className="motion-chip">
            {reducedMotion ? "Quadros estáticos" : "Motion ativo"}
          </span>
        </div>

        {flowScene && representation !== "code" ? (
          <FlowScenePlayer
            scene={flowScene}
            stepIndex={stepIndex}
            reducedMotion={reducedMotion}
            speed={speed}
            onStepSelect={changeStep}
          />
        ) : (
          <TraceCanvas
            trace={trace}
            stepIndex={stepIndex}
            representation={representation}
            reducedMotion={reducedMotion}
          />
        )}

        {!flowScene && currentStep.concept ? (
          <section className="concept-panel" aria-label="Conceito em foco">
            <span className="eyebrow">Conceito em foco</span>
            <strong>{currentStep.concept.title}</strong>
            <p>{currentStep.concept.body}</p>
          </section>
        ) : null}

        {reducedMotion ? (
          <ol className="reduced-steps" aria-label="Descrição estática dos passos">
            {trace.steps.map((item, index) => (
              <li aria-current={index === stepIndex ? "step" : undefined} key={item.id}>
                <strong>{item.eventLabel}</strong>
                <span>{item.captions[representation] ?? item.description}</span>
              </li>
            ))}
          </ol>
        ) : null}

        <div className="narration-row">
          <div>
            <span className="eyebrow">{currentStep.eventLabel}</span>
            <p>{currentSceneStep?.caption ?? currentStep.captions[representation] ?? currentStep.description}</p>
          </div>
          <span className="complexity-chip">{currentStep.metrics.complexity}</span>
        </div>

        <TimelineControls
          stepIndex={stepIndex}
          maxStep={maxStep}
          status={player.status}
          speed={speed}
          onStepChange={changeStep}
          onPlayToggle={togglePlay}
          onSpeedChange={setSpeed}
          onReplay={replay}
        />

        <button
          type="button"
          className="text-button"
          aria-pressed={focusMode}
          onClick={() => setFocusMode((v) => !v)}
        >
          {focusMode ? "Sair do modo foco" : "Modo foco →"}
        </button>

        <div className="metrics-grid">
          <div><span>Operações</span><strong>{currentStep.metrics.operations}</strong></div>
          <div><span>Elementos tocados</span><strong>{currentStep.metrics.touched}</strong></div>
          <div><span>Contexto do custo</span><strong>{currentStep.metrics.context}</strong></div>
        </div>
      </section>

      <div className="lesson-layers">
        <section>
          <span className="eyebrow">Problema</span>
          <p>{lesson.explanation.problem}</p>
        </section>
        <section>
          <span className="eyebrow">Modelo mental</span>
          <p>{lesson.explanation.model}</p>
        </section>
        <section>
          <span className="eyebrow">Custo</span>
          <p>{lesson.explanation.cost}</p>
        </section>
        <section>
          <span className="eyebrow">Quando usar</span>
          <p>{lesson.explanation.whenToUse}</p>
        </section>
        <section>
          <span className="eyebrow">Alternativa</span>
          <p>{lesson.explanation.alternative}</p>
        </section>
      </div>

      <ChallengePanel lessonId={lesson.id} challenge={lesson.challenge} representation={representation} />
      {lesson.limitation ? (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          limitation={lesson.limitation}
        />
      ) : null}
    </article>
  );
}
