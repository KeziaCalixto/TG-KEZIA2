import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { createClient } from "@/lib/supabase/server";
import { isSameOrigin, privateJson, readJson } from "@/lib/supabase/http";
import { getReminderConfig } from "@/lib/reminders/config";

const scheduleSchema = z
  .object({
    calculationId: z.uuid(),
    leadDays: z.union([z.literal(0), z.literal(1), z.literal(3)]),
    hour: z.union([z.literal(9), z.literal(12), z.literal(18)]),
    externalEmailConsent: z.literal(true).optional(),
  })
  .strict();
const cancelSchema = z.union([
  z.object({ id: z.uuid() }).strict(),
  z.object({ all: z.literal(true) }).strict(),
]);
const unavailable = () =>
  privateJson({ error: "Lembretes indisponíveis neste ambiente." }, 503);
async function identity() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || data.user.is_anonymous) return null;
  return { client, user: data.user };
}
export async function GET(request: Request) {
  const config = getReminderConfig();
  if (!config) return privateJson({ available: false, reminders: [] });
  try {
    const auth = await identity();
    if (!auth)
      return privateJson(
        { error: "Entre na sua conta para consultar lembretes." },
        401,
      );
    const params = new URL(request.url).searchParams;
    if ([...params.keys()].length !== 1 || !params.has("ids"))
      return privateJson({ error: "Cálculos inválidos." }, 400);
    const ids = z
      .array(z.uuid())
      .min(1)
      .max(50)
      .safeParse(params.get("ids")?.split(","));
    if (!ids.success) return privateJson({ error: "Cálculos inválidos." }, 400);
    const { data, error } = await auth.client.rpc(
      "list_deadline_reminders_for_mode",
      {
        p_ids: ids.data,
        p_mode: config.mode,
      },
    );
    if (error) return unavailable();
    return privateJson({
      available: true,
      ...(config.mode === "brevo" ? { mode: config.mode } : {}),
      reminders: data ?? [],
    });
  } catch {
    return unavailable();
  }
}
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem inválida." }, 403);
  const config = getReminderConfig();
  if (!config) return unavailable();
  const parsed = scheduleSchema.safeParse(await readJson(request));
  if (!parsed.success)
    return privateJson({ error: "Opções de lembrete inválidas." }, 400);
  if ((config.mode === "brevo") !== (parsed.data.externalEmailConsent === true))
    return privateJson(
      {
        error:
          "O modo de envio mudou. Atualize o histórico e confirme novamente onde receber o lembrete.",
      },
      409,
    );
  try {
    const auth = await identity();
    if (!auth)
      return privateJson(
        { error: "Entre na sua conta para ativar um lembrete." },
        401,
      );
    if (!auth.user.email_confirmed_at || !auth.user.email)
      return privateJson(
        { error: "Confirme o e-mail da sua conta antes de ativar lembretes." },
        403,
      );
    const { data: calculation, error: lookupError } = await auth.client
      .from("deadline_calculations")
      .select("result_snapshot")
      .eq("owner_id", auth.user.id)
      .eq("id", parsed.data.calculationId)
      .maybeSingle();
    if (lookupError) return unavailable();
    if (!calculation)
      return privateJson({ error: "Cálculo não encontrado." }, 404);
    const snapshot = historySnapshotSchema.safeParse(
      calculation.result_snapshot,
    );
    if (
      !snapshot.success ||
      snapshot.data.status !== "provisional" ||
      !snapshot.data.dueDate
    )
      return privateJson(
        {
          error:
            "Este cálculo não tem memória e vencimento elegíveis para lembrete.",
        },
        409,
      );
    const now = Temporal.Instant.fromEpochMilliseconds(Date.now());
    const due = Temporal.PlainDate.from(snapshot.data.dueDate);
    const planned = due
      .subtract({ days: parsed.data.leadDays })
      .toZonedDateTime({
        timeZone: "America/Sao_Paulo",
        plainTime: Temporal.PlainTime.from({ hour: parsed.data.hour }),
      })
      .toInstant();
    if (
      Temporal.Instant.compare(planned, now) <= 0 ||
      Temporal.PlainDate.compare(
        due,
        now.toZonedDateTimeISO("America/Sao_Paulo").toPlainDate(),
      ) < 0
    )
      return privateJson(
        {
          error:
            "Escolha uma antecedência e horário que ainda estejam no futuro.",
        },
        409,
      );
    const { data, error } = await auth.client.rpc(
      config.mode === "brevo"
        ? "schedule_deadline_reminder_for_mode"
        : "schedule_deadline_reminder",
      {
        p_calculation_id: parsed.data.calculationId,
        p_lead_days: parsed.data.leadDays,
        p_hour: parsed.data.hour,
        ...(config.mode === "brevo" ? { p_mode: config.mode } : {}),
      },
    );
    if (error) {
      const status =
        error.code === "23505" || error.code === "22023"
          ? 409
          : error.code === "42501"
            ? 403
            : error.code === "P0002"
              ? 404
              : 503;
      return privateJson(
        {
          error:
            status === 409
              ? "Já existe lembrete ativo ou o horário não está mais disponível. Atualize a lista."
              : "Não foi possível ativar o lembrete.",
        },
        status,
      );
    }
    return privateJson({ id: data }, 201);
  } catch {
    return unavailable();
  }
}
export async function DELETE(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem inválida." }, 403);
  if (!getReminderConfig()) return unavailable();
  const parsed = cancelSchema.safeParse(await readJson(request));
  if (!parsed.success)
    return privateJson({ error: "Cancelamento inválido." }, 400);
  try {
    const auth = await identity();
    if (!auth)
      return privateJson(
        { error: "Entre na sua conta para cancelar lembretes." },
        401,
      );
    const { data, error } = await auth.client.rpc("cancel_deadline_reminders", {
      p_id: "id" in parsed.data ? parsed.data.id : null,
    });
    if (error) return unavailable();
    if ("id" in parsed.data && !data)
      return privateJson({ error: "Lembrete ativo não encontrado." }, 404);
    return privateJson({ cancelled: data });
  } catch {
    return unavailable();
  }
}
