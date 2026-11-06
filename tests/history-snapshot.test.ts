import { describe, expect, it } from "vitest";
import { calculateForMvp } from "@/application/calculate";
import { historySnapshotSchema } from "@/application/history-snapshot";
const snapshot = calculateForMvp({
  regime: "civil",
  court: "TJSP",
  locality: "Santos",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-09-04",
  days: 1,
});
describe("leitura defensiva do snapshot original", () => {
  it("preserva entrada, pendências, trilha, fontes e versão sem recalcular", () => {
    expect(historySnapshotSchema.parse(snapshot)).toEqual(snapshot);
    expect(
      historySnapshotSchema.parse({
        ...snapshot,
        metadata: { ...snapshot.metadata, engineVersion: "0.1.0" },
      }).metadata.engineVersion,
    ).toBe("0.1.0");
  });
  it("recusa links executáveis, datas inválidas, payloads incompletos e status contraditório", () => {
    for (const malformed of [
      null,
      {},
      { ...snapshot, status: "incomplete" },
      { ...snapshot, dueDate: "2026-02-30" },
      {
        ...snapshot,
        sources: [{ ...snapshot.sources[0], url: "javascript:alert(1)" }],
      },
      { ...snapshot, trace: [{ ...snapshot.trace[0], date: "invalid" }] },
    ]) {
      expect(historySnapshotSchema.safeParse(malformed).success).toBe(false);
    }
  });
});
