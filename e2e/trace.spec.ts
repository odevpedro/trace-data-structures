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
  await expect(page.getByLabel("Conceito em foco")).toContainText("Fotos abre a última posição.");

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
  await expect(page.locator(".flow-scene")).toBeVisible();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Antes do if, existe um valor de entrada");
  await page.getByLabel("Preferência de movimento").selectOption("reduced");
  await expect(page.getByText("Quadros estáticos")).toBeVisible();
  await expect(page.getByRole("list", { name: "Descrição estática dos passos" })).toBeVisible();

  const player = page.getByRole("article");
  await player.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Passo 1 de 4")).toBeVisible();
  await expect(page.locator(".flow-scene")).toHaveAttribute("data-reduced-motion", "true");

  await page.getByRole("button", { name: "Bloco else (bloqueado)" }).click();
  await expect(page.getByLabel("Conquista desbloqueada")).toContainText("Primeiro Trace");
  expect(errors).toEqual([]);
});

test("loop for e busca linear respondem ao novo player visual com entradas manipuláveis", async ({ page }) => {
  const errors = captureConsoleErrors(page);

  await page.goto("/app/lesson/for-loop");
  await expect(page.locator(".flow-scene")).toBeVisible();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Inicialização do loop");
  await page.getByRole("spinbutton", { name: "Número de repetições" }).fill("5");
  await expect(page.getByLabel("Conceito em foco")).toContainText("Inicialização do loop");
  await expect(page.getByText("E se o limite mudasse?")).toBeVisible();

  await page.goto("/app/lesson/linear-search");
  await expect(page.locator(".flow-scene")).toBeVisible();
  await page.getByRole("spinbutton", { name: "Valor alvo" }).fill("20");
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await expect(page.getByLabel("Conceito em foco")).toContainText("Retorno de ausência");
  expect(errors).toEqual([]);
});

test("Dijkstra usa grafo ponderado, fila de prioridade e reconstrói o caminho final", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/lesson/dijkstra");
  await expect(page.locator('.flow-scene[data-scene-kind="graph"]')).toBeVisible();
  await expect(page.getByText("Priority queue")).toBeVisible();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Dijkstra começa com uma única certeza");

  await page.getByRole("button", { name: /Relaxar C → B/i }).click();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Relaxar é substituir um caminho por outro mais barato");
  await expect(page.getByText(/pred C/i)).toBeVisible();

  await page.getByRole("button", { name: /Rejeitar B → E/i }).click();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Relaxação rejeitada");

  await page.getByRole("button", { name: /Reconstruir o menor caminho/i }).click();
  await expect(page.getByLabel("Conceito em foco")).toContainText("O caminho mínimo final nasce dos predecessores");
  await expect(page.locator(".graph-shortest-path-card strong")).toHaveText("A → C → B → D → E");
  expect(errors).toEqual([]);
});

test("lições legadas sem cena manual também usam o padrão linear", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/lesson/array");
  await expect(page.locator(".flow-scene")).toBeVisible();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Observar");

  await page.goto("/app/lesson/hash");
  await expect(page.locator(".flow-scene")).toBeVisible();
  await expect(page.getByLabel("Conceito em foco")).toContainText(/começar|calcular hash/i);
  expect(errors).toEqual([]);
});

test("flashcards e system design entregam interações reais", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/review");
  await page.getByRole("button", { name: /Frente do flashcard/ }).click();
  await expect(page.getByText(/O\(n\) no pior caso/)).toBeVisible();
  await page.getByRole("button", { name: "Aprendi" }).click();
  await expect(page.getByText(/Quando uma busca linear pode parar/)).toBeVisible();

  await page.goto("/app/lesson/request-flow");
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await expect(page.getByLabel("Conceito em foco")).toContainText("201 Created retorna ao cliente.");
  await expect(page.getByText("latência: 126 ms", { exact: true })).toBeVisible();

  await page.goto("/app/lesson/backend-async");
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await expect(page.getByLabel("Conceito em foco")).toContainText(/Retry funciona; pedido persiste e recibo é enviado/);
  await expect(page.locator(".flow-scene")).toBeVisible();

  await page.getByRole("combobox", { name: "Cenário" }).selectOption("2");
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await expect(page.getByLabel("Conceito em foco")).toContainText(/não com dois/i);

  await page.getByRole("combobox", { name: "Cenário" }).selectOption("3");
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }
  await expect(page.getByLabel("Conceito em foco")).toContainText(/terminou na DLQ/i);

  await page.goto("/app/lesson/backend-request");
  await expect(page.locator(".flow-scene")).toBeVisible();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Requisição HTTP");
  await page.getByRole("button", { name: "Reiniciar" }).click();
  await expect(page.getByLabel("Passo 0 de 9")).toBeVisible();

  await page.goto("/app/lesson/backend-cache");
  await page.getByRole("combobox", { name: "Cenário do cache" }).selectOption("2");
  await expect(page.locator(".flow-scene")).toBeVisible();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await expect(page.getByLabel("Conceito em foco")).toContainText("Cache miss");
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

  await page.goto("/app/compare/bfs-dijkstra");
  await expect(page.locator("main.compare-page")).toBeVisible();
  const compare = await new AxeBuilder({ page }).analyze();
  expect(compare.violations).toEqual([]);

  await page.goto("/app/progress");
  await expect(page.getByRole("heading", { name: "Seu progresso" })).toBeVisible();
  const progress = await new AxeBuilder({ page }).analyze();
  expect(progress.violations).toEqual([]);
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

  const ids = [
    "stack",
    "queue",
    "hash",
    "bst",
    "graph",
    "dijkstra",
    "bellman-ford",
    "btree",
    "lru",
    "bloom",
    "backend-router",
    "backend-validation",
    "backend-service-layer",
    "backend-authentication",
    "backend-authorization",
    "backend-queue",
    "backend-worker",
    "backend-idempotency",
    "backend-retry",
    "backend-dlq",
    "backend-request",
    "backend-cache",
    "backend-auth",
    "backend-async",
  ];
  for (const id of ids) {
    await page.goto(`/app/lesson/${id}`);
    await expect(page.getByRole("article")).toBeVisible();
    expect(errors, `Erro ao carregar ${id}`).toEqual([]);
  }
});

test("novas comparações carregam sem erro", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const ids = ["insert-middle", "array-queue", "list-hash", "bfs-dijkstra", "bfs-dfs", "dijkstra-bellman"];
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
  await expect(page.getByRole("dialog")).toHaveCount(0);
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

test("comparação dijkstra-bellman evidencia premissas diferentes", async ({ page }) => {
  const errors = captureConsoleErrors(page);
  await page.goto("/app/compare/dijkstra-bellman");
  await expect(page.locator("main.compare-page")).toBeVisible();

  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();

  await expect(page.getByText(/premissa foi quebrada/i)).toBeVisible();
  await expect(page.locator(".compare-stage").nth(1).getByText("Bellman-Ford")).toBeVisible();
  expect(errors).toEqual([]);
});
