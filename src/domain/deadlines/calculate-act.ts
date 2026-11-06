import { proceduralActs } from "./acts";
import type {
  CalculationInput,
  CalculationResult,
  JudicialCalendar,
} from "./types";

export function calculateActDeadline(
  input: CalculationInput,
  calendar: JudicialCalendar,
  calculateBase: (
    input: unknown,
    calendar: JudicialCalendar,
  ) => CalculationResult,
): CalculationResult {
  const selection = input.act!;
  const act = proceduralActs.find(
    (candidate) =>
      candidate.id === selection.id && candidate.version === selection.version,
  );
  const blockers: string[] = [];
  if (!act)
    blockers.push(
      "Ato ou versão não disponível. Nenhum prazo foi escolhido automaticamente.",
    );
  if (act && (act.regime !== input.regime || act.court !== input.court))
    blockers.push("O ato não corresponde ao regime e tribunal selecionados.");
  if (act && act.days !== input.days)
    blockers.push(
      "A quantidade diverge da duração fixa do ato. Escolha cálculo manual para outra quantidade.",
    );
  if (selection.eligibility !== "confirmed")
    blockers.push(
      "Confirme todas as condições do ato. Dúvida, ciência anterior, audiência ou hipótese excluída exigem outro enquadramento.",
    );
  if (act && input.eventDate < act.supportFrom)
    blockers.push("Evento anterior ao período suportado pelo catálogo.");
  if (input.regime !== "civil" && input.context !== "ordinary")
    blockers.push(
      "O contexto comum precisa ser confirmado; exceções não estão habilitadas pelo ato.",
    );
  const pending =
    "Catálogo parcial de atos; revisão jurídica pendente. Não verifica admissibilidade nem efeitos sobre outros prazos.";
  const metadata = {
    actId: selection.id,
    actVersion: selection.version,
    engineVersion: "0.4.0",
    ruleVersion: "procedural-act-guard-2026-10-22",
    calendarId: calendar.id,
    calendarVersion: calendar.version,
    calendarCompleteness: calendar.completeness,
    calendarConsultedOn: calendar.consultedOn,
    legalReview: "pending" as const,
    timeZone: "America/Sao_Paulo" as const,
  };
  if (blockers.length || !act)
    return {
      status: "incomplete",
      input,
      eventDate: input.eventDate,
      publicationDate: null,
      legalStartDate: null,
      firstCountedDate: null,
      dueDate: null,
      trace: [],
      sources: act ? structuredClone(act.sources) : [],
      warnings: [
        ...blockers,
        pending,
        "O calendário selecionado é parcial; confira atos locais não cadastrados.",
      ],
      snapshot: {
        calendar: structuredClone(calendar),
        ...(act ? { act: structuredClone(act) } : {}),
      },
      metadata,
    };
  const { act: _selection, ...baseInput } = input;
  void _selection;
  const result = calculateBase(baseInput, calendar);
  const sources = new Map(result.sources.map((source) => [source.id, source]));
  act.sources.forEach((source) =>
    sources.set(source.id, structuredClone(source)),
  );
  return {
    ...result,
    input,
    trace: result.trace.map((day, index) =>
      index === 0
        ? {
            ...day,
            reasons: [
              ...day.reasons,
              `${act.label}: ${act.days} dias. Condições do catálogo declaradas pelo usuário.`,
            ],
            sourceIds: [
              ...new Set([
                ...day.sourceIds,
                ...act.sources.map((source) => source.id),
              ]),
            ],
          }
        : day,
    ),
    sources: [...sources.values()],
    warnings: [...result.warnings, pending],
    snapshot: { ...result.snapshot, act: structuredClone(act) },
    metadata: {
      ...result.metadata,
      actId: act.id,
      actVersion: act.version,
      countingEngineVersion: result.metadata.engineVersion,
      engineVersion: "0.4.0",
    },
  };
}
