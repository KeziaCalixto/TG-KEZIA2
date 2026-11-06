import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { request } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// API-only integration fixture. No browser traces, passwords, cookies or email links in output.
const app = "http://127.0.0.1:3000";
const mail = "http://127.0.0.1:54324";
const email = `tg-recovery-${randomUUID()}@example.com`;
const oldPassword = randomBytes(24).toString("base64url");
const newPassword = randomBytes(24).toString("base64url");
let admin, userId, initiating, fresh;
let stage = "local status";
const messageIds = [];
try {
  stage = "local status command";
  const statusOutput = execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      "& ./node_modules/.bin/supabase.cmd status -o json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 60000 },
  );
  stage = "local status JSON";
  const status = JSON.parse(statusOutput.replace(/^\uFEFF/, ""));
  stage = "local loopback check";
  assert.ok(
    ["127.0.0.1", "localhost"].includes(new URL(status.API_URL).hostname),
  );
  admin = createClient(
    status.API_URL,
    status.SECRET_KEY ?? status.SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  stage = "ephemeral local account";
  const created = await admin.auth.admin.createUser({
    email,
    password: oldPassword,
    email_confirm: true,
  });
  assert.equal(created.error, null);
  userId = created.data.user.id;
  initiating = await request.newContext({
    baseURL: app,
    extraHTTPHeaders: { Origin: app },
  });
  fresh = await request.newContext({
    baseURL: app,
    extraHTTPHeaders: { Origin: app },
  });
  stage = "recovery request and Mailpit delivery";
  assert.equal(
    (await initiating.post("/api/auth/recovery", { data: { email } })).status(),
    200,
  );
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
  assert.match(message.Subject, /Recupere sua senha/);
  const link = [
    ...message.HTML.replaceAll("&amp;", "&").matchAll(
      /href="(https?:\/\/[^\"]+)"/g,
    ),
  ]
    .map((match) => new URL(match[1]))
    .find(
      (url) =>
        url.pathname === "/auth/v1/verify" &&
        url.searchParams.get("type") === "recovery" &&
        ["127.0.0.1", "localhost"].includes(url.hostname),
    );
  assert.ok(link);
  assert.equal(
    link.searchParams.get("redirect_to"),
    `${app}/auth/callback?flow=recovery`,
  );
  console.log(
    "PASS: local recovery email delivered with custom template and exact callback; credentials kept in memory.",
  );
  stage = "PKCE callback and verified SSR session";
  const accepted = await initiating.get(link.href);
  assert.equal(new URL(accepted.url()).pathname, "/conta/definir-senha");
  assert.equal(
    (await (await initiating.get("/api/auth/session")).json()).user?.id,
    userId,
  );
  assert.equal(
    (await (await fresh.get("/api/auth/session")).json()).user,
    null,
  );
  assert.equal(
    (
      await fresh.post("/api/auth/password", {
        data: { password: newPassword, confirmation: newPassword },
      })
    ).status(),
    401,
  );
  console.log(
    "PASS: PKCE recovery creates verified SSR session only in initiating context; unauthenticated password change refused.",
  );
  stage = "password update, logout and password login";
  assert.equal(
    (
      await initiating.post("/api/auth/password", {
        data: { password: newPassword, confirmation: newPassword },
      })
    ).status(),
    200,
  );
  await initiating.post("/api/auth/logout");
  assert.equal(
    (
      await fresh.post("/api/auth/login", {
        data: { email, password: oldPassword },
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await fresh.post("/api/auth/login", {
        data: { email, password: newPassword },
      })
    ).status(),
    200,
  );
  assert.equal(
    (await (await fresh.get("/api/auth/session")).json()).user?.id,
    userId,
  );
  stage = "private history after recovery";
  const saved = await fresh.post("/api/history", {
    data: {
      input: {
        regime: "civil",
        court: "TJSP",
        locality: "Santos",
        medium: "electronic",
        communication: "publication",
        eventDate: "2026-09-04",
        days: 1,
      },
    },
  });
  assert.equal(saved.status(), 201);
  const original = (await saved.json()).calculation;
  assert.equal(original.result_snapshot.dueDate, "2026-09-09");
  assert.equal(original.result_snapshot.snapshot.calendar.locality, "Santos");
  const history = await (await fresh.get("/api/history")).json();
  assert.deepEqual(
    history.calculations.find((item) => item.id === original.id)
      ?.result_snapshot,
    original.result_snapshot,
  );
  assert.equal((await initiating.get("/api/history")).status(), 401);
  console.log(
    "PASS: recovered account saves and retrieves original Santos snapshot; signed-out context cannot read history.",
  );
  await fresh.post("/api/auth/logout");
  stage = "expired/replayed link";
  const replayed = await fresh.get(link.href);
  assert.equal(new URL(replayed.url()).pathname, "/entrar");
  assert.equal(
    (await (await fresh.get("/api/auth/session")).json()).user,
    null,
  );
  console.log(
    "PASS: new password logs in after logout; old password and replayed link refused.",
  );
} catch (error) {
  console.error(
    `FAIL: ${stage}; details intentionally suppressed to protect credentials.`,
  );
  if (stage === "local status command")
    console.error(
      `Command status: ${Number.isInteger(error.status) ? error.status : "unavailable"}; timeout: ${error.code === "ETIMEDOUT"}; missing executable: ${error.code === "ENOENT"}.`,
    );
  process.exitCode = 1;
} finally {
  await initiating?.dispose();
  await fresh?.dispose();
  if (admin && userId) {
    const result = await admin.auth.admin.deleteUser(userId);
    if (result.error) {
      console.error("FAIL: fixture cleanup");
      process.exitCode = 1;
    }
  }
  if (messageIds.length) {
    try {
      const deleted = await fetch(`${mail}/api/v1/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDs: messageIds }),
      });
      assert.equal(deleted.status, 200);
      for (const id of messageIds)
        assert.equal((await fetch(`${mail}/api/v1/message/${id}`)).status, 404);
      console.log("PASS: local account and captured fixture messages removed.");
    } catch {
      console.error("FAIL: Mailpit fixture cleanup");
      process.exitCode = 1;
    }
  }
}
