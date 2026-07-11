import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyProgress, type ProgressSnapshot } from "../core/progress/types";
import type { ProgressRepository } from "../storage/progressRepository";
import { App } from "./App";

describe("App", () => {
  const repository: ProgressRepository = {
    load: vi.fn(async () => createEmptyProgress()),
    save: vi.fn(async () => undefined),
  };

  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("mantém o protótipo original acessível a partir da landing page", async () => {
    render(<App repository={repository} />);

    expect(await screen.findByRole("heading", { name: /Veja a execução/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir protótipo original" })).toHaveAttribute(
      "href",
      "/prototype/trace_complete_market_v2.html",
    );
  });

  it("recupera passo e representação persistidos", async () => {
    const persistedRepository: ProgressRepository = {
      load: vi.fn(async () =>
        ({
          ...createEmptyProgress(),
          lastLessonId: "array",
          lessonSteps: { array: 2 },
          lessonRepresentations: { array: "practical" },
        }) satisfies ProgressSnapshot,
      ),
      save: vi.fn(async () => undefined),
    };
    window.history.pushState({}, "", "/app/lesson/array");
    render(<App repository={persistedRepository} />);

    await waitFor(() => expect(screen.getByLabelText("Passo 2 de 4")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Aplicação prática/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
