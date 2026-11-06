# Catálogo inicial de atos — evidências locais

Execução: **22/10/2026**, America/Sao_Paulo. Pesquisa registrada em `e225182`; implementação e evidências em `ed705ce`. [Fontes, cabimento, vigências e casos independentes](../legal/rules/procedural-acts-2026-10-22.md). Civil comum TJSP/dez comarcas 2026, trabalhista TRT-2 Capital 2026–2027 e criminal TJSP/dez comarcas 2026. Sem publicação, migration, alteração de Auth/RLS ou envio de e-mail externo. Calendários e catálogo parciais; revisão jurídica profissional pendente.

## TDD e regressão

| Comando / etapa | Resultado real |
| --- | --- |
| `pnpm test -- tests/procedural-acts.test.ts`, caso civil antes da implementação | Exit 1: um falho; vencimento nulo em vez de 28/10/2026. |
| Mesmo arquivo, primeira fatia civil implementada | Exit 0: um aprovado. |
| Inclusão dos casos trabalhista/criminal antes dos respectivos atos | Exit 1: dois falhos e um aprovado. |
| Catálogo com os três atos | Exit 0: três aprovados. |
| Inclusão de regressões e contrato de histórico antes de ajustar o leitor | Exit 1: 19 aprovados e dois falhos; o leitor descartava `snapshot.act` e metadados novos. |
| Leitor compatível, mesmo arquivo | Exit 0: 21 aprovados. |
| `pnpm check` | Exit 0: tipos, lint, Prettier e **175 unitários em 15 arquivos**. |
| `pnpm build` | Exit 0: compilação, tipos, 20 rotas e finalização. |
| `pnpm test:e2e --workers=1` | Exit 0: **47 aprovados e um omitido**, 3,5 min. Omitido: PDF histórico duplicado no mobile, como antes. |
| `pnpm db:test:app` | Exit 0: cadastro/Mailpit/PKCE/sessão, persistência e leitura reais dos três atos, rejeição de salvamento não confirmado, versões coincidentes, isolamento entre duas contas, exclusão e limpeza das fixtures. |
| `pnpm check`, após complementos de UI e tipografia | Exit 0: 175 unitários, tipos, lint e formatação novamente aprovados. |
| `pnpm test:e2e tests/e2e/procedural-acts.spec.ts --workers=1` | Exit 0: oito aprovados após uniformizar a tipografia da ficha. |
| `pnpm build`, após ajustes finais de impressão | Exit 0; Prettier do CSS aprovado. |
| `pnpm test:e2e --project=desktop --grep 'imprime só\|ato criminal\|trabalhista 2027' --workers=1` | Exit 0: três aprovados após corrigir a fragmentação do layout na impressão. |
| `git diff --check` e `node tmp/check-delivery-links.mjs` | Sem achados de whitespace; 90 links locais em nove materiais, nenhum ausente. |

As regressões verificam disponibilização/publicação, prorrogação criminal após sábado/feriado, duração adulterada, ato de outro ramo, ID/versão desconhecidos, condições desconhecidas/excluídas, contextos criminais fora do perfil, manual anterior, cópia do snapshot e travessia trabalhista com oito úteis até 01/02/2027. Casos esperados enumerados na pesquisa; não inferidos da implementação.

## Fluxo completo e compatibilidade

UI → API real → resultado: publicação 06/10/2026 gera 28/10 civil, 19/10 trabalhista e 08/10 criminal quando condições do exemplo são confirmadas. Antes da confirmação não há vencimento. A UI trava apenas a duração catalogada; trocar para manual remove ato/declaração e permite editar dias. Trocar regime ou limpar o formulário não reutiliza confirmação. Axe sem violações nos três resultados observados em desktop/mobile; ausência de rolagem horizontal verificada nesses percursos. JSON baixado preserva ato, declaração e versão.

O helper local salva cada ato pela API autenticada, confere ficha/versão e recálculo separado, recarrega a página e abre a memória original com as condições declaradas. Verifica rejeição 422 para ato não confirmado; regressões anteriores de duas identidades e tentativa anônima continuam aprovadas. Os novos campos usam JSON existente, sem alteração de privilégios. Validação de leitura não autentica o snapshot: a indicação de memória original não verificada permanece.

Conferência manual no navegador do Codex: exemplo civil, 15 úteis, 28/10/2026 e identificação de apelação visíveis. [Imagem](artifacts/procedural-act-local.png). O preenchimento automatizado de data pelo controle do IAB não persistiu inicialmente; o erro de data foi exibido. O botão de exemplo do próprio aplicativo preencheu corretamente a data. Uma seleção teve timeout do controle; o estado foi relido antes de continuar. Esses episódios não ocorreram na suíte Playwright do aplicativo e não foram atribuídos ao motor.

## PDF e limites

O E2E desktop substitui somente o diálogo nativo, aciona o preparador real de impressão e gera [memória do ato criminal](../../output/pdf/memoria-ato-criminal.pdf). `pypdf` confirmou ato, condição de réu solto, vencimento e versão. A primeira renderização tinha três páginas, com metadados isolados no final; uniformizar a tipografia e reduzir espaçamentos reuniu os metadados, mas ainda deixou uma página vazia. Retirar flex/altura mínima do contêiner na impressão e o espaço final das fontes resolveu a sobra. Build e regressões dirigidas foram repetidos conforme a tabela.

**Artefato final: duas páginas**, com 1.431 e 2.629 caracteres extraídos. Ambas renderizadas em 1.250 px com Poppler e inspecionadas: datas, condições, exclusões, trilha, URLs e versões legíveis, sem cortes, sobreposição ou página vazia. Os cenários anteriores de impressão histórica e travessia trabalhista passaram; o PDF histórico já versionado foi preservado, sem substituir a evidência do marco anterior.

Não houve nova execução pgTAP, ensaio hospedado, avaliação com participantes ou revisão jurídica profissional. Não calcula intimação pessoal, ciência anterior/audiência, prerrogativas, admissibilidade, protocolo ou efeito de embargos/interrupção sobre outro cálculo. Fontes cujo acesso integral ficou limitado estão identificadas honestamente na pesquisa. Lembretes por e-mail apenas planejados; próximo marco proposto: organização do histórico privado.
