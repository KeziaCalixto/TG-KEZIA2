# Pesquisa da regra trabalhista por DJEN

Identificador: `labor-djen-research-2026-10-21`; consulta em **21/10/2026**. Estado: pesquisa técnica com fontes primárias; **revisão jurídica pendente**, sem profissional revisor identificado. Não afirma implementação, homologação ou teste executado.

## Recorte e fundamento

Recorte proposto: prazo judicial trabalhista em **dias úteis**, sem prerrogativas ou exceções, comunicado por publicação no **DJEN**, no TRT-2, município de São Paulo, durante 2026. A quantidade de dias será informada pelo usuário; o recorte não determina automaticamente prazo de recurso, defesa ou outro ato. Prazo material trabalhista, prescrição, pagamento rescisório e prazo administrativo não pertencem a este perfil.

| ID           | Norma/dispositivo e URL primária                                                                                                                                                       | Vigência relevante e efeito                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L-CLT-775    | [CLT consolidada, art. 775, caput e §§ 1º–2º](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm)                                                                  | Redação da Lei 13.467/2017; dias úteis, exclusão do começo e inclusão do vencimento; prorrogação/dilatação judicial depende de decisão, não inferida pelo sistema                                                   |
| L-CLT-775A   | [CLT, art. 775-A](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm) e [Lei 13.545/2017](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/lei/l13545.htm) | Suspensão anual inclusiva de 20/12 a 20/01; lei de inclusão publicada em 20/12/2017, vigência na publicação                                                                                                         |
| L-ELEC-4     | [Lei 11.419/2006, art. 1º, § 1º, art. 4º, §§ 2º–4º](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11419.htm)                                                           | Lei aplicável também ao trabalhista; publicação no primeiro dia útil após disponibilização, início no primeiro útil após publicação; ressalva de intimação/vista pessoal; lei vigente desde 90 dias após publicação |
| L-CNJ-455    | [Resolução CNJ 455/2022, art. 11, § 3º, texto compilado](https://atos.cnj.jus.br/atos/detalhar/4509)                                                                                   | Redação da Resolução 569/2024; DJEN para hipóteses sem vista/intimação pessoal; comunicação concomitante por outro meio é informacional; página registra também alteração pela Resolução 624/2025                   |
| L-TRT2-PROV5 | [Provimento GP/CR 05, de 26/05/2025](https://basis.trt2.jus.br/bitstream/handle/123456789/17365/2025_prov0005_gp_cr.pdf?sequence=1&isAllowed=y), arts. 1º–5º                           | DEJT administrativo 4228, de 26/05/2025, pp. 1–2; vigência na publicação; art. 1º manda observar Resolução 455; transição da funcionalidade Procuradoria até 30/05/2025 não precisa ser simulada no recorte 2026    |
| L-CAL-50     | [Portaria GP 50/2025](https://basis.trt2.jus.br/bitstream/handle/123456789/17686/2025_port0050_gp.pdf?isAllowed=y&sequence=4), art. 1º, parágrafo único e anexo                        | Exercício 2026; remete aos arts. 219 e 224, § 1º, do CPC para contagem nos dias assinalados; datas transferidas próprias do TRT-2                                                                                   |
| L-CAL-15     | [Portaria GP/CR 15, de 28/10/2025](https://basis.trt2.jus.br/bitstream/handle/123456789/17736/2025_port0015_gp_cr.pdf?isAllowed=y&sequence=2), arts. 1º–2º                             | Suspende prazos judiciais de 21 a 23/01/2026, retoma 26/01; expediente regular de 07 a 23/01; não abrange administrativos                                                                                           |

Os PDFs do TRT-2 foram baixados do domínio oficial com HTTP 200 e texto extraído com `pypdf`. O [registro oficial do Provimento 05/2025](https://basis.trt2.jus.br/handle/123456789/17365), consultado nesta data, informa ausência de revogação expressa; isso não certifica toda alteração indireta possível. A [página institucional de legislação do PJe](https://ww2.trt2.jus.br/servicos/acesso-online/processo-judicial-eletronico-pje/pje-legislacao-especifica) vincula o Provimento 05/2025 e o Ato GP/CR 08/2024 de adoção do DJEN. A [notícia institucional de 09/05/2025](https://ww2.trt2.jus.br/noticias/noticias/noticia/novas-regras-de-contagem-de-prazos-processuais-terao-efeito-a-partir-de-16-5) informa a aplicação das diretrizes a partir de 16/05/2025; sua descrição abreviada de publicação como dia seguinte deve ser lida sob a exigência legal de **dia útil** da Lei 11.419, art. 4º, § 3º.

## Marcos e decisão de implementação proposta

1. **Evento original:** disponibilização ou publicação já conhecida, informado separadamente. Não usar data genérica de ciência.
2. **Comunicação considerada:** para disponibilização, primeiro dia útil de publicação posterior; para publicação conhecida, manter a data informada, condicionada à validação de expediente/comunicação.
3. **Dia do começo excluído:** a publicação, preservada como marco na memória.
4. **Primeiro dia computado:** primeiro dia posterior à publicação que não seja sábado, domingo, feriado, dia sem expediente aplicável ou suspensão de prazo judicial.
5. **Contagem:** consumir uma unidade apenas por dia computável; suspensão preserva dias anteriores; múltiplos motivos não multiplicam a exclusão.
6. **Vencimento:** data que consome a última unidade, dentro da cobertura. Se faltarem cobertura, âmbito, fonte necessária ou hipótese especial, resultado incompleto, vencimento nulo e motivo explícito.

São decisões de tradução do recorte para um contrato determinístico, sujeitas à revisão jurídica. A memória deve identificar CLT como fundamento da unidade/contagem; não trocar apenas o rótulo da regra civil.

### Publicação e suspensão são calendários distintos

Suspensão de prazo não torna automaticamente a data sem expediente ou sem publicação. A Portaria 15 mantém expediente de 07 a 23/01. Portanto, não se pode empregar sem distinção um `isBusinessDay` que exclui suspensões tanto para obter publicação quanto para consumir dias do prazo.

Exemplo manual: disponibilização em **22/01/2026**, expediente normal na sexta **23/01**; publicação considerada em **23/01** e primeiro dia computável em **26/01**, após o fim da suspensão e do fim de semana. Não deslocar a publicação para 26/01 apenas por causa da suspensão. Se o motor não representar essa distinção, bloquear esse cenário com pendência específica até implementar/testar a fronteira, em vez de fornecer marcos errados.

## Casos manuais independentes para fixtures

Calendário: [TRT-2 Capital 2026 levantado nesta pesquisa](../sources/labor-sp-2026-research.md). Resultados esperados calculados manualmente, **não extraídos da implementação**. Datas em ISO; quantidade não corresponde automaticamente a um ato tipificado. Estes casos são material para TDD e ainda precisam de aprovação jurídica.

| ID  | Evento, data, quantidade                                                                            | Publicação considerada | Primeiro dia / vencimento esperados                             | Razão verificável                                                                         |
| --- | --------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| L01 | Publicação `2026-03-02`, 5 dias                                                                     | `2026-03-02`           | `2026-03-03` / `2026-03-09`                                     | Conta 03,04,05,06,09; exclui fim de semana                                                |
| L02 | Publicação `2026-02-13`, 1 dia                                                                      | `2026-02-13`           | `2026-02-19` / `2026-02-19`                                     | 14–15 fim de semana; 16–17 Carnaval; 18 Cinzas integral                                   |
| L03 | Publicação `2026-03-31`, 1 dia                                                                      | `2026-03-31`           | `2026-04-06` / `2026-04-06`                                     | Semana Santa começa na quarta 01/04, não apenas na sexta                                  |
| L04 | Publicação `2026-04-17`, 1 dia                                                                      | `2026-04-17`           | `2026-04-22` / `2026-04-22`                                     | 18–19 fim de semana, 20 suspensão, 21 Tiradentes                                          |
| L05 | Disponibilização `2026-06-03`, 1 dia                                                                | `2026-06-08`           | `2026-06-09` / `2026-06-09`                                     | 04 feriado municipal, 05 suspensão expediente, 06–07 fim de semana; não contar publicação |
| L06 | Publicação `2026-07-08`, 1 dia                                                                      | `2026-07-08`           | `2026-07-13` / `2026-07-13`                                     | 09 feriado estadual, 10 suspensão, 11–12 fim de semana                                    |
| L07 | Publicação `2026-08-07`, 1 dia                                                                      | `2026-08-07`           | `2026-08-11` / `2026-08-11`                                     | Feriado antecipado para 10/08; 11/08 normal neste conjunto                                |
| L08 | Publicação `2026-10-27`, 1 dia                                                                      | `2026-10-27`           | `2026-10-28` / `2026-10-28`                                     | Não importar 28/10 como feriado na Capital                                                |
| L09 | Publicação `2026-10-29`, 1 dia                                                                      | `2026-10-29`           | `2026-11-03` / `2026-11-03`                                     | 30/10 transferência, 31 sábado, 01 domingo/Todos Santos, 02 Finados                       |
| L10 | Publicação `2026-12-04`, 1 dia                                                                      | `2026-12-04`           | `2026-12-08` / `2026-12-08`                                     | Dia da Justiça antecipado para 07/12; 08/12 não é feriado da Capital por esse motivo      |
| L11 | Publicação conhecida `2026-01-20`, 1 dia                                                            | `2026-01-20`           | `2026-01-26` / `2026-01-26`                                     | Prazo permanece suspenso até 23 inclusive; 24–25 fim de semana                            |
| L12 | Disponibilização `2026-01-22`, 1 dia                                                                | `2026-01-23`           | `2026-01-26` / `2026-01-26`                                     | Distinguir expediente/publicação de suspensão de prazo                                    |
| L13 | Publicação `2026-12-18`, 2 dias                                                                     | `2026-12-18`           | Nenhum dia consumido até fim da cobertura / **vencimento nulo** | Fim de semana 19–20 e suspensão 20/12 em diante; não inventar calendário de 2027          |
| L14 | Regra trabalhista e calendário TJSP ou TRT-15                                                       | —                      | **Recusar incompatibilidade**                                   | Tribunal e jurisdição não são intercambiáveis                                             |
| L15 | Citação, Domicílio, intimação pessoal, audiência, prazo administrativo/material ou exceção judicial | —                      | **Recusar hipótese fora do perfil**                             | Quantidade de dias não supre a especificação jurídica ausente                             |

## Lacunas e critérios de aceite

- Independência do calendário TRT-2 em relação ao TJSP, com versão imutável própria e referência a cada evento.
- Fontes/dispositivos/revisão/pêndencias preservados em tela, histórico, JSON e impressão; não afirmar calendário oficial completo.
- Calendário parcial de 2026, sem travessia artificial para 2027, sem certificação de completude de cada prédio.
- Suporte a disponibilização durante suspensão somente após distinguir expediente de dia computável e aprovar casos como L12.
- Não inferir prorrogação por força maior, indisponibilidade, despacho, regra especial, prazo em dobro ou prerrogativa institucional.
- Não tratar prazo material de direito do trabalho como prazo processual do art. 775.
- Registrar execução real dos testes e divergências em `docs/testing/`; aprovação automatizada não conclui revisão jurídica.
