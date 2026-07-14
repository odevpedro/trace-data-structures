import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { lessonById } from "../../content/lessons";
import { backendLessons } from "../../content/backend";
import { graphLessons } from "../../content/graphs";
import { systemsLessons } from "../../content/systems";
import { resetTraceStoreForTests, useTraceStore } from "../../store/useTraceStore";
import { LessonPlayer } from "./LessonPlayer";

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe("LessonPlayer", () => {
  beforeEach(() => resetTraceStoreForTests());

  it("troca de representação sem perder o passo da timeline", async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<LessonPlayer lesson={lessonById.array} />);

    expect(container.querySelector(".flow-scene")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(screen.getByLabelText("Passo 1 de 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Aplicação prática/ }));
    expect(screen.getByLabelText("Passo 1 de 4")).toBeInTheDocument();
    expect(screen.getAllByText("Fotos abre a última posição.").length).toBeGreaterThan(0);
  });

  it("gera automaticamente uma cena linear para uma lição antiga sem cena manual", () => {
    const { container } = renderWithRouter(<LessonPlayer lesson={lessonById["linked-list"]} />);

    expect(container.querySelector(".flow-scene")).not.toBeNull();
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Observar");
  });

  it("oferece teclado e atualiza a descrição acessível do passo", () => {
    renderWithRouter(<LessonPlayer lesson={lessonById["linear-search"]} />);
    const player = screen.getByRole("article");
    player.focus();
    fireEvent.keyDown(player, { key: "ArrowRight" });

    expect(screen.getByLabelText("Passo 1 de 4")).toBeInTheDocument();
    expect(screen.getAllByText(/4 não é 12/i).length).toBeGreaterThan(0);
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

  it("aplica a cena linear ao loop for e reinicia ao mudar o limite", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LessonPlayer lesson={lessonById["for-loop"]} />);

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Inicialização do loop");

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(useTraceStore.getState().player.stepIndex).toBe(1);

    const input = screen.getByRole("spinbutton", { name: "Número de repetições" });
    await user.clear(input);
    await user.type(input, "5");

    expect(useTraceStore.getState().player.stepIndex).toBe(0);
    expect(useTraceStore.getState().lessonInputs["for-loop"].limit).toBe(5);
    expect(screen.getByText("E se o limite mudasse?")).toBeInTheDocument();
  });

  it("aplica a cena linear à busca e permite testar alvo ausente", async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<LessonPlayer lesson={lessonById["linear-search"]} />);

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Buscar não é o mesmo que já saber a posição");

    const input = screen.getByRole("spinbutton", { name: "Valor alvo" });
    await user.clear(input);
    await user.type(input, "20");

    expect(useTraceStore.getState().lessonInputs["linear-search"].target).toBe(20);

    for (let index = 0; index < 5; index += 1) {
      await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    }

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Retorno de ausência");
    expect(container.querySelector('.flow-packet[data-semantic="result"]')).not.toBeNull();
  });

  it("aplica a linguagem visual linear ao if e troca de ramo conforme a entrada", async () => {
    const user = userEvent.setup();
    const { container } = renderWithRouter(<LessonPlayer lesson={lessonById["condition-if"]} />);

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Antes do if, existe um valor de entrada");
    expect(container.querySelectorAll(".flow-node")).toHaveLength(5);
    expect(screen.getByText("E se o valor mudasse?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Aplicação prática/ }));
    expect(screen.getByText("Pessoa tentando entrar")).toBeInTheDocument();
    expect(screen.getByText("Regra de acesso")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Branch não significa duplicar execução");
    expect(container.querySelector('.flow-packet[data-semantic="condition-false"]')).not.toBeNull();

    const input = screen.getByRole("spinbutton", { name: "Idade" });
    await user.clear(input);
    await user.type(input, "21");

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Branch não significa duplicar execução");
    expect(container.querySelector('.flow-packet[data-semantic="condition-true"]')).not.toBeNull();
  });

  it("permite trocar o cenário do backend assíncrono e reinicia a timeline", async () => {
    const user = userEvent.setup();
    const backendAsync = backendLessons.find((lesson) => lesson.id === "backend-async");
    if (!backendAsync) throw new Error("backend-async não encontrado");

    renderWithRouter(<LessonPlayer lesson={backendAsync} />);
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(useTraceStore.getState().player.stepIndex).toBe(1);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Cenário" }),
      "3",
    );

    expect(useTraceStore.getState().player.stepIndex).toBe(0);
    expect(useTraceStore.getState().lessonInputs["backend-async"].scenario).toBe(3);
    expect(screen.getAllByText(/falha permanente/i).length).toBeGreaterThan(0);
  });

  it("desbloqueia uma conquista somente ao acertar um desafio", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LessonPlayer lesson={lessonById.array} />);

    await user.click(screen.getByRole("button", { name: "Para preservar todos os valores" }));

    expect(useTraceStore.getState().completedLessonIds).toContain("array");
    expect(useTraceStore.getState().achievementIds).toContain("first-trace");
  });

  it("mostra um conceito em foco na lição de backend request", async () => {
    const user = userEvent.setup();
    const backendRequest = backendLessons.find((lesson) => lesson.id === "backend-request");
    if (!backendRequest) throw new Error("backend-request não encontrado");

    renderWithRouter(<LessonPlayer lesson={backendRequest} />);

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    const conceptPanel = screen.getByLabelText("Conceito em foco");
    expect(conceptPanel).toHaveTextContent("Requisição HTTP");
    expect(within(conceptPanel).getByText(/método, rota, headers/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));

    expect(conceptPanel).toHaveTextContent("Receber, validar e transformar");
    expect(within(conceptPanel).getByText(/DTO nasce depois da validação/i)).toBeInTheDocument();
  });

  it("reinicia a cena de backend pelo botão de replay", async () => {
    const user = userEvent.setup();
    const backendRequest = backendLessons.find((lesson) => lesson.id === "backend-request");
    if (!backendRequest) throw new Error("backend-request não encontrado");

    renderWithRouter(<LessonPlayer lesson={backendRequest} />);

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(screen.getByLabelText("Passo 2 de 9")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.getByLabelText("Passo 0 de 9")).toBeInTheDocument();
  });

  it("permite navegar por chips de etapa na cena de backend", async () => {
    const user = userEvent.setup();
    const backendRequest = backendLessons.find((lesson) => lesson.id === "backend-request");
    if (!backendRequest) throw new Error("backend-request não encontrado");

    renderWithRouter(<LessonPlayer lesson={backendRequest} />);

    await user.click(screen.getByRole("button", { name: /O servidor consulta o banco/i }));
    expect(screen.getByLabelText("Passo 4 de 9")).toBeInTheDocument();
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Consulta ao banco");
  });

  it("troca entre cache hit e cache miss reiniciando a timeline", async () => {
    const user = userEvent.setup();
    const backendCache = backendLessons.find((lesson) => lesson.id === "backend-cache");
    if (!backendCache) throw new Error("backend-cache não encontrado");

    renderWithRouter(<LessonPlayer lesson={backendCache} />);

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    expect(useTraceStore.getState().player.stepIndex).toBe(1);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Cenário do cache" }),
      "2",
    );

    expect(useTraceStore.getState().player.stepIndex).toBe(0);
    expect(useTraceStore.getState().lessonInputs["backend-cache"].scenario).toBe(2);
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Cache entra entre servidor e banco");
  });

  it("respeita reduced motion na cena de backend", async () => {
    const user = userEvent.setup();
    const backendRequest = backendLessons.find((lesson) => lesson.id === "backend-request");
    if (!backendRequest) throw new Error("backend-request não encontrado");

    useTraceStore.setState((state) => ({ ...state, motionPreference: "reduced" }));
    const { container } = renderWithRouter(<LessonPlayer lesson={backendRequest} />);

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));

    expect(container.querySelector('.flow-scene[data-reduced-motion="true"]')).not.toBeNull();
    expect(container.querySelector('.flow-packet[data-reduced-motion="true"]')).not.toBeNull();
  });

  it("usa um renderer de árvore real para a lição de B+ Tree", async () => {
    const user = userEvent.setup();
    const btree = systemsLessons.find((lesson) => lesson.id === "btree");
    if (!btree) throw new Error("btree não encontrado");

    const { container } = renderWithRouter(<LessonPlayer lesson={btree} />);

    expect(container.querySelector('.flow-scene[data-scene-kind="tree"]')).not.toBeNull();
    expect(container.querySelectorAll(".tree-page")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));
    await user.click(screen.getByRole("button", { name: "Próximo passo" }));

    expect(container.querySelectorAll(".tree-page")).toHaveLength(4);
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Split é redistribuição física");

    await user.click(screen.getByRole("button", { name: /A chave separadora sobe para a raiz/i }));
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Promoção muda a navegação da árvore");
    expect(container).toHaveTextContent("27");
    expect(container).toHaveTextContent("30");
  });

  it("usa um renderer de fila com mensagem persistente para a lição de DLQ", async () => {
    const user = userEvent.setup();
    const backendDlq = backendLessons.find((lesson) => lesson.id === "backend-dlq");
    if (!backendDlq) throw new Error("backend-dlq não encontrado");

    const { container } = renderWithRouter(<LessonPlayer lesson={backendDlq} />);

    expect(container.querySelector('.flow-scene[data-scene-kind="queue"]')).not.toBeNull();
    expect(screen.getByText("Pedido #482")).toBeInTheDocument();
    expect(screen.getByText(/attempt 1\/3/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /A nova falha consome a última tentativa útil/i }));

    expect(screen.getByText(/attempt 3\/3/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Existe um limite deliberado para retry");

    await user.click(screen.getByRole("button", { name: /A mensagem desvia para a DLQ/i }));

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("DLQ é estacionamento explícito para falha final");
    expect(screen.getByText("dead-lettered")).toBeInTheDocument();
  });

  it("usa um renderer de grafo ponderado para a lição de Dijkstra", async () => {
    const user = userEvent.setup();
    const dijkstra = graphLessons.find((lesson) => lesson.id === "dijkstra");
    if (!dijkstra) throw new Error("dijkstra não encontrado");

    const { container } = renderWithRouter(<LessonPlayer lesson={dijkstra} />);

    expect(container.querySelector('.flow-scene[data-scene-kind="graph"]')).not.toBeNull();
    expect(container.querySelectorAll(".graph-node")).toHaveLength(5);
    expect(screen.getByText("Priority queue")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Relaxar C → B/i }));

    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Relaxar é substituir um caminho por outro mais barato");
    expect(container).toHaveTextContent("pred C");
    expect(container).toHaveTextContent("B");
    expect(container).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: /Rejeitar B → E/i }));
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("Relaxação rejeitada também ensina o algoritmo");

    await user.click(screen.getByRole("button", { name: /Reconstruir o menor caminho/i }));
    expect(screen.getByLabelText("Conceito em foco")).toHaveTextContent("O caminho mínimo final nasce dos predecessores");
    expect(container).toHaveTextContent("A → C → B → D → E");
  });
});
