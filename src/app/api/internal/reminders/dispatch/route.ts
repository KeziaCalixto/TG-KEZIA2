import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { privateJson, readJson } from "@/lib/supabase/http";
import { getReminderConfig } from "@/lib/reminders/config";
import { reminderEmail } from "@/lib/reminders/email";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { checkReminderDelivery } from "@/lib/reminders/delivery";

export const runtime = "nodejs";
export const maxDuration = 120;
const claimsSchema = z
  .array(z.object({ id: z.uuid(), token: z.uuid() }))
  .max(5);
const preparedSchema = z.object({
  calculationId: z.uuid(),
  dueDate: z.iso.date(),
  leadDays: z.number().int(),
  hour: z.number().int(),
  email: z.email(),
  snapshot: historySnapshotSchema,
});

export async function POST(request: Request) {
  // Next.js can expose a stream even when HTTP declares a zero-length body.
  const hasBody = request.body && request.headers.get("content-length") !== "0";
  const operation = hasBody
    ? z
        .object({ operation: z.enum(["probe", "dispatch"]) })
        .strict()
        .safeParse(await readJson(request))
    : { success: true as const, data: { operation: "dispatch" as const } };
  if (!operation.success)
    return privateJson({ error: "Operação inválida." }, 400);
  const config = getReminderConfig(operation.data.operation === "probe");
  if (!config) return privateJson({ error: "Dispatcher indisponível." }, 503);
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${config.secret}`);
  const bearer =
    provided.length === expected.length && timingSafeEqual(provided, expected);
  let invocation: { nonce: string; timestamp: number } | null = null;
  if (!bearer) {
    const signed = z
      .object({
        timestamp: z.string().regex(/^\d{10}$/),
        nonce: z.uuid(),
        signature: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .safeParse({
        timestamp: request.headers.get("X-Prazo-Timestamp"),
        nonce: request.headers.get("X-Prazo-Nonce"),
        signature: request.headers.get("X-Prazo-Signature"),
      });
    if (
      config.mode !== "brevo" ||
      !config.schedulerSecret ||
      config.schedulerSecret.length < 32 ||
      !signed.success
    )
      return privateJson({ error: "Não autorizado." }, 401);
    const timestamp = Number(signed.data.timestamp),
      age = Math.floor(Date.now() / 1000) - timestamp;
    const signature = createHmac("sha256", config.schedulerSecret)
      .update(
        [
          "POST",
          "/api/internal/reminders/dispatch",
          "brevo",
          operation.data.operation,
          signed.data.timestamp,
          signed.data.nonce,
        ].join("\n"),
      )
      .digest();
    if (
      age < -30 ||
      age > 120 ||
      !timingSafeEqual(signature, Buffer.from(signed.data.signature, "hex"))
    )
      return privateJson({ error: "Não autorizado." }, 401);
    invocation = { nonce: signed.data.nonce, timestamp };
  }
  const client = createClient(config.supabaseUrl, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(5000) }),
    },
  });
  try {
    if (invocation) {
      const used = await client.rpc("consume_reminder_invocation", {
        p_nonce: invocation.nonce,
        p_timestamp: invocation.timestamp,
        p_operation: operation.data.operation,
      });
      if (used.error || used.data !== true)
        return privateJson({ error: "Não autorizado." }, 401);
    }
    if (operation.data.operation === "probe") {
      const check = await checkReminderDelivery(config);
      return privateJson(
        check.ready
          ? {
              probe: true,
              providerReady: true,
              deliveryEnabled:
                config.mode === "brevo" &&
                process.env.REMINDERS_DELIVERY_ENABLED === "true",
            }
          : {
              probe: true,
              providerReady: false,
              code: check.code,
              ...(check.ip ? { ip: check.ip } : {}),
            },
        check.ready ? 200 : 503,
      );
    }
    const { data, error } = await client.rpc(
      config.mode === "brevo"
        ? "claim_deadline_reminders_for_mode"
        : "claim_deadline_reminders",
      {
        p_limit: 5,
        ...(config.mode === "brevo" ? { p_mode: config.mode } : {}),
      },
    );
    const claims = claimsSchema.safeParse(data);
    if (error || !claims.success)
      return privateJson({ error: "Não foi possível consultar a fila." }, 503);
    const counts = {
      claimed: claims.data.length,
      accepted: 0,
      failed: 0,
      uncertain: 0,
      skipped: 0,
    };
    for (const claim of claims.data) {
      let outcome:
        "accepted" | "preflight_failed" | "send_rejected" | "send_uncertain" =
        "preflight_failed";
      let postStarted = false;
      try {
        if (!(await checkReminderDelivery(config)).ready)
          throw new Error("preflight");
        const ready = await client.rpc("prepare_deadline_reminder", {
          p_id: claim.id,
          p_token: claim.token,
        });
        if (ready.error) throw new Error("prepare");
        if (!ready.data) {
          counts.skipped++;
          continue;
        }
        const prepared = preparedSchema.safeParse(ready.data);
        if (
          !prepared.success ||
          prepared.data.snapshot.status !== "provisional" ||
          prepared.data.snapshot.dueDate !== prepared.data.dueDate
        ) {
          outcome = "send_rejected";
        } else {
          const message = reminderEmail(
            prepared.data,
            config.appUrl,
            config.mode,
          );
          postStarted = true;
          const sent = await fetch(
            config.mode === "local"
              ? `${config.mailpitUrl}/api/v1/send`
              : "https://api.brevo.com/v3/smtp/email",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(config.mode === "brevo"
                  ? { "api-key": config.apiKey, Accept: "application/json" }
                  : {}),
              },
              body: JSON.stringify(
                config.mode === "local"
                  ? {
                      From: {
                        Email: "lembretes@prazo-claro.test",
                        Name: "Prazo Claro",
                      },
                      To: [{ Email: prepared.data.email }],
                      ...message,
                    }
                  : {
                      sender: {
                        email: config.senderEmail,
                        name: config.senderName,
                      },
                      to: [{ email: prepared.data.email }],
                      subject: message.Subject,
                      textContent: message.Text,
                      htmlContent: message.HTML,
                      headers: { idempotencyKey: claim.id },
                    },
              ),
              signal: AbortSignal.timeout(5000),
              redirect: "error",
            },
          );
          if (sent.status >= 400 && sent.status < 500) {
            const rejection: unknown =
              config.mode === "brevo"
                ? await sent.json().catch(() => null)
                : null;
            const duplicate = z
              .object({ code: z.literal("duplicate_parameter") })
              .safeParse(rejection);
            outcome = duplicate.success ? "send_uncertain" : "send_rejected";
          } else if (
            !sent.ok ||
            (config.mode === "brevo" && sent.status !== 201)
          )
            outcome = "send_uncertain";
          else {
            const confirmation = (
              config.mode === "local"
                ? z.object({ ID: z.string().min(1) })
                : z.object({ messageId: z.string().min(1) })
            ).safeParse(await sent.json());
            outcome = confirmation.success ? "accepted" : "send_uncertain";
          }
        }
      } catch {
        outcome = postStarted ? "send_uncertain" : "preflight_failed";
      }
      const settled = await client.rpc("settle_deadline_reminder", {
        p_id: claim.id,
        p_token: claim.token,
        p_outcome: outcome,
      });
      if (settled.error || settled.data !== true) counts.uncertain++;
      else if (outcome === "accepted") counts.accepted++;
      else if (outcome === "send_uncertain") counts.uncertain++;
      else counts.failed++;
    }
    return privateJson(counts);
  } catch {
    return privateJson(
      {
        error:
          "Não foi possível concluir o processamento. Confira os estados antes de repetir.",
      },
      503,
    );
  }
}
