import { test, expect } from "@playwright/test";
import { calculateForMvp } from "../../src/application/calculate";
import { historyResponse } from "../helpers/history-response";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/reminders?**", (route) =>
    route.fulfill({ json: { available: false, reminders: [] } }),
  );
});

test("exporta memória incompleta mantendo vencimento nulo, fontes e pendências", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Data da publicação", { exact: false })
    .fill("2026-12-18");
  await page
    .getByRole("spinbutton", { name: "Quantidade de dias", exact: true })
    .fill("2");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(
    page.getByText("Nenhum vencimento foi emitido.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Salvar cálculo no histórico" }),
  ).toHaveCount(0);
  const waiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar memória", exact: true })
    .click({ timeout: 3000 });
  const download = await waiting;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.status).toBe("incomplete");
  expect(exported.dueDate).toBeNull();
  expect(exported.warnings.length).toBeGreaterThan(0);
  expect(exported.snapshot.calendar.completeness).toBe("demonstration");
  expect(exported.metadata.legalReview).toBe("pending");
  await expect(
    page.getByRole("button", { name: "Imprimir memória de cálculo" }),
  ).toBeVisible();
});

test("imprime só a memória histórica selecionada com fontes e estado de demonstração", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Artefato A4 gerado no navegador desktop.",
  );
  const input = {
    regime: "civil",
    court: "TJSP",
    locality: "Santos",
    medium: "electronic",
    communication: "publication",
    eventDate: "2026-09-04",
    days: 1,
  };
  const snapshot = calculateForMvp(input);
  await page.route("**/api/history*", (route) =>
    route.fulfill({
      json: historyResponse([
        {
          id: "selected",
          title: "Selecionado",
          created_at: "2026-10-20T12:00:00Z",
          result_snapshot: snapshot,
          recomputed: null,
          integrity: "unverified",
          dueStatus: "past",
        },
        {
          id: "other",
          title: "Outro registro não deve ser impresso",
          created_at: "2026-10-20T12:00:00Z",
          result_snapshot: snapshot,
          recomputed: null,
          integrity: "unverified",
          dueStatus: "past",
        },
      ]),
    }),
  );
  // The native dialog is replaced only in this test. The real print handler prepares
  // the document; page.pdf emits the browser's print lifecycle and afterprint cleanup.
  await page.addInitScript(() => {
    window.print = () => {};
  });
  await page.goto("/historico");
  await page
    .getByRole("button", { name: "Ver memória original", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Imprimir memória de cálculo" })
    .click();
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("link", {
      name: "Pular para o conteúdo",
      includeHidden: true,
    }),
  ).not.toBeVisible();
  await expect(
    page.getByText("Outro registro não deve ser impresso", { exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText("Memória original do histórico · não verificada.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Calendário demonstrativo · cobertura parcial/),
  ).toBeVisible();
  await expect(page.locator(".sources-panel")).toHaveAttribute("open", "");
  const pdf = await page.pdf({
    path: testInfo.outputPath("memoria-historica.pdf"),
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
  expect(pdf.length).toBeGreaterThan(5000);
  await testInfo.attach("Memória histórica A4", {
    body: pdf,
    contentType: "application/pdf",
  });
  await page.emulateMedia({ media: "screen" });
  await expect(
    page.getByText("Outro registro não deve ser impresso", { exact: true }),
  ).toBeVisible();
});
