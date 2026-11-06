import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("cadastro aceito abre orientação de confirmação sem expor credenciais", async ({
  page,
}, testInfo) => {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ json: { configured: true, user: null } }),
  );
  await page.route("**/api/auth/signup", (route) =>
    route.fulfill({
      json: {
        requiresEmailConfirmation: true,
        message:
          "Se o cadastro puder ser realizado, você receberá um e-mail de confirmação. Verifique sua caixa de entrada.",
      },
    }),
  );
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await page.getByLabel("E-mail", { exact: true }).fill("fixture@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("LocalFixtureOnly!123");
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  await expect(page).toHaveURL(/\/conta\/confirmar-email$/);
  await expect(
    page.getByRole("heading", { name: "Confira seu e-mail.", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/mesmo navegador/)).toBeVisible();
  await expect(
    page.getByText(/Se o cadastro puder ser realizado/),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("fixture@example.test");
  await expect(page.locator("body")).not.toContainText("LocalFixtureOnly!123");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Confira seu e-mail.", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    path: `docs/testing/artifacts/signup-confirmation-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Voltar para entrar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/entrar$/);
});

test("limite de cadastro mantém o formulário e o erro em vez de confirmar envio", async ({
  page,
}) => {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ json: { configured: true, user: null } }),
  );
  await page.route("**/api/auth/signup", (route) =>
    route.fulfill({
      status: 429,
      json: {
        error: "Muitas tentativas de envio. Aguarde antes de tentar novamente.",
      },
    }),
  );
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await page.getByLabel("E-mail", { exact: true }).fill("fixture@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("LocalFixtureOnly!123");
  await page.getByRole("button", { name: "Criar minha conta" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Muitas tentativas de envio." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(
    page.getByRole("button", { name: "Criar minha conta" }),
  ).toBeEnabled();
});
