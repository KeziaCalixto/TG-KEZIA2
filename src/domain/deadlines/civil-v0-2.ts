import { Temporal } from "@js-temporal/polyfill";
import { cpcSource, electronicDiarySource } from "../calendars/tjsp-2026";
import { civilInputSchema, civilDateSchema } from "./schema";
import type {
  CalculationResult,
  JudicialCalendar,
  LegalSource,
  TraceDay,
} from "./types";

export const ENGINE_VERSION = "0.2.0";
export const RULE_VERSION = "civil-djen-mvp-2026-10-18";

export function calculateCivilDeadline(
  rawInput: unknown,
  calendar: JudicialCalendar,
): CalculationResult {
  const parsed = civilInputSchema.safeParse(rawInput);
  const result: CalculationResult = {
    status: "incomplete",
    input: parsed.success ? parsed.data : null,
    eventDate: parsed.success ? parsed.data.eventDate : null,
    publicationDate: null,
    legalStartDate: null,
    firstCountedDate: null,
    dueDate: null,
    trace: [],
    sources: [cpcSource, electronicDiarySource],
    warnings: [],
    snapshot: { calendar: structuredClone(calendar) },
    metadata: {
      engineVersion: ENGINE_VERSION,
      ruleVersion: RULE_VERSION,
      calendarId: calendar.id,
      calendarVersion: calendar.version,
      calendarCompleteness: calendar.completeness,
      calendarConsultedOn: calendar.consultedOn,
      legalReview: "pending",
      timeZone: "America/Sao_Paulo",
    },
  };
  const knownSources = new Map<string, LegalSource>(
    result.sources.map((source) => [source.id, source]),
  );
  const stop = (message: string): CalculationResult => {
    result.sources = [...knownSources.values()];
    result.warnings.push(message);
    return result;
  };
  if (!parsed.success)
    return stop(parsed.error.issues.map((issue) => issue.message).join(" "));
  const input = parsed.data;
  if (!calendar.version || !calendar.id)
    return stop("O calendário precisa de identificação e versão.");
  if (
    !civilDateSchema.safeParse(calendar.from).success ||
    !civilDateSchema.safeParse(calendar.to).success ||
    calendar.from > calendar.to ||
    calendar.events.some(
      (event) =>
        !civilDateSchema.safeParse(event.start).success ||
        !civilDateSchema.safeParse(event.end).success ||
        event.start > event.end,
    )
  )
    return stop(
      "O calendário possui datas inválidas ou intervalos invertidos.",
    );
  if (calendar.court !== input.court || calendar.locality !== input.locality)
    return stop(
      "O calendário não corresponde ao tribunal e à localidade informados.",
    );
  if (input.eventDate < "2016-03-18")
    return stop(
      "Data anterior à vigência da regra implementada. É necessária uma regra histórica.",
    );
  const inCoverage = (date: string) =>
    date >= calendar.from && date <= calendar.to;
  const isSuspended = (date: Temporal.PlainDate) =>
    (date.month === 12 && date.day >= 20) ||
    (date.month === 1 && date.day <= 20);
  const classify = (date: Temporal.PlainDate) => {
    const iso = date.toString();
    const events = calendar.events.filter(
      (event) => iso >= event.start && iso <= event.end,
    );
    const holidays = events.filter((event) => event.kind === "holiday");
    const suspensions = events.filter((event) => event.kind === "suspension");
    const ambiguous = events.some((event) =>
      ["interruption", "unavailability", "partial_closure"].includes(
        event.kind,
      ),
    );
    const reasons: string[] = [];
    if (date.dayOfWeek > 5) reasons.push("Fim de semana");
    holidays.forEach((event) => reasons.push(event.name));
    if (isSuspended(date))
      reasons.push("Suspensão legal — CPC, art. 220 (20/12 a 20/01)");
    suspensions.forEach((event) => reasons.push(event.name));
    events
      .filter((event) =>
        ["interruption", "unavailability", "partial_closure"].includes(
          event.kind,
        ),
      )
      .forEach((event) => reasons.push(event.name));
    for (const event of events) knownSources.set(event.source.id, event.source);
    return {
      courtWorking: date.dayOfWeek <= 5 && holidays.length === 0,
      countable: reasons.length === 0,
      ambiguous,
      reasons,
      sourceIds: [
        ...new Set([
          ...(date.dayOfWeek > 5 || isSuspended(date) ? [cpcSource.id] : []),
          ...events.map((event) => event.source.id),
        ]),
      ],
    };
  };
  const addTrace = (day: TraceDay) => {
    result.trace.push(day);
    result.sources = [...knownSources.values()];
  };
  let publication = Temporal.PlainDate.from(input.eventDate);
  if (!inCoverage(publication.toString()))
    return stop(
      "Data fora da cobertura do calendário. Nenhum vencimento foi emitido.",
    );
  addTrace({
    date: input.eventDate,
    counted: false,
    ordinal: null,
    phase: "event",
    reasons: [
      input.communication === "availability"
        ? "Disponibilização no DJEN"
        : "Publicação — marco excluído",
    ],
    sourceIds: [
      input.communication === "availability"
        ? electronicDiarySource.id
        : cpcSource.id,
    ],
  });
  if (classify(publication).ambiguous) {
    result.trace[0].reasons.push(...classify(publication).reasons);
    result.trace[0].sourceIds.push(...classify(publication).sourceIds);
    return stop(
      "O evento coincide com uma exceção de expediente ainda não suportada. Confira a certidão e o sistema aplicável.",
    );
  }
  if (input.communication === "availability") {
    if (isSuspended(publication))
      return stop(
        "Disponibilização durante a suspensão legal exige conferir as regras locais de publicação.",
      );
    for (let guard = 0; guard < 370; guard++) {
      publication = publication.add({ days: 1 });
      const iso = publication.toString();
      if (!inCoverage(iso))
        return stop("Calendário insuficiente para determinar a publicação.");
      const day = classify(publication);
      if (day.ambiguous || isSuspended(publication)) {
        addTrace({
          date: iso,
          counted: false,
          ordinal: null,
          phase: "communication",
          reasons: day.reasons,
          sourceIds: day.sourceIds,
        });
        return stop(
          "Publicação depende de ato local de expediente ainda não modelado.",
        );
      }
      addTrace({
        date: iso,
        counted: false,
        ordinal: null,
        phase: "communication",
        reasons: day.courtWorking
          ? ["Publicação no primeiro dia útil — marco excluído"]
          : day.reasons,
        sourceIds: [...day.sourceIds, electronicDiarySource.id],
      });
      if (day.courtWorking) break;
    }
  } else if (!classify(publication).courtWorking || isSuspended(publication)) {
    return stop(
      "A data de publicação informada recai em dia sem expediente ou em período que exige conferência local. Confirme o marco de comunicação.",
    );
  }
  result.publicationDate = publication.toString();
  result.legalStartDate = publication.toString();
  let date = publication;
  let counted = 0;
  // Limite explícito evita varreduras ilimitadas de calendários inválidos.
  for (let guard = 0; guard < 1500 && counted < input.days; guard++) {
    date = date.add({ days: 1 });
    const iso = date.toString();
    if (!inCoverage(iso))
      return stop(
        "A contagem ultrapassou a cobertura do calendário. Complete o calendário antes de emitir o vencimento.",
      );
    const day = classify(date);
    if (day.ambiguous) {
      addTrace({
        date: iso,
        counted: false,
        ordinal: null,
        phase: "counting",
        reasons: day.reasons,
        sourceIds: day.sourceIds,
      });
      return stop(
        "Há interrupção, indisponibilidade ou expediente parcial que exige análise específica. Vencimento não emitido.",
      );
    }
    if (day.countable) {
      counted++;
      result.firstCountedDate ??= iso;
    }
    addTrace({
      date: iso,
      counted: day.countable,
      ordinal: day.countable ? counted : null,
      phase: "counting",
      reasons: day.countable ? ["Dia útil computado"] : day.reasons,
      sourceIds: day.countable ? [cpcSource.id] : day.sourceIds,
    });
  }
  if (counted !== input.days)
    return stop("Limite de varredura atingido. Revise os dados do calendário.");
  result.dueDate = date.toString();
  result.status = "provisional";
  if (calendar.completeness === "demonstration")
    result.warnings.push(
      `Simulação com calendário parcial do TJSP — ${calendar.locality}. Ausência de evento não confirma expediente normal. Confira atos da unidade judicial e indisponibilidades.`,
    );
  result.warnings.push(
    "Regras com revisão jurídica pendente. Resultado demonstrativo para o trabalho acadêmico.",
  );
  return result;
}
