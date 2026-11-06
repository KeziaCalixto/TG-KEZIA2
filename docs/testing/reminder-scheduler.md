# Agendador de lembretes — verificação local

Etapa de 23/10/2026, America/Sao_Paulo. [Decisão do protocolo](../architecture/adr/0006-agendamento-com-assinatura-descartavel.md) e [operação](../reminder-scheduler-operations.md). Este registro distingue implementação local de instalação/ativação hospedada.

## Banco e isolamento

`pnpm db:test` retornou exit 0: **146 testes em cinco arquivos**, incluindo 41 novos casos do agendador. As fixtures abrem transação e fazem rollback: pg_net não transmite essas requisições, pois o envio depende do commit. Respostas HTTP dos casos de ativação são sintéticas, inseridas na mesma transação; não comprovam disponibilidade da Vercel/Brevo.

Casos cobertos: preparação repetível de um único job inativo, configuração desligada, tick vazio sem HTTP, probe enquanto desligado, ausência de Bearer/chave permanente nos cabeçalhos, assinatura em formato fixo, uma requisição em curso por operação, consumo único/expiração/vínculo de operação e timestamp, bloqueios de anon/authenticated/service, ativação condicionada a probe consumido e entrega habilitada, suspensão conjunta de job/configuração e retenção operacional de sete dias. Serviço pode consumir a invocação, mas não ler tabelas privadas, emitir chamadas ou ativar Cron.

| Comando | Resultado observado |
| --- | --- |
| `pnpm exec supabase db advisors --local --type security --level warn --fail-on warn` | Exit 0, nenhum achado. |
| `pnpm exec supabase db lint --local --schema 'public,reminder_private'` | Exit 0, nenhum erro de schema. |
| `pnpm exec supabase db pull reminder_scheduler --local --schema 'public,reminder_private' --yes` | Migration `20261023192044_reminder_scheduler.sql` gerada; registro somente no banco local. |
| `pnpm exec supabase db pull verify_reminder_scheduler --local --schema 'public,reminder_private' --yes` | Quatro migrations reproduzidas no banco descartável; `No schema changes found`/`DbPullInSyncError`, exit 1 sem criar migration adicional. Não foi resetado o banco em uso. |
| `pnpm exec supabase migration list --local` | Quatro versões locais/aplicadas coincidentes: inicial, fila, modos e agendador. |

O diff de schemas não inclui instalação das extensões. A migration recebeu bootstrap condicional de pg_cron em pg_catalog e pg_net em extensions; não recria extensão existente nem altera grants da plataforma. A primeira instalação local de pg_net em public foi identificada pelo advisor e corrigida antes do registro final: extensão nova sem requisições, respostas ou job próprio foi recriada em extensions. Repetir CREATE EXTENSION IF NOT EXISTS para pg_cron acionou erro de grants da plataforma; o bloco condicional evita essa repetição. Nenhum CASCADE ou alteração de ACL/RLS do pg_net foi usado.

## Aplicação

`pnpm check`: typecheck, lint e formatação aprovados; o runner Vitest não iniciou na sandbox Windows (`spawn EPERM`). Repetido `pnpm test` com permissão de subprocessos: exit 0, **254 testes em 18 arquivos**. Os **29 testes do dispatcher** incluem vetores HMAC fixos, assinatura alterada/expirada/futura, replay, vínculo da operação, consumo antes do claim, probe com entrega desligada e diagnóstico de IP limitado, sem refletir mensagem/chave do provedor. Mocks cobrem transporte e relógio, não as permissões reais do banco.

`pnpm build`: exit 0, geração de 22 rotas/páginas, endpoint compilado em Node.js. Nenhuma alteração de motor, regras jurídicas, calendário ou snapshot nesta etapa.

## Regressão encontrada na integração real

`pnpm exec playwright test tests/e2e/history-organization.spec.ts tests/e2e/reminders.spec.ts`: exit 0, **16 cenários aprovados**, desktop/mobile. Em seguida, `pnpm db:test:reminders` falhou na etapa de dispatcher concorrente; limpeza de contas/cálculos/lembretes/mensagens confirmou PASS. O runner mínimo `pnpm reminders:dispatch` reproduziu HTTP 400 mesmo com fila vazia. Comparação no servidor real: POST vazio e vazio com Content-Type JSON retornaram 400; JSON explícito `{operation:"dispatch"}` retornou 200 com contagens zero.

O Next.js expõe stream mesmo quando Content-Length é zero. A nova seleção de operação interpretava presença do stream como payload JSON obrigatório. Teste de regressão no Route Handler reproduziu **um falho e 29 aprovados**, antes de alterar a implementação. Após reconhecer corpo de tamanho zero como a chamada legada: **30 aprovados**. Build repetido retornou exit 0; integração real completa repetida retornou exit 0, com um único aceite/mensagem nos dois disparos simultâneos, isolamento entre contas, link privado, exclusão/logout e limpeza confirmada. Capturas históricas regravadas pelo helper foram restauradas, sem substituir evidências antigas. Os 16 E2E foram executados antes dessa correção de transporte; não se afirma nova execução integral após ela.

Também foi detectada chave publicável preenchida no campo de servidor. Um caso novo na fronteira da API falhou antes do bloqueio preventivo; configuração externa agora exige o prefixo sb_secret_ e recusa quebras de linha. O responsável substituiu a chave no arquivo privado; verificação de formato sem imprimir valor confirmou chave de servidor presente e entrega desligada. Isso ainda não comprova autorização no projeto hospedado.

Após esses ajustes, `pnpm check` retornou exit 0 com tipos, lint, Prettier e **256 testes em 18 arquivos**. Uma execução intermediária foi interrompida porque o processo de lint deixou de avançar; a repetição completa acima terminou aprovada. A consulta hospedada `deadline_calculations?select=id&limit=0`, com chave somente no header privado, retornou HTTP 200 sem ler registros: a chave é aceita pelo projeto correto. Consumo da RPC e dispatch hospedados ainda não foram ensaiados.

## Limites de publicação

Até este registro, não há migration, credencial de lembretes, job ou envio externo novo em produção. O arquivo privado `.env.reminders.production.local`, ignorado pelo Git, foi preparado com entrega desligada e preenchido pelo responsável. O plugin não disponibiliza a chave Secret e a CLI Supabase hospedada não está autenticada; não foi copiada a credencial da stack local.

Próximos aceites: CI em banco limpo; preview sem acesso ao banco de produção; migrations hospedadas com job inativo; credenciais exclusivas de production; probe assinado real sem envio; liberação da origem efetiva no Brevo/cotas; ativação controlada; lembrete solicitado e recebimento confirmado pelo proprietário. Sucesso de SQL, HTTP ou aceite do provedor não comprova recebimento.

## Preparação de ambientes

Metadados Vercel confirmados para `tg-kezia2`, projeto `prj_6fxNlJSppqQJaQFCNWUZVK9R2c6s`, equipe `team_4KRCMp44xurZqkaKO8WVFC1i`. Somente o alvo de NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY foi alterado de production/preview/development para **production**, preservando os valores. Leitura posterior confirmou os alvos; Corepack continua nos três. Novos previews ficam sem backend hospedado; deployments antigos conservam sua configuração de build e não são reclassificados retroativamente.

A tentativa de configurar as nove variáveis de lembretes exclusivamente em production, com entrega false e credenciais como sensitive, foi recusada pela revisão automática: exigiu autorização explícita para enviar esses dados sensíveis à Vercel. Não houve fallback/bypass ou criação parcial. A instalação remota, Vault, job e envio real continuam pendentes. Solicitar autorização concreta com nomes/destino, sem pedir os valores no chat.
