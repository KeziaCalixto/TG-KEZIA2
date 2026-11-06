import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// No traces, screenshots or token URLs: invitation credentials stay in memory.
let admin, browser, userId;
let stage = "local status";
const messageIds = [];
const email = `tg-invite-${randomUUID()}@example.com`;
const app = "http://127.0.0.1:3000";
const mail = "http://127.0.0.1:54324";
try {
  const status = JSON.parse(
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "& ./node_modules/.bin/supabase.cmd status -o json",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30000 },
    ),
  );
  assert.ok(
    ["127.0.0.1", "localhost"].includes(new URL(status.API_URL).hostname),
  );
  admin = createClient(
    status.API_URL,
    status.SECRET_KEY ?? status.SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  stage = "invite delivery";
  const invited = await admin.auth.admin.inviteUserByEmail(email);
  assert.equal(invited.error, null);
  userId = invited.data.user.id;
  let message;
  for (let i = 0; i < 40 && !message; i++) {
    const inbox = await (await fetch(`${mail}/api/v1/messages`)).json();
    const item = inbox.messages?.find((item) =>
      item.To?.some((to) => to.Address === email),
    );
    if (item) {
      messageIds.push(item.ID);
      message = await (await fetch(`${mail}/api/v1/message/${item.ID}`)).json();
    } else await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(message);
  const links = [
    ...message.HTML.replaceAll("&amp;", "&").matchAll(
      /href="(https?:\/\/[^\"]+)"/g,
    ),
  ].map((match) => new URL(match[1]));
  const link = links.find(
    (url) =>
      url.pathname === "/auth/v1/verify" &&
      ["localhost", "127.0.0.1"].includes(url.hostname),
  );
  assert.ok(link);
  browser = await chromium.launch({
    channel: process.platform === "win32" ? "msedge" : undefined,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  stage = "accept invite in fresh browser, persist SSR session";
  assert.equal(
    (
      await context.request.post(`${app}/api/auth/password`, {
        headers: { Origin: app },
        data: { password: "valid-password", confirmation: "valid-password" },
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await context.request.post(`${app}/api/auth/password`, {
        headers: { Origin: "http://attacker.invalid" },
        data: { password: "valid-password", confirmation: "valid-password" },
      })
    ).status(),
    403,
  );
  await page.goto(link.href);
  await page.waitForURL(
    (url) => url.pathname === "/conta/definir-senha" && !url.hash,
  );
  const session = await (
    await context.request.get(`${app}/api/auth/session`)
  ).json();
  assert.equal(session.user?.id, userId);
  await page.getByText("Conectado", { exact: true }).waitFor();
  console.log(
    "PASS: invitation from Mailpit accepted in fresh browser; verified SSR identity and visible connected account.",
  );

  stage = "invited user defines password";
  const password = randomBytes(24).toString("base64url");
  await page.getByLabel("Nova senha", { exact: true }).fill(password);
  await page
    .getByLabel("Confirme a nova senha", { exact: true })
    .fill(password);
  await page
    .getByRole("button", { name: "Salvar senha e continuar", exact: true })
    .click();
  await page.waitForURL(
    (url) =>
      url.pathname === "/entrar" &&
      url.searchParams.get("senha") === "definida",
  );
  await page
    .getByRole("heading", { name: "Sua conta.", exact: true })
    .waitFor();
  assert.equal(new URL(page.url()).hash, "");
  await page.reload();
  assert.equal(
    (await (await context.request.get(`${app}/api/auth/session`)).json()).user
      ?.id,
    userId,
  );
  await page.getByText("Conectado", { exact: true }).waitFor();
  console.log(
    "PASS: invited user sets password, remains authenticated after reload; credentials absent from URL.",
  );

  stage = "logout, password login and global account feedback";
  await page
    .getByRole("button", { name: "Sair da conta", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Entrar na conta", exact: true })
    .waitFor();
  assert.equal((await context.request.get(`${app}/api/history`)).status(), 401);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Entrar na conta", exact: true })
    .click();
  await page.getByText("Conectado", { exact: true }).waitFor();
  await page.goto(app);
  await page.getByText("Conectado", { exact: true }).waitFor();
  assert.ok(
    await page
      .getByRole("link", { name: `Conta conectada: ${email}`, exact: true })
      .isVisible(),
  );
  await page.setViewportSize({ width: 375, height: 812 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.getByText("Conectado", { exact: true }).waitFor();
  console.log(
    "PASS: logout updates header, invited password login works, connected indicator persists across pages and at 375px.",
  );

  stage = "reused invitation in another browser";
  const reusedContext = await browser.newContext();
  const reusedPage = await reusedContext.newPage();
  await reusedPage.goto(link.href);
  await reusedPage
    .getByRole("alert")
    .filter({ hasText: "Link inválido ou expirado" })
    .waitFor();
  assert.equal(
    (await reusedContext.request.get(`${app}/api/history`)).status(),
    401,
  );
  assert.equal(new URL(reusedPage.url()).hash, "");
  console.log(
    "PASS: reused invitation reports an accessible error and does not create a session.",
  );
  await reusedPage.goto(
    `${app}/#access_token=invalid&refresh_token=invalid&type=invite`,
  );
  await reusedPage
    .getByRole("alert")
    .filter({ hasText: "Link inválido ou expirado" })
    .waitFor();
  assert.equal(new URL(reusedPage.url()).hash, "");
  assert.equal(
    (await reusedContext.request.get(`${app}/api/history`)).status(),
    401,
  );
  console.log(
    "PASS: invalid invitation fragment removed without authenticating; anonymous/cross-origin password updates denied.",
  );
  await context.request.post(`${app}/api/auth/logout`, {
    headers: { Origin: app },
  });
} catch (error) {
  console.error(
    `FAIL: invitation verification at stage "${stage}" (${error.name}). Sensitive output suppressed.`,
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
  let failed = false;
  if (admin && !userId) {
    const list = await admin.auth.admin.listUsers({ perPage: 1000 });
    userId = list.data?.users.find((user) => user.email === email)?.id;
  }
  if (userId && (await admin.auth.admin.deleteUser(userId)).error)
    failed = true;
  if (messageIds.length) {
    const response = await fetch(`${mail}/api/v1/messages`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ IDs: messageIds }),
    });
    if (!response.ok) failed = true;
  }
  if (failed) {
    console.error("FAIL: invitation fixture cleanup");
    process.exitCode = 1;
  } else if (userId)
    console.log(
      "PASS: ephemeral invitation user and local test email removed.",
    );
}
