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
    expect(screen.getByText(/Ao mutar um objeto/)).toBeInTheDocument();
  });
});
