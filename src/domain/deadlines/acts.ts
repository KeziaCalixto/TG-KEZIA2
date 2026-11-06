import type { ActSnapshot } from "./types";

// Immutable catalog version. Legal vigency and scope researched in docs/legal/rules/.
const commonConditions = [
  "DJEN é a comunicação válida ao advogado constituído e o marco aplicável, sem ciência anterior ou audiência que já inicie o prazo.",
  "Prazo simples, sem intimação pessoal exigível, prerrogativa, regra especial, determinação divergente, embargos já opostos ou outro fato que altere a contagem.",
];
export const proceduralActs: readonly ActSnapshot[] = [
  {
    id: "labor-ordinary-appeal",
    version: "2026-10-22.demo.1",
    regime: "labor",
    court: "TRT2",
    label: "Recurso ordinário contra decisão da Vara do Trabalho",
    days: 8,
    countingMode: "business",
    supportFrom: "2026-01-01",
    consultedOn: "2026-10-22",
    scope: "TRT-2, São Paulo Capital, procedimento comum em 2026–2027.",
    conditions: [
      "Decisão definitiva ou terminativa de Vara, em dissídio individual e procedimento comum, prazo simples.",
      "Não há sentença comunicada em audiência nem data de julgamento previamente comunicada que defina o início.",
      ...commonConditions,
    ],
    exclusions: [
      "Decisão originária de TRT, execução, agravo de petição, rito sumaríssimo/de alçada, dissídio coletivo ou jus postulandi.",
      "Audiência, intimação pessoal, embargos e devolução de prazo exigem enquadramento próprio.",
    ],
    sources: [
      {
        id: "ACT-CLT-ORDINARY-APPEAL",
        title: "Consolidação das Leis do Trabalho",
        provision: "Arts. 895, I; 775; 775-A; 851, § 2º",
        url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm",
      },
      {
        id: "ACT-TST-217",
        title: "TST — Tema repetitivo 217 / Súmula 197",
        provision:
          "RR-0000022-36.2024.5.09.0133 — marco comunicado em audiência",
        url: "https://www.tst.jus.br/documents/d/guest/irr217-pdf",
      },
    ],
    legalReview: "pending",
  },
  {
    id: "criminal-sentence-clarification",
    version: "2026-10-22.demo.1",
    regime: "criminal",
    court: "TJSP",
    label: "Pedido de declaração da sentença penal",
    days: 2,
    countingMode: "continuous",
    supportFrom: "2026-01-01",
    consultedOn: "2026-10-22",
    scope:
      "TJSP, dez comarcas cadastradas em 2026; defesa de réu solto com advogado constituído.",
    conditions: [
      "Sentença do juiz de primeiro grau com obscuridade, ambiguidade, contradição ou omissão (CPP 382).",
      "Defesa de réu solto representado por advogado constituído; DJEN válido e suficiente no caso.",
      ...commonConditions,
    ],
    exclusions: [
      "Acórdão (CPP 619), júri/procedimento especial, réu preso, Maria da Penha ou urgência.",
      "Ministério Público, Defensoria, defensor nomeado, intimações múltiplas relevantes ou prazo diferenciado.",
      "Não determina interrupção ou reinício de outros prazos.",
    ],
    sources: [
      {
        id: "ACT-CPP-CLARIFICATION",
        title: "Código de Processo Penal",
        provision: "Arts. 382; 370, §§ 1º, 3º e 4º; 392, II; 619",
        url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm",
      },
    ],
    legalReview: "pending",
  },
  {
    id: "civil-appeal",
    version: "2026-10-22.demo.1",
    regime: "civil",
    court: "TJSP",
    label: "Apelação contra sentença civil",
    days: 15,
    countingMode: "business",
    supportFrom: "2026-01-01",
    consultedOn: "2026-10-22",
    scope: "TJSP, dez comarcas cadastradas, processo civil comum em 2026.",
    conditions: [
      "Sentença de primeiro grau em procedimento comum; apelação em prazo simples.",
      ...commonConditions,
    ],
    exclusions: [
      "Decisão interlocutória, despacho, acórdão, juizado ou procedimento especial.",
      "Contrarrazões, recurso adesivo e recálculo após embargos não estão neste catálogo.",
    ],
    sources: [
      {
        id: "ACT-CPC-APPEAL",
        title: "Código de Processo Civil",
        provision: "Arts. 1.003, caput e § 5º; 1.009; 1.026",
        url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm",
      },
    ],
    legalReview: "pending",
  },
];
