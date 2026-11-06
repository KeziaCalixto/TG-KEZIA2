import type { CalendarEvent, JudicialCalendar } from "../deadlines/types";
import type { SpLocality } from "./localities";
import { spLocalities } from "./localities";
import { tjsp2026 } from "./tjsp-2026";

// DJE 4334, 25/11/2025, p. 4–7, Proc. 2018/206016. Conferência: 20/10/2026.
// Datas municipais completas da relação; sobreposições mantêm ambos os fundamentos.
const municipalDates: Record<
  SpLocality,
  { page: number; dates: readonly string[] }
> = {
  "São Paulo": {
    page: 7,
    dates: ["01-25", "04-03", "06-04", "11-20", "11-02"],
  },
  Campinas: { page: 4, dates: ["04-03", "06-04", "11-20", "12-08"] },
  Guarulhos: { page: 4, dates: ["04-03", "06-04", "11-20", "12-08"] },
  Osasco: { page: 5, dates: ["02-19", "04-03", "06-04", "06-13", "11-02"] },
  "Ribeirão Preto": { page: 6, dates: ["01-20", "04-03", "06-19"] },
  "Santo André": { page: 6, dates: ["04-03", "04-08", "06-04", "11-20"] },
  Santos: { page: 6, dates: ["01-26", "04-03", "09-08", "11-20"] },
  "São Bernardo do Campo": {
    page: 7,
    dates: ["04-03", "06-04", "08-20", "11-20"],
  },
  "São José dos Campos": {
    page: 7,
    dates: ["03-19", "04-03", "06-04", "07-27", "11-02"],
  },
  Sorocaba: { page: 7, dates: ["04-03", "06-04", "08-15", "11-20"] },
};

function createCalendar(locality: SpLocality): JudicialCalendar {
  const slug = locality
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(" ", "-");
  const { page, dates } = municipalDates[locality];
  const municipalEvents: CalendarEvent[] = dates.map((date) => ({
    id: `municipal-${slug}-2026-${date}`,
    start: `2026-${date}`,
    end: `2026-${date}`,
    name: `Feriado municipal — ${locality} (relação TJSP 2026)`,
    kind: "holiday",
    source: {
      id: `TJSP-MUNICIPAIS-2026-p${page}`,
      title: "Relação de feriados municipais para 2026 — TJSP",
      provision: `Processo 2018/206016, DJE 4334, p. ${page} — ${locality}`,
      url: `https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=${page}`,
    },
  }));
  return {
    ...tjsp2026,
    id: locality === "São Paulo" ? tjsp2026.id : `tjsp-${slug}-2026`,
    version: "2026-10-20.demo.2",
    locality,
    consultedOn: "2026-10-20",
    // A versão anterior é preservada. Somente eventos de âmbito estadual/sistema
    // são herdados; o aniversário da Capital nunca se aplica a outra comarca.
    events: [
      ...tjsp2026.events.filter((event) => event.id !== "sp-aniversario"),
      ...municipalEvents,
    ],
  };
}

export const spCalendars2026 = Object.fromEntries(
  spLocalities.map((locality) => [locality, createCalendar(locality)]),
) as Record<SpLocality, JudicialCalendar>;
