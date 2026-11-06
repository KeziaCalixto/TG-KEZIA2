# Ampliação criminal TJSP — dez comarcas, 2026

Consulta técnica em 21/10/2026; revisão jurídica profissional pendente. Âmbito: prazo processual ordinário em dias, DJEN, município sede das dez comarcas de [SP já cadastradas](sp-comarcas-2026.md). Não distingue vara, prédio ou foro regional; não certifica atos extraordinários de cada unidade. Calendários demonstrativos, de 01/01 a 31/12/2026.

## Fontes e decisão territorial

- [Provimento CSM 2.813/2025, arts. 1º–5º, DJE 4334, pp. 2–3](https://www.tjsp.jus.br/atcapi/dje/v1/caderno/pagina/download/site?idCaderno=10&idEdicao=4334&idVolume=4334&pagina=2): disciplina ausência de expediente em primeira/segunda instâncias e Secretarias do TJSP em 2026. Não restringe os fechamentos ao ramo civil. Vigência na publicação; admite alterações posteriores. PDF oficial baixado e texto das pp. 2–7 conferido nesta etapa.
- Relação municipal aprovada pelo CSM em 24/11/2025, Processo 2018/206016, no mesmo DJE, pp. 3–7: datas e fontes por município em [sp-comarcas-2026.md](sp-comarcas-2026.md). Conferidas novamente as entradas das dez comarcas. Não importar essas datas para TRT-2 ou TRT-15.
- [Provimento CSM 2.845/2026](https://esaj.tjsp.jus.br/gcn-frontend-vue/legislacao/find/246161): alteração de outubro já registrada no [catálogo](index.md); 30/10 sem expediente, 28/10 com expediente.
- [Comunicado Conjunto 1.047/2025](https://portal.tjsp.jus.br/Corregedoria/Comunicados/Comunicado?codigoComunicado=58675&pagina=9): destinatários das unidades judiciais do Estado, restrições ordinárias de publicação/intimação de 07–20/01/2026. As ressalvas urgentes não integram este perfil.
- [Comunicado Conjunto 371/2025](https://www.tjsp.jus.br/Corregedoria/Comunicados/Comunicado?codigoComunicado=52007&pagina=1): DJEN para hipóteses sem intimação pessoal, desde 16/05/2025. Condições, regras do CPP, vigência e exceções permanecem na [ficha criminal](../rules/criminal-djen-research-2026-10-21.md).

Decisão de implementação: reutilizar somente os eventos TJSP com proveniência estadual/sistema e os municipais da comarca escolhida; remover suspensão civil; aplicar suspensão criminal pelo CPP, art. 798-A. Feriado intermediário consome unidade no curso contínuo; feriado no início ou fim exige dia útil. Expediente parcial/indisponibilidade continuam bloqueados conservadoramente, sem declarar suspensão integral. Não há nova interpretação da contagem.

## Versões e compatibilidade

Preservar integralmente `criminal-sp-2026.ts`, calendário da Capital `2026-10-21.demo.1`, e o perfil criminal inicial de mesma versão. O novo catálogo `criminal-sp-comarcas-2026.ts` conserva essa entrada e acrescenta nove calendários com ID municipal próprio e versão `2026-10-21.demo.2`. A ampliação de âmbito da regra tem versão própria `.demo.2`, usada nas nove localidades adicionais; Capital conserva `.demo.1`. O motor mantém o algoritmo 0.3.0. Não substituir snapshots antigos por catálogos correntes; a leitura original e suas fontes devem continuar disponíveis.

Trabalhista: permanece somente TRT-2 Capital; um município aceito no criminal não o torna aceito no trabalhista. Localidade não cadastrada, tribunal incompatível, contexto excluído ou travessia sem cobertura produzem incompleto/vencimento nulo (ou 400 na validação da API).

## Casos para TDD

Datas abaixo em 2026; marcos de publicação excluídos, contexto ordinário explicitamente confirmado. Expectativas técnicas independentes, ainda sem revisão jurídica.

| Caso | Localidade e entrada | Primeiro computado / fim nominal / vencimento |
| --- | --- | --- |
| PC-SP01 | Santos, publicação 04/09, 1 dia | 09/09 / 09/09 / 09/09 (07/09 estadual e 08/09 municipal) |
| PC-SP02 | Capital, mesma entrada | 08/09 / 08/09 / 08/09 (não importar Santos) |
| PC-SP03 | Santos, publicação 03/09, 5 dias | 04/09 / 08/09 / 09/09; 07 e 08 contam no curso, só o vencimento é prorrogado |
| PC-SP04 | Santos, disponibilização 04/09, 1 dia | Publicação 09/09; primeiro/fim/vencimento 10/09 |
| PC-SP05 | Ribeirão Preto, publicação 17/06, 3 dias | 18/06 / 20/06 / 22/06; feriado 19/06 intermediário computado |
| PC-SP06 | Santo André, publicação 07/04, 1 dia | 09/04 / 09/04 / 09/04 |
| PC-SP07 | São Bernardo do Campo, publicação 19/08, 1 dia | 21/08 / 21/08 / 21/08 |
| PC-SP08 | São José dos Campos, publicação 24/07, 1 dia | 28/07 / 28/07 / 28/07 |
| PC-SP09 | Sorocaba, publicação 14/08, 1 dia | 17/08 / 17/08 / 17/08 |
| PC-SP10 | Campinas e Guarulhos, publicação 03/12, 2 dias | 04/12 / 05/12 / 09/12 |
| PC-SP11 | Osasco, publicação 12/06, 1 dia | 15/06 / 15/06 / 15/06 |
| PC-SP12 | Todas, publicação 18/12, 2 dias | Incompleto; calendário real não cobre 2027 |

Aceites técnicos: API aceita nove novas comarcas criminais, histórico/exportação conservam fonte municipal e versões, troca de localidade invalida resultado visível, calendários mostram o perfil correto, trabalhista recusa expansão implícita, regressão civil e criminal Capital preservadas. Execuções reais serão registradas em `docs/testing/`; esta ficha não declara testes aprovados.
