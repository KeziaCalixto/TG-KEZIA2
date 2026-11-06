import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Local integration harness: no traces, passwords, cookies or confirmation URLs
// are saved to artifacts. Fixtures are removed even if a check fails.
const root = fileURLToPath(new URL("../../", import.meta.url));
const app = "http://127.0.0.1:3000";
const mail = "http://127.0.0.1:54324";
const users = new Set();
const messages = new Set();
let admin;
let browser;
let stage = "local configuration";
let ownerEmail;
const jsonRequest = (data) => ({
  headers: { Origin: app },
  data,
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(page, email, password) {
  await page.goto(`${app}/entrar`);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Entrar na conta", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Sua conta.", exact: true })
    .waitFor();
}

try {
  const command =
    process.platform === "win32"
      ? [
          "powershell.exe",
          [
            "-NoProfile",
            "-Command",
            "& ./node_modules/.bin/supabase.cmd status -o json",
          ],
        ]
      : ["pnpm", ["exec", "supabase", "status", "-o", "json"]];
  const status = JSON.parse(
    execFileSync(command[0], command[1], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30_000,
    }),
  );
  const url = new URL(status.API_URL);
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(url.hostname));
  assert.ok(status.PUBLISHABLE_KEY?.startsWith("sb_publishable_"));
  admin = createClient(url.href, status.SECRET_KEY ?? status.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
    },
  });
  browser = await chromium.launch({
    channel: process.platform === "win32" ? "msedge" : undefined,
  });
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  ownerPage.setDefaultTimeout(15_000);
  const id = randomUUID();
  ownerEmail = `tg-app-${id}@example.com`;
  const otherEmail = `tg-other-${id}@example.com`;
  const password = randomBytes(24).toString("base64url");

  stage = "signup from browser";
  await ownerPage.goto(`${app}/entrar`);
  stage = "configured browser session";
  assert.equal(
    (await (await ownerContext.request.get(`${app}/api/auth/session`)).json())
      .configured,
    true,
  );
  await ownerPage
    .getByRole("button", { name: "Entrar na conta", exact: true })
    .waitFor();
  stage = "signup form";
  await ownerPage
    .getByRole("button", { name: "Criar conta", exact: true })
    .click();
  await ownerPage.getByLabel("E-mail", { exact: true }).fill(ownerEmail);
  await ownerPage.getByLabel("Senha", { exact: true }).fill(password);
  const signupPromise = ownerPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/signup") &&
      response.request().method() === "POST",
  );
  await ownerPage
    .getByRole("button", { name: "Criar minha conta", exact: true })
    .click();
  stage = "signup HTTP response";
  assert.equal((await signupPromise).status(), 200);
  stage = "signup confirmation page";
  await ownerPage.waitForURL(`${app}/conta/confirmar-email`);
  await ownerPage
    .getByRole("heading", { name: "Confira seu e-mail.", exact: true })
    .waitFor();
  stage = "lookup created signup fixture";
  const listed = await admin.auth.admin.listUsers({ perPage: 1000 });
  assert.equal(listed.error, null);
  const owner = listed.data.users.find((user) => user.email === ownerEmail);
  assert.ok(owner);
  users.add(owner.id);
  assert.equal(
    (await (await ownerContext.request.get(`${app}/api/auth/session`)).json())
      .user,
    null,
  );

  stage = "local confirmation email and PKCE callback";
  let email;
  for (let attempt = 0; attempt < 40 && !email; attempt++) {
    const inbox = await (
      await fetch(`${mail}/api/v1/messages`, {
        signal: AbortSignal.timeout(10_000),
      })
    ).json();
    const summary = inbox.messages?.find((message) =>
      message.To?.some((recipient) => recipient.Address === ownerEmail),
    );
    if (summary) {
      messages.add(summary.ID);
      email = await (
        await fetch(`${mail}/api/v1/message/${encodeURIComponent(summary.ID)}`)
      ).json();
    } else await delay(250);
  }
  assert.ok(email);
  assert.equal(email.Subject, "Confirme seu e-mail no Prazo Claro");
  assert.ok(email.HTML?.includes("Confirme seu e-mail no Prazo Claro"));
  const content = `${email.HTML ?? ""}\n${email.Text ?? ""}`.replaceAll(
    "&amp;",
    "&",
  );
  const confirmation = [...content.matchAll(/https?:\/\/[^\s<>"']+/g)]
    .map((match) => new URL(match[0]))
    .find(
      (link) =>
        ["127.0.0.1", "localhost"].includes(link.hostname) &&
        link.pathname.endsWith("/auth/v1/verify"),
    );
  assert.ok(confirmation);
  await ownerPage.goto(confirmation.href);
  await ownerPage.waitForURL(
    (current) =>
      current.origin === app &&
      current.searchParams.get("auth") === "confirmed",
  );
  const confirmed = await (
    await ownerContext.request.get(`${app}/api/auth/session`)
  ).json();
  assert.equal(confirmed.user?.id, owner.id);
  console.log(
    "PASS: browser signup, local email confirmation and PKCE server session.",
  );

  stage = "logout and password login";
  await ownerPage.goto(`${app}/entrar`);
  await ownerPage
    .getByRole("button", { name: "Sair da conta", exact: true })
    .click();
  await ownerPage
    .getByRole("button", { name: "Entrar na conta", exact: true })
    .waitFor();
  assert.equal(
    (await ownerContext.request.get(`${app}/api/history`)).status(),
    401,
  );
  const deniedLogin = await ownerContext.request.post(
    `${app}/api/auth/login`,
    jsonRequest({ email: ownerEmail, password: "incorrect-password" }),
  );
  assert.equal(deniedLogin.status(), 401);
  await login(ownerPage, ownerEmail, password);
  await ownerPage.reload();
  await ownerPage
    .getByRole("heading", { name: "Sua conta.", exact: true })
    .waitFor();
  assert.equal(
    (await (await ownerContext.request.get(`${app}/api/auth/session`)).json())
      .user?.id,
    owner.id,
  );
  console.log(
    "PASS: incorrect password denied, login/logout and session after page reload.",
  );

  stage = "calculate, save and reload private history";
  await ownerPage.goto(app);
  await ownerPage
    .getByRole("button", { name: "Preencher um exemplo", exact: true })
    .click();
  await ownerPage
    .getByRole("button", { name: "Calcular prazo", exact: true })
    .click();
  await ownerPage.getByTestId("due-date").waitFor();
  assert.equal(
    await ownerPage.getByTestId("due-date").textContent(),
    "14/10/2026",
  );
  await ownerPage
    .getByLabel("Título para salvar (opcional)")
    .fill("Fixture de integração local");
  const savePromise = ownerPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/history") &&
      response.request().method() === "POST",
  );
  await ownerPage
    .getByRole("button", { name: "Salvar cálculo no histórico", exact: true })
    .click();
  const savedResponse = await savePromise;
  assert.equal(savedResponse.status(), 201);
  const saved = (await savedResponse.json()).calculation;
  assert.equal(saved.title, "Fixture de integração local");
  assert.equal(saved.result_snapshot.status, "provisional");
  assert.equal(saved.result_snapshot.dueDate, "2026-10-14");
  await ownerPage.goto(`${app}/historico`);
  await ownerPage
    .getByRole("button", { name: "Ver memória original", exact: true })
    .waitFor();
  await ownerPage.reload();
  await ownerPage
    .getByRole("button", { name: "Ver memória original", exact: true })
    .click();
  stage = "readable original memory";
  await ownerPage.getByTestId("due-date").waitFor();
  assert.equal(
    await ownerPage.getByTestId("due-date").textContent(),
    "14/10/2026",
  );
  stage = "technical original snapshot";
  await ownerPage
    .getByText("Dados técnicos originais (JSON)", { exact: true })
    .click();
  await ownerPage.locator(".history-json").waitFor();
  assert.ok(
    (await ownerPage.locator(".history-json").textContent()).includes(
      "2026-10-14",
    ),
  );
  console.log(
    "PASS: UI calculation, server persistence and original memory after reload.",
  );

  stage =
    "new profiles persisted and readable through private application history";
  for (const [
    regime,
    court,
    locality,
    eventDate,
    days,
    expectedDate,
    label,
  ] of [
    [
      "labor",
      "TRT2",
      "São Paulo",
      "2026-10-06",
      5,
      "2026-10-14",
      "Trabalhista",
    ],
    [
      "labor",
      "TRT2",
      "São Paulo",
      "2026-12-17",
      10,
      "2027-02-03",
      "Trabalhista",
    ],
    [
      "criminal",
      "TJSP",
      "São Paulo",
      "2026-10-06",
      5,
      "2026-10-13",
      "Penal / criminal",
    ],
    [
      "criminal",
      "TJSP",
      "Santos",
      "2026-09-04",
      1,
      "2026-09-09",
      "Penal / criminal",
    ],
  ]) {
    const created = await ownerContext.request.post(
      `${app}/api/history`,
      jsonRequest({
        title: `Fixture ${regime}`,
        input: {
          regime,
          court,
          locality,
          medium: "electronic",
          communication: "publication",
          eventDate,
          days,
          context: "ordinary",
        },
      }),
    );
    assert.equal(created.status(), 201);
    const record = (await created.json()).calculation;
    assert.equal(record.result_snapshot.dueDate, expectedDate);
    assert.equal(record.result_snapshot.snapshot.rule.regime, regime);
    assert.equal(record.result_snapshot.snapshot.calendar.locality, locality);
    if (expectedDate === "2027-02-03") {
      assert.equal(
        record.result_snapshot.snapshot.calendar.components.length,
        2,
      );
      assert.equal(
        record.result_snapshot.snapshot.calendar.components[1].version,
        "2026-10-22.demo.1",
      );
    }
    if (locality === "Santos") {
      assert.equal(
        record.result_snapshot.snapshot.rule.version,
        "2026-10-21.demo.2",
      );
      assert.ok(
        record.result_snapshot.sources.some(
          (source) => source.id === "TJSP-MUNICIPAIS-2026-p6",
        ),
      );
    }
    const records = (
      await (await ownerContext.request.get(`${app}/api/history`)).json()
    ).calculations;
    assert.equal(
      records.find((item) => item.id === record.id)?.recomputed?.dueDate,
      expectedDate,
    );
    await ownerPage.goto(`${app}/historico`);
    const article = ownerPage
      .locator(".history-item")
      .filter({ hasText: `Fixture ${regime}` });
    await article
      .getByRole("button", { name: "Ver memória original", exact: true })
      .click();
    await article.getByTestId("due-date").waitFor();
    assert.ok(
      (await article.locator(".result-context").first().textContent()).includes(
        label,
      ),
    );
    const removed = await ownerContext.request.delete(
      `${app}/api/history`,
      jsonRequest({ id: record.id }),
    );
    assert.equal(removed.status(), 200);
  }
  console.log(
    "PASS: labor/criminal server calculation, real persistence, reload, original memory and cleanup.",
  );

  stage = "procedural acts persisted with original sources and version";
  for (const [regime, court, actId, days, dueDate] of [
    ["civil", "TJSP", "civil-appeal", 15, "2026-10-28"],
    ["labor", "TRT2", "labor-ordinary-appeal", 8, "2026-10-19"],
    ["criminal", "TJSP", "criminal-sentence-clarification", 2, "2026-10-08"],
  ]) {
    const input = {
      regime,
      court,
      locality: "São Paulo",
      medium: "electronic",
      communication: "publication",
      eventDate: "2026-10-06",
      days,
      ...(regime === "civil" ? {} : { context: "ordinary" }),
      act: {
        id: actId,
        version: "2026-10-22.demo.1",
        eligibility: "confirmed",
      },
    };
    const blocked = await ownerContext.request.post(
      `${app}/api/history`,
      jsonRequest({
        input: { ...input, act: { ...input.act, eligibility: "unknown" } },
      }),
    );
    assert.equal(blocked.status(), 422);
    const created = await ownerContext.request.post(
      `${app}/api/history`,
      jsonRequest({ input, title: `Fixture ato ${regime}` }),
    );
    assert.equal(created.status(), 201);
    const record = (await created.json()).calculation;
    assert.equal(record.result_snapshot.dueDate, dueDate);
    assert.equal(record.result_snapshot.snapshot.act.id, actId);
    assert.equal(record.result_snapshot.metadata.actVersion, input.act.version);
    const records = (
      await (await ownerContext.request.get(`${app}/api/history`)).json()
    ).calculations;
    const savedAct = records.find((item) => item.id === record.id);
    assert.equal(
      savedAct.result_snapshot.snapshot.act.conditions.length > 0,
      true,
    );
    assert.equal(savedAct.recomputed.metadata.actId, actId);
    assert.equal(savedAct.recomputed.dueDate, dueDate);
    await ownerPage.goto(`${app}/historico`);
    await ownerPage.reload();
    const article = ownerPage
      .locator(".history-item")
      .filter({ hasText: `Fixture ato ${regime}` });
    await article
      .getByRole("button", { name: "Ver memória original", exact: true })
      .click();
    await article.getByTestId("due-date").waitFor();
    await article
      .getByText("Fontes e versões utilizadas", { exact: true })
      .click();
    await article.locator(".act-memory").waitFor();
    assert.ok(
      (await article.locator(".act-memory").textContent()).includes(
        "confirmadas pelo usuário",
      ),
    );
    assert.equal(
      (
        await ownerContext.request.delete(
          `${app}/api/history`,
          jsonRequest({ id: record.id }),
        )
      ).status(),
      200,
    );
  }
  console.log(
    "PASS: three procedural acts, unconfirmed save denied, real persistence, original conditions/sources and version-aware recomputation.",
  );

  stage = "pagination and regime filters through the real application API";
  const paginatedIds = [];
  const laborIds = [];
  // Equal timestamps must be set on INSERT: snapshots have no UPDATE grant.
  // Use only this disposable user's authenticated Data API session, with no
  // persistence, tokens in output, privilege changes or privileged DB mutation.
  const fixtureClient = createClient(url.href, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixtureLogin = await fixtureClient.auth.signInWithPassword({
    email: ownerEmail,
    password,
  });
  assert.equal(fixtureLogin.error, null);
  const tieTimestamp = new Date(
    Date.parse(saved.created_at) + 1000,
  ).toISOString();
  for (let index = 0; index < 12; index++) {
    const regime = ["civil", "labor", "criminal"][index % 3];
    const input = {
      regime,
      court: regime === "labor" ? "TRT2" : "TJSP",
      locality: "São Paulo",
      medium: "electronic",
      communication: "publication",
      eventDate: "2026-10-06",
      days: 5,
      ...(regime === "civil" ? {} : { context: "ordinary" }),
    };
    const calculated = await ownerContext.request.post(`${app}/api/calculate`, {
      data: input,
    });
    assert.equal(calculated.status(), 200);
    const snapshot = await calculated.json();
    assert.equal(snapshot.status, "provisional");
    const created = await fixtureClient
      .from("deadline_calculations")
      .insert({
        owner_id: owner.id,
        title: `Fixture paginação ${index + 1}`,
        input,
        result_snapshot: snapshot,
        status: "provisional",
        created_at: tieTimestamp,
      })
      .select("id")
      .single();
    assert.equal(created.error, null);
    paginatedIds.push(created.data.id);
    if (regime === "labor") laborIds.push(created.data.id);
  }
  assert.equal(
    (await fixtureClient.auth.signOut({ scope: "local" })).error,
    null,
  );
  const ordered = [...paginatedIds].sort().reverse();
  const orderedLabor = [...laborIds].sort().reverse();
  for (const pageNumber of [1, 2]) {
    stage = `paginated API, page ${pageNumber}: owner total`;
    const body = await (
      await ownerContext.request.get(
        `${app}/api/history?page=${pageNumber}&pageSize=2`,
      )
    ).json();
    assert.equal(body.pagination.total, 13);
    stage = `paginated API, page ${pageNumber}: UUID tie ordering`;
    assert.deepEqual(
      body.calculations.map((item) => item.id),
      ordered.slice((pageNumber - 1) * 2, pageNumber * 2),
    );
    assert.equal(body.timeZone, "America/Sao_Paulo");
    assert.match(body.asOfDate, /^\d{4}-\d{2}-\d{2}$/);
    const filtered = await (
      await ownerContext.request.get(
        `${app}/api/history?page=${pageNumber}&pageSize=2&regime=labor`,
      )
    ).json();
    stage = `paginated API, page ${pageNumber}: filtered total`;
    assert.equal(filtered.pagination.total, 4);
    assert.equal(filtered.pagination.totalPages, 2);
    stage = `paginated API, page ${pageNumber}: filtered UUID ordering`;
    assert.deepEqual(
      filtered.calculations.map((item) => item.id),
      orderedLabor.slice((pageNumber - 1) * 2, pageNumber * 2),
    );
  }
  const outside = await ownerContext.request.get(
    `${app}/api/history?page=100&regime=labor`,
  );
  stage = "paginated API: outside range and recount";
  assert.equal(outside.status(), 200);
  const outsideBody = await outside.json();
  assert.deepEqual(outsideBody.calculations, []);
  assert.equal(outsideBody.pagination.total, 4);
  await ownerPage.goto(`${app}/historico`);
  stage = "paginated browser: second page";
  await ownerPage
    .getByRole("button", { name: "Próxima página", exact: true })
    .click();
  await ownerPage.getByText("Página 2 de 2", { exact: false }).waitFor();
  assert.ok(
    (await ownerPage.locator(".history-pagination").textContent()).includes(
      "Página 2 de 2",
    ),
  );
  await ownerPage.getByLabel("Filtrar por regime").selectOption("labor");
  stage = "paginated browser: filtered rows";
  await ownerPage.getByText("4 cálculos no filtro", { exact: true }).waitFor();
  assert.equal(await ownerPage.locator(".history-item").count(), 4);
  await ownerPage.screenshot({
    path: "docs/testing/artifacts/history-pagination-local.png",
    fullPage: true,
  });
  console.log(
    "PASS: real filtered totals, interval pages, equal timestamp ordering, out-of-range recovery and browser navigation.",
  );

  stage = "second account and API ownership checks";
  const otherCreated = await admin.auth.admin.createUser({
    email: otherEmail,
    password,
    email_confirm: true,
  });
  assert.equal(otherCreated.error, null);
  assert.ok(otherCreated.data.user);
  users.add(otherCreated.data.user.id);
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  otherPage.setDefaultTimeout(15_000);
  await login(otherPage, otherEmail, password);
  const otherHistory = await (
    await otherContext.request.get(`${app}/api/history`)
  ).json();
  assert.deepEqual(otherHistory.calculations, []);
  assert.equal(otherHistory.pagination.total, 0);
  const otherFiltered = await (
    await otherContext.request.get(`${app}/api/history?regime=labor&pageSize=2`)
  ).json();
  assert.equal(otherFiltered.pagination.total, 0);
  assert.deepEqual(otherFiltered.calculations, []);
  assert.equal(
    (
      await otherContext.request.delete(
        `${app}/api/history`,
        jsonRequest({ id: paginatedIds[0] }),
      )
    ).status(),
    404,
  );
  for (const id of paginatedIds) {
    assert.equal(
      (
        await ownerContext.request.delete(
          `${app}/api/history`,
          jsonRequest({ id }),
        )
      ).status(),
      200,
    );
  }
  const emptyAfterDeletion = await ownerContext.request.get(
    `${app}/api/history?page=2&regime=labor`,
  );
  assert.equal(emptyAfterDeletion.status(), 200);
  assert.equal((await emptyAfterDeletion.json()).pagination.total, 0);
  assert.equal(
    (
      await otherContext.request.delete(
        `${app}/api/history`,
        jsonRequest({ id: saved.id }),
      )
    ).status(),
    404,
  );
  const forged = await otherContext.request.post(
    `${app}/api/history`,
    jsonRequest({
      input: saved.input,
      owner_id: owner.id,
      result: { dueDate: "2099-01-01" },
    }),
  );
  assert.equal(forged.status(), 201);
  const recomputed = (await forged.json()).calculation;
  assert.equal(recomputed.result_snapshot.dueDate, "2026-10-14");
  const ownerHistory = await (
    await ownerContext.request.get(`${app}/api/history`)
  ).json();
  assert.deepEqual(
    ownerHistory.calculations.map((item) => item.id),
    [saved.id],
  );
  const anonymous = await browser.newContext();
  assert.equal(
    (await anonymous.request.get(`${app}/api/history`)).status(),
    401,
  );
  await anonymous.close();
  console.log(
    "PASS: second account cannot read/delete first account history; forged owner/result ignored; anonymous denied.",
  );

  stage = "delete from UI and end sessions";
  await ownerPage.goto(`${app}/historico`);
  await ownerPage.getByRole("button", { name: "Excluir", exact: true }).click();
  await ownerPage
    .getByRole("button", { name: "Excluir definitivamente", exact: true })
    .click();
  await ownerPage
    .getByRole("status")
    .filter({ hasText: "Cálculo excluído." })
    .waitFor();
  await ownerPage.reload();
  await ownerPage
    .getByRole("status")
    .filter({ hasText: "Nenhum cálculo salvo." })
    .waitFor();
  for (const context of [ownerContext, otherContext]) {
    assert.equal(
      (
        await context.request.post(`${app}/api/auth/logout`, jsonRequest())
      ).status(),
      200,
    );
    assert.equal(
      (await context.request.get(`${app}/api/history`)).status(),
      401,
    );
  }
  console.log(
    "PASS: deletion through UI and private history denied after logout.",
  );
} catch (error) {
  const signal =
    error?.name === "AssertionError" &&
    ["number", "boolean"].includes(typeof error.actual)
      ? `; observed=${error.actual}; expected=${error.expected}`
      : "";
  console.error(
    `FAIL: local application verification at stage "${stage}" (${error?.name ?? "Error"}${signal}). Sensitive output suppressed.`,
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
  let cleanupFailed = false;
  if (admin && ownerEmail && !users.size) {
    const listed = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const user of listed.data?.users ?? [])
      if (user.email === ownerEmail) users.add(user.id);
  }
  for (const userId of users) {
    const result = await admin.auth.admin.deleteUser(userId);
    if (result.error) cleanupFailed = true;
  }
  if (messages.size) {
    try {
      const result = await fetch(`${mail}/api/v1/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDs: [...messages] }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!result.ok) cleanupFailed = true;
    } catch {
      cleanupFailed = true;
    }
  }
  if (cleanupFailed) {
    console.error("FAIL: inspect cleanup of local ephemeral fixtures.");
    process.exitCode = 1;
  } else if (users.size)
    console.log(
      "PASS: ephemeral users, associated rows and test confirmation email removed.",
    );
}
