import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useTraceStore } from "../../store/useTraceStore";
import { FlashcardsPanel } from "./FlashcardsPanel";

describe("FlashcardsPanel", () => {
  it("vira e agenda um dos três cards", async () => {
    const user = userEvent.setup();
    render(<FlashcardsPanel />);

    await user.click(screen.getByRole("button", { name: /Frente do flashcard/ }));
    expect(screen.getByText(/O\(n\) no pior caso/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aprendi" }));

    expect(useTraceStore.getState().flashcards["array-insert-cost"].box).toBe(1);
    expect(screen.getByText(/Quando uma busca linear pode parar/)).toBeInTheDocument();
  });

  it("mostra nenhum card vencido quando todos foram revisados hoje", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    useTraceStore.setState({
      flashcards: {
        "array-insert-cost": { box: 1, dueAt: future, lastReviewedAt: future, reviews: 1 },
        "linear-search-stop": { box: 2, dueAt: future, lastReviewedAt: future, reviews: 2 },
        "reference-mutation": { box: 1, dueAt: future, lastReviewedAt: future, reviews: 1 },
      },
    });

    render(<FlashcardsPanel />);
    expect(screen.getByText("Nenhum card vencido.")).toBeInTheDocument();
  });

  it("continua navegável ao revisar um card intermediário da fila", async () => {
    const user = userEvent.setup();
    useTraceStore.setState({
      flashcards: {},
    });

    render(<FlashcardsPanel />);

    await user.click(screen.getByRole("button", { name: "Abrir card 2" }));
    await user.click(screen.getByRole("button", { name: /Frente do flashcard/ }));
    await user.click(screen.getByRole("button", { name: "Aprendi" }));

    expect(screen.getByText(/Qual é o custo de inserir no meio de um array/)).toBeInTheDocument();
  });
});
