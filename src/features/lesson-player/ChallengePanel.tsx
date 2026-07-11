import { useState } from "react";
import type { ChallengeDefinition, Representation } from "../../core/trace-engine/types";
import { useTraceStore } from "../../store/useTraceStore";

interface ChallengePanelProps {
  lessonId: string;
  challenge: ChallengeDefinition;
  representation: Representation;
}

export function ChallengePanel({ lessonId, challenge, representation }: ChallengePanelProps) {
  const effective = challenge.byRepresentation?.[representation] ?? challenge;
  const storedAttempt = useTraceStore((state) => state.challengeAttempts[lessonId]);
  const answerChallenge = useTraceStore((state) => state.answerChallenge);
  const [feedback, setFeedback] = useState(
    storedAttempt?.correct ? effective.success : "Observe o trace antes de responder.",
  );

  return (
    <section className="challenge-panel" aria-labelledby={`${lessonId}-challenge`}>
      <div>
        <span className="eyebrow">Desafio de compreensão</span>
        <h2 id={`${lessonId}-challenge`}>{effective.question}</h2>
        <p>{effective.hint}</p>
      </div>
      <div className="challenge-options">
        {effective.choices.map((choice) => {
          const selected = storedAttempt?.choiceId === choice.id;
          const state = selected ? (choice.correct ? "correct" : "wrong") : "idle";
          return (
            <button
              type="button"
              data-answer-state={state}
              disabled={storedAttempt?.correct}
              key={choice.id}
              onClick={() => {
                answerChallenge(lessonId, choice.id, choice.correct);
                setFeedback(choice.correct ? effective.success : "Ainda não. Use a dica e reveja o passo decisivo.");
              }}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
      <p className="challenge-feedback" role="status">
        {feedback}
      </p>
    </section>
  );
}
