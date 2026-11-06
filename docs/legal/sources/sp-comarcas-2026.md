# Calendários demonstrativos de comarcas de SP — 2026

Consulta: 20/10/2026. **Revisão jurídica pendente**, sem responsável habilitado identificado. Precisão territorial: município sede da comarca; não distingue foro regional, vara, prédio ou sistema. Não há alegação de cobertura integral do Estado.

Fonte primária: Conselho Superior da Magistratura do TJSP, sessão de 24/11/2025, Processo 2018/206016, **Relação de feriados municipais para 2026**, DJE 4334 de 25/11/2025, p. 3–7. O ato admite alterações durante 2026. Âmbito/vigência: localidades expressamente relacionadas, exercício de 2026. IDs: `TJSP-MUNICIPAIS-2026-p4` a `p7`.

| Comarca / município | Datas da relação para 2026 | Fonte |
| --- | --- | --- |
| São Paulo (Capital) | 25/01, 03/04, 04/06, 02/11, 20/11 | [DJE, p. 7](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=7) |
| Campinas | 03/04, 04/06, 20/11, 08/12 | [DJE, p. 4](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=4) |
| Guarulhos | 03/04, 04/06, 20/11, 08/12 | [DJE, p. 4](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=4) |
| Osasco | 19/02, 03/04, 04/06, 13/06, 02/11 | [DJE, p. 5](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=5) |
| Ribeirão Preto | 20/01, 03/04, 19/06 | [DJE, p. 6](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=6) |
| Santo André | 03/04, 08/04, 04/06, 20/11 | [DJE, p. 6](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=6) |
| Santos | 26/01, 03/04, 08/09, 20/11 | [DJE, p. 6](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=6) |
| São Bernardo do Campo | 03/04, 04/06, 20/08, 20/11 | [DJE, p. 7](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=7) |
| São José dos Campos | 19/03, 03/04, 04/06, 27/07, 02/11 | [DJE, p. 7](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=7) |
| Sorocaba | 03/04, 04/06, 15/08, 20/11 | [DJE, p. 7](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=7) |

Sexta-feira Santa = 03/04/2026, Corpus Christi = 04/06/2026, Finados = 02/11/2026. Datas móveis também expressas no [Provimento CSM 2.813/2025, art. 1º](https://esaj.tjsp.jus.br/gcn-frontend-vue/legislacao/find/236794); não inferidas somente pela Páscoa. Eventos estaduais e bloqueios de expediente parcial/indisponibilidade continuam conforme o [catálogo de fontes](index.md). A seleção do sistema/efeito da indisponibilidade continua pendente; bloqueio conservador não equivale a declarar feriado.

## Versão, completude e mudanças

`sp-2026.ts`: versão `2026-10-20.demo.2`, período 01/01 a 31/12/2026, completude `demonstration`, ID próprio por comarca. A Capital `2026-10-18.demo.1` em `tjsp-2026.ts` permanece preservada. Aniversário da Capital não é herdado por outra comarca. Sobreposições conservam as fontes sem consumir dois dias.

Motor 0.2.0 amplia o contrato territorial e identifica a comarca nos avisos; a regra civil não mudou. O servidor escolhe o calendário, sem aceitar catálogo enviado pelo navegador. Não houve migration nem aprovação de catálogo remoto. Histórico anterior continua separado, sem troca pelo cálculo atual.

Faltam levantamento exaustivo de atos extraordinários/alterações de cada comarca, especificidades de unidade e revisão jurídica. A ausência de evento não confirma expediente normal. Fora de 2026 ou em comarca não cadastrada, não há vencimento. Não há cobertura de 2027.

## Casos de referência técnica

Publicação é o marco excluído. Casos sem revisão jurídica profissional:

| Caso | Publicação / prazo | Primeiro computado | Estimativa / decisão |
| --- | --- | --- | --- |
| SP01 Santos | 04/09/2026, 1 dia útil | 09/09 | 09/09; fim de semana, 07/09 estadual e 08/09 municipal excluídos |
| SP02 Capital | 04/09/2026, 1 dia útil | 08/09 | 08/09; não importa feriado de Santos |
| SP03 Ribeirão Preto | 18/06/2026, 2 dias úteis | 22/06 | 23/06; 19/06 e fim de semana excluídos |
| SP04 Sorocaba | 28/10/2026, 2 dias úteis | 29/10 | 03/11; 30/10 transferido, fim de semana e 02/11 excluídos |
| SP05 Todas as dez | 18/12/2026, 2 dias úteis | — | Incompleto: suspensão e travessia da cobertura |
| SP06 Campinas / Guarulhos | 05/10 ou 18/02, respectivamente | — | Incompleto: indisponibilidade / expediente parcial |

Testes: `tests/sp-calendars.test.ts` e `tests/e2e/calculator.spec.ts`. [Evidências de execução](../../testing/local-finishing.md).
