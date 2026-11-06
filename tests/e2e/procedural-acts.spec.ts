import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const [regime, act, days, expected] of [
  ["civil", "civil-appeal", "15", "28/10/2026"],
  ["labor", "labor-ordinary-appeal", "8", "19/10/2026"],
  ["criminal", "criminal-sentence-clarification", "2", "08/10/2026"],
]) {
  test(`ato ${regime}: condições, cálculo, fonte e exportação`, async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await page.getByLabel("Regime processual").selectOption(regime);
    if (regime !== "civil")
      await page
        .getByLabel("Contexto do prazo (obrigatório)")
        .selectOption("ordinary");
    await page
      .getByLabel("Data da publicação", { exact: false })
      .fill("2026-10-06");
    await page.getByLabel("Ato processual", { exact: true }).selectOption(act);
    await expect(
      page.getByLabel("Quantidade de dias", { exact: true }),
    ).toHaveValue(days);
    await expect(
      page.getByLabel("Quantidade de dias", { exact: true }),
    ).toHaveAttribute("readonly", "");
    await expect(
      page.getByLabel("Enquadramento do ato (obrigatório)"),
    ).toHaveValue("unknown");
    await page
      .getByRole("button", { name: "Calcular prazo", exact: true })
      .click();
    await expect(
      page.getByText("Nenhum vencimento foi emitido.", { exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Enquadramento do ato (obrigatório)")
      .selectOption("confirmed");
    await page
      .getByRole("button", { name: "Calcular prazo", exact: true })
      .click();
    await expect(page.getByTestId("due-date")).toHaveText(expected);
    await page
      .getByText("Fontes e versões utilizadas", { exact: true })
      .click();
    await expect(
      page.getByText("Condições declaradas: confirmadas pelo usuário", {
        exact: false,
      }),
    ).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exportar memória" }).click(),
    ]);
    const chunks: Buffer[] = [];
    for await (const chunk of (await download.createReadStream())!)
      chunks.push(Buffer.from(chunk));
    const result = JSON.parse(Buffer.concat(chunks).toString());
    expect(result.snapshot.act.id).toBe(act);
    expect(result.input.act.eligibility).toBe("confirmed");
    expect(result.metadata.actVersion).toBe("2026-10-22.demo.1");
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    if (regime === "criminal" && testInfo.project.name === "desktop") {
      await page.evaluate(() => {
        window.print = () => {};
      });
      await page
        .getByRole("button", { name: "Imprimir memória de cálculo" })
        .click();
      await page.emulateMedia({ media: "print" });
      await expect(page.locator(".act-memory")).toBeVisible();
      const pdf = await page.pdf({
        path: "output/pdf/memoria-ato-criminal.pdf",
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
      });
      expect(pdf.length).toBeGreaterThan(5000);
      await page.emulateMedia({ media: "screen" });
    }
    await page.getByLabel("Ato processual", { exact: true }).selectOption("");
    await expect(page.getByTestId("due-date")).toHaveCount(0);
    await page.getByLabel("Quantidade de dias", { exact: true }).fill("5");
    await page
      .getByRole("button", { name: "Calcular prazo", exact: true })
      .click();
    await expect(page.getByTestId("due-date")).toBeVisible();
    await expect(page.locator(".act-memory")).toHaveCount(0);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  });
}

test("troca de perfil ou limpeza remove confirmação do ato anterior", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Ato processual", { exact: true })
    .selectOption("civil-appeal");
  await page
    .getByLabel("Enquadramento do ato (obrigatório)")
    .selectOption("confirmed");
  await page.getByLabel("Regime processual").selectOption("criminal");
  await page
    .getByLabel("Ato processual", { exact: true })
    .selectOption("criminal-sentence-clarification");
  await expect(
    page.getByLabel("Enquadramento do ato (obrigatório)"),
  ).toHaveValue("unknown");
  await page.getByRole("button", { name: "Limpar formulário" }).click();
  await expect(page.getByLabel("Regime processual")).toHaveValue("civil");
  await expect(page.getByLabel("Ato processual", { exact: true })).toHaveValue(
    "",
  );
});
