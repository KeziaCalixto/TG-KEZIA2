# Calendário trabalhista TRT-2 Capital — versão de 2027

Consulta/implementação técnica: 22/10/2026. Revisão jurídica profissional pendente. Âmbito: unidades sediadas no município de São Paulo, TRT-2, perfil processual comum em dias úteis/DJEN, contexto ordinário confirmado. Não cobre TRT-15 ou outra localidade. Precisão municipal; não certifica suspensões de prédio, vara, processo ou indisponibilidades.

Fonte primária: [Portaria GP 19, de 12/08/2026, arts. 1º–3º e anexo](https://basis.trt2.jus.br/bitstream/handle/123456789/18580/2026_port0019_gp.pdf?sequence=3&isAllowed=y), TRT-2, DEJT administrativo 4537 de 14/08/2026, pp. 1–2; vigência na publicação. PDF de 11 páginas baixado novamente do domínio oficial em 22/10 e texto extraído. [Ficha de pesquisa com todas as datas, páginas, diferenças, consultas e lacunas](calendar-2027-research.md). ID da fonte no aplicativo: `TRT2-GP19-2026`.

## Eventos, versões e composição

O catálogo `labor-sp-2027.ts` mantém os eventos expressos no ato para a Capital, natureza **sem expediente**, calendário `trt2-capital-2027@2026-10-22.demo.1`, 01/01–31/12/2027, completude `demonstration`. Recesso e Semana Santa são intervalos inclusivos; feriado coincidente com fim de semana não consome duas exclusões. Dias de fechamento não se confundem com suspensão processual. A suspensão de contagem de 20/12–20/01 decorre da CLT, art. 775-A, no [perfil próprio](../rules/labor-djen-research-2026-10-21.md).

Não copiar de 2026: suspensão de 21–23/01, antecipação de Cursos Jurídicos para 10/08 ou Dia da Justiça para 07/12. Para 2027, anexo registra 11/08 e 08/12; Servidor em 29/10, sem fechar também 28/10 na Capital.

`labor-sp-2026-2027.ts` compõe as versões anuais sem alterá-las, ID `trt2-capital-2026-2027@2026-10-22.demo.1`, cobertura 01/01/2026–31/12/2027. `components` conserva ID, versão, perfil, tribunal, município, intervalo, consulta e completude de cada trecho; todos os eventos e suas fontes integram o snapshot. A composição recusa lacunas, sobreposição, âmbito diferente, composição aninhada ou IDs de evento repetidos. Componente demonstrativo mantém conjunto demonstrativo.

Seleção na aplicação: evento a partir de 2027 usa o calendário anual de 2027, que continua bloqueando 2028. Para evento de 2026, tenta-se primeiro a versão anual preservada. Apenas resultado incompleto cujo percurso chegou a 31/12/2026 tenta a composição contígua; os demais resultados conservam a versão anterior. Não se examina texto de aviso nem se estende uma data final sem incorporar o segundo ano. Algoritmo do motor 0.3.0 e regra trabalhista continuam os mesmos; nenhuma alteração no motor civil ou nos calendários criminais.

## Aceites técnicos

Casos da ficha de pesquisa aplicados em `tests/labor-2027.test.ts`: feriados próprios de 2027, disponibilidade/publicação, início após suspensão, versões do snapshot, lacuna de composição e fim de cobertura. Caso de travessia: publicação 17/12/2026, dez dias úteis, primeiro 18/12, suspensão 20/12–20/01, retomada em 21/01, excluído aniversário 25/01, décimo em **03/02/2027**. Caso sem cobertura suficiente: publicação 17/12/2027 ou data de 2028 → incompleto, vencimento nulo.

Calendário na UI permite 2027 somente no trabalhista; troca de perfil restaura 2026. Memória, exportação JSON, impressão e histórico devem identificar os dois componentes quando houver travessia. Versões anuais antigas e resultados salvos não são sobrescritos. Aceite técnico e comandos reais pertencem a `docs/testing/`; este registro de fonte não equivale a aprovação jurídica.

Pendências: revisar profissionalmente; levantar alterações/atos extraordinários, restrições de publicação/pós-recesso e sistema; manter o aviso de parcialidade enquanto isso. TJSP 2027 não habilitado: fonte de outro tribunal não preenche essa lacuna. TRT-15 e demais municípios dependem de especificação própria.
