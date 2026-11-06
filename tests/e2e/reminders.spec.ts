import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { calculateForMvp } from "../../src/application/calculate";
import { historyResponse } from "../helpers/history-response";
const calculationId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const reminderId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const snapshot = calculateForMvp({
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-11-09",
  days: 1,
});
const item = {
  id: calculationId,
  title: "Aula com lembrete",
  created_at: "2026-10-23T12:00:00Z",
  result_snapshot: snapshot,
  recomputed: null,
  integrity: "unverified",
  dueStatus: "future",
};
async function history(page: Page) {
  await page.route("**/api/history?**", (route) =>
    route.fulfill({
      json: { ...historyResponse([item]), asOfDate: "2026-10-23" },
    }),
  );
}

test("envio externo exige consentimento próprio e distingue aceite de entrega", async ({
  page,
}, testInfo) => {
  await history(page);
  let accepted = false;
  await page.route("**/api/reminders**", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({
        json: {
          available: true,
          mode: "brevo",
          reminders: accepted
            ? [
                {
                  id: reminderId,
                  calculation_id: calculationId,
                  status: "accepted",
                  send_at: "2026-11-09T12:00:00Z",
                  time_zone: "America/Sao_Paulo",
                  lead_days: 1,
                  accepted_at: "2026-11-09T12:00:00Z",
                  delivery_mode: "brevo",
                },
              ]
            : [],
        },
      });
    expect(route.request().postDataJSON()).toEqual({
      calculationId,
      leadDays: 1,
      hour: 9,
      externalEmailConsent: true,
    });
    accepted = true;
    return route.fulfill({ status: 201, json: { id: reminderId } });
  });
  await page.goto("/historico");
  await expect(
    page.getByRole("button", { name: "Ativar lembrete", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Lembretes por e-mail · teste local", { exact: true }),
  ).toHaveCount(0);
  const consent = page.getByRole("checkbox", {
    name: "Quero receber este lembrete no e-mail confirmado da minha conta.",
  });
  await expect(consent).not.toBeChecked();
  if (testInfo.project.name === "desktop")
    await page.screenshot({
      path: "docs/testing/artifacts/reminder-external-consent-desktop.png",
      fullPage: true,
    });
  await consent.check();
  await page
    .getByRole("button", { name: "Ativar lembrete", exact: true })
    .click();
  await expect(
    page.getByText("Aceito pelo serviço de e-mail · entrega não confirmada", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Lembrete agendado. O envio ao e-mail confirmado da sua conta está previsto para o horário escolhido.",
      { exact: true },
    ),
  ).toBeFocused();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
test("ativa somente com escolha explícita e permite cancelar com feedback acessível", async ({
  page,
}) => {
  await history(page);
  let reminder: Record<string, unknown> | null = null;
  await page.route("**/api/reminders**", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({
        json: { available: true, reminders: reminder ? [reminder] : [] },
      });
    if (route.request().method() === "POST") {
      expect(route.request().postDataJSON()).toEqual({
        calculationId,
        leadDays: 1,
        hour: 12,
      });
      reminder = {
        id: reminderId,
        calculation_id: calculationId,
        status: "pending",
        send_at: "2026-11-09T15:00:00Z",
        time_zone: "America/Sao_Paulo",
        lead_days: 1,
        accepted_at: null,
      };
      return route.fulfill({ status: 201, json: { id: reminderId } });
    }
    expect(route.request().postDataJSON()).toEqual({ id: reminderId });
    reminder = { ...reminder, status: "cancelled" };
    return route.fulfill({ json: { cancelled: 1 } });
  });
  await page.goto("/historico");
  await expect(
    page.getByRole("button", { name: "Ativar lembrete", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Horário em São Paulo").selectOption("12");
  await page
    .getByRole("checkbox", {
      name: "Quero receber este lembrete na caixa local de testes.",
    })
    .check();
  await page
    .getByRole("button", { name: "Ativar lembrete", exact: true })
    .click();
  await expect(page.getByText("Agendado", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Lembrete ativado" }),
  ).toBeFocused();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Cancelar lembrete", exact: true })
    .click();
  await expect(page.getByText("Cancelado", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Lembrete cancelado." }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("cancelamento de todos requer confirmação e preserva foco", async ({
  page,
}) => {
  await history(page);
  let cancelled = false;
  let deletes = 0;
  await page.route("**/api/reminders**", async (route) => {
    if (route.request().method() === "DELETE") {
      expect(route.request().postDataJSON()).toEqual({ all: true });
      cancelled = true;
      deletes++;
      return route.fulfill({ json: { cancelled: 2 } });
    }
    return route.fulfill({
      json: {
        available: true,
        reminders: [
          {
            id: reminderId,
            calculation_id: calculationId,
            status: cancelled ? "cancelled" : "pending",
            send_at: "2026-11-09T12:00:00Z",
            time_zone: "America/Sao_Paulo",
            lead_days: 1,
            accepted_at: null,
          },
        ],
      },
    });
  });
  await page.goto("/historico");
  const trigger = page.getByRole("button", {
    name: "Cancelar todos os lembretes ativos",
    exact: true,
  });
  await trigger.click();
  await expect(
    page.getByRole("group", {
      name: "Confirmar cancelamento dos lembretes",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Manter lembretes", exact: true })
    .click();
  expect(deletes).toBe(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole("button", {
      name: "Confirmar cancelamento de todos",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Todos os lembretes ativos foram cancelados." }),
  ).toBeFocused();
  expect(deletes).toBe(1);
});
test("erro de ativação não vira sucesso e link abre memória original privada", async ({
  page,
}) => {
  await history(page);
  await page.route("**/api/reminders**", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 503,
          json: { error: "Não foi possível ativar o lembrete." },
        })
      : route.fulfill({ json: { available: true, reminders: [] } }),
  );
  await page.goto(`/historico?calculationId=${calculationId}`);
  await expect(page.getByTestId("due-date")).toContainText("10/11/2026");
  await expect(
    page.getByRole("link", { name: "Voltar ao histórico completo" }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Quero receber este lembrete na caixa local de testes.",
    })
    .check();
  await page
    .getByRole("button", { name: "Ativar lembrete", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível ativar o lembrete." }),
  ).toBeFocused();
  await expect(page.getByText("Agendado", { exact: true })).toHaveCount(0);
});
