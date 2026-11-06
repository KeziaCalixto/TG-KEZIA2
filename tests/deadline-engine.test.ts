import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { calculateDeadline } from "@/domain/deadlines/calculate";
import { tjsp2026 } from "@/domain/calendars/tjsp-2026";
import { spCalendars2026 } from "@/domain/calendars/sp-2026";
import type { CalculationInput } from "@/domain/deadlines/types";
import fc from "fast-check";

const baseline = {
  ...tjsp2026,
  id: "fixture-didatica",
  version: "fixture-1",
  events: tjsp2026.events.filter((event) => event.kind === "holiday"),
};
const input: CalculationInput = {
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-10-06",
  days: 5,
};

describe("contagem civil TJSP — contrato público", () => {
  it("exclui a publicação e 12 de outubro: cinco dias desde 05/10/2026 terminam em 13/10", () => {
    const result = calculateDeadline(
      {
        regime: "civil",
        court: "TJSP",
        locality: "São Paulo",
        medium: "electronic",
        communication: "publication",
        eventDate: "2026-10-05",
        days: 5,
      },
      baseline,
    );
    expect(result.status).toBe("provisional");
    expect(result.dueDate).toBe("2026-10-13");
    expect(result.firstCountedDate).toBe("2026-10-06");
    expect(
      result.trace.filter((day) => day.counted).map((day) => day.date),
    ).toEqual([
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-13",
    ]);
  });

  it("não extrapola o oráculo didático para uma data real com indisponibilidade conhecida", () => {
    const result = calculateForMvp({ ...input, eventDate: "2026-10-05" });
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
    expect(
      result.sources.some((source) => source.id === "TJSP-INDISP-79261"),
    ).toBe(true);
  });
  it("preserva o segundo dia de indisponibilidade que atravessa a meia-noite", () => {
    const result = calculateForMvp({
      ...input,
      eventDate: "2026-06-25",
      days: 1,
    });
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
    expect(
      result.sources.some((source) => source.id === "TJSP-INDISP-70654"),
    ).toBe(true);
  });

  it("exibe uma simulação dentro da cobertura com avisos e versões", () => {
    const result = calculateForMvp(input);
    expect(result.dueDate).toBe("2026-10-14");
    expect(result.status).toBe("provisional");
    expect(result.metadata.legalReview).toBe("pending");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.snapshot.calendar.version).toBe(
      spCalendars2026["São Paulo"].version,
    );
  });

  it("distingue disponibilização de publicação sem duplicar a exclusão", () => {
    const result = calculateDeadline(
      { ...input, communication: "availability", eventDate: "2026-10-02" },
      baseline,
    );
    expect(result.eventDate).toBe("2026-10-02");
    expect(result.publicationDate).toBe("2026-10-05");
    expect(result.legalStartDate).toBe("2026-10-05");
    expect(result.firstCountedDate).toBe("2026-10-06");
    expect(result.dueDate).toBe("2026-10-13");
  });

  it("trata disponibilização em fim de semana como evento distinto", () => {
    const result = calculateForMvp({
      ...input,
      communication: "availability",
      eventDate: "2026-10-10",
      days: 1,
    });
    expect(result.publicationDate).toBe("2026-10-13");
    expect(result.firstCountedDate).toBe("2026-10-14");
    expect(result.dueDate).toBe("2026-10-14");
  });

  it.each(["2026-10-10", "2026-10-12", "2026-01-12"])(
    "recusa publicação incompatível em %s sem ajustar silenciosamente",
    (eventDate) => {
      expect(calculateForMvp({ ...input, eventDate }).dueDate).toBeNull();
    },
  );

  it("aplica alteração do Dia do Servidor: 28/10 é útil e 30/10 é excluído", () => {
    const result = calculateForMvp({
      ...input,
      eventDate: "2026-10-27",
      days: 3,
    });
    expect(result.dueDate).toBe("2026-11-03");
    expect(result.trace.find((day) => day.date === "2026-10-28")?.counted).toBe(
      true,
    );
    expect(result.trace.find((day) => day.date === "2026-10-30")?.counted).toBe(
      false,
    );
  });

  it("preserva saldo durante suspensão de 20/12 a 20/01 inclusive com fixture de dois anos", () => {
    const result = calculateDeadline(
      { ...input, eventDate: "2026-12-17", days: 2 },
      { ...baseline, to: "2027-02-01" },
    );
    expect(result.firstCountedDate).toBe("2026-12-18");
    expect(result.dueDate).toBe("2027-01-21");
    expect(
      result.trace.filter((day) => day.counted).map((day) => day.date),
    ).toEqual(["2026-12-18", "2027-01-21"]);
    expect(
      result.trace.find((day) => day.date === "2026-12-25")?.reasons.length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("não emite vencimento de 2027 com calendário limitado a 2026", () => {
    const result = calculateForMvp({
      ...input,
      eventDate: "2026-12-17",
      days: 2,
    });
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
    expect(result.firstCountedDate).toBe("2026-12-18");
  });

  it.each(["2026-02-18", "2026-06-24", "2026-06-29"])(
    "bloqueia expediente parcial ainda não modelado em %s",
    (eventDate) => {
      expect(calculateForMvp({ ...input, eventDate }).status).toBe(
        "incomplete",
      );
    },
  );

  it.each([0, -1, 1.5, 366, NaN])("recusa quantidade inválida %s", (days) => {
    expect(calculateForMvp({ ...input, days }).dueDate).toBeNull();
  });

  it.each(["2026-02-30", "06/10/2026", "2026-10-06T00:00:00Z", "2025-10-06"])(
    "não fabrica data para entrada inválida ou sem cobertura %s",
    (eventDate) => {
      expect(calculateForMvp({ ...input, eventDate }).status).toBe(
        "incomplete",
      );
    },
  );

  it("rejeita outro regime e campos extras que tentem substituir o calendário", () => {
    expect(calculateForMvp({ ...input, regime: "penal" }).dueDate).toBeNull();
    expect(
      calculateForMvp({ ...input, calendar: { events: [] } }).dueDate,
    ).toBeNull();
  });

  it("recusa calendário sem versão", () => {
    expect(calculateDeadline(input, { ...baseline, version: "" }).status).toBe(
      "incomplete",
    );
  });

  it("interrupção não é tratada como suspensão", () => {
    const result = calculateDeadline(input, {
      ...baseline,
      events: [
        ...baseline.events,
        {
          id: "fixture-interruption",
          start: "2026-10-07",
          end: "2026-10-07",
          kind: "interruption",
          name: "Interrupção hipotética de teste",
          source: baseline.events[0].source,
        },
      ],
    });
    expect(result.dueDate).toBeNull();
    expect(result.status).toBe("incomplete");
  });

  it("não altera entradas e reproduz o mesmo resultado sem relógio ou rede", () => {
    const calendarBefore = JSON.stringify(baseline);
    const first = calculateDeadline(input, baseline);
    expect(calculateDeadline(input, baseline)).toEqual(first);
    expect(JSON.stringify(baseline)).toBe(calendarBefore);
    expect(calculateDeadline(first.input, first.snapshot.calendar)).toEqual(
      first,
    );
  });

  it("mantém invariantes civis para quantidades de dias dentro da cobertura", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 35 }), (days) => {
        const result = calculateForMvp({ ...input, days });
        expect(result.status).toBe("provisional");
        expect(result.trace.filter((day) => day.counted)).toHaveLength(days);
        expect(result.trace.filter((day) => day.counted).at(-1)?.date).toBe(
          result.dueDate,
        );
        expect(new Set(result.trace.map((day) => day.date)).size).toBe(
          result.trace.length,
        );
        expect(result.dueDate! > input.eventDate).toBe(true);
      }),
      { numRuns: 50, seed: 42 },
    );
  });
});
