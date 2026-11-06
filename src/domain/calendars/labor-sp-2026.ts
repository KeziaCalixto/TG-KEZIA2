import type {
  CalendarEvent,
  JudicialCalendar,
  LegalSource,
} from "../deadlines/types";

export const laborCalendarSource: LegalSource = {
  id: "TRT2-GP50-2025",
  title: "Portaria GP nº 50/2025 — TRT-2",
  provision:
    "Calendário de 2026 e feriados da Capital; antecipações de 10/08, 30/10 e 07/12",
  url: "https://basis.trt2.jus.br/bitstream/handle/123456789/17686/2025_port0050_gp.pdf?isAllowed=y&sequence=4",
};
export const laborJanuarySource: LegalSource = {
  id: "TRT2-GPCR15-2025",
  title: "Portaria GP/CR nº 15/2025 — TRT-2",
  provision: "Suspensão dos prazos em 21, 22 e 23 de janeiro de 2026",
  url: "https://basis.trt2.jus.br/bitstream/handle/123456789/17736/2025_port0015_gp_cr.pdf?isAllowed=y&sequence=2",
};

const closures = [
  ["01-25", "Aniversário da Capital"],
  ["02-16", "Carnaval"],
  ["02-17", "Carnaval"],
  ["02-18", "Suspensão do expediente"],
  ["04-20", "Suspensão do expediente"],
  ["04-21", "Tiradentes"],
  ["05-01", "Dia do Trabalho"],
  ["06-04", "Corpus Christi — Capital"],
  ["06-05", "Suspensão do expediente"],
  ["07-09", "Data Magna de SP"],
  ["07-10", "Suspensão do expediente"],
  ["08-10", "Cursos Jurídicos — antecipado"],
  ["09-07", "Independência"],
  ["10-12", "Nossa Senhora Aparecida"],
  ["10-30", "Servidor Público — antecipado"],
  ["11-01", "Todos os Santos"],
  ["11-02", "Finados"],
  ["11-15", "Proclamação da República"],
  ["11-20", "Consciência Negra"],
  ["12-07", "Dia da Justiça — antecipado"],
];
const events: CalendarEvent[] = closures.map(([day, name]) => ({
  id: `trt2-${day}`,
  start: `2026-${day}`,
  end: `2026-${day}`,
  name,
  kind: "holiday",
  source: laborCalendarSource,
}));
for (const [start, end, name] of [
  ["01-01", "01-06", "Recesso — ausência de expediente"],
  ["04-01", "04-05", "Semana Santa"],
  ["12-20", "12-31", "Recesso — ausência de expediente"],
]) {
  events.push({
    id: `trt2-${start}-${end}`,
    start: `2026-${start}`,
    end: `2026-${end}`,
    name,
    kind: "holiday",
    source: laborCalendarSource,
  });
}
events.push({
  id: "trt2-janeiro-prazos",
  start: "2026-01-21",
  end: "2026-01-23",
  name: "Suspensão extraordinária dos prazos — TRT-2",
  kind: "suspension",
  source: laborJanuarySource,
});

export const laborSp2026: JudicialCalendar = {
  profile: "labor",
  id: "trt2-capital-2026",
  version: "2026-10-21.demo.1",
  court: "TRT2",
  locality: "São Paulo",
  from: "2026-01-01",
  to: "2026-12-31",
  completeness: "demonstration",
  consultedOn: "2026-10-21",
  events,
};
