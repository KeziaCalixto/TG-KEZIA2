import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { calculateDeadline } from "@/domain/deadlines/calculate";
import { tjsp2026 } from "@/domain/calendars/tjsp-2026";
import { spCalendars2026 } from "@/domain/calendars/sp-2026";

const input = {
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-09-04",
  days: 1,
};

describe("calendários municipais de SP — DJE 4334, p. 4 a 7", () => {
  it.each([
    ["Santo André", "2026-04-07", "2026-04-09"],
    ["São Bernardo do Campo", "2026-08-19", "2026-08-21"],
    ["São José dos Campos", "2026-03-18", "2026-03-20"],
  ])("exclui o feriado próprio de %s", (locality, eventDate, dueDate) => {
    const result = calculateForMvp({ ...input, locality, eventDate });
    expect(result.dueDate).toBe(dueDate);
    expect(
      result.trace.some(
        (day) =>
          !day.counted &&
          day.reasons.some((reason) =>
            reason.includes(`Feriado municipal — ${locality}`),
          ),
      ),
    ).toBe(true);
  });
  it("não aceita uma publicação em 19/02 em Osasco como dia normal da Capital", () => {
    const result = calculateForMvp({
      ...input,
      locality: "Osasco",
      eventDate: "2026-02-19",
    });
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
    expect(calculateForMvp({ ...input, eventDate: "2026-02-19" }).dueDate).toBe(
      "2026-02-20",
    );
  });
  it("aplica 08/09 somente a Santos: não transfere o feriado à Capital", () => {
    const santos = calculateForMvp({ ...input, locality: "Santos" });
    expect(santos.dueDate).toBe("2026-09-09");
    expect(calculateForMvp(input).dueDate).toBe("2026-09-08");
    expect(
      santos.trace.find((day) => day.date === "2026-09-08")?.sourceIds,
    ).toContain("TJSP-MUNICIPAIS-2026-p6");
    expect(santos.snapshot.calendar.locality).toBe("Santos");
    expect(santos.warnings.join(" ")).toContain("Santos");
  });
  it("exclui 19/06 em Ribeirão Preto e preserva o saldo", () => {
    const result = calculateForMvp({
      ...input,
      locality: "Ribeirão Preto",
      eventDate: "2026-06-18",
      days: 2,
    });
    expect(result.firstCountedDate).toBe("2026-06-22");
    expect(result.dueDate).toBe("2026-06-23");
  });
  it("não aceita outra UF, comarca não cadastrada ou calendário de outro município", () => {
    for (const locality of ["Rio de Janeiro", "Comarca desconhecida"]) {
      expect(calculateForMvp({ ...input, locality }).dueDate).toBeNull();
    }
    expect(
      calculateDeadline(
        { ...input, locality: "Santos" },
        spCalendars2026["São Paulo"],
      ).dueDate,
    ).toBeNull();
  });
  it("preserva o calendário anterior e versões distintas por comarca", () => {
    expect(tjsp2026.version).toBe("2026-10-18.demo.1");
    expect(spCalendars2026["São Paulo"].version).not.toBe(tjsp2026.version);
    expect(new Set(Object.values(spCalendars2026).map((c) => c.id)).size).toBe(
      10,
    );
    for (const calendar of Object.values(spCalendars2026)) {
      expect(calendar.completeness).toBe("demonstration");
      expect(
        calendar.events.every((e) => e.source.url.startsWith("https://")),
      ).toBe(true);
      const result = calculateForMvp({
        ...input,
        locality: calendar.locality,
        eventDate: "2026-12-18",
        days: 2,
      });
      expect(result.status).toBe("incomplete");
      expect(result.dueDate).toBeNull();
    }
  });
  it("mantém bloqueios de expediente parcial/indisponibilidade e transferência de outubro", () => {
    expect(
      calculateForMvp({
        ...input,
        locality: "Campinas",
        eventDate: "2026-10-05",
      }).status,
    ).toBe("incomplete");
    expect(
      calculateForMvp({
        ...input,
        locality: "Guarulhos",
        eventDate: "2026-02-18",
      }).status,
    ).toBe("incomplete");
    const result = calculateForMvp({
      ...input,
      locality: "Sorocaba",
      eventDate: "2026-10-28",
      days: 2,
    });
    expect(result.dueDate).toBe("2026-11-03");
  });
});
