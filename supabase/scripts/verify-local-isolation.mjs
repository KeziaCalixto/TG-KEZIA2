import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
// Only local status is read. Privileged fields stay in memory for fixture cleanup.
let status;
try {
  status = JSON.parse(
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "& ./node_modules/.bin/supabase.cmd status -o json",
      ],
      {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 20_000,
      },
    ),
  );
} catch {
  console.error(
    "FAIL: local status unavailable or invalid. No captured credentials are displayed.",
  );
  process.exit(1);
}
const url = new URL(status.API_URL);
assert.ok(
  ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname),
  "Only local Supabase is permitted",
);
assert.ok(
  status.PUBLISHABLE_KEY?.startsWith("sb_publishable_"),
  "A modern public key is required",
);
const adminKey = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
assert.ok(
  typeof adminKey === "string",
  "Local fixture administration key unavailable",
);
const options = {
  global: {
    fetch: (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(15_000) }),
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const admin = createClient(url.href, adminKey, options);
const owner = createClient(url.href, status.PUBLISHABLE_KEY, options);
const other = createClient(url.href, status.PUBLISHABLE_KEY, options);
const anonymous = createClient(url.href, status.PUBLISHABLE_KEY, options);
const users = [];
let stage = "fixture creation";
let cleanupFailed = false;
try {
  const prefix = `verification-${randomUUID()}`;
  const password = randomBytes(24).toString("base64url");
  for (const suffix of ["owner", "other"]) {
    const email = `${prefix}-${suffix}@example.invalid`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.equal(error, null);
    assert.ok(data.user);
    users.push({ id: data.user.id, email });
  }
  stage = "password sign-in";
  for (const [client, user] of [
    [owner, users[0]],
    [other, users[1]],
  ]) {
    const { error } = await client.auth.signInWithPassword({
      email: user.email,
      password,
    });
    assert.equal(error, null);
    const verified = await client.auth.getUser();
    assert.equal(verified.error, null);
    assert.equal(verified.data.user.id, user.id);
  }
  stage = "owner insertion and read";
  const { data: saved, error: saveError } = await owner
    .from("deadline_calculations")
    .insert({
      owner_id: users[0].id,
      title: "Ephemeral RLS fixture",
      input: {},
      result_snapshot: {},
    })
    .select("id,title")
    .single();
  assert.equal(saveError, null);
  assert.ok(saved?.id);
  stage = "unauthenticated read";
  const noSession = await anonymous.from("deadline_calculations").select("id");
  assert.equal(noSession.error?.code, "42501");
  stage = "cross-user read";
  const crossRead = await other
    .from("deadline_calculations")
    .select("id")
    .eq("id", saved.id);
  assert.equal(crossRead.error, null);
  assert.deepEqual(crossRead.data, []);
  stage = "cross-user insert";
  const forgedOwner = await other.from("deadline_calculations").insert({
    owner_id: users[0].id,
    title: "Denied",
    input: {},
    result_snapshot: {},
  });
  assert.equal(forgedOwner.error?.code, "42501");
  stage = "snapshot update denial";
  const update = await owner
    .from("deadline_calculations")
    .update({ title: "Denied" })
    .eq("id", saved.id);
  assert.equal(update.error?.code, "42501");
  stage = "cross-user delete";
  const crossDelete = await other
    .from("deadline_calculations")
    .delete()
    .eq("id", saved.id)
    .select("id");
  assert.equal(crossDelete.error, null);
  assert.deepEqual(crossDelete.data, []);
  const intact = await owner
    .from("deadline_calculations")
    .select("title")
    .eq("id", saved.id)
    .single();
  assert.equal(intact.error, null);
  assert.equal(intact.data.title, "Ephemeral RLS fixture");
  stage = "owner delete";
  const removed = await owner
    .from("deadline_calculations")
    .delete()
    .eq("id", saved.id)
    .select("id");
  assert.equal(removed.error, null);
  assert.equal(removed.data.length, 1);
  stage = "logout";
  assert.equal((await owner.auth.signOut()).error, null);
  assert.equal((await other.auth.signOut()).error, null);
  console.log(
    "PASS: local password Auth, verified identities, owner CRUD permissions, cross-user isolation and anonymous denial.",
  );
} catch {
  console.error(
    `FAIL: local verification at stage "${stage}". No credentials are displayed.`,
  );
  process.exitCode = 1;
} finally {
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) cleanupFailed = true;
  }
  if (cleanupFailed) {
    console.error(
      "FAIL: ephemeral fixture cleanup needs inspection in the local Auth instance.",
    );
    process.exitCode = 1;
  } else if (users.length) {
    console.log(
      "PASS: ephemeral test users removed; related rows removed by cascade.",
    );
  }
}
