import { useMemo, useState } from "react";
import { flashcards } from "../../content/flashcards";
import type { ReviewRating } from "../../core/progress/types";
import { useReducedMotion } from "../../shared/hooks/useReducedMotion";
import { useTraceStore } from "../../store/useTraceStore";

const ratingLabels: Record<ReviewRating, string> = {
  again: "Rever em 10 min",
  hard: "Difícil · amanhã",
  good: "Aprendi",
};

export function FlashcardsPanel() {
  const progress = useTraceStore((state) => state.flashcards);
  const reviewFlashcard = useTraceStore((state) => state.reviewFlashcard);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcards[index];
  const reviewed = useMemo(
    () => flashcards.filter((item) => progress[item.id]?.reviews).length,
    [progress],
  );

  const rate = (rating: ReviewRating) => {
    reviewFlashcard(card.id, rating);
    setFlipped(false);
    setIndex((current) => (current + 1) % flashcards.length);
  };

  return (
    <section className="review-shell" aria-labelledby="review-title">
      <header className="page-hero">
        <div>
          <span className="eyebrow">Revisão espaçada · sessão curta</span>
          <h1 id="review-title">Consolide o que acabou de observar.</h1>
          <p>Três cards derivados das lições. Sua avaliação define quando cada um volta.</p>
        </div>
        <span className="progress-number">{reviewed} / {flashcards.length} revisados</span>
      </header>

      <div className="flashcard-wrap">
        <button
          className="flashcard"
          type="button"
          data-flipped={flipped}
          data-reduced-motion={reducedMotion}
          aria-label={flipped ? "Verso do flashcard. Ativar para voltar." : "Frente do flashcard. Ativar para revelar."}
          onClick={() => setFlipped((value) => !value)}
        >
          <span className="flashcard__meta">
            {card.kind} · {String(index + 1).padStart(2, "0")}
          </span>
          <strong>{flipped ? card.back : card.front}</strong>
          <span className="flashcard__hint">{flipped ? "Avalie sua lembrança" : "Clique para revelar"}</span>
        </button>

        <div className="flashcard-dots" aria-label={`Card ${index + 1} de ${flashcards.length}`}>
          {flashcards.map((item, itemIndex) => (
            <button
              type="button"
              aria-label={`Abrir card ${itemIndex + 1}`}
              aria-current={itemIndex === index}
              key={item.id}
              onClick={() => {
                setIndex(itemIndex);
                setFlipped(false);
              }}
            />
          ))}
        </div>

        {flipped ? (
          <div className="review-ratings" aria-label="Avaliar lembrança">
            {(Object.keys(ratingLabels) as ReviewRating[]).map((rating) => (
              <button className="text-button" type="button" key={rating} onClick={() => rate(rating)}>
                {ratingLabels[rating]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="review-note">
        <strong>Como a agenda funciona</strong>
        <p>“Aprendi” aumenta o intervalo; “Difícil” volta amanhã; “Rever” retorna em dez minutos. Os dados ficam no IndexedDB deste navegador.</p>
      </aside>
    </section>
  );
}
