import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
const root = fileURLToPath(new URL("../../", import.meta.url));
const app = "http://127.0.0.1:3000",
  mail = "http://127.0.0.1:54324";
let stage = "local configuration",
  admin,
  browser,
  ownerEmail;
const users = new Set(),
  messages = new Set();
const json = (data) => ({ headers: { Origin: app }, data });
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
  assert.ok(
    ["127.0.0.1", "localhost", "[::1]"].includes(
      new URL(status.API_URL).hostname,
    ),
  );
  assert.equal(process.env.REMINDERS_MODE, "local");
  assert.ok(process.env.REMINDERS_DISPATCH_SECRET?.length >= 32);
  admin = createClient(
    status.API_URL,
    status.SECRET_KEY ?? status.SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  browser = await chromium.launch({
    channel: process.platform === "win32" ? "msedge" : undefined,
  });
  const ownerContext = await browser.newContext(),
    otherContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage(),
    otherPage = await otherContext.newPage();
  ownerPage.setDefaultTimeout(15_000);
  otherPage.setDefaultTimeout(15_000);
  const suffix = randomUUID(),
    password = randomBytes(24).toString("base64url");
  ownerEmail = `reminder-${suffix}@example.invalid`;
  const otherEmail = `reminder-other-${suffix}@example.invalid`;
  stage = "ephemeral confirmed identities";
  for (const email of [ownerEmail, otherEmail]) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.equal(created.error, null);
    users.add(created.data.user.id);
  }
  await login(ownerPage, ownerEmail, password);
  await login(otherPage, otherEmail, password);
  const input = {
    regime: "labor",
    court: "TRT2",
    locality: "São Paulo",
    medium: "electronic",
    communication: "publication",
    eventDate: "2027-11-09",
    days: 1,
    context: "ordinary",
  };
  const calculations = [];
  for (const title of [
    "Fixture lembrete principal",
    "Fixture lembrete secundário",
  ]) {
    const saved = await ownerContext.request.post(
      `${app}/api/history`,
      json({ input, title }),
    );
    assert.equal(saved.status(), 201);
    const calculation = (await saved.json()).calculation;
    assert.equal(calculation.result_snapshot.dueDate, "2027-11-10");
    calculations.push(calculation.id);
  }
  stage = "explicit opt-in through browser and original schedule";
  await ownerPage.goto(`${app}/historico?calculationId=${calculations[0]}`);
  const checkbox = ownerPage.getByRole("checkbox", {
    name: "Quero receber este lembrete na caixa local de testes.",
  });
  await checkbox.check();
  const activated = ownerPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/reminders") &&
      response.request().method() === "POST",
  );
  await ownerPage
    .getByRole("button", { name: "Ativar lembrete", exact: true })
    .click();
  const activation = await activated;
  assert.equal(activation.status(), 201);
  const firstId = (await activation.json()).id;
  await ownerPage.getByText("Agendado", { exact: true }).waitFor();
  let listing = await ownerContext.request.get(
    `${app}/api/reminders?ids=${calculations[0]}`,
  );
  assert.equal(listing.status(), 200);
  const first = (await listing.json()).reminders[0];
  assert.equal(first.status, "pending");
  assert.equal(
    new Date(first.send_at).toISOString(),
    "2027-11-09T12:00:00.000Z",
  );
  stage = "second account cannot read cancel or forge reminder";
  assert.deepEqual(
    (
      await (
        await otherContext.request.get(
          `${app}/api/reminders?ids=${calculations[0]}`,
        )
      ).json()
    ).reminders,
    [],
  );
  assert.equal(
    (
      await otherContext.request.delete(
        `${app}/api/reminders`,
        json({ id: firstId }),
      )
    ).status(),
    404,
  );
  assert.equal(
    (
      await otherContext.request.post(
        `${app}/api/reminders`,
        json({ calculationId: calculations[0], leadDays: 1, hour: 9 }),
      )
    ).status(),
    404,
  );
  assert.equal(
    (
      await ownerContext.request.post(
        `${app}/api/reminders`,
        json({
          calculationId: calculations[0],
          leadDays: 1,
          hour: 9,
          email: otherEmail,
        }),
      )
    ).status(),
    400,
  );
  const second = await ownerContext.request.post(
    `${app}/api/reminders`,
    json({ calculationId: calculations[1], leadDays: 3, hour: 18 }),
  );
  assert.equal(second.status(), 201);
  stage = "cancel all through confirmed browser interaction";
  await ownerPage
    .getByRole("button", {
      name: "Cancelar todos os lembretes ativos",
      exact: true,
    })
    .click();
  await ownerPage
    .getByRole("button", {
      name: "Confirmar cancelamento de todos",
      exact: true,
    })
    .click();
  await ownerPage
    .getByText("Todos os lembretes ativos foram cancelados.", { exact: true })
    .waitFor();
  const cancelled = (
    await (
      await ownerContext.request.get(
        `${app}/api/reminders?ids=${calculations.join(",")}`,
      )
    ).json()
  ).reminders;
  assert.equal(cancelled.length, 2);
  assert.ok(cancelled.every((item) => item.status === "cancelled"));
  stage = "new generation after explicit reactivation";
  await ownerPage
    .getByRole("checkbox", {
      name: "Quero receber este lembrete na caixa local de testes.",
    })
    .check();
  const reactivated = ownerPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/reminders") &&
      response.request().method() === "POST",
  );
  await ownerPage
    .getByRole("button", { name: "Ativar lembrete", exact: true })
    .click();
  const reminderId = (await (await reactivated).json()).id;
  assert.notEqual(reminderId, firstId);
  assert.match(reminderId, /^[0-9a-f-]{36}$/);
  // Advance ONLY this disposable reminder's execution clock. Original calculation,
  // snapshot, versions and grants remain untouched. No production timing override.
  const sql = `update public.deadline_reminders set send_at=now()-interval '1 second' where id='${reminderId}'::uuid;`;
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "supabase_db_TG-KEZIA2",
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-q",
    ],
    { input: sql, cwd: root, stdio: ["pipe", "pipe", "pipe"], timeout: 20_000 },
  );
  stage = "concurrent real dispatch and deduplication";
  const dispatch = () =>
    ownerContext.request.post(`${app}/api/internal/reminders/dispatch`, {
      headers: {
        Authorization: `Bearer ${process.env.REMINDERS_DISPATCH_SECRET}`,
      },
    });
  const responses = await Promise.all([dispatch(), dispatch()]);
  assert.ok(responses.every((result) => result.status() === 200));
  const counts = await Promise.all(responses.map((result) => result.json()));
  assert.equal(
    counts.reduce((total, value) => total + value.accepted, 0),
    1,
  );
  assert.equal(
    counts.reduce((total, value) => total + value.claimed, 0),
    1,
  );
  assert.equal((await (await dispatch()).json()).accepted, 0);
  stage = "real local message and private memory link";
  let received = [];
  for (let attempt = 0; attempt < 20 && !received.length; attempt++) {
    const inbox = await (await fetch(`${mail}/api/v1/messages`)).json();
    received = (inbox.messages ?? []).filter((message) =>
      message.To?.some((to) => to.Address === ownerEmail),
    );
    if (!received.length)
      await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.equal(received.length, 1);
  messages.add(received[0].ID);
  const email = await (
    await fetch(`${mail}/api/v1/message/${encodeURIComponent(received[0].ID)}`)
  ).json();
  assert.equal(email.Subject, "Prazo Claro — lembrete de vencimento estimado");
  assert.ok(email.HTML.includes("revisão jurídica pendente"));
  assert.ok(!email.HTML.includes("Fixture lembrete principal"));
  await ownerPage.goto(
    `${mail}/view/${encodeURIComponent(received[0].ID)}.html`,
  );
  await ownerPage
    .getByRole("link", { name: "Conferir memória original", exact: true })
    .waitFor();
  await ownerPage.screenshot({
    path: "docs/testing/artifacts/reminder-email-local.png",
    fullPage: true,
  });
  await ownerPage
    .getByRole("link", { name: "Conferir memória original", exact: true })
    .click();
  await ownerPage.getByTestId("due-date").waitFor();
  assert.ok(
    (await ownerPage.getByTestId("due-date").textContent()).includes(
      "10/11/2027",
    ),
  );
  await ownerPage
    .getByText("Aceito pela caixa de testes", { exact: true })
    .waitFor();
  await ownerPage.screenshot({
    path: "docs/testing/artifacts/reminder-history-local.png",
    fullPage: true,
  });
  const isolated = await otherContext.request.get(
    `${app}/api/history?calculationId=${calculations[0]}`,
  );
  assert.deepEqual((await isolated.json()).calculations, []);
  const anonymous = await browser.newContext();
  assert.equal(
    (
      await anonymous.request.get(
        `${app}/api/history?calculationId=${calculations[0]}`,
      )
    ).status(),
    401,
  );
  await anonymous.close();
  stage = "deletion cancels pending reminders and logout";
  assert.equal(
    (
      await ownerContext.request.post(
        `${app}/api/reminders`,
        json({ calculationId: calculations[0], leadDays: 3, hour: 18 }),
      )
    ).status(),
    201,
  );
  for (const id of calculations)
    assert.equal(
      (
        await ownerContext.request.delete(`${app}/api/history`, json({ id }))
      ).status(),
      200,
    );
  assert.deepEqual(
    (
      await (
        await ownerContext.request.get(
          `${app}/api/reminders?ids=${calculations.join(",")}`,
        )
      ).json()
    ).reminders,
    [],
  );
  assert.equal((await (await dispatch()).json()).claimed, 0);
  for (const context of [ownerContext, otherContext])
    await context.request.post(`${app}/api/auth/logout`, json());
  console.log(
    "PASS: explicit browser opt-in, original schedule, two-account isolation, cancel-all, new generation, concurrent dispatch once, real Mailpit message, private memory link, deletion and logout.",
  );
} catch (error) {
  console.error(
    `FAIL: reminders integration at stage "${stage}" (${error?.name ?? "Error"}). Sensitive output suppressed.`,
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
  let failed = false;
  for (const id of users) {
    const result = await admin.auth.admin.deleteUser(id);
    if (result.error) failed = true;
  }
  // Discover this fixture's messages even if a failure preceded message lookup.
  if (ownerEmail) {
    try {
      const inbox = await (await fetch(`${mail}/api/v1/messages`)).json();
      for (const message of inbox.messages ?? [])
        if (message.To?.some((to) => to.Address === ownerEmail))
          messages.add(message.ID);
    } catch {
      failed = true;
    }
  }
  if (messages.size) {
    try {
      const result = await fetch(`${mail}/api/v1/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDs: [...messages] }),
      });
      if (!result.ok) failed = true;
    } catch {
      failed = true;
    }
  }
  if (failed) {
    console.error("FAIL: verify cleanup of local reminder fixtures.");
    process.exitCode = 1;
  } else if (users.size)
    console.log(
      "PASS: ephemeral reminder users, calculations, reminders and local test messages removed.",
    );
}
