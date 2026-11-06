import { calculateForMvp } from "@/application/calculate";
import { calculationInputSchema } from "@/domain/deadlines/schema";
import type { CalculationResult } from "@/domain/deadlines/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSameOrigin, privateJson, readJson } from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";
import {
  parseHistoryQuery,
  type HistoryDueStatus,
} from "@/application/history-query";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { Temporal } from "@js-temporal/polyfill";

export const dynamic = "force-dynamic";

async function authenticatedClient() {
  if (!isSupabaseConfigured()) return null;
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  return !error && data.user && !data.user.is_anonymous
    ? { client, user: data.user }
    : null;
}

export async function GET(request?: Request) {
  const options = parseHistoryQuery(
    new URL(request?.url ?? "http://localhost/api/history").searchParams,
  );
  if (!options)
    return privateJson({ error: "Filtros ou paginação inválidos." }, 400);
  if (!isSupabaseConfigured())
    return privateJson(
      { error: "Histórico remoto ainda não configurado." },
      503,
    );
  const auth = await authenticatedClient();
  if (!auth)
    return privateJson(
      { error: "Entre na sua conta para acessar o histórico." },
      401,
    );
  const scopedQuery = (head = false) => {
    let query = auth.client
      .from("deadline_calculations")
      .select("id,title,input,result_snapshot,created_at", {
        count: "exact",
        head,
      })
      .eq("owner_id", auth.user.id);
    if (options.regime) query = query.eq("input->>regime", options.regime);
    if (options.calculationId) query = query.eq("id", options.calculationId);
    return query;
  };
  const start = (options.page - 1) * options.pageSize;
  let { data, error, count } = await scopedQuery()
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + options.pageSize - 1);
  if (error?.code === "PGRST103") {
    // A deletion may leave the requested offset beyond the last row. Recount
    // without an interval, preserving the same owner and regime restrictions.
    const recount = await scopedQuery(true);
    data = [];
    error = recount.error;
    count = recount.count;
  }
  if (error || count === null)
    return privateJson(
      { error: "Não foi possível carregar o histórico." },
      503,
    );
  const timeZone = "America/Sao_Paulo";
  const asOfDate = Temporal.Instant.fromEpochMilliseconds(Date.now())
    .toZonedDateTimeISO(timeZone)
    .toPlainDate()
    .toString();
  const calculations = (data ?? []).map((row) => {
    const original = historySnapshotSchema.safeParse(row.result_snapshot);
    const dueDate =
      original.success && original.data.status === "provisional"
        ? original.data.dueDate
        : null;
    const dueStatus: HistoryDueStatus = !dueDate
      ? "undetermined"
      : dueDate < asOfDate
        ? "past"
        : dueDate === asOfDate
          ? "today"
          : "future";
    let recomputed: CalculationResult | null = null;
    try {
      const parsed = calculationInputSchema.safeParse(row.input);
      if (parsed.success) {
        const current = calculateForMvp(parsed.data);
        const snapshot: unknown = row.result_snapshot;
        const metadata =
          snapshot && typeof snapshot === "object" && "metadata" in snapshot
            ? snapshot.metadata
            : null;
        if (metadata && typeof metadata === "object") {
          const savedMetadata = metadata as Record<string, unknown>;
          const versions = [
            "engineVersion",
            "ruleVersion",
            "calendarId",
            "calendarVersion",
            "actId",
            "actVersion",
            "countingEngineVersion",
          ] as const;
          if (
            versions.every(
              (key) => savedMetadata[key] === current.metadata[key],
            )
          ) {
            recomputed = current;
          }
        }
      }
    } catch {
      // Historical versions may be unavailable; preserve the snapshot separately.
    }
    return { ...row, integrity: "unverified" as const, recomputed, dueStatus };
  });
  const total = count;
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize));
  return privateJson({
    calculations,
    asOfDate,
    timeZone,
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      total,
      totalPages,
      hasPrevious: options.page > 1,
      hasNext: options.page < totalPages,
    },
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  if (!isSupabaseConfigured())
    return privateJson(
      { error: "Histórico remoto ainda não configurado." },
      503,
    );
  const auth = await authenticatedClient();
  if (!auth)
    return privateJson({ error: "Entre na sua conta para salvar." }, 401);
  const body = await readJson(request);
  const parsed = calculationInputSchema.safeParse(body?.input);
  if (
    !parsed.success ||
    (body?.title !== undefined &&
      (typeof body.title !== "string" || body.title.length > 120))
  ) {
    return privateJson(
      { error: "Entrada inválida. O título deve ter até 120 caracteres." },
      400,
    );
  }
  const result = calculateForMvp(parsed.data);
  if (result.status === "incomplete")
    return privateJson(
      { error: "Cálculos incompletos não podem ser salvos." },
      422,
    );
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const { data, error } = await auth.client
    .from("deadline_calculations")
    .insert({
      owner_id: auth.user.id,
      title: title || "Cálculo demonstrativo",
      input: parsed.data,
      result_snapshot: result,
      status: "provisional",
    })
    .select("id,title,input,result_snapshot,created_at")
    .single();
  if (error)
    return privateJson({ error: "Não foi possível salvar o cálculo." }, 503);
  return privateJson(
    { calculation: { ...data, integrity: "unverified", recomputed: result } },
    201,
  );
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  if (!isSupabaseConfigured())
    return privateJson(
      { error: "Histórico remoto ainda não configurado." },
      503,
    );
  const auth = await authenticatedClient();
  if (!auth)
    return privateJson({ error: "Entre na sua conta para excluir." }, 401);
  const body = await readJson(request);
  if (
    typeof body?.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      body.id,
    )
  ) {
    return privateJson({ error: "Identificador inválido." }, 400);
  }
  const { data, error } = await auth.client
    .from("deadline_calculations")
    .delete()
    .eq("id", body.id)
    .eq("owner_id", auth.user.id)
    .select("id");
  if (error)
    return privateJson({ error: "Não foi possível excluir o cálculo." }, 503);
  if (!data?.length)
    return privateJson({ error: "Cálculo não encontrado." }, 404);
  return privateJson({ success: true });
}
