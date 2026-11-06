# TRT-2 Capital 2027 e travessia — evidências locais

Execução em **22/10/2026**, ambiente local; implementação registrada em `5c5c13a`. [Fonte, âmbito, versões e aceites](../legal/sources/labor-sp-2027.md). Marco anterior criminal concluído em `27b1982`; fonte de 2027 pesquisada em `6ea4e51`. Sem deploy, migration, alteração de Auth/RLS, dependência ou credencial.

## TDD e regressão

| Comando | Resultado real |
| --- | --- |
| `pnpm exec vitest run tests/labor-2027.test.ts`, antes da implementação | Exit 1: 15 falhos, um aprovado. Calendário anual antigo não produzia datas de 2027 nem travessia. |
| Mesmo arquivo, após primeira implementação | Exit 1: 13 aprovados, três falhos por expectativa de fonte no conjunto de fontes utilizadas, em percursos sem evento do ato. |
| `pnpm exec vitest run tests/labor-2027.test.ts tests/multi-regime.test.ts tests/criminal-sp-calendars.test.ts`, após ajuste documentado | Exit 0: 73 aprovados. |
| `pnpm check` | Exit 0: tipos, lint, formatação e **154 unitários em 14 arquivos**. |
| `pnpm build` | Exit 0: compilação, tipagem, geração de 20 rotas e finalização. |
| `pnpm test:e2e --workers=1` | Exit 0: **39 aprovados e um omitido**, 3,6 min. PDF histórico duplicado no mobile continua omitido, como antes. |
| `pnpm db:test:app` | Exit 0: conta efêmera/Mailpit/PKCE, sessão, cálculos, gravação/recarga/memória composta, segunda identidade sem acesso, exclusão e limpeza de usuários/linhas/e-mail. |

A expectativa dos três testes de fonte foi corrigida: `result.sources` contém fundamentos efetivamente usados no percurso; sem feriado/fechamento do ato atravessado, ele não aparece ali. O teste confere o ato em `snapshot.calendar.events`, que conserva o calendário e suas fontes completos. A travessia percorre eventos dos dois anos e também confere ambos os atos em `result.sources`. Não foi alterado o motor para acrescentar uma fonte artificialmente.

O antigo teste que exigia incompleto em qualquer travessia trabalhista foi substituído pelos casos da nova cobertura; criminal e civil continuam bloqueando 2027. Resultados trabalhistas de 2026 já calculáveis são comparados integralmente com `calculateDeadline(input,laborSp2026)`; preservados. Motor `extended.ts`, motor civil e calendário anual de 2026 sem diff neste marco.

## Fluxo completo

Formulário trabalhista → API real → publicação 10/08/2027, um dia → 12/08. Alteração para 17/12/2026, dez dias → 03/02/2027, com dez datas computadas enumeradas na especificação. Fontes/versões mostram as duas partes; JSON baixado mantém componentes, intervalo, avisos e estado jurídico pendente. Axe sem violações no resultado composto observado em desktop/mobile. Calendário permite ano 2027 somente no trabalhista, mostra 11/08 e 08/12 e restaura 2026 ao mudar para criminal.

No Supabase local, o helper salva o caso entre anos pela API do aplicativo, confere dois componentes e versão de 2027, relê com recálculo de versões coincidentes e abre a memória original no navegador. O caso criminal de Santos e o civil anterior permanecem na integração. Não foi enviado e-mail externo nem alterado dado de usuário real.

Conferência manual na aba local: mesmo caso de travessia, **03/02/2027**, dez dias computados e contexto TRT-2 visíveis. [Imagem](artifacts/labor-cross-year-local.png). Uma ação manual teve timeout do controle do navegador; o estado foi relido, os campos estavam preenchidos e o cálculo ainda não tinha sido enviado. Nova ação no botão em estado atual produziu o resultado esperado; isso não foi interpretado como falha do motor.

## PDF real

O E2E desktop substitui apenas o diálogo nativo, aciona o preparador real de impressão e gera [memória A4 de cinco páginas](../../output/pdf/memoria-travessia-trt2-2026-2027.pdf). `pypdf` confirmou vencimento, IDs/versões anuais, aviso de cobertura parcial e URLs. As cinco páginas foram renderizadas com Poppler e inspecionadas; a página 3 foi revista em 130 dpi para distinguir perda de legibilidade na miniatura de defeito no PDF. Tabela contínua, cabeçalhos repetidos, fontes/versões e avisos legíveis, sem cortes ou sobreposições observados. Isso não equivale a revisão jurídica do conteúdo.

## Limites e próxima etapa

Calendários demonstrativos/parciais; cobertura de 2027 somente TRT-2 Capital. Sem atos especiais por processo/prédio/sistema, sem TRT-15/TJSP 2027/2028, sem exceções novas. Ato anual permite atualização superveniente; ausência de evento no catálogo não prova expediente normal. Não houve revisão jurídica profissional, ensaio externo hospedado, nova execução pgTAP ou avaliação com participantes. Próxima fatia: especificar catálogo de atos/prazos predefinidos por perfil com condições, fontes e TDD; comunicações pessoais e juizados permanecem contratos separados.
