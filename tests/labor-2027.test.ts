import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { calculateDeadline } from "@/domain/deadlines/calculate";
import { laborSp2026 } from "@/domain/calendars/labor-sp-2026";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { composeCalendars } from "@/domain/calendars/compose";
import { laborSp2027 } from "@/domain/calendars/labor-sp-2027";

const input = {
  regime: "labor",
  court: "TRT2",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  context: "ordinary",
  eventDate: "2027-01-20",
  days: 1,
};

describe("trabalhista TRT-2 Capital — 2027 e travessia", () => {
  // Portaria GP19/2026; casos independentes em calendar-2027-research.md.
  it.each([
    ["2027-01-20", "2027-01-21"],
    ["2027-01-22", "2027-01-26"],
    ["2027-02-05", "2027-02-11"],
    ["2027-03-23", "2027-03-29"],
    ["2027-05-26", "2027-05-31"],
    ["2027-08-10", "2027-08-12"],
    ["2027-09-03", "2027-09-08"],
    ["2027-10-08", "2027-10-13"],
    ["2027-10-27", "2027-10-28"],
    ["2027-10-28", "2027-11-03"],
    ["2027-12-06", "2027-12-07"],
    ["2027-12-07", "2027-12-09"],
  ])("publicação %s, 1 dia → %s", (eventDate, dueDate) => {
    const result = calculateForMvp({ ...input, eventDate });
    expect(result.status).toBe("provisional");
    expect(result.firstCountedDate).toBe(dueDate);
    expect(result.dueDate).toBe(dueDate);
    expect(result.snapshot.calendar.id).toBe("trt2-capital-2027");
    expect(
      result.snapshot.calendar.events.some(
        (event) => event.source.id === "TRT2-GP19-2026",
      ),
    ).toBe(true);
    expect(result.metadata.calendarCompleteness).toBe("demonstration");
    expect(historySnapshotSchema.parse(result)).toEqual(result);
  });
  it("mantém suspensão, publicação e aniversário como decisões distintas em janeiro", () => {
    const result = calculateForMvp({
      ...input,
      communication: "availability",
      eventDate: "2027-01-22",
    });
    expect(result.publicationDate).toBe("2027-01-26");
    expect(result.dueDate).toBe("2027-01-27");
    const cross = calculateForMvp({
      ...input,
      communication: "availability",
      eventDate: "2026-12-31",
    });
    expect(cross.publicationDate).toBe("2027-01-07");
    expect(cross.dueDate).toBe("2027-01-21");
  });
  it("atravessa dois calendários explícitos, sem apagar fontes, versões ou o saldo", () => {
    const result = calculateForMvp({
      ...input,
      eventDate: "2026-12-17",
      days: 10,
    });
    expect(result.dueDate).toBe("2027-02-03");
    expect(
      result.trace.filter((day) => day.counted).map((day) => day.date),
    ).toEqual([
      "2026-12-18",
      "2027-01-21",
      "2027-01-22",
      "2027-01-26",
      "2027-01-27",
      "2027-01-28",
      "2027-01-29",
      "2027-02-01",
      "2027-02-02",
      "2027-02-03",
    ]);
    const calendar = result.snapshot.calendar;
    expect(calendar.components?.map((part) => [part.id, part.version])).toEqual(
      [
        ["trt2-capital-2026", "2026-10-21.demo.1"],
        ["trt2-capital-2027", "2026-10-22.demo.1"],
      ],
    );
    expect(
      result.sources.some((source) => source.id === "TRT2-GP50-2025"),
    ).toBe(true);
    expect(
      result.sources.some((source) => source.id === "TRT2-GP19-2026"),
    ).toBe(true);
    expect(historySnapshotSchema.parse(result)).toEqual(result);
    expect(
      calculateForMvp({ ...input, eventDate: "2026-12-17", days: 10 }),
    ).toEqual(result);
  });
  it("preserva integralmente os resultados de 2026 que já tinham cobertura", () => {
    const before = structuredClone(laborSp2026);
    for (const eventDate of [
      "2026-01-20",
      "2026-08-07",
      "2026-10-06",
      "2026-12-04",
    ]) {
      const data = { ...input, eventDate };
      expect(calculateForMvp(data)).toEqual(
        calculateDeadline(data, laborSp2026),
      );
    }
    expect(laborSp2026).toEqual(before);
    expect(
      calculateForMvp({ ...input, eventDate: "2026-12-18", days: 2 }).dueDate,
    ).toBe("2027-01-22");
  });
  it("não compõe anos com lacuna, sobreposição ou outra localidade", () => {
    const definition = {
      id: "fixture",
      version: "fixture-1",
      consultedOn: "2026-10-22",
    };
    for (const second of [
      { ...laborSp2027, from: "2027-01-02" },
      { ...laborSp2027, from: "2026-12-31" },
      { ...laborSp2027, locality: "Santos" as const },
    ])
      expect(() => composeCalendars([laborSp2026, second], definition)).toThrow(
        "Calendários incompatíveis",
      );
  });
  it("não amplia outros tribunais, contexto excluído ou 2028", () => {
    for (const data of [
      { ...input, eventDate: "2028-03-01" },
      { ...input, eventDate: "2027-12-17" },
      { ...input, regime: "criminal", court: "TJSP" },
      { ...input, regime: "civil", court: "TJSP", context: undefined },
      { ...input, context: "unknown" },
      { ...input, context: "special" },
      { ...input, locality: "Santos" },
    ]) {
      const result = calculateForMvp(data);
      expect(result.status).toBe("incomplete");
      expect(result.dueDate).toBeNull();
    }
  });
});
