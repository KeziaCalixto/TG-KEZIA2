# Isolamento dos modos de entrega — 23/10/2026

Banco local, contrato incremental em [lembretes externos](../email-reminders-external.md). Este marco não aplica migrations remotas nem envia mensagens.

## TDD e regressão reais

1. `pnpm exec supabase test db supabase/tests/reminder_modes.test_test.sql --local`: dois casos falhos por ausência da coluna/modo padrão; após acrescentar a coluna no banco local, dois aprovados.
2. Casos de agendamento explícito: falha pela RPC inexistente e ausência do registro Brevo; implementação SQL local reaproveitou a autorização/horário/snapshot da função existente, na mesma transação. Seis casos aprovados.
3. Caso de claim: worker antigo obteve duas gerações quando deveria obter uma; RPC externa inexistente. Após claim por modo e preservação do wrapper local, nove aprovados.
4. Casos de listagem/permissões: 17 aprovados e um falho pela função de listagem ainda ausente. Implementação invoker, projeção mínima e RLS: 18 aprovados.
5. Ampliação da regressão: listagem isolada, campos privados ausentes, acesso cruzado/anon, lease/janela sem mutação cruzada e cancelamento dos dois modos. `pnpm exec supabase test db --local`: **105 testes em quatro arquivos aprovados** (77 anteriores + 28 novos), exit 0. Fixtures em transação com rollback.

O watcher local foi encerrado antes desses ensaios para evitar interferência no claim. Não houve reset do banco com dados.

## Schema e permissões

- `pnpm exec supabase db advisors --local --type security --fail-on warn`: exit 0, nenhum apontamento.
- `pnpm exec supabase db pull reminder_delivery_modes --local --schema 'public,reminder_private' --yes`: gerou `20261023184137_reminder_delivery_modes.sql` e registrou na história **local**. A mensagem genérica da CLI usa `remoteHistoryUpdated` mesmo com `--local`; não houve aplicação hospedada.
- Segunda comparação `db pull verify_reminder_modes` com os mesmos parâmetros: `DbPullInSyncError` / **No schema changes found**. O banco sombra aplicou as três migrations; nenhum arquivo adicional gerado.
- `pnpm exec supabase migration list --local`: três versões coincidentes, incluindo `20261023184137`.

`delivery_mode` tem constraint local/Brevo e default local; nenhuma linha antiga é promovida. Escrita direta permanece negada ao usuário; função privada de agendamento por modo chama a validação original e altera somente o ID recém-criado. Novo claim é exclusivo de serviço e limita tanto manutenção quanto seleção ao modo pedido. Função antiga de claim passa a invoker e delega ao modo local. Listagem nova é invoker e retorna somente projeção mínima do proprietário, limitada ao modo corrente. Não há novo grant de tabela para `service_role`, nem schema privado exposto.

O estado técnico do app/adaptador e do scheduler deve ser registrado separadamente. Esta verificação SQL não comprova HTTP Brevo, recebimento externo, segurança de preview hospedado ou revisão jurídica.
