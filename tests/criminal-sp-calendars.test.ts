import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { calculateDeadline } from "@/domain/deadlines/calculate";
import { criminalSp2026 } from "@/domain/calendars/criminal-sp-2026";
import { spLocalities } from "@/domain/calendars/localities";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { POST } from "@/app/api/calculate/route";

const input = {
  regime: "criminal",
  court: "TJSP",
  locality: "Santos",
  medium: "electronic",
  communication: "publication",
  context: "ordinary",
  eventDate: "2026-09-04",
  days: 1,
};

describe("criminal TJSP — cobertura municipal 2026", () => {
  // PC-SP01–11: docs/legal/sources/criminal-sp-comarcas-2026.md.
  it.each([
    ["Santos", "2026-09-04", 1, "2026-09-09", "2026-09-09", "2026-09-09"],
    ["São Paulo", "2026-09-04", 1, "2026-09-08", "2026-09-08", "2026-09-08"],
    ["Santos", "2026-09-03", 5, "2026-09-04", "2026-09-08", "2026-09-09"],
    [
      "Ribeirão Preto",
      "2026-06-17",
      3,
      "2026-06-18",
      "2026-06-20",
      "2026-06-22",
    ],
    ["Santo André", "2026-04-07", 1, "2026-04-09", "2026-04-09", "2026-04-09"],
    [
      "São Bernardo do Campo",
      "2026-08-19",
      1,
      "2026-08-21",
      "2026-08-21",
      "2026-08-21",
    ],
    [
      "São José dos Campos",
      "2026-07-24",
      1,
      "2026-07-28",
      "2026-07-28",
      "2026-07-28",
    ],
    ["Sorocaba", "2026-08-14", 1, "2026-08-17", "2026-08-17", "2026-08-17"],
    ["Campinas", "2026-12-03", 2, "2026-12-04", "2026-12-05", "2026-12-09"],
    ["Guarulhos", "2026-12-03", 2, "2026-12-04", "2026-12-05", "2026-12-09"],
    ["Osasco", "2026-06-12", 1, "2026-06-15", "2026-06-15", "2026-06-15"],
  ])("%s — %s, %i dias", (locality, eventDate, days, first, nominal, due) => {
    const result = calculateForMvp({ ...input, locality, eventDate, days });
    expect(result.status).toBe("provisional");
    expect(result.firstCountedDate).toBe(first);
    expect(result.nominalDueDate).toBe(nominal);
    expect(result.dueDate).toBe(due);
    expect(result.snapshot.calendar.locality).toBe(locality);
    expect(result.trace.filter((day) => day.counted)).toHaveLength(days);
    expect(historySnapshotSchema.parse(result)).toEqual(result);
    for (const day of result.trace)
      for (const id of day.sourceIds)
        expect(result.sources.some((source) => source.id === id)).toBe(true);
  });
  it("normaliza disponibilização com a fonte municipal e mantém prorrogação sem novas unidades", () => {
    const result = calculateForMvp({ ...input, communication: "availability" });
    expect(result.publicationDate).toBe("2026-09-09");
    expect(result.dueDate).toBe("2026-09-10");
    expect(
      result.sources.some((source) => source.id === "TJSP-MUNICIPAIS-2026-p6"),
    ).toBe(true);
    const continuous = calculateForMvp({
      ...input,
      eventDate: "2026-09-03",
      days: 5,
    });
    expect(
      continuous.trace.find(
        (day) => day.date === "2026-09-08" && day.phase === "counting",
      )?.counted,
    ).toBe(true);
    expect(
      continuous.trace
        .filter((day) => day.phase === "extension")
        .every((day) => !day.counted),
    ).toBe(true);
  });
  it.each(spLocalities)(
    "%s não extrapola 2027 nem aceita publicação ordinária restrita",
    (locality) => {
      for (const eventDate of ["2026-12-18", "2027-03-02", "2026-01-19"]) {
        const result = calculateForMvp({
          ...input,
          locality,
          eventDate,
          days: 2,
        });
        expect(result.input?.locality).toBe(locality);
        expect(result.status).toBe("incomplete");
        expect(result.dueDate).toBeNull();
      }
    },
  );
  it("preserva a versão anterior da Capital e recusa calendário de outra comarca", () => {
    const capitalInput = {
      ...input,
      locality: "São Paulo",
      eventDate: "2026-10-06",
      days: 5,
    };
    const before = structuredClone(criminalSp2026);
    const original = calculateDeadline(capitalInput, criminalSp2026);
    expect(calculateForMvp(capitalInput)).toEqual(original);
    expect(original.metadata.calendarVersion).toBe("2026-10-21.demo.1");
    expect(original.metadata.ruleVersion).toBe(
      "criminal-djen-tjsp-ordinary@2026-10-21.demo.1",
    );
    expect(original.dueDate).toBe("2026-10-13");
    const santos = calculateForMvp(input);
    expect(santos.metadata.calendarVersion).toBe("2026-10-21.demo.2");
    expect(santos.metadata.ruleVersion).toBe(
      "criminal-djen-tjsp-ordinary@2026-10-21.demo.2",
    );
    expect(santos.snapshot.rule?.scope).toContain("dez comarcas");
    expect(calculateDeadline(input, criminalSp2026).dueDate).toBeNull();
    expect(criminalSp2026).toEqual(before);
    expect(calculateForMvp(input)).toEqual(santos);
  });
  it("API aceita expansão criminal, mas não amplia trabalhista ou comarcas desconhecidas", async () => {
    const request = (data: unknown) =>
      new Request("http://localhost/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    const response = await POST(request(input));
    expect(response.status).toBe(200);
    expect((await response.json()).dueDate).toBe("2026-09-09");
    expect(
      (await POST(request({ ...input, regime: "labor", court: "TRT2" })))
        .status,
    ).toBe(400);
    expect((await POST(request({ ...input, locality: "Bauru" }))).status).toBe(
      400,
    );
  });
});
