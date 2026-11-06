// Server-only local runner. Never prints authorization headers or provider data.
const app = new URL(process.env.REMINDERS_APP_URL ?? "http://127.0.0.1:3000");
if (
  process.env.REMINDERS_MODE !== "local" ||
  app.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(app.hostname) ||
  !process.env.REMINDERS_DISPATCH_SECRET
) {
  throw new Error(
    "Configure os lembretes locais conforme docs/email-reminders.md.",
  );
}
const watch = process.argv.includes("--watch");
do {
  try {
    const response = await fetch(
      new URL("/api/internal/reminders/dispatch", app),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REMINDERS_DISPATCH_SECRET}`,
        },
        signal: AbortSignal.timeout(65_000),
        redirect: "error",
      },
    );
    if (!response.ok) {
      console.error(
        `Dispatcher local indisponível (HTTP ${response.status}). Confira a configuração e os estados na aplicação.`,
      );
      if (!watch) process.exitCode = 1;
    } else {
      const counts = await response.json();
      console.log(
        `Lote local: ${Number(counts.claimed) || 0} obtidos, ${Number(counts.accepted) || 0} aceitos, ${Number(counts.failed) || 0} falhas/tentativas, ${Number(counts.uncertain) || 0} incertos, ${Number(counts.skipped) || 0} ignorados.`,
      );
    }
  } catch {
    console.error(
      "Falha ao contatar o dispatcher local; confira os estados antes de repetir.",
    );
    if (!watch) process.exitCode = 1;
  }
  if (watch) await new Promise((resolve) => setTimeout(resolve, 60_000));
} while (watch);
