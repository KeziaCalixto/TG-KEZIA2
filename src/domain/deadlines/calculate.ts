import { calculateCivilDeadline } from "./civil-v0-2";
import { calculateExtendedDeadline } from "./extended";
import { baseCalculationInputSchema, calculationInputSchema } from "./schema";
import { calculateActDeadline } from "./calculate-act";
import type { JudicialCalendar } from "./types";
export { ENGINE_VERSION, RULE_VERSION } from "./civil-v0-2";

export function calculateDeadline(input: unknown, calendar: JudicialCalendar) {
  const parsed = calculationInputSchema.safeParse(input);
  if (parsed.success && parsed.data.act)
    return calculateActDeadline(parsed.data, calendar, calculateBaseDeadline);
  return calculateBaseDeadline(input, calendar);
}

function calculateBaseDeadline(input: unknown, calendar: JudicialCalendar) {
  const parsed = baseCalculationInputSchema.safeParse(input);
  if (parsed.success && parsed.data.regime === "civil" && calendar.profile) {
    return {
      ...calculateCivilDeadline(null, calendar),
      input: parsed.data,
      eventDate: parsed.data.eventDate,
      warnings: [
        "O calendário não corresponde ao perfil civil. Nenhum vencimento foi emitido.",
      ],
    };
  }
  return parsed.success && parsed.data.regime !== "civil"
    ? calculateExtendedDeadline(parsed.data, calendar)
    : calculateCivilDeadline(input, calendar);
}
