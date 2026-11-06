import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { calculateForMvp } from "../../src/application/calculate";
import { historyResponse } from "../helpers/history-response";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/reminders?**", (route) =>
    route.fulfill({ json: { available: false, reminders: [] } }),
  );
});

test("calcula pelo servidor, exibe memória e exporta snapshot com avisos", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cada prazo, com clareza." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preencher um exemplo" }).click();
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("14/10/2026");
  await expect(
    page.getByText("SIMULAÇÃO · REVISÃO PENDENTE", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "12/10/2026", exact: true }),
  ).toBeVisible();
  await page.getByText("Fontes e versões utilizadas", { exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar memória" }).click(),
  ]);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.status).toBe("provisional");
  expect(exported.dueDate).toBe("2026-10-14");
  expect(exported.snapshot.calendar.completeness).toBe("demonstration");
  expect(exported.warnings).not.toHaveLength(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `docs/testing/artifacts/calculadora-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page
    .getByRole("spinbutton", { name: "Quantidade de dias", exact: true })
    .fill("10");
  await expect(page.getByTestId("due-date")).toHaveCount(0);
});

test("validação foca o resumo e associa o erro ao campo", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Revise os dados para continuar." }),
  ).toBeFocused();
  await expect(
    page.getByLabel("Data da publicação", { exact: false }),
  ).toHaveAttribute("aria-invalid", "true");
});

test("distingue disponibilização e não conta publicação ou feriado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Qual data você possui?").selectOption("availability");
  await page
    .getByLabel("Data da disponibilização", { exact: false })
    .fill("2026-10-09");
  await page
    .getByRole("spinbutton", { name: "Quantidade de dias", exact: true })
    .fill("1");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("14/10/2026");
  await expect(
    page.getByText("Publicação no primeiro dia útil — marco excluído", {
      exact: true,
    }),
  ).toBeVisible();
});

test("não emite vencimento fora da cobertura ou para indisponibilidade não modelada", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Data da publicação", { exact: false })
    .fill("2026-12-17");
  await page
    .getByRole("spinbutton", { name: "Quantidade de dias", exact: true })
    .fill("2");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByText("Nenhum vencimento foi emitido.")).toBeVisible();
  await expect(page.getByTestId("due-date")).toHaveCount(0);
  await page
    .getByLabel("Data da publicação", { exact: false })
    .fill("2026-10-05");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByText("Nenhum vencimento foi emitido.")).toBeVisible();
  await expect(
    page.getByText(/O evento coincide com uma exceção/),
  ).toBeVisible();
});

test("calendário, fontes e estados sem Supabase são navegáveis e acessíveis", async ({
  page,
}) => {
  await page.goto("/calendario");
  await page.getByLabel("Filtrar mês").selectOption("10");
  await expect(
    page.getByRole("cell", { name: "30/10/2026", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "28/10/2026", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("cell", { name: "05/10/2026", exact: true }),
  ).toBeVisible();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page
    .getByRole("link", { name: "Histórico de cálculos", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Seu histórico de cálculos." }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /configurado|Entre na sua conta/ }),
  ).toContainText(/configurado|Entre na sua conta/);
  await page.getByRole("link", { name: "Acessar minha conta" }).click();
  await expect(
    page.getByRole("button", { name: "Entrar na conta", exact: true }),
  ).toBeVisible();
  await page.goto("/base-normativa");
  await expect(
    page.getByRole("heading", { name: "Fontes oficiais" }),
  ).toBeVisible();
});

test("mantém layout sem rolagem horizontal em viewport pequena", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Preencher um exemplo" }).click();
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("seleciona comarca, aplica feriado local e consulta calendário correspondente", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Comarca / município").selectOption("Santos");
  await page
    .getByLabel("Data da publicação", { exact: false })
    .fill("2026-09-04");
  await page
    .getByRole("spinbutton", { name: "Quantidade de dias", exact: true })
    .fill("1");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("09/09/2026");
  await expect(
    page.getByText(/Simulação com calendário parcial do TJSP — Santos/),
  ).toBeVisible();
  await page.getByLabel("Comarca / município").selectOption("São Paulo");
  await expect(page.getByTestId("due-date")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("08/09/2026");
  await page.goto("/calendario");
  await page.getByLabel("Comarca de SP").selectOption("Santos");
  await page.getByLabel("Filtrar mês").selectOption("09");
  await expect(
    page.getByRole("cell", { name: "08/09/2026", exact: true }),
  ).toBeVisible();
});

test("oferece recuperação acessível com resposta genérica e retorno para entrar", async ({
  page,
}) => {
  await page.route("**/api/auth/recovery", (route) =>
    route.fulfill({
      json: {
        message:
          "Se houver uma conta elegível, você receberá um link. Abra neste mesmo navegador.",
      },
    }),
  );
  await page.goto("/entrar");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await page.getByLabel("E-mail da conta").fill("fixture@example.test");
  await page
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Se houver uma conta elegível",
  );
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("link", { name: "Voltar para entrar" }).click();
  await expect(
    page.getByRole("button", { name: "Entrar na conta", exact: true }),
  ).toBeVisible();
});

test("apresenta histórico original legível e exporta sem substituir pela versão atual", async ({
  page,
}) => {
  const snapshot = calculateForMvp({
    regime: "civil",
    court: "TJSP",
    locality: "Santos",
    medium: "electronic",
    communication: "publication",
    eventDate: "2026-09-04",
    days: 1,
  });
  snapshot.metadata.calendarVersion = "fixture-original";
  snapshot.snapshot.calendar.version = "fixture-original";
  await page.route("**/api/history*", (route) =>
    route.fulfill({
      json: historyResponse([
        {
          id: "fixture",
          title: "Memória de exemplo",
          created_at: "2026-10-20T12:00:00Z",
          result_snapshot: snapshot,
          recomputed: null,
          integrity: "unverified",
          dueStatus: "past",
        },
      ]),
    }),
  );
  await page.goto("/historico");
  await page.getByRole("button", { name: "Ver memória original" }).click();
  await expect(page.getByTestId("due-date")).toHaveText("09/09/2026");
  await expect(
    page.getByText("Memória original do histórico · não verificada.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Salvar cálculo no histórico" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("cell", { name: /Feriado municipal — Santos/ }),
  ).toBeVisible();
  await expect(page.locator(".history-json")).not.toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar memória" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.integrity).toBe("unverified");
  expect(exported.originalSnapshot).toEqual(snapshot);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
