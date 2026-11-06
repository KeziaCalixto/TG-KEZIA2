import type { LegalSource, RuleSnapshot } from "./types";

export const laborSource: LegalSource = {
  id: "BR-CLT-775",
  title: "Consolidação das Leis do Trabalho",
  provision: "Arts. 775 e 775-A — dias úteis e suspensão inclusiva",
  url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm",
};
export const criminalSource: LegalSource = {
  id: "BR-CPP-798",
  title: "Código de Processo Penal",
  provision:
    "Arts. 798 e 798-A — contagem contínua, prorrogação e suspensão com exceções",
  url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm",
};
export const saturdaySource: LegalSource = {
  id: "BR-L1408-ART3",
  title: "Lei nº 1.408/1951, redação da Lei nº 4.674/1965",
  provision: "Art. 3º — início ou vencimento em sábado",
  url: "https://www2.camara.leg.br/legin/fed/lei/1950-1959/lei-1408-9-agosto-1951-361886-normaatualizada-pl.html",
};
export const laborDiarySource: LegalSource = {
  id: "TRT2-DJEN-5-2025",
  title: "Provimento GP/CR nº 05/2025 — TRT-2",
  provision: "Arts. 1º–5º — DJEN e observância da Resolução CNJ 455",
  url: "https://basis.trt2.jus.br/bitstream/handle/123456789/17365/2025_prov0005_gp_cr.pdf?sequence=1&isAllowed=y",
};
export const criminalDiarySource: LegalSource = {
  id: "TJSP-DJEN-371-2025",
  title: "Comunicado Conjunto TJSP nº 371/2025",
  provision:
    "DJEN para comunicações sem exigência de intimação pessoal, desde 16/05/2025",
  url: "https://www.tjsp.jus.br/Corregedoria/Comunicados/Comunicado?codigoComunicado=52007&pagina=1",
};
export const extendedProfiles: Record<"labor" | "criminal", RuleSnapshot> = {
  labor: {
    id: "labor-djen-trt2-ordinary",
    version: "2026-10-21.demo.1",
    regime: "labor",
    countingMode: "business",
    validFrom: "2025-05-26",
    scope:
      "TRT-2, São Paulo Capital; prazo processual comum pelo DJEN, em dias, sem intimação pessoal exigível, prerrogativas ou procedimento especial. Não calcula prazo material ou administrativo.",
    legalReview: "pending",
  },
  criminal: {
    id: "criminal-djen-tjsp-ordinary",
    version: "2026-10-21.demo.1",
    regime: "criminal",
    countingMode: "continuous",
    validFrom: "2025-05-16",
    scope:
      "TJSP, São Paulo Capital; prazo processual pelo DJEN, publicação válida a advogado constituído, sem intimação pessoal exigível, réu preso vinculado, violência doméstica, urgência, prerrogativa ou procedimento especial. Não calcula prazo penal material.",
    legalReview: "pending",
  },
};

// Ampliação territorial, sem sobrescrever o perfil inicial da Capital.
export const criminalSpProfile: RuleSnapshot = {
  ...extendedProfiles.criminal,
  version: "2026-10-21.demo.2",
  scope:
    "TJSP, dez comarcas de SP cadastradas, no município sede; prazo processual pelo DJEN, publicação válida a advogado constituído, sem intimação pessoal exigível, réu preso vinculado, violência doméstica, urgência, prerrogativa ou procedimento especial. Não cobre atos específicos por foro/vara nem prazo penal material.",
};
