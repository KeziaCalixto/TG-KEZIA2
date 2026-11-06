# Ampliação criminal municipal — evidências locais

Implementação e verificações em 21/10/2026; integração real encerrada em 22/10 após reiniciar o ambiente local. Fonte e casos: [criminal SP 2026](../legal/sources/criminal-sp-comarcas-2026.md). Pesquisa/especificação em `6ea4e51`. Sem publicação, alteração de Auth/RLS ou migration.

## Comandos e resultados reais

| Verificação | Resultado |
| --- | --- |
| `pnpm exec vitest run tests/criminal-sp-calendars.test.ts`, antes de implementar | Exit 1: 22 falhos e 2 aprovados; API recusava municípios adicionais e devolvia entrada inválida/sem data. |
| `pnpm exec vitest run tests/criminal-sp-calendars.test.ts tests/multi-regime.test.ts`, após implementar | Exit 0: 57 aprovados. |
| `pnpm check` | Exit 0: tipagem, lint, formatação e 138 unitários, 13 arquivos. |
| `pnpm build` | Exit 0: 20 rotas; compilação, tipagem e geração concluídas. |
| `pnpm test:e2e --workers=1` | Relatório final `stats`: 38 no total, 37 esperados/aprovados, zero inesperados/flaky, um omitido; `ok: true`, 160,4 s. `.last-run.json`: `passed`, sem falhos. Omitido: PDF duplicado no mobile, conforme configuração anterior. |
| `node --check supabase/scripts/verify-local-app.mjs` | Exit 0. |
| `pnpm db:test:app` | Exit 0 em 22/10: cadastro/confirmação Mailpit/PKCE, sessão, login/logout/recarga, cálculo civil, persistência trabalhista/criminal Capital e criminal Santos, memória original, isolamento e limpeza. |
| `git diff --check` | Sem erro de whitespace. |

O processo da execução E2E já não estava disponível na retomada de 22/10. O resultado acima foi conferido no `report.json` do ZIP embutido em `playwright-report/index.html`, além do arquivo de última execução; não foi inferido apenas da existência dos testes. O build e o check tiveram retorno final exit 0 observado em 21/10. O lint isolado do helper foi iniciado em 21/10, mas seu retorno não foi recuperado; não se afirma uma segunda execução aprovada desse comando.

## Fluxo observado

O E2E municipal percorre formulário criminal/Santos → API → estimativa 09/09 para publicação 04/09/2026, um dia → JSON baixado com município, regra/calendário `.demo.2` e fonte `TJSP-MUNICIPAIS-2026-p6`. Troca para Capital invalida resultado e produz 08/09. Calendário criminal/Santos/setembro mostra 08/09, Axe sem violações nesse cenário; troca para trabalhista restaura somente Capital. Os demais testes mantêm civil, conta, impressão e perfis iniciais.

O helper real grava a memória criminal de Santos pelo servidor, confere data/fonte municipal/versão, relê e recalcula sob versões coincidentes, abre o original na UI e exclui a fixture. Segunda conta não lê/exclui o histórico do primeiro; proprietário/resultado forjados são ignorados, anônimo recusado. Usuários, linhas e e-mail efêmeros removidos. Não houve envio externo.

Conferência manual no navegador local em 21/10: Santos, mesma entrada → 09/09, fonte municipal na memória, perfil e revisão pendente visíveis. Arquivos históricos `criminal-sp-2026.ts`, `sp-2026.ts`, `labor-sp-2026.ts` e `civil-v0-2.ts` sem diff nesta fatia. Teste compara a saída da Capital ao calendário anterior e mantém `.demo.1`; novas nove comarcas usam `.demo.2`.

## Limites

Calendário parcial/demonstrativo, precisão municipal, contexto ordinário obrigatório e revisão jurídica pendente. Atos específicos de foro/vara/sistema não foram levantados exaustivamente. A suíte não certifica tempestividade. 2027 continua fora da cobertura computável deste marco; o ato TRT-2 localizado tem implementação própria como próxima tarefa. Sem novo ensaio de PDF específico criminal, sem deploy e sem nova execução de pgTAP por não haver migration. Na retomada, Docker/app estavam parados; foram iniciados sem reset. O serviço opcional Vector continuou reiniciando; não é usado pelo fluxo testado.
