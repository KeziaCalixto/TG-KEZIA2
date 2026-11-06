import { Temporal } from "@js-temporal/polyfill";
import type { JudicialCalendar } from "../deadlines/types";

/** Composição de versões do catálogo interno; nunca preenche lacuna entre anos. */
export function composeCalendars(
  calendars: readonly JudicialCalendar[],
  definition: { id: string; version: string; consultedOn: string },
): JudicialCalendar {
  const first = calendars[0];
  if (
    !first ||
    calendars.some(
      (calendar, index) =>
        calendar.components ||
        calendar.profile !== first.profile ||
        calendar.court !== first.court ||
        calendar.locality !== first.locality ||
        Temporal.PlainDate.compare(calendar.from, calendar.to) > 0 ||
        (index > 0 &&
          Temporal.PlainDate.from(calendars[index - 1].to)
            .add({ days: 1 })
            .toString() !== calendar.from),
    )
  )
    throw new Error(
      "Calendários incompatíveis, sobrepostos ou com lacuna de cobertura.",
    );
  const events = calendars.flatMap((calendar) =>
    structuredClone(calendar.events),
  );
  if (new Set(events.map((event) => event.id)).size !== events.length)
    throw new Error("A composição exige identificadores de eventos distintos.");
  return {
    ...first,
    ...definition,
    to: calendars[calendars.length - 1].to,
    completeness: calendars.every(
      (calendar) => calendar.completeness === "reviewed",
    )
      ? "reviewed"
      : "demonstration",
    events,
    components: calendars.map(
      ({
        id,
        version,
        profile,
        court,
        locality,
        from,
        to,
        completeness,
        consultedOn,
      }) => ({
        id,
        version,
        profile,
        court,
        locality,
        from,
        to,
        completeness,
        consultedOn,
      }),
    ),
  };
}
