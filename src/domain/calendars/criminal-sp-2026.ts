import { spCalendars2026 } from "./sp-2026";
import type { JudicialCalendar } from "../deadlines/types";

// Fechamentos do TJSP orientam extremos, não suspendem o curso contínuo.
// A suspensão anual decorre do CPP 798-A no perfil, nunca do CPC.
export const criminalSp2026: JudicialCalendar = {
  ...structuredClone(spCalendars2026["São Paulo"]),
  id: "tjsp-criminal-capital-2026",
  profile: "criminal",
  version: "2026-10-21.demo.1",
  consultedOn: "2026-10-21",
  events: [
    ...structuredClone(
      spCalendars2026["São Paulo"].events.filter(
        (event) => event.kind !== "suspension",
      ),
    ),
    {
      id: "tjsp-posrecesso-publicacoes",
      start: "2026-01-07",
      end: "2026-01-20",
      name: "Restrição de publicações/intimações ordinárias — conferir ato local",
      kind: "publication_restriction",
      source: {
        id: "TJSP-1047-2025",
        title: "Comunicado Conjunto TJSP nº 1.047/2025",
        provision: "Período 07–20/01/2026; ressalvas urgentes fora do perfil",
        url: "https://esaj.tjsp.jus.br/gcn-frontend-vue/legislacao/find/237382",
      },
    },
  ],
};
