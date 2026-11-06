import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
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
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname))
    throw new Error("local_only");
  const path = new URL("../../.env.local", import.meta.url);
  let source = await readFile(path, "utf8");
  const publicUrl = source
    .match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]
    ?.trim()
    .replace(/^['"]|['"]$/g, "");
  if (!publicUrl || new URL(publicUrl).origin !== url.origin)
    throw new Error("local_environment_required");
  const key = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
  if (typeof key !== "string" || !key) throw new Error("local_key_missing");
  const previous = source
    .match(/^REMINDERS_DISPATCH_SECRET=([^\r\n]+)$/m)?.[1]
    ?.trim();
  const values = {
    REMINDERS_MODE: "local",
    REMINDERS_APP_URL: "http://127.0.0.1:3000",
    REMINDERS_MAILPIT_URL: "http://127.0.0.1:54324",
    REMINDERS_SUPABASE_SECRET_KEY: key,
    REMINDERS_DISPATCH_SECRET:
      previous && previous.length >= 32
        ? previous
        : randomBytes(32).toString("hex"),
  };
  for (const [name, value] of Object.entries(values)) {
    const pattern = new RegExp(`^${name}=.*$`, "m");
    source = pattern.test(source)
      ? source.replace(pattern, `${name}=${value}`)
      : `${source.trimEnd()}\n${name}=${value}\n`;
  }
  await writeFile(path, source, "utf8");
  console.log(
    "Lembretes configurados exclusivamente para Supabase/Mailpit locais em .env.local ignorado pelo Git. Reinicie o aplicativo. Nenhuma credencial foi exibida.",
  );
} catch {
  console.error(
    "Não foi possível preparar lembretes locais. Confira a stack e o .env.local conforme docs/email-reminders.md. Detalhes sensíveis omitidos.",
  );
  process.exitCode = 1;
}
