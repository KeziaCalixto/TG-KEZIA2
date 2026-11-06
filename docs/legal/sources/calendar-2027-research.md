# Pesquisa de calendários forenses de SP para 2027

Consulta: **21/10/2026**. Ficha: `sp-calendars-2027-research-1`. Estado: pesquisa técnica, **revisão jurídica pendente**. Esta ficha não altera a cobertura do aplicativo nem registra testes executados.

O levantamento encontrou um ato anual primário do **TRT-2 para 2027**. Para o **TJSP**, não foi localizado nesta consulta um ato anual ou uma relação municipal de 2027 suficiente para nova versão. Não localizado não significa inexistente ou não publicado: a busca não certifica exaustividade dos diários, unidades e atos extraordinários.

## Fontes e resultados

| ID | Fonte primária | Resultado e âmbito |
| --- | --- | --- |
| TR2-27 | [Portaria GP 19, de 12/08/2026 — registro completo](https://basis.trt2.jus.br/handle/123456789/18580?show=full), [PDF com anexo](https://basis.trt2.jus.br/bitstream/handle/123456789/18580/2026_port0019_gp.pdf?sequence=3&isAllowed=y) | Define o calendário de feriados de 2027 dos órgãos da Justiça do Trabalho da 2ª Região; discrimina âmbito regional e municipal. DEJT administrativo 4537, 14/08/2026, pp. 1–2. Art. 3º: vigor na publicação. Registro consultado informa ausência de revogação expressa; isso não prova ausência de alterações. |
| TR2-PORTAL | [Feriados e suspensões](https://ww2.trt2.jus.br/servicos/agenda/feriados-e-suspensoes-de-expediente/?L=0), [normas de feriados](https://ww2.trt2.jus.br/servicos/agenda/feriados-e-suspensoes-de-expediente/normas-feriados) | Portal distingue feriado regional, municipal, recesso, suspensão de expediente e suspensão processual. Recomenda consultar o órgão e efeito de cada evento; indisponibilidades têm consulta separada. O resultado indexado ainda exibia 2026; a página de normas foi lida por download HTTP 200. Não se concluiu pela inexistência de 2027 a partir da grade. |
| TJSP-PORTAL | [Expediente forense e suspensão de prazos](https://www.tjsp.jus.br/CanaisComunicacao/Feriados/ExpedienteForense), [processos físicos](https://www.tjsp.jus.br/CanaisComunicacao/Feriados/ProcessosFisicos), [segundo grau](https://www.tjsp.jus.br/CanaisComunicacao/Feriados/Suspensao) | Consulta oficial por município, com fontes de suspensões e consultas próprias para físicos/segundo grau. A extração estática da consulta municipal não trouxe lista filtrada de 2027; ausência de linhas na extração não prova ausência de eventos. |
| TR15-27 | [Portaria GP-CR 010, de 13/10/2026](https://trt15.jus.br/legislacao/normas-institucionais/portarias/portaria-gp-cr-no-0102026), [catálogo oficial](https://trt15.jus.br/corregedoria/normas/portarias?field_ano_comunicado_target_id=All&page=14) | Ato anual de 2027 do **TRT-15**, publicado segundo o catálogo no DEJT administrativo de 14/10/2026, p. 5. Achado útil para futura pesquisa do interior, porém fora do perfil TRT-2 atual; não pode substituir o calendário do TRT-2 ou do TJSP. Há ocorrências municipais de Campinas explicitadas no texto. |
| CNJ-ADM | [Portaria CNJ 81, de 04/12/2025](https://atos.cnj.jus.br/atos/detalhar/6544) | Calendário das **unidades administrativas do CNJ**, janeiro de 2026 a setembro de 2027. Descartado como fonte do TJSP/TRT-2: aparecer em busca ou catálogo do TJSP não transfere seu âmbito. |

O PDF de TR2-27 foi baixado diretamente do domínio Basis com HTTP 200 e lido com `pypdf`: **11 páginas**, texto do ato na p. 1 e relação mensal nas pp. 3–11. A p. 2 contém a grade; as datas e abrangências abaixo foram conferidas na relação textual, sem depender de cores. O próprio PDF remete à publicação no diário como original.

## TRT-2: atos, efeitos e Capital

TR2-27, art. 1º e anexo, fornece os dias sem expediente e os feriados para o exercício de 2027. Seu parágrafo único remete aos arts. 219 e 224, § 1º, do CPC para a contagem. Art. 2º, § 1º, prevê portarias próprias para suspensões locais posteriores; § 2º prevê atualização/republicação por alteração municipal. Logo, **ato anual encontrado não equivale a calendário completo de ocorrências futuras**.

Recorte desta tabela: unidades do TRT-2 sediadas no município de São Paulo, ano civil de 2027. Todas as datas são de **2027**, salvo a suspensão anual iniciada no ano anterior. Não cobre TRT-15, ordem de processo, prédio específico, prazos administrativos ou indisponibilidades.

| Data ou intervalo inclusivo | Natureza | Abrangência no ato | Fonte e efeito proposto para futura versão |
| --- | --- | --- | --- |
| 01/01–06/01 | Recesso, sem expediente | Segunda Região | TR2-27, anexo janeiro, p. 3; exclui dias úteis da contagem trabalhista. |
| 25/01 | Aniversário municipal | São Paulo (sede) | TR2-27, p. 3, com Lei municipal 14.485/2007 indicada; somente unidades no município. |
| 08/02–09/02 | Carnaval | Segunda Região | TR2-27, pp. 3–4; sem expediente. |
| 10/02 | Suspensão de expediente, Cinzas | Segunda Região | TR2-27, p. 4; dia integral, sem importar a regra parcial do TJSP/CNJ. |
| 24/03–28/03 | Semana Santa | Segunda Região | TR2-27, p. 4; não inferir a partir da Páscoa: as datas constam do anexo. |
| 21/04 | Tiradentes | Segunda Região | TR2-27, p. 5. |
| 01/05 | Dia do Trabalhador | Segunda Região | TR2-27, p. 5; coincide com sábado, sem duplicar unidades excluídas. |
| 27/05 | Corpus Christi municipal | São Paulo (sede), entre os municípios relacionados | TR2-27, p. 7, com Lei municipal 14.485/2007 indicada; não classificar automaticamente como feriado nacional. |
| 28/05 | Suspensão de expediente | Segunda Região | TR2-27, p. 7. |
| 09/07 | Data Magna estadual | Segunda Região | TR2-27, p. 8, com Lei estadual 9.497/1997 indicada. |
| 11/08 | Instalação dos Cursos Jurídicos | Segunda Região | TR2-27, p. 8; sem antecipação para 10/08 na relação de 2027. |
| 06/09 | Suspensão de expediente | Segunda Região | TR2-27, p. 8. |
| 07/09 | Independência | Segunda Região | TR2-27, p. 9. |
| 11/10 | Suspensão de expediente | Segunda Região | TR2-27, p. 9. |
| 12/10 | Nossa Senhora Aparecida | Segunda Região | TR2-27, p. 9. |
| 29/10 | Comemoração do Servidor Público transferida | Segunda Região | TR2-27, p. 9; não excluir também 28/10 na Capital por esse motivo. Há feriado municipal de Itapevi em 28/10, inaplicável à Capital. |
| 01/11–02/11 | Todos os Santos e Finados | Segunda Região | TR2-27, p. 10. |
| 15/11 | Proclamação da República | Segunda Região | TR2-27, p. 10. |
| 20/11 | Consciência Negra | Segunda Região | TR2-27, p. 10; coincide com sábado. |
| 08/12 | Dia da Justiça | Segunda Região | TR2-27, p. 10; não antecipar para 07/12 a partir do ato de 2026. |
| 20/12–31/12 | Recesso, sem expediente | Segunda Região | TR2-27, pp. 10–11; não estende a cobertura para 2028. |

A suspensão de prazos de 20/12 a 20/01, inclusive, decorre da [CLT, art. 775-A](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm), já pesquisada na [ficha do perfil trabalhista](../rules/labor-djen-research-2026-10-21.md). É **suspensão do curso**, distinta de ausência de expediente/publicação. Não foi localizado nesta pesquisa ato de suspensão suplementar de 21–23/01/**2027**. A Portaria GP/CR 15/2025 levantada para 2026 não pode ser copiada para outro exercício.

Esta tabela é extração do ato do tribunal. Não houve auditoria independente de toda a legislação municipal subjacente nem verificação exaustiva de alterações futuras, eventos por prédio e indisponibilidades. Uma implementação continuaria **demonstrativa e parcial**, com nova versão/snapshot e consulta datada.

## TJSP: lacuna delimitada

As pesquisas não localizaram provimento anual CSM ou relação municipal de 2027 que permita estender os calendários civil/criminal atuais. O calendário de 2026 e suas alterações não são fonte anual de 2027. Também não basta aplicar feriados federais, extrapolar datas móveis ou repetir as pontes de 2026.

O resultado do catálogo TJSP `237504`, que menciona janeiro de 2026 a setembro de 2027, levou ao calendário administrativo do CNJ (CNJ-ADM). **Não é confirmação de calendário TJSP 2027**. A identificação do órgão emissor e do art. 1º evitou esse falso positivo.

Antes de criar versão TJSP 2027, ainda são necessários: ato CSM do exercício e alterações; relação municipal aplicável a cada comarca; disciplina de publicações/intimações de janeiro de 2027 para o perfil criminal; suspensões por grau, unidade, suporte e sistema; indisponibilidades certificadas com efeito próprio. A existência de suspensão nacional no CPC/CPP não preenche essas lacunas.

## Consultas reproduzíveis e limitações de acesso

Consultadas em 21/10/2026, com resultados limitados aos documentos encontrados:

- Buscas web nos domínios `tjsp.jus.br`, `trt2.jus.br`, `ww2.trt2.jus.br` e `basis.trt2.jus.br`, combinando `2027`, `calendário`, `feriados`, `Provimento CSM`, `Portaria GP` e `expediente forense`. Não localizaram o ato anual TRT-2 pela indexação externa; a pesquisa interna abaixo localizou.
- [Basis: 2027 AND calendário](https://basis.trt2.jus.br/discover?query=2027%20AND%20calend%C3%A1rio&rpp=100) e [2027 AND feriados](https://basis.trt2.jus.br/discover?query=2027%20AND%20feriados&rpp=100): HTTP 200; localizaram GP19/2026 e o Informativo 33/2026.
- [Basis: calendário e alterações](https://basis.trt2.jus.br/discover?query=2027%20AND%20calend%C3%A1rio%20AND%20Altera&rpp=100), [janeiro e suspensão](https://basis.trt2.jus.br/discover?query=2027%20AND%20janeiro%20AND%20suspens%C3%A3o&rpp=100), [publicação e prazos](https://basis.trt2.jus.br/discover?query=2027%20AND%20publica%C3%A7%C3%A3o%20AND%20prazos&rpp=100): lidas para triagem; nenhum ato complementar pertinente a janeiro/2027 ou alteração de GP19 foi confirmado. Resultados de outros assuntos/anos não foram tratados como eventos.
- O leitor web retornou 403/erro de acesso em páginas/PDFs do TRT-2/Basis. Download HTTP direto permitiu ler a busca, registro e PDF. O caminho antigo `/simple-search` retornou 404; a busca válida foi `/discover`. Erro de acesso não foi interpretado como ausência de norma.
- O portal TJSP é parcialmente dinâmico. A leitura estática revelou os campos de município e consultas próprias, sem uma extração completa do banco por comarca/ano. Não foi realizada certificação exaustiva do diário de 2026.

## Próxima implementação e casos de aceitação

Há fonte suficiente para **propor** uma nova versão trabalhista TRT-2 Capital 2027, preservando a versão de 2026. Integrar dois anos exige catálogo que mantenha o âmbito e versões de cada trecho; não basta trocar `validTo`. O vínculo à fonte por data e a exportação/histórico devem conservar os snapshots. Sem composição explícita, cálculo que sai de 2026 continua incompleto.

Casos derivados para TDD, ainda **não executados nesta pesquisa**:

| Caso ordinário, DJEN, Capital TRT-2 | Resultado esperado da interpretação proposta | Fundamento |
| --- | --- | --- |
| Publicação 20/01/2027, 1 dia | Primeiro dia computado e vencimento 21/01/2027, sem copiar suspensão suplementar de 2026 | CLT 775-A e TR2-27, sujeito a ato complementar posterior |
| Publicação 22/01/2027, 1 dia | 26/01/2027, excluindo fim de semana e aniversário em 25/01 | TR2-27, p. 3 |
| Publicação 05/02/2027, 1 dia | 11/02/2027 | Carnaval e Cinzas integral, TR2-27, pp. 3–4 |
| Publicação 23/03/2027, 1 dia | 29/03/2027 | Semana Santa, TR2-27, p. 4 |
| Publicação 26/05/2027, 1 dia | 31/05/2027 | Corpus municipal e suspensão de 28/05, TR2-27, p. 7 |
| Publicação 10/08/2027, 1 dia | 12/08/2027 | Sem antecipação dos Cursos Jurídicos, TR2-27, p. 8 |
| Publicação 27/10/2027, 1 dia; publicação 28/10, 1 dia | 28/10 e 03/11, respectivamente | Transferência para 29/10, fim de semana, 01–02/11, TR2-27, pp. 9–10 |
| Publicação 06/12/2027, 1 dia; publicação 07/12, 1 dia | 07/12 e 09/12, respectivamente | Dia da Justiça em 08/12, TR2-27, p. 10 |
| Publicação 17/12/2026, 10 dias, com composição explícita 2026+2027 | Proposta de vencimento 03/02/2027: computa 18/12; retoma 21/01, exclui 25/01, completa no 10º dia útil | CLT 775-A, fonte 2026 preservada e TR2-27; sem composição/atos suficientes deve permanecer incompleto |
| Contagem que entra em 2028, ou seleção TJSP 2027 | Incompleto, vencimento nulo | Cobertura ausente; não usar ato de outro tribunal |

Antes do aceite: conferir eventuais atos complementares, escrever testes falhos, implementar seleção/composição com versões imutáveis, testar limites e publicação durante suspensão, verificar memória/exportação/histórico, e registrar revisão jurídica separadamente. Nenhum calendário ou teste foi implementado por esta ficha.
