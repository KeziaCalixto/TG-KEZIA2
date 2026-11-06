# Regras candidatas — civil comum / TJSP São Paulo

Versão documental: `civil-djen-mvp-2026-10-18`. Revisão: **técnica documental; jurídica pendente**. Os IDs das fontes apontam para [o catálogo](../sources/index.md). As regras abaixo são uma especificação limitada para implementação e testes, sem certificação de tempestividade de casos reais.

## Condições do recorte

Somente prazo processual civil comum, quantidade inteira positiva em dias, sem regra especial, prerrogativa, interrupção, intimação pessoal ou indisponibilidade a decidir. Tribunal TJSP; município São Paulo; fuso America/Sao_Paulo. O suporte dos autos não substitui o meio de comunicação. As duas entradas admissíveis são a data de disponibilização no DJEN e a data de publicação já identificada pelo usuário.

O recorte temporal da aplicação demonstrativa pode ser menor que a vigência legal. Essa restrição é decisão de engenharia e deve aparecer nas mensagens de cobertura.

## Regras e fundamentos

| ID | Regra normativa resumida | Fonte/dispositivo | Vigência e alteração relevante | Caso |
| --- | --- | --- | --- | --- |
| CIV-DAYS-001 | Contar dias úteis apenas em prazos processuais em dias. | BR-CPC-2015, art. 219 e parágrafo único | CPC desde 18/03/2016; sem alteração indicada no trecho consultado | C01 |
| CIV-NONWORKING-001 | Sábados, domingos e ausência de expediente são feriados forenses. | BR-CPC-2015, art. 216 | Mesmo marco | C01, C05 |
| CIV-EXCLUDE-001 | Excluir começo; incluir vencimento, salvo regra diversa. | BR-CPC-2015, art. 224, caput | Mesmo marco | C01 |
| CIV-SUSPEND-001 | Suspender curso de 20/12 a 20/01, inclusive. | BR-CPC-2015, art. 220 | Mesmo marco | C03, C04 |
| CIV-DJEN-001 | Publicação: primeiro dia útil posterior à disponibilização; contagem: primeiro útil posterior à publicação. | BR-L11419-2006, art. 4º, §§ 3º–4º; BR-CPC-2015, art. 224, §§ 2º–3º | Lei 11.419: art. 22, 90 dias após DOU 20/12/2006; CPC desde 18/03/2016 | C02 |
| CIV-PUBLICATION-001 | No diário, o marco é a publicação. | BR-CPC-2015, art. 231, VII | CPC desde 18/03/2016 | C01 |
| CIV-ENDPOINT-001 | Expediente alterado e indisponibilidade podem deslocar extremos; exigem dados específicos. | BR-CPC-2015, art. 224, § 1º | Mesmo marco; não automatizada nesta fatia | C09 |
| TJSP-DJEN-001 | DJEN determina a comunicação sem exigência pessoal; aviso concomitante tem valor informativo. | TJSP-DJEN-371-2025; CNJ-455-569, art. 11, § 3º | Aplicação TJSP anunciada desde 16/05/2025 | C10 |
| TJSP-OCT12-2026 | Excluir 12/10/2026 por feriado/ausência de expediente. | BR-FERIADO-1210, art. 1º; TJSP-CAL-2813-2025, art. 1º | Exercício de 2026; lei nacional desde 1980 | C01 |
| TJSP-SERVIDOR-2026 | Em 2026, 28/10 tem expediente; comemoração foi transferida a 30/10. | TJSP-CAL-2845-2026, arts. 1º–3º | Registro de publicação 02/10/2026; altera parcialmente o Provimento 2.813/2025 | C06 |
| MVP-EXCEPTION-BLOCK-001 | Enquanto não existir regra por sistema/horário, devolver incompleto quando a normalização ou o intervalo da contagem tocar expediente parcial/indisponibilidade conhecida. | Decisão de implementação conservadora; evidências TJSP-COPA-2406-2026, TJSP-COPA-2906-2026, TJSP-ESAJ-2406-2026, TJSP-ESAJ-0510-2026 e TJSP-CAL-2813-2025, art. 2º | Aplicação nesta versão demonstrativa; não é regra normativa de suspensão de dia inteiro | C09, C11, C12 |

Referências diretas para conferência: [CPC](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm), [Lei 11.419](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11419.htm), [CNJ 569](https://atos.cnj.jus.br/atos/detalhar/5691), [TJSP 371](https://www.tjsp.jus.br/Corregedoria/Comunicados/Comunicado?codigoComunicado=52007&pagina=1), [TJSP 2.845](https://www.tjsp.jus.br/atc/dejesp/consultaSimples.do?cdCaderno=10&cdVolume=4532&nuDiario=4532&nuSeqpagina=1).

## Decisões de implementação

1. Guardar datas civis sem horário para esta fatia; não usar o fuso da máquina para decidir qual dia foi informado.
2. Manter separados evento original, publicação juridicamente considerada, marco excluído, primeiro dia contado e vencimento.
3. Uma entrada do tipo **publicação** não recebe novamente o avanço próprio da disponibilização. Publicação em dia sem expediente requer confirmação; não corrigir silenciosamente uma informação possivelmente incorreta.
4. **Dia de expediente** e **dia computável** são funções diferentes. A suspensão da contagem não prova ausência de expediente nem, sozinha, proibição de publicação. Para eventos normalizados dentro do recesso/pós-recesso, exigir o ato local pertinente ou devolver incompleto.
5. Sobreposição de feriado e suspensão deve guardar os dois motivos e excluir o dia uma única vez. Suspensão preserva a quantidade já contada; interrupção seria outro evento, ainda não suportado.
6. Uma simulação com calendário demonstrativo pode exibir data sob as premissas visíveis. Seu estado é **simulação**, nunca “juridicamente validado”. Se a cobertura não permite sequer terminar o cálculo, não produzir uma data final. A classificação demonstrativa não autoriza omitir exceção conhecida já catalogada: aplicar o bloqueio conservador e preservar fonte/motivo. Fixtures que removem essas exceções servem somente a testes isolados, sem substituir o catálogo da aplicação.
7. Quantidade, data, localidade, fonte, regra e calendário são entradas explícitas. Quantidade negativa/fracionária, data inválida, regime não suportado ou ausência de versão devem produzir erro de validação/incompleto.
8. Registrar versão das regras, versão do calendário, fontes e dia a dia no resultado. Nenhuma chamada de rede ou LLM participa da soma de dias.

## Exceções e bloqueios de escopo

Intimação pessoal eletrônica, consulta automática, Domicílio Judicial Eletrônico e citação eletrônica têm marcos próprios: bloquear sua seleção nesta versão. Também não interpretar datas de correio/mandado sem distinguir ocorrência e juntada. Prazos em dobro, horas, meses, anos, matérias penal/trabalhista/juizados, suspensões específicas do processo e justa causa exigem outras regras revisadas.

O calendário inicial não prova ausência de suspensões excepcionais. A homologação jurídica requer revisão das normas e das condições processuais por profissional habilitado; testes aprovados comprovam consistência técnica com a especificação, sem substituir essa revisão.
