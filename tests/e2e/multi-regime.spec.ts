import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("trabalhista 2027 atravessa o ano com versões anuais e calendário próprio", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    window.print = () => {};
  });
  await page.goto("/");
  await page
    .getByLabel("Regime processual", { exact: true })
    .selectOption("labor");
  await page
    .getByLabel("Contexto do prazo (obrigatório)")
    .selectOption("ordinary");
  await page.getByLabel("Data da publicação").fill("2027-08-10");
  await page.getByLabel("Quantidade de dias", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("12/08/2027");
  await page.getByLabel("Data da publicação").fill("2026-12-17");
  await page.getByLabel("Quantidade de dias", { exact: true }).fill("10");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("03/02/2027");
  await page.getByText("Fontes e versões utilizadas", { exact: true }).click();
  await expect(
    page.getByText("Versões anuais que compõem a cobertura", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/trt2-capital-2026 · versão 2026-10-21.demo.1/),
  ).toBeVisible();
  await expect(
    page.getByText(/trt2-capital-2027 · versão 2026-10-22.demo.1/),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar memória", exact: true })
    .click();
  const download = await downloadEvent;
  const { readFile } = await import("node:fs/promises");
  const result = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(result.snapshot.calendar.components).toHaveLength(2);
  expect(result.snapshot.calendar.to).toBe("2027-12-31");
  expect(
    result.trace.filter((day: { counted: boolean }) => day.counted),
  ).toHaveLength(10);
  expect(result.metadata.legalReview).toBe("pending");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  if (testInfo.project.name === "desktop") {
    await page
      .getByRole("button", { name: "Imprimir memória de cálculo", exact: true })
      .click();
    await page.emulateMedia({ media: "print" });
    await expect(
      page.getByText("Versões anuais que compõem a cobertura", { exact: true }),
    ).toBeVisible();
    const pdf = await page.pdf({
      path: "output/pdf/memoria-travessia-trt2-2026-2027.pdf",
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    expect(pdf.length).toBeGreaterThan(5000);
    await testInfo.attach("Memória trabalhista entre anos", {
      body: pdf,
      contentType: "application/pdf",
    });
    await page.emulateMedia({ media: "screen" });
  }
  await page.goto("/calendario");
  await page.getByLabel("Perfil do calendário").selectOption("labor");
  await page.getByLabel("Ano do calendário").selectOption("2027");
  await page.getByLabel("Filtrar mês").selectOption("08");
  await expect(page.getByText("11/08/2027", { exact: true })).toBeVisible();
  await expect(page.getByText("10/08/2027", { exact: true })).toHaveCount(0);
  await page.getByLabel("Filtrar mês").selectOption("12");
  await expect(page.getByText("08/12/2027", { exact: true })).toBeVisible();
  await expect(page.getByText("07/12/2027", { exact: true })).toHaveCount(0);
  await page.getByLabel("Perfil do calendário").selectOption("criminal");
  await expect(page.getByLabel("Ano do calendário")).toHaveValue("2026");
  await expect(
    page.getByLabel("Ano do calendário").locator("option"),
  ).toHaveCount(1);
});

test("criminal exige contexto e preserva curso contínuo na exportação", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Regime processual", { exact: true })
    .selectOption("criminal");
  await page.getByLabel("Data da publicação").fill("2026-10-06");
  await page.getByLabel("Quantidade de dias", { exact: true }).fill("5");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(
    page.getByText("Nenhum vencimento foi emitido.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Contexto do prazo (obrigatório)")
    .selectOption("ordinary");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("13/10/2026");
  await expect(
    page.getByText("11/10/2026", { exact: true }).first(),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar memória", exact: true })
    .click();
  const download = await downloadEvent;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const { readFile } = await import("node:fs/promises");
  const data = JSON.parse(await readFile(filePath!, "utf8"));
  expect(data.input.regime).toBe("criminal");
  expect(data.snapshot.rule.countingMode).toBe("continuous");
  expect(data.nominalDueDate).toBe("2026-10-11");
  expect(data.dueDate).toBe("2026-10-13");
  expect(
    data.trace.filter((day: { counted: boolean }) => day.counted),
  ).toHaveLength(5);
  await page
    .getByLabel("Contexto do prazo (obrigatório)")
    .selectOption("custody");
  await expect(page.getByTestId("due-date")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(
    page.getByText("Nenhum vencimento foi emitido.", { exact: true }),
  ).toBeVisible();
});

test("trabalhista usa TRT-2 e troca de perfil não reutiliza contexto elegível", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Regime processual", { exact: true })
    .selectOption("labor");
  await expect(page.getByLabel("Tribunal", { exact: true })).toHaveValue(
    "TRT2",
  );
  await expect(
    page.getByLabel("Comarca / município", { exact: true }).locator("option"),
  ).toHaveCount(1);
  await page
    .getByLabel("Contexto do prazo (obrigatório)")
    .selectOption("ordinary");
  await page.getByLabel("Data da publicação").fill("2026-08-07");
  await page.getByLabel("Quantidade de dias", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("11/08/2026");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByLabel("Regime processual", { exact: true })
    .selectOption("criminal");
  await expect(page.getByLabel("Contexto do prazo (obrigatório)")).toHaveValue(
    "unknown",
  );
  await expect(page.getByTestId("due-date")).toHaveCount(0);
  await page
    .getByLabel("Regime processual", { exact: true })
    .selectOption("civil");
  await expect(page.getByLabel("Contexto do prazo (obrigatório)")).toHaveCount(
    0,
  );
  await expect(
    page.getByLabel("Comarca / município", { exact: true }).locator("option"),
  ).toHaveCount(10);
});

test("calendário distingue tribunal e datas transferidas", async ({ page }) => {
  await page.goto("/calendario");
  await page.getByLabel("Perfil do calendário").selectOption("labor");
  await page.getByLabel("Filtrar mês").selectOption("08");
  await expect(page.getByText("10/08/2026", { exact: true })).toBeVisible();
  await expect(page.getByText("11/08/2026", { exact: true })).toHaveCount(0);
  await page.goto("/base-normativa");
  await expect(
    page.getByRole("heading", { name: "Perfil trabalhista — TRT-2 Capital" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Perfil criminal — TJSP em SP" }),
  ).toBeVisible();
});

test("criminal usa feriado de Santos, exporta a fonte e invalida resultado ao mudar de comarca", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Regime processual", { exact: true })
    .selectOption("criminal");
  const locality = page.getByLabel("Comarca / município", { exact: true });
  await expect(locality.locator("option")).toHaveCount(10);
  await locality.selectOption("Santos");
  await page
    .getByLabel("Contexto do prazo (obrigatório)")
    .selectOption("ordinary");
  await page.getByLabel("Data da publicação").fill("2026-09-04");
  await page.getByLabel("Quantidade de dias", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("09/09/2026");
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar memória", exact: true })
    .click();
  const download = await downloadEvent;
  const { readFile } = await import("node:fs/promises");
  const data = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(data.input.locality).toBe("Santos");
  expect(data.metadata.calendarVersion).toBe("2026-10-21.demo.2");
  expect(data.snapshot.calendar.id).toBe("tjsp-criminal-santos-2026");
  expect(data.snapshot.rule.version).toBe("2026-10-21.demo.2");
  expect(
    data.sources.some(
      (source: { id: string }) => source.id === "TJSP-MUNICIPAIS-2026-p6",
    ),
  ).toBe(true);
  await locality.selectOption("São Paulo");
  await expect(page.getByTestId("due-date")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await expect(page.getByTestId("due-date")).toHaveText("08/09/2026");
  await page.goto("/calendario");
  await page.getByLabel("Perfil do calendário").selectOption("criminal");
  await page.getByLabel("Comarca de SP").selectOption("Santos");
  await page.getByLabel("Filtrar mês").selectOption("09");
  await expect(
    page.getByRole("heading", { name: "Eventos de 2026 — Santos" }),
  ).toBeVisible();
  await expect(page.getByText("08/09/2026", { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Perfil do calendário").selectOption("labor");
  await expect(page.getByLabel("Comarca de SP")).toHaveValue("São Paulo");
  await expect(page.getByLabel("Comarca de SP").locator("option")).toHaveCount(
    1,
  );
});
