import { expect, test } from "@playwright/test";
import { calculateForMvp } from "../../src/application/calculate";
import { historyResponse } from "../helpers/history-response";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/reminders?**", (route) =>
    route.fulfill({ json: { available: false, reminders: [] } }),
  );
});

const fixtures = Array.from({ length: 12 }, (_, i) => {
  const regime = ["civil", "labor", "criminal"][i % 3];
  const input = {
    regime,
    court: regime === "labor" ? "TRT2" : "TJSP",
    locality: "São Paulo",
    medium: "electronic",
    communication: "publication",
    eventDate: ["2026-10-20", "2026-10-21", "2026-10-22"][i % 3],
    days: 1,
    ...(regime === "civil" ? {} : { context: "ordinary" }),
  };
  return {
    id: `fixture-${i}`,
    title: `Caso ${i + 1}`,
    created_at: "2026-10-22T12:00:00Z",
    input,
    result_snapshot: calculateForMvp(input),
    integrity: "unverified",
    recomputed: null,
    dueStatus: ["past", "today", "future"][i % 3],
  };
});

test("pagina o histórico e filtra todo o ramo antes do intervalo", async ({
  page,
}) => {
  await page.route("**/api/history*", async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const selected = fixtures.filter(
      (item) =>
        !params.get("regime") || item.input.regime === params.get("regime"),
    );
    const current = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 10);
    await route.fulfill({
      json: historyResponse(
        selected.slice((current - 1) * pageSize, current * pageSize),
        { page: current, pageSize, total: selected.length },
      ),
    });
  });
  await page.goto("/historico");
  await expect(page.locator(".history-item")).toHaveCount(10);
  await page
    .getByRole("button", { name: "Próxima página", exact: true })
    .click({ timeout: 3000 });
  await expect(
    page.getByRole("heading", { name: "Caso 11", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".history-item")).toHaveCount(2);
  await expect(page.locator(".history-pagination [role=status]")).toBeFocused();
  await page.getByLabel("Filtrar por regime").selectOption("labor");
  await expect(page.locator(".history-item")).toHaveCount(4);
  await expect(page.getByText("Página 1 de 1", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próxima página", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Vence hoje · estimativa", { exact: true }),
  ).toHaveCount(4);
  await expect(
    page.getByText(/Referência: 22\/10\/2026 · America\/Sao_Paulo/),
  ).toBeVisible();
  await page.getByLabel("Registros por página").selectOption("20");
  await page.getByLabel("Filtrar por regime").selectOption("all");
  await expect(page.locator(".history-item")).toHaveCount(12);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("filtros permanecem no vazio e falha não mostra dados da seleção anterior", async ({
  page,
}) => {
  let fail = true;
  let asOfDate = "2026-10-22";
  await page.route("**/api/history*", async (route) => {
    const regime = new URL(route.request().url()).searchParams.get("regime");
    if (regime === "criminal" && fail) {
      fail = false;
      await route.fulfill({
        status: 503,
        json: { error: "Não foi possível carregar o histórico." },
      });
      return;
    }
    await route.fulfill({
      json: {
        ...historyResponse(
          regime === "labor"
            ? []
            : regime === "criminal"
              ? [
                  {
                    ...fixtures[2],
                    dueStatus: asOfDate === "2026-10-23" ? "today" : "future",
                  },
                ]
              : fixtures.slice(0, 3),
        ),
        asOfDate,
      },
    });
  });
  await page.goto("/historico");
  await expect(
    page.getByText("Futuro · estimativa", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Vencido · estimativa", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Buscar nesta página").fill("ausente");
  await expect(
    page.getByText("Nenhum registro corresponde à busca nesta página."),
  ).toBeVisible();
  await page.getByLabel("Filtrar por regime").selectOption("labor");
  await expect(page.getByText(/Nenhum cálculo neste regime/)).toBeVisible();
  await expect(page.getByLabel("Filtrar por regime")).toBeVisible();
  await page.getByLabel("Filtrar por regime").selectOption("criminal");
  await expect(
    page.getByRole("alert").filter({ hasText: "Não foi possível carregar" }),
  ).toContainText("Não foi possível carregar");
  await expect(page.locator(".history-item")).toHaveCount(0);
  await page.getByRole("button", { name: "Atualizar histórico" }).click();
  await expect(
    page.getByRole("heading", { name: "Caso 3", exact: true }),
  ).toBeVisible();
  asOfDate = "2026-10-23";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText(/Referência: 23\/10\/2026/)).toBeVisible();
  await expect(
    page.getByText("Vence hoje · estimativa", { exact: true }),
  ).toBeVisible();
});

test("excluir os últimos registros refaz total e retorna à página anterior", async ({
  page,
}) => {
  let items = [...fixtures];
  await page.route("**/api/history*", async (route) => {
    if (route.request().method() === "DELETE") {
      items = items.filter(
        (item) => item.id !== route.request().postDataJSON().id,
      );
      await route.fulfill({ json: { success: true } });
      return;
    }
    const current = Number(
      new URL(route.request().url()).searchParams.get("page") ?? 1,
    );
    await route.fulfill({
      json: historyResponse(items.slice((current - 1) * 10, current * 10), {
        page: current,
        total: items.length,
      }),
    });
  });
  await page.goto("/historico");
  await page
    .getByRole("button", { name: "Próxima página", exact: true })
    .click();
  await expect(page.locator(".history-item")).toHaveCount(2);
  for (const count of [1, 10]) {
    await page
      .getByRole("button", { name: "Excluir", exact: true })
      .last()
      .click();
    await page
      .getByRole("button", { name: "Excluir definitivamente", exact: true })
      .click();
    await expect(page.locator(".history-item")).toHaveCount(count);
    await expect(
      page.getByText("Cálculo excluído.", { exact: true }),
    ).toBeFocused();
  }
  await expect(page.getByText("Página 1 de 1", { exact: false })).toBeVisible();
});

test("resposta atrasada não substitui filtro mais recente", async ({
  page,
}) => {
  let release: (() => void) | undefined;
  const paused = new Promise<void>((resolve) => {
    release = resolve;
  });
  let markRequested: (() => void) | undefined;
  const requested = new Promise<void>((resolve) => {
    markRequested = resolve;
  });
  let markFinished: (() => void) | undefined;
  const finished = new Promise<void>((resolve) => {
    markFinished = resolve;
  });
  await page.route("**/api/history*", async (route) => {
    const regime = new URL(route.request().url()).searchParams.get("regime");
    if (regime === "labor") {
      markRequested?.();
      await paused;
    }
    await route
      .fulfill({
        json: historyResponse(
          regime === "criminal" ? [fixtures[2]] : [fixtures[1]],
        ),
      })
      .catch(() => {});
    if (regime === "labor") markFinished?.();
  });
  await page.goto("/historico");
  await expect(page.locator(".history-item")).toHaveCount(1);
  await page.getByLabel("Filtrar por regime").selectOption("labor");
  await requested;
  await page.getByLabel("Filtrar por regime").selectOption("criminal");
  await expect(
    page.getByRole("heading", { name: "Caso 3", exact: true }),
  ).toBeVisible();
  release?.();
  await finished;
  await expect(page.getByLabel("Filtrar por regime")).toHaveValue("criminal");
  await expect(
    page.getByRole("heading", { name: "Caso 2", exact: true }),
  ).toHaveCount(0);
});
