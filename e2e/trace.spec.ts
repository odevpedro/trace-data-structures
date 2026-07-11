import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function captureConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("jornada preserva passo e representação após recarregar", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/lesson/array");
  await expect(page.getByRole("heading", { name: "Array: inserção no meio" })).toBeVisible();

  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: /Aplicação prática/ }).click();
  await expect(page.getByLabel("Passo 1 de 4")).toBeVisible();
  await expect(page.getByText("Fotos abre a última posição.")).toBeVisible();

  await page.waitForTimeout(250);
  await page.reload();
  await expect(page.getByLabel("Passo 1 de 4")).toBeVisible();
  await expect(page.getByRole("button", { name: /Aplicação prática/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Usar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.waitForTimeout(250);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

test("teclado, movimento reduzido, desafio e conquista funcionam juntos", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/lesson/condition-if");
  await page.getByLabel("Preferência de movimento").selectOption("reduced");
  await expect(page.getByText("Quadros estáticos")).toBeVisible();
  await expect(page.getByRole("list", { name: "Descrição estática dos passos" })).toBeVisible();

  const player = page.getByRole("article");
  await player.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Passo 1 de 4")).toBeVisible();

  await page.getByRole("button", { name: "Bloco else (bloqueado)" }).click();
  await expect(page.getByLabel("Conquista desbloqueada")).toContainText("Primeiro Trace");
  expect(errors).toEqual([]);
});

test("flashcards e system design entregam interações reais", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/review");
  await page.getByRole("button", { name: /Frente do flashcard/ }).click();
  await expect(page.getByText(/O\(n\) no pior caso/)).toBeVisible();
  await page.getByRole("button", { name: "Aprendi" }).click();
  await expect(page.getByText(/Ao mutar um objeto/)).toBeVisible();

  await page.goto("/app/lesson/request-flow");
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await expect(page.getByText("201 Created retorna ao cliente.")).toBeVisible();
  await expect(page.getByText("latência: 126 ms", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("landing e player não têm violações automáticas de acessibilidade", async ({ page }) => {
  await page.goto("/");
  const landing = await new AxeBuilder({ page }).analyze();
  expect(landing.violations).toEqual([]);

  await page.goto("/app/lesson/linear-search");
  await expect(page.getByRole("heading", { name: "Busca linear: encontre o alvo" })).toBeVisible();
  const lesson = await new AxeBuilder({ page }).analyze();
  expect(lesson.violations).toEqual([]);
});

test("protótipo preservado continua executável", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/prototype/trace_complete_market_v2.html");
  await expect(page.getByRole("heading", { name: "Estruturas de dados em movimento" })).toBeVisible();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await expect(page.getByText("Passo 1 / 4")).toBeVisible();
  expect(errors).toEqual([]);
});

test("novas lições carregam sem erro", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const ids = ["stack", "queue", "hash", "bst", "graph", "dijkstra", "bellman-ford", "btree", "lru", "bloom"];
  for (const id of ids) {
    await page.goto(`/app/lesson/${id}`);
    await expect(page.getByRole("article")).toBeVisible();
    expect(errors, `Erro ao carregar ${id}`).toEqual([]);
  }
});

test("novas comparações carregam sem erro", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const ids = ["array-queue", "list-hash", "bfs-dijkstra", "bfs-dfs"];
  for (const id of ids) {
    await page.goto(`/app/compare/${id}`);
    await expect(page.locator("main.compare-page")).toBeVisible();
    expect(errors, `Erro ao carregar comparação ${id}`).toEqual([]);
  }
});

test("player permanece utilizável em viewport móvel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/lesson/for-loop");
  await expect(page.getByRole("heading", { name: "Loop for: estado que evolui" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Aplicação prática/ })).toBeVisible();
  const documentDoesNotOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(documentDoesNotOverflow).toBe(true);
});

test("todas as lições restantes carregam sem erro", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const ids = ["doubly-linked-list", "deque", "set", "balanced", "heap", "trie", "dfs", "union-find", "circular"];
  for (const id of ids) {
    await page.goto(`/app/lesson/${id}`);
    await expect(page.getByRole("article")).toBeVisible();
    expect(errors, `Erro ao carregar ${id}`).toEqual([]);
  }
});

test("player de lição navega por todos os passos sem erro", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/lesson/linked-list");
  await expect(page.getByRole("article")).toBeVisible();

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
    expect(errors, `Erro no passo ${index + 1}`).toEqual([]);
  }

  await expect(page.getByRole("button", { name: "Próximo passo" })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("drawer de limitação abre e fecha corretamente", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/lesson/array");
  await expect(page.getByRole("article")).toBeVisible();

  await page.getByRole("button", { name: /limitação/i }).click();
  await expect(page.getByRole("dialog")).toHaveAttribute("data-open", "true");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveAttribute("data-open", "false");
  expect(errors).toEqual([]);
});

test("comparação bfs-dijkstra sincroniza passos", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/compare/bfs-dijkstra");
  await expect(page.locator("main.compare-page")).toBeVisible();

  const stages = page.locator(".compare-stage");
  await expect(stages).toHaveCount(2);

  await expect(stages.nth(0).locator("figure.trace-stage")).toBeVisible();
  await expect(stages.nth(1).locator("figure.trace-stage")).toBeVisible();

  await page.getByRole("button", { name: "Próximo passo" }).click();
  await expect(stages.nth(0).locator(".event-chip")).not.toHaveText("OBSERVE");
  await expect(stages.nth(1).locator(".event-chip")).not.toHaveText("OBSERVE");
  expect(errors).toEqual([]);
});
