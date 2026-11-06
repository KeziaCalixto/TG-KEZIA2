import type {
  CalendarEvent,
  JudicialCalendar,
  LegalSource,
} from "../deadlines/types";

export const laborCalendar2027Source: LegalSource = {
  id: "TRT2-GP19-2026",
  title: "Portaria GP nº 19/2026 — TRT-2",
  provision:
    "Arts. 1º–3º e anexo, pp. 3–11 — calendário de 2027, município de São Paulo",
  url: "https://basis.trt2.jus.br/bitstream/handle/123456789/18580/2026_port0019_gp.pdf?sequence=3&isAllowed=y",
};

// Extração própria do anexo de 2027; não copia transferências/suspensões de 2026.
const closures = [
  ["01-25", "Aniversário da Capital"],
  ["02-08", "Carnaval"],
  ["02-09", "Carnaval"],
  ["02-10", "Suspensão integral do expediente — Cinzas"],
  ["04-21", "Tiradentes"],
  ["05-01", "Dia do Trabalho"],
  ["05-27", "Corpus Christi — Capital"],
  ["05-28", "Suspensão do expediente"],
  ["07-09", "Data Magna de SP"],
  ["08-11", "Instalação dos Cursos Jurídicos"],
  ["09-06", "Suspensão do expediente"],
  ["09-07", "Independência"],
  ["10-11", "Suspensão do expediente"],
  ["10-12", "Nossa Senhora Aparecida"],
  ["10-29", "Servidor Público — transferido"],
  ["11-01", "Todos os Santos"],
  ["11-02", "Finados"],
  ["11-15", "Proclamação da República"],
  ["11-20", "Consciência Negra"],
  ["12-08", "Dia da Justiça"],
];
const events: CalendarEvent[] = closures.map(([day, name]) => ({
  id: `trt2-2027-${day}`,
  start: `2027-${day}`,
  end: `2027-${day}`,
  name,
  kind: "holiday",
  source: laborCalendar2027Source,
}));
for (const [start, end, name] of [
  ["01-01", "01-06", "Recesso — ausência de expediente"],
  ["03-24", "03-28", "Semana Santa"],
  ["12-20", "12-31", "Recesso — ausência de expediente"],
]) {
  events.push({
    id: `trt2-2027-${start}-${end}`,
    start: `2027-${start}`,
    end: `2027-${end}`,
    name,
    kind: "holiday",
    source: laborCalendar2027Source,
  });
}
export const laborSp2027: JudicialCalendar = {
  profile: "labor",
  id: "trt2-capital-2027",
  version: "2026-10-22.demo.1",
  court: "TRT2",
  locality: "São Paulo",
  from: "2027-01-01",
  to: "2027-12-31",
  completeness: "demonstration",
  consultedOn: "2026-10-22",
  events,
};
