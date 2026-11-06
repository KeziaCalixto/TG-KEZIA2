import { tjsp2026 } from "@/domain/calendars/tjsp-2026";
import { spCalendars2026 } from "@/domain/calendars/sp-2026";
import { calculationInputSchema } from "@/domain/deadlines/schema";
import { calculateDeadline } from "@/domain/deadlines/calculate";
import type { CalculationResult } from "@/domain/deadlines/types";
import { laborSp2026 } from "@/domain/calendars/labor-sp-2026";
import { laborSp2027 } from "@/domain/calendars/labor-sp-2027";
import { laborSp2026To2027 } from "@/domain/calendars/labor-sp-2026-2027";
import { criminalSpCalendars2026 } from "@/domain/calendars/criminal-sp-comarcas-2026";

export function calculateForMvp(input: unknown): CalculationResult {
  const parsed = calculationInputSchema.safeParse(input);
  if (parsed.success && parsed.data.regime === "labor") {
    if (parsed.data.eventDate >= laborSp2027.from)
      return calculateDeadline(input, laborSp2027);
    const original = calculateDeadline(input, laborSp2026);
    // A versão anual antiga continua selecionada quando suficiente. Só um percurso
    // incompleto que chegou ao último dia coberto pode tentar o catálogo contíguo.
    return original.status === "incomplete" &&
      original.trace.at(-1)?.date === laborSp2026.to
      ? calculateDeadline(input, laborSp2026To2027)
      : original;
  }
  return calculateDeadline(
    input,
    parsed.success && parsed.data.regime === "criminal"
      ? criminalSpCalendars2026[parsed.data.locality]
      : parsed.success
        ? spCalendars2026[parsed.data.locality]
        : tjsp2026,
  );
}
