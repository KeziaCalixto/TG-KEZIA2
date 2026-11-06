import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { calculateDeadline } from "@/domain/deadlines/calculate";
import { criminalSp2026 } from "@/domain/calendars/criminal-sp-2026";
import { laborSp2026 } from "@/domain/calendars/labor-sp-2026";
import { POST } from "@/app/api/calculate/route";

const base = {
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  context: "ordinary",
  eventDate: "2026-10-06",
  days: 5,
};

// Casos enumerados em docs/legal/rules/*-djen-research-2026-10-21.md.
// Referências técnicas; revisão jurídica profissional ainda pendente.
describe("perfis processuais de SP — contrato público", () => {
  it.each([
    ["2026-03-02", 5, "2026-03-09"],
    ["2026-02-13", 1, "2026-02-19"],
    ["2026-03-31", 1, "2026-04-06"],
    ["2026-04-17", 1, "2026-04-22"],
    ["2026-07-08", 1, "2026-07-13"],
    ["2026-08-07", 1, "2026-08-11"],
    ["2026-10-27", 1, "2026-10-28"],
    ["2026-10-29", 1, "2026-11-03"],
    ["2026-12-04", 1, "2026-12-08"],
    ["2026-01-20", 1, "2026-01-26"],
  ])(
    "trabalhista: publicação %s, %i dias → %s",
    (eventDate, days, expected) => {
      expect(
        calculateForMvp({
          ...base,
          regime: "labor",
          court: "TRT2",
          eventDate,
          days,
        }).dueDate,
      ).toBe(expected);
    },
  );
  it("separa publicação de suspensão de prazo em janeiro no TRT-2", () => {
    const result = calculateForMvp({
      ...base,
      regime: "labor",
      court: "TRT2",
      communication: "availability",
      eventDate: "2026-01-22",
      days: 1,
    });
    expect(result.publicationDate).toBe("2026-01-23");
    expect(result.firstCountedDate).toBe("2026-01-26");
    expect(result.dueDate).toBe("2026-01-26");
  });
  it.each([
    ["2026-10-09", 1, "2026-10-13", "2026-10-13"],
    ["2026-10-19", 5, "2026-10-24", "2026-10-26"],
    ["2026-10-08", 5, "2026-10-13", "2026-10-13"],
    ["2026-10-28", 5, "2026-11-02", "2026-11-03"],
    ["2026-10-29", 1, "2026-11-03", "2026-11-03"],
  ])(
    "criminal: publicação %s, %i dias, fim nominal %s, vencimento %s",
    (eventDate, days, nominal, due) => {
      const result = calculateForMvp({
        ...base,
        regime: "criminal",
        eventDate,
        days,
      });
      expect(result.nominalDueDate).toBe(nominal);
      expect(result.dueDate).toBe(due);
      expect(historySnapshotSchema.safeParse(result).success).toBe(true);
      expect(result.sources.some((source) => source.id === "BR-CPC-2015")).toBe(
        false,
      );
    },
  );
  it("criminal distingue disponibilização de publicação", () => {
    const result = calculateForMvp({
      ...base,
      regime: "criminal",
      communication: "availability",
      eventDate: "2026-10-09",
      days: 1,
    });
    expect(result.publicationDate).toBe("2026-10-13");
    expect(result.dueDate).toBe("2026-10-14");
  });
  it.each(["custody", "domestic_violence", "urgent", "special", "unknown"])(
    "bloqueia contexto criminal %s sem presumir regra ordinária",
    (context) => {
      const result = calculateForMvp({ ...base, regime: "criminal", context });
      expect(result.status).toBe("incomplete");
      expect(result.dueDate).toBeNull();
    },
  );
  it("recusa publicação criminal durante restrição local de janeiro", () => {
    const result = calculateForMvp({
      ...base,
      regime: "criminal",
      eventDate: "2026-01-19",
    });
    expect(result.dueDate).toBeNull();
    expect(
      result.sources.some((source) => source.id === "TJSP-1047-2025"),
    ).toBe(true);
  });
  it("suspende o curso criminal sem reiniciar, em fixture com cobertura de 2027", () => {
    const fixture = {
      ...criminalSp2026,
      id: "fixture-travessia",
      version: "fixture-1",
      to: "2027-01-31",
      events: [],
    };
    const before = structuredClone(fixture);
    const result = calculateDeadline(
      { ...base, regime: "criminal", eventDate: "2026-12-17", days: 10 },
      fixture,
    );
    expect(result.firstCountedDate).toBe("2026-12-18");
    expect(result.dueDate).toBe("2027-01-28");
    expect(
      result.trace
        .filter((day) => day.counted)
        .slice(0, 3)
        .map((day) => day.date),
    ).toEqual(["2026-12-18", "2026-12-19", "2027-01-21"]);
    expect(fixture).toEqual(before);
    expect(
      calculateDeadline(
        { ...base, regime: "criminal", eventDate: "2026-12-17", days: 10 },
        fixture,
      ),
    ).toEqual(result);
  });
  it.each(["criminal"])("não inventa cobertura de 2027 para %s", (regime) => {
    const result = calculateForMvp({
      ...base,
      regime,
      court: regime === "labor" ? "TRT2" : "TJSP",
      eventDate: "2026-12-18",
      days: 2,
    });
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
  });
  it("impede calendário de outro perfil mesmo com mesma cidade", () => {
    const result = calculateDeadline(
      { ...base, regime: "criminal" },
      laborSp2026,
    );
    expect(result.dueDate).toBeNull();
    expect(result.warnings.join(" ")).toContain("incompatível");
  });
  it("não aceita calendário criminal sob a regra civil preservada", () => {
    const result = calculateDeadline(
      {
        regime: "civil",
        court: "TJSP",
        locality: "São Paulo",
        medium: "electronic",
        communication: "publication",
        eventDate: "2026-10-06",
        days: 5,
      },
      criminalSp2026,
    );
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
  });
  it("API aceita o perfil tipado e recusa contexto ausente e tribunal incompatível", async () => {
    const request = (input: unknown) =>
      new Request("http://localhost/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    const valid = { ...base, regime: "criminal" };
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect((await response.json()).dueDate).toBe("2026-10-13");
    expect((await POST(request({ ...valid, context: undefined }))).status).toBe(
      400,
    );
    expect((await POST(request({ ...valid, court: "TRT2" }))).status).toBe(400);
    expect((await POST(request({ ...valid, locality: "Bauru" }))).status).toBe(
      400,
    );
  });
  it("trabalhista exclui fim de semana e 12/10 após publicação em 09/10", () => {
    const result = calculateForMvp({
      regime: "labor",
      court: "TRT2",
      locality: "São Paulo",
      medium: "electronic",
      communication: "publication",
      context: "ordinary",
      eventDate: "2026-10-09",
      days: 1,
    });
    expect(result.status).toBe("provisional");
    expect(result.dueDate).toBe("2026-10-13");
    expect(result.sources.some((source) => source.id === "BR-CLT-775")).toBe(
      true,
    );
  });
  it("criminal conta dias intermediários continuamente e prorroga domingo e feriado final", () => {
    const result = calculateForMvp({
      regime: "criminal",
      court: "TJSP",
      locality: "São Paulo",
      medium: "electronic",
      communication: "publication",
      context: "ordinary",
      eventDate: "2026-10-06",
      days: 5,
    });
    expect(result.status).toBe("provisional");
    expect(result.firstCountedDate).toBe("2026-10-07");
    expect(result.dueDate).toBe("2026-10-13");
    expect(
      result.trace.filter((day) => day.counted).map((day) => day.date),
    ).toEqual([
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
    expect(result.sources.some((source) => source.id === "BR-CPP-798")).toBe(
      true,
    );
  });
  it("preserva o perfil trabalhista na leitura da memória do histórico", () => {
    const result = calculateForMvp({
      regime: "labor",
      court: "TRT2",
      locality: "São Paulo",
      medium: "electronic",
      communication: "publication",
      context: "ordinary",
      eventDate: "2026-10-09",
      days: 1,
    });
    const parsed = historySnapshotSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.snapshot.rule?.regime).toBe("labor");
  });
  it("registra na trilha a exceção que impede continuar a contagem", () => {
    const result = calculateDeadline(
      {
        regime: "criminal",
        court: "TJSP",
        locality: "São Paulo",
        medium: "electronic",
        communication: "publication",
        context: "ordinary",
        eventDate: "2026-10-06",
        days: 5,
      },
      {
        ...criminalSp2026,
        id: "fixture-excecao",
        version: "fixture-1",
        events: [
          {
            id: "fixture-indisponibilidade",
            start: "2026-10-08",
            end: "2026-10-08",
            name: "Indisponibilidade controlada",
            kind: "unavailability",
            source: {
              id: "fixture-fonte",
              title: "Fixture de teste",
              provision: "Sem efeito jurídico real",
              url: "https://example.test/fixture",
            },
          },
        ],
      },
    );
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
    expect(result.trace.at(-1)?.date).toBe("2026-10-08");
    expect(result.trace.at(-1)?.sourceIds).toContain("fixture-fonte");
  });
});
