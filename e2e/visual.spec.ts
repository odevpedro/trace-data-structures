import { expect, test, type Page } from "@playwright/test";

async function clearFocus(page: Page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
}

async function prepareVisualPage(page: Page) {
  await page.addStyleTag({
    content: ".skip-link { display: none !important; }",
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("landing desktop mantém baseline visual", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await prepareVisualPage(page);
  await clearFocus(page);
  await expect(page.locator("main")).toHaveScreenshot("landing-desktop.png", {
    animations: "disabled",
  });
});

test("array desktop mantém baseline visual com drawer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/app/lesson/array");
  await prepareVisualPage(page);
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: /limitação/i }).click();
  await clearFocus(page);
  await expect(page.locator(".lesson-page")).toHaveScreenshot("lesson-array-drawer-desktop.png", {
    animations: "disabled",
  });
});

test("comparação dijkstra-bellman mantém baseline visual", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/app/compare/dijkstra-bellman");
  await prepareVisualPage(page);
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await clearFocus(page);
  await expect(page.locator("main.compare-page")).toHaveScreenshot("compare-dijkstra-bellman-desktop.png", {
    animations: "disabled",
  });
});

test("dijkstra desktop mantém baseline visual do grafo ponderado", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/app/lesson/dijkstra");
  await prepareVisualPage(page);
  await page.getByRole("button", { name: /Relaxar C → B/i }).click();
  await clearFocus(page);
  await expect(page.locator(".lesson-page")).toHaveScreenshot("dijkstra-graph-desktop.png", {
    animations: "disabled",
  });
});

test("progresso dark mantém baseline visual", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/app/progress");
  await prepareVisualPage(page);
  await page.getByRole("button", { name: "Usar tema escuro" }).click();
  await clearFocus(page);
  await expect(page.locator("main.progress-page")).toHaveScreenshot("progress-dark-desktop.png", {
    animations: "disabled",
  });
});

test("backend async mobile mantém baseline visual", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/lesson/backend-async");
  await prepareVisualPage(page);
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await page.getByRole("button", { name: "Próximo passo" }).click();
  await clearFocus(page);
  await expect(page.locator(".lesson-page")).toHaveScreenshot("backend-async-mobile.png", {
    animations: "disabled",
  });
});
