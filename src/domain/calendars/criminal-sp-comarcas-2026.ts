import { spLocalities, type SpLocality } from "./localities";
import { spCalendars2026 } from "./sp-2026";
import { criminalSp2026 } from "./criminal-sp-2026";
import type { JudicialCalendar } from "../deadlines/types";

// Âmbito e fontes: docs/legal/sources/criminal-sp-comarcas-2026.md.
// A versão inicial da Capital permanece intacta; os novos municípios têm IDs próprios.
export const criminalSpCalendars2026 = Object.fromEntries(
  spLocalities.map((locality) => {
    if (locality === "São Paulo") return [locality, criminalSp2026];
    const municipalCalendar = spCalendars2026[locality];
    const calendar: JudicialCalendar = {
      ...structuredClone(municipalCalendar),
      id: municipalCalendar.id.replace("tjsp-", "tjsp-criminal-"),
      profile: "criminal",
      version: "2026-10-21.demo.2",
      consultedOn: "2026-10-21",
      events: [
        ...structuredClone(
          municipalCalendar.events.filter(
            (event) => event.kind !== "suspension",
          ),
        ),
        ...structuredClone(
          criminalSp2026.events.filter(
            (event) => event.kind === "publication_restriction",
          ),
        ),
      ],
    };
    return [locality, calendar];
  }),
) as Record<SpLocality, JudicialCalendar>;
