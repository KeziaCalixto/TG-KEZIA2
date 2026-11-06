# Organização do histórico privado — evidências locais

Etapa iniciada em **22/10/2026**, retomada em **23/10/2026**, America/Sao_Paulo. Contrato registrado em `70a12c6`: [parâmetros, paginação, situação e fronteiras de teste](../history-organization.md). Implementação e evidências registradas em `ed466cf`. Sem publicação, migration, alteração de grants/RLS, envio externo ou mudança no motor e nos calendários.

## TDD e correções observadas

| Etapa / comando | Resultado observado |
| --- | --- |
| `pnpm test -- tests/history-organization.test.ts`, parâmetro desconhecido antes da implementação | Exit 1: um falho; recebia 200 em vez de 400. |
| Mesmo arquivo, caso de paginação antes da implementação | Exit 1: um falho e um aprovado; metadados ausentes. |
| Caso de relógio/fuso antes da classificação | Exit 1: um falho e dois aprovados; `asOfDate` ausente. |
| Regressões de contrato | Exit 1: 15 aprovados e um falho; ausência de contagem era apresentada como lista válida. |
| Após tratar contagem ausente como indisponibilidade | Exit 0: 16 aprovados. |
| Caso PostgREST 416/PGRST103 antes do fallback | Exit 1: 15 aprovados e dois falhos. Um expôs retorno 503 em vez de página vazia; outro foi contaminação de resposta mock pendente. |
| Recontagem sob o mesmo proprietário/regime e reset do mock entre casos | Exit 0: 17 aprovados. |
| `pnpm check`, em 22/10 | Exit 0: tipos, lint, Prettier e 192 unitários em 16 arquivos. Primeira tentativa havia encontrado formatação; correção intermediária de tipos no retorno discriminado do SDK também foi necessária. |
| `pnpm build`, em 22/10, após ajuda/privacidade | Exit 0: compilação, tipos e 20 rotas. |
| Primeira suíte `pnpm test:e2e --workers=1`, em 22/10 | Exit 1: 51 aprovados, quatro falhos e um omitido. Seletores antigos buscavam `status` em erro agora corretamente `alert`, ou incluíam o anunciador de rota do Next. Seletores restringidos pelo texto esperado. |
| Duas tentativas `pnpm db:test:app`, em 22/10 | Exit 1 na preparação das novas fixtures; percursos anteriores passaram e fixtures foram limpas. O teste tentava alterar `created_at` após inserir, mas não existe grant de UPDATE. Ajustado para timestamps iguais na inserção autenticada, sem ampliar privilégios. |
| Retomada `pnpm db:test:app`, em 23/10 | Exit 1 em configuração local: Docker desligado. Nenhuma conta criada nessa tentativa; Docker Desktop iniciado para retomar. |
| `pnpm test:e2e --workers=1`, em 23/10, após corrigir seletores | Exit 0: **55 aprovados e um omitido**, 3,7 min. Omitido: PDF histórico duplicado no mobile, como nos marcos anteriores. |
| `pnpm db:test:app`, em 23/10, com Docker e servidor ativos | Exit 0: cadastro/Mailpit/PKCE/sessão, memórias dos três perfis/atos, filtros/contagens/ordenação/páginas reais, duas contas, anônimo, exclusão e limpeza aprovados. |
| `pnpm check`, em 23/10, após formatar o helper corrigido | Exit 0: tipos, lint sem avisos, Prettier e **192 unitários em 16 arquivos**. Lint levou alguns minutos nesta retomada, mas concluiu sem intervenção. |
| `git diff --check` e `node tmp/check-delivery-links.mjs`, em 23/10 | Exit 0: sem erros de whitespace; 98 links locais em nove materiais, nenhum destino ausente. Avisos de conversão LF/CRLF do Git não indicaram falha. |

A tentativa de executar o helper corrigido no fim de 22/10 não chegou a executar: a revisão automática de aprovação estava indisponível por limite de uso da ferramenta. Não houve rejeição de segurança ou contorno da revisão.

## Fronteiras e limites

Os 17 casos novos exercitam o Route Handler com o SDK real construindo consultas PostgREST e fetch externo substituído. Conferem validação antes da consulta, proprietário, regime antes do intervalo, desempate, contagem, cache privado, erros e fallback. Esses mocks não comprovam políticas do banco.

Relógio simulado em `2026-10-22T02:59Z` e `03:00Z` verifica a virada de 21 para 22/10 em São Paulo; o dia seguinte verifica vencimento passado. A data do snapshot antigo é preservada e usada na situação, mesmo quando o motor atual produziria outra estimativa. Memória inválida/incompleta fica sem vencimento determinado. Relógio permanece no GET, fora do motor.

Quatro cenários novos em desktop/mobile cobrem paginação, tamanhos, filtro global por regime, busca somente na página, vazio, falha/repetição, atualização ao voltar foco, resposta antiga descartada, exclusão da última página e foco. Axe e largura horizontal são conferidos nos estados cobertos; não substituem avaliação humana, leitor de tela ou aparelho físico.

A integração real usa contas efêmeras locais e registros fictícios: 13 cálculos, timestamps empatados, ordenação por UUID, filtro antes do intervalo, contagem do proprietário e página fora do total; depois segunda conta e exclusão. Login auxiliar apenas em memória, sem expor tokens em logs/artefatos. A ausência de UPDATE foi preservada. Snapshot continua identificado como não verificado; indicação de vencimento não comprova cumprimento do ato nem revisão jurídica.

O helper confirmou total 13 para o proprietário e quatro trabalhistas, com páginas de dois registros em UUID decrescente no empate; a página 100 retornou 200, vazia, com total quatro. O navegador percorreu a segunda página e voltou à primeira ao filtrar. Segunda conta recebeu total zero também sob filtro e não pôde excluir registros alheios. Depois de excluir os trabalhistas, a página fora do total retornou total zero. Cadastro, e-mail de confirmação e todas as fixtures foram removidos no encerramento.

[Captura do navegador com dados fictícios locais](artifacts/history-pagination-local.png), produzida pelo helper e inspecionada: filtro Trabalhista, quatro registros, paginação, referência 23/10/2026 e situação textual legíveis, sem corte ou sobreposição. Os artefatos de calculadora/PDF de marcos anteriores são preservados; esta etapa não os substitui por regenerações com novas datas de execução.

Busca textual não é global; paginação por intervalo pode se deslocar com alterações concorrentes. A situação tem data/fuso de referência e atualização explícita, sem acompanhamento em tempo real. Não houve ensaio hospedado ou nova execução de pgTAP nesta etapa sem migration. Lembretes por e-mail continuam planejados, sem agendamento.
