import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { POST } from "@/app/api/calculate/route";

const civil = {
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-10-06",
  days: 15,
  act: {
    id: "civil-appeal",
    version: "2026-10-22.demo.1",
    eligibility: "confirmed",
  },
};

describe("atos processuais — casos independentes da pesquisa de 22/10/2026", () => {
  it.each([
    ["civil", "TJSP", "civil-appeal", 15, "2026-10-29"],
    ["labor", "TRT2", "labor-ordinary-appeal", 8, "2026-10-20"],
    ["criminal", "TJSP", "criminal-sentence-clarification", 2, "2026-10-09"],
  ])(
    "ACT-A01: disponibilização no perfil %s não é publicação",
    (regime, court, id, days, expected) => {
      const result = calculateForMvp({
        ...civil,
        regime,
        court,
        ...(regime === "civil" ? {} : { context: "ordinary" }),
        communication: "availability",
        days,
        act: { ...civil.act, id },
      });
      expect(result.publicationDate).toBe("2026-10-07");
      expect(result.firstCountedDate).toBe("2026-10-08");
      expect(result.dueDate).toBe(expected);
    },
  );
  it("ACT-P02: criminal conta o sábado intermediário/final e prorroga após feriado", () => {
    const result = calculateForMvp({
      ...civil,
      regime: "criminal",
      context: "ordinary",
      eventDate: "2026-10-08",
      days: 2,
      act: { ...civil.act, id: "criminal-sentence-clarification" },
    });
    expect(result.nominalDueDate).toBe("2026-10-10");
    expect(
      result.trace.filter((day) => day.counted).map((day) => day.date),
    ).toEqual(["2026-10-09", "2026-10-10"]);
    expect(result.dueDate).toBe("2026-10-13");
  });
  it.each([
    { act: { ...civil.act, eligibility: "unknown" } },
    { act: { ...civil.act, eligibility: "excluded" } },
    { act: { ...civil.act, version: "inexistente" } },
    { act: { ...civil.act, id: "nao-cadastrado" } },
    { act: { ...civil.act, id: "criminal-sentence-clarification" } },
    { days: 30 },
  ])("ACT-B: impede prazo por entrada incompatível %j", (change) => {
    const result = calculateForMvp({ ...civil, ...change });
    expect(result.status).toBe("incomplete");
    expect(result.dueDate).toBeNull();
    expect(result.trace).toEqual([]);
  });
  it.each(["unknown", "custody", "domestic_violence", "urgent", "special"])(
    "ato não libera contexto criminal %s",
    (context) => {
      const result = calculateForMvp({
        ...civil,
        regime: "criminal",
        context,
        days: 2,
        act: { ...civil.act, id: "criminal-sentence-clarification" },
      });
      expect(result.status).toBe("incomplete");
      expect(result.dueDate).toBeNull();
    },
  );
  it("preserva contagem manual, metadados antigos e legibilidade de memórias", () => {
    const { act: _act, ...manual } = civil;
    void _act;
    const original = calculateForMvp(manual);
    expect(original.dueDate).toBe("2026-10-28");
    expect(original.metadata.engineVersion).toBe("0.2.0");
    expect(original.metadata.actVersion).toBeUndefined();
    expect(historySnapshotSchema.parse(original)).toEqual(original);
    const result = calculateForMvp(civil);
    expect(historySnapshotSchema.parse(result)).toEqual(result);
    const saved = JSON.stringify(result);
    result.snapshot.act!.conditions.push("mutação da cópia");
    expect(JSON.stringify(calculateForMvp(civil))).toBe(saved);
  });
  it("mantém calendário composto ao atravessar o ano com recurso de 8 úteis", () => {
    const result = calculateForMvp({
      ...civil,
      regime: "labor",
      court: "TRT2",
      context: "ordinary",
      eventDate: "2026-12-17",
      days: 8,
      act: { ...civil.act, id: "labor-ordinary-appeal" },
    });
    expect(result.dueDate).toBe("2027-02-01");
    expect(result.snapshot.calendar.components).toHaveLength(2);
    expect(historySnapshotSchema.parse(result)).toEqual(result);
  });
  it("API valida duração no servidor, mantém versão e bloqueia dados adulterados", async () => {
    for (const [input, expected] of [
      [civil, "2026-10-28"],
      [{ ...civil, days: 1 }, null],
    ] as const) {
      const response = await POST(
        new Request("http://localhost/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      );
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.dueDate).toBe(expected);
      expect(result.metadata.actId).toBe("civil-appeal");
    }
  });
  it.each([
    ["labor", "TRT2", "labor-ordinary-appeal", 8, "2026-10-19"],
    ["criminal", "TJSP", "criminal-sentence-clarification", 2, "2026-10-08"],
  ])(
    "ato %s mantém duração e contagem próprias",
    (regime, court, id, days, expected) => {
      const result = calculateForMvp({
        ...civil,
        regime,
        court,
        context: "ordinary",
        days,
        act: { ...civil.act, id },
      });
      expect(result.dueDate).toBe(expected);
      expect(result.snapshot.act?.id).toBe(id);
      expect(result.metadata.countingEngineVersion).toBe("0.3.0");
    },
  );
  it("ACT-C01: apelação civil, 15 úteis, preserva ato e fonte na memória", () => {
    const result = calculateForMvp(civil);
    expect(result.dueDate).toBe("2026-10-28");
    expect(result.input).toEqual(civil);
    expect(result.snapshot.act?.id).toBe("civil-appeal");
    expect(result.metadata.actVersion).toBe("2026-10-22.demo.1");
    expect(
      result.sources.some((source) => source.provision.includes("1.003")),
    ).toBe(true);
    expect(result.trace[0].sourceIds).toContain("ACT-CPC-APPEAL");
  });
});
