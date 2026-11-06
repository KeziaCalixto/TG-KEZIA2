import { Temporal } from "@js-temporal/polyfill";
import { electronicDiarySource } from "../calendars/tjsp-2026";
import { calculationInputSchema, civilDateSchema } from "./schema";
import {
  extendedProfiles,
  criminalSpProfile,
  laborSource,
  criminalSource,
  saturdaySource,
  laborDiarySource,
  criminalDiarySource,
} from "./profiles";
import type { CalculationResult, JudicialCalendar, TraceDay } from "./types";

export function calculateExtendedDeadline(
  raw: unknown,
  calendar: JudicialCalendar,
): CalculationResult {
  const parsed = calculationInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.regime === "civil")
    throw new Error("Perfil inválido para esta fronteira interna.");
  const input = parsed.data;
  const rule =
    input.regime === "criminal" && input.locality !== "São Paulo"
      ? criminalSpProfile
      : extendedProfiles[input.regime];
  const continuous = input.regime === "criminal";
  const legalSource = continuous ? criminalSource : laborSource;
  const result: CalculationResult = {
    status: "incomplete",
    input,
    eventDate: input.eventDate,
    publicationDate: null,
    legalStartDate: null,
    firstCountedDate: null,
    dueDate: null,
    nominalDueDate: null,
    trace: [],
    sources: [
      legalSource,
      electronicDiarySource,
      continuous ? criminalDiarySource : laborDiarySource,
      ...(continuous ? [saturdaySource] : []),
    ],
    warnings: [],
    snapshot: {
      calendar: structuredClone(calendar),
      rule: structuredClone(rule),
    },
    metadata: {
      engineVersion: "0.3.0",
      ruleVersion: `${rule.id}@${rule.version}`,
      calendarId: calendar.id,
      calendarVersion: calendar.version,
      calendarCompleteness: calendar.completeness,
      calendarConsultedOn: calendar.consultedOn,
      legalReview: "pending",
      timeZone: "America/Sao_Paulo",
    },
  };
  const sources = new Map(result.sources.map((source) => [source.id, source]));
  const stop = (message: string) => {
    result.warnings.push(message);
    result.sources = [...sources.values()];
    return result;
  };
  if (input.context !== "ordinary")
    return stop(
      "Confirme o contexto ordinário. Exceções e contexto desconhecido exigem regra própria; nenhum vencimento foi emitido.",
    );
  if (
    calendar.profile !== input.regime ||
    calendar.court !== input.court ||
    calendar.locality !== input.locality
  )
    return stop(
      "Calendário incompatível com o perfil, tribunal ou localidade.",
    );
  if (
    !calendar.id ||
    !calendar.version ||
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
    return stop("Calendário inválido ou sem versão.");
  if (input.eventDate < rule.validFrom)
    return stop(
      "Data anterior à vigência do perfil. É necessária uma versão histórica.",
    );
  const inCoverage = (date: string) =>
    date >= calendar.from && date <= calendar.to;
  const classify = (date: Temporal.PlainDate) => {
    const iso = date.toString();
    const events = calendar.events.filter(
      (event) => iso >= event.start && iso <= event.end,
    );
    for (const event of events) sources.set(event.source.id, event.source);
    const annual =
      (date.month === 12 && date.day >= 20) ||
      (date.month === 1 && date.day <= 20);
    const holiday = events.some((event) => event.kind === "holiday");
    const suspended =
      annual || events.some((event) => event.kind === "suspension");
    return {
      courtWorking: date.dayOfWeek <= 5 && !holiday,
      suspended,
      ambiguous: events.some((event) =>
        ["interruption", "unavailability", "partial_closure"].includes(
          event.kind,
        ),
      ),
      publicationBlocked: events.some(
        (event) => event.kind === "publication_restriction",
      ),
      reasons: [
        ...(date.dayOfWeek > 5 ? ["Fim de semana"] : []),
        ...events.map((event) => event.name),
        ...(annual
          ? [
              `Suspensão legal — ${continuous ? "CPP, art. 798-A" : "CLT, art. 775-A"} (20/12 a 20/01)`,
            ]
          : []),
      ],
      sourceIds: [
        ...new Set([legalSource.id, ...events.map((event) => event.source.id)]),
      ],
    };
  };
  const add = (day: TraceDay) => result.trace.push(day);
  let publication = Temporal.PlainDate.from(input.eventDate);
  if (!inCoverage(input.eventDate))
    return stop(
      "Data fora da cobertura do calendário. Nenhum vencimento foi emitido.",
    );
  add({
    date: input.eventDate,
    counted: false,
    ordinal: null,
    phase: "event",
    reasons: [
      input.communication === "availability"
        ? "Disponibilização no DJEN"
        : "Publicação — marco excluído",
    ],
    sourceIds: [electronicDiarySource.id],
  });
  if (
    classify(publication).ambiguous ||
    classify(publication).publicationBlocked
  ) {
    result.trace[0].reasons.push(...classify(publication).reasons);
    result.trace[0].sourceIds.push(...classify(publication).sourceIds);
    return stop(
      "O evento coincide com restrição de publicação, expediente parcial, indisponibilidade ou interrupção ainda não modelada.",
    );
  }
  if (input.communication === "availability") {
    for (let guard = 0; guard < 370; guard++) {
      publication = publication.add({ days: 1 });
      if (!inCoverage(publication.toString()))
        return stop("Calendário insuficiente para determinar a publicação.");
      const day = classify(publication);
      add({
        date: publication.toString(),
        counted: false,
        ordinal: null,
        phase: "communication",
        reasons:
          day.courtWorking && !day.ambiguous && !day.publicationBlocked
            ? ["Publicação no primeiro dia de expediente — marco excluído"]
            : day.reasons,
        sourceIds: [...day.sourceIds, electronicDiarySource.id],
      });
      if (day.ambiguous || day.publicationBlocked)
        return stop(
          "Comunicação depende de restrição local ou exceção de expediente ainda não suportada.",
        );
      if (day.courtWorking) break;
    }
  } else if (!classify(publication).courtWorking)
    return stop(
      "Publicação informada em dia sem expediente. Confirme o marco.",
    );
  if (!classify(publication).courtWorking)
    return stop("Limite de busca da publicação atingido.");
  result.publicationDate = publication.toString();
  result.legalStartDate = publication.toString();
  let date = publication;
  let counted = 0;
  for (let guard = 0; guard < 1500 && counted < input.days; guard++) {
    date = date.add({ days: 1 });
    if (!inCoverage(date.toString()))
      return stop(
        "A contagem ultrapassou a cobertura do calendário. Nenhum vencimento foi emitido.",
      );
    const day = classify(date);
    if (day.ambiguous) {
      add({
        date: date.toString(),
        counted: false,
        ordinal: null,
        phase: "counting",
        reasons: day.reasons,
        sourceIds: day.sourceIds,
      });
      return stop(
        "Há indisponibilidade, interrupção ou expediente parcial sem efeito modelado. Vencimento não emitido.",
      );
    }
    const countable =
      !day.suspended && ((continuous && counted > 0) || day.courtWorking);
    if (countable) {
      counted++;
      result.firstCountedDate ??= date.toString();
    }
    add({
      date: date.toString(),
      counted: countable,
      ordinal: countable ? counted : null,
      phase: "counting",
      reasons: countable
        ? [
            continuous
              ? "Dia computado no curso contínuo — CPP, art. 798"
              : "Dia útil computado — CLT, art. 775",
            ...(continuous && day.reasons.length
              ? day.reasons.map(
                  (reason) => `${reason} — não interrompe o curso contínuo`,
                )
              : []),
          ]
        : day.reasons,
      sourceIds: [
        ...day.sourceIds,
        ...(countable && counted === 1 ? [electronicDiarySource.id] : []),
      ],
    });
  }
  if (counted !== input.days)
    return stop("Limite de varredura atingido. Confira a cobertura.");
  result.nominalDueDate = date.toString();
  if (continuous) {
    for (let guard = 0; guard < 370; guard++) {
      const day = classify(date);
      if (day.ambiguous) {
        add({
          date: date.toString(),
          counted: false,
          ordinal: null,
          phase: "extension",
          reasons: day.reasons,
          sourceIds: day.sourceIds,
        });
        return stop("Vencimento depende de exceção ainda não modelada.");
      }
      if (day.courtWorking && !day.suspended) break;
      add({
        date: date.toString(),
        counted: false,
        ordinal: null,
        phase: "extension",
        reasons: [
          "Prorrogação do vencimento; não acrescenta unidade ao prazo",
          ...day.reasons,
        ],
        sourceIds: [...day.sourceIds, saturdaySource.id],
      });
      date = date.add({ days: 1 });
      if (!inCoverage(date.toString()))
        return stop(
          "Prorrogação ultrapassou a cobertura do calendário. Vencimento não emitido.",
        );
    }
    if (!classify(date).courtWorking || classify(date).suspended)
      return stop("Limite de prorrogação atingido.");
    if (date.toString() !== result.nominalDueDate)
      add({
        date: date.toString(),
        counted: false,
        ordinal: null,
        phase: "extension",
        reasons: [
          "Vencimento prorrogado ao próximo dia útil; prazo já integralmente computado",
        ],
        sourceIds: [criminalSource.id, saturdaySource.id],
      });
  }
  result.status = "provisional";
  result.dueDate = date.toString();
  result.warnings.push(
    `Simulação com calendário parcial de ${input.court} — ${input.locality}. Ausência de evento não confirma expediente normal.`,
    rule.scope,
    "Revisão jurídica pendente. Resultado demonstrativo para o trabalho acadêmico.",
  );
  result.sources = [...sources.values()];
  return result;
}
