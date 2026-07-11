import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { lessonById } from "../../content/lessons";
import { resetTraceStoreForTests, useTraceStore } from "../../store/useTraceStore";
import { LessonPlayer } from "./LessonPlayer";

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe("LessonPlayer", () => {
  beforeEach(() => resetTraceStoreForTests());

  it("troca de representação sem perder o passo da timeline", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LessonPlayer lesson={lessonById.array} />);

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(screen.getByLabelText("Passo 1 de 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Aplicação prática/ }));
    expect(screen.getByLabelText("Passo 1 de 4")).toBeInTheDocument();
    expect(screen.getByText("Fotos abre a última posição.")).toBeInTheDocument();
  });

  it("oferece teclado e atualiza a descrição acessível do passo", () => {
    renderWithRouter(<LessonPlayer lesson={lessonById["linear-search"]} />);
    const player = screen.getByRole("article");
    player.focus();
    fireEvent.keyDown(player, { key: "ArrowRight" });

    expect(screen.getByLabelText("Passo 1 de 4")).toBeInTheDocument();
    expect(screen.getAllByText(/A primeira comparação falha/).length).toBeGreaterThan(0);
  });

  it("reinicia o trace ao manipular a entrada de controle de fluxo", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LessonPlayer lesson={lessonById["condition-if"]} />);
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(useTraceStore.getState().player.stepIndex).toBe(1);

    const input = screen.getByRole("spinbutton", { name: "Idade" });
    await user.clear(input);
    await user.type(input, "21");

    expect(useTraceStore.getState().player.stepIndex).toBe(0);
    expect(useTraceStore.getState().lessonInputs["condition-if"].age).toBe(21);
  });

  it("desbloqueia uma conquista somente ao acertar um desafio", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LessonPlayer lesson={lessonById.array} />);

    await user.click(screen.getByRole("button", { name: "Para preservar todos os valores" }));

    expect(useTraceStore.getState().completedLessonIds).toContain("array");
    expect(useTraceStore.getState().achievementIds).toContain("first-trace");
  });
});
