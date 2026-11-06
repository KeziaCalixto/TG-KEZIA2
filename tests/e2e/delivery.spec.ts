import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { calculateForMvp } from "../../src/application/calculate";
import { historyResponse } from "../helpers/history-response";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/reminders?**", (route) =>
    route.fulfill({ json: { available: false, reminders: [] } }),
  );
});

test("ajuda e privacidade ficam disponíveis com teclado e sem rolagem horizontal", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ajuda", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Como usar o Prazo Claro." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "4. Exporte, imprima ou salve" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Informações de privacidade", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Privacidade e seus registros." }),
  ).toBeVisible();
  await expect(page.getByText(/Não existe expiração automática/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
});

test("o título é enviado como metadado, sem mudar a entrada da contagem", async ({
  page,
}) => {
  let saved: Record<string, unknown> | undefined;
  await page.route("**/api/history", async (route) => {
    saved = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      json: { calculation: { id: "fixture" } },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Preencher um exemplo" }).click();
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await page
    .getByLabel("Título para salvar (opcional)")
    .fill("Aula de processo civil");
  await page
    .getByRole("button", { name: "Salvar cálculo no histórico" })
    .click();
  await expect(page.getByRole("status")).toContainText("Cálculo salvo.");
  expect(saved?.title).toBe("Aula de processo civil");
  expect(saved?.input).not.toHaveProperty("title");
  await page.getByLabel("Comarca / município").selectOption("Santos");
  await expect(page.getByTestId("due-date")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByLabel("Título para salvar (opcional)")).toHaveValue(
    "",
  );
});

test("busca ignora acentos e só exclui após confirmação, com cancelamento e foco", async ({
  page,
}) => {
  const baseline = {
    regime: "civil",
    court: "TJSP",
    locality: "Santos",
    medium: "electronic",
    communication: "publication",
    eventDate: "2026-09-04",
    days: 1,
  };
  let items = ["Santos", "Ribeirão Preto"].map((locality, i) => ({
    id: `fixture-${i}`,
    title: `Aula ${i + 1}`,
    created_at: "2026-10-20T12:00:00Z",
    result_snapshot: calculateForMvp({ ...baseline, locality }),
    recomputed: null,
    integrity: "unverified",
    dueStatus: "past",
  }));
  let deletes = 0;
  await page.route("**/api/history*", async (route) => {
    if (route.request().method() === "DELETE") {
      deletes++;
      items = items.filter(
        (item) => item.id !== route.request().postDataJSON().id,
      );
      await route.fulfill({ json: { success: true } });
    } else await route.fulfill({ json: historyResponse(items) });
  });
  await page.goto("/historico");
  await page.getByLabel("Buscar nesta página").fill("ribeirao");
  await expect(page.locator(".history-item")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Aula 2" })).toBeVisible();
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "Confirmar exclusão do cálculo" }),
  ).toBeFocused();
  expect(deletes).toBe(0);
  await page
    .getByRole("button", { name: "Cancelar exclusão", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Excluir", exact: true }),
  ).toBeFocused();
  expect(deletes).toBe(0);
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await page
    .getByRole("button", { name: "Excluir definitivamente", exact: true })
    .click();
  await expect(
    page.getByText("Cálculo excluído.", { exact: true }),
  ).toBeFocused();
  expect(deletes).toBe(1);
  await expect(page.locator(".history-item")).toHaveCount(0);
  await page.getByLabel("Buscar nesta página").fill("");
  await expect(page.getByRole("heading", { name: "Aula 1" })).toBeVisible();
});

test("mantém cabeçalhos de proteção e cache privado nas respostas de conta", async ({
  request,
}) => {
  const page = await request.get("/");
  expect(page.headers()["x-content-type-options"]).toBe("nosniff");
  expect(page.headers()["x-frame-options"]).toBe("DENY");
  expect(page.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  const session = await request.get("/api/auth/session");
  expect(session.headers()["cache-control"]).toBe("private, no-store");
  const foreign = await request.post("/api/auth/recovery", {
    headers: { Origin: "https://external.invalid" },
    data: { email: "fixture@example.test" },
  });
  expect(foreign.status()).toBe(403);
});
