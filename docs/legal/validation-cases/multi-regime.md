# Referências técnicas dos novos perfis de SP

Data: 21/10/2026. Revisão jurídica pendente. Tabelas completas e fontes: [trabalhista](../rules/labor-djen-research-2026-10-21.md) e [criminal](../rules/criminal-djen-research-2026-10-21.md). Quantidades são entradas didáticas, não definição automática da duração de um ato.

| Perfil / caso | Evento / quantidade | Marcos e resultado de referência |
| --- | --- | --- |
| Civil preservado | Publicação 06/10/2026; 5 dias úteis | Primeiro 07/10; estimativa 14/10 |
| Trabalhista TRT-2 Capital | Publicação 06/10/2026; 5 dias úteis | Primeiro 07/10; estimativa 14/10, com fontes CLT e calendário TRT-2 |
| Criminal TJSP Capital | Publicação 06/10/2026; 5 dias processuais | Primeiro 07/10; conta 07–11 continuamente; fim nominal 11/10; prorrogação ao dia 13/10 |
| Publicação e suspensão trabalhistas | Disponibilização 22/01/2026; 1 dia | Publicação 23/01, apesar de prazo suspenso; primeiro computado/vencimento 26/01 |
| Criminal em contexto desconhecido/excluído | Mesma data e quantidade do exemplo criminal | Incompleto, vencimento nulo; confirmação não pode ser presumida |
| Criminal com travessia em fixture | Publicação 17/12/2026; 10 dias; calendário controlado até 31/01/2027, sem outros eventos | Conta 18–19/12; suspensão 20/12–20/01; retoma 21/01 e chega a 28/01. O catálogo real de 2026 não autoriza esse resultado: nele permanece incompleto |
| Incompatibilidade | Regra criminal/calendário trabalhista, ou regra civil/calendário criminal | Incompleto, sem cálculo sob o perfil errado |

O caso de travessia é explicitamente uma fixture, não calendário oficial de 2027. Cenários de indisponibilidade/expediente parcial conservam data e fonte na trilha e param sem vencimento. Variações municipais/atos supervenientes não levantados mantêm a natureza demonstrativa dos calendários reais.

Implementação e testes: `tests/multi-regime.test.ts`, `tests/e2e/multi-regime.spec.ts` e helper local `supabase/scripts/verify-local-app.mjs`. Resultados reais, falhas corrigidas e limites: [multi-regime](../../testing/multi-regime.md).

## Ampliações posteriores

- Criminal municipal 2026: [PC-SP01–12, fontes e resultados esperados](../sources/criminal-sp-comarcas-2026.md), [evidências](../../testing/criminal-sp-expansion.md). Capital conserva a versão inicial; novas localidades têm versão própria.
- Trabalhista Capital 2027 e composição com 2026: [casos independentes do ato anual](../sources/calendar-2027-research.md), [contrato/versões](../sources/labor-sp-2027.md), `tests/labor-2027.test.ts` e [evidências reais](../../testing/labor-2027.md). Publicação 17/12/2026, dez dias úteis → 03/02/2027 no calendário composto. Essa ampliação trabalhista não transforma a fixture criminal acima em cobertura real do TJSP 2027.
