# Publicação e preparação hospedada — 23/10/2026

Código do marco: `5f1d116a660e003b0f0b747104d840a32dea8ce5`, incluindo o agendador em `173eae8`. [PR #1](https://github.com/Eduwilll/TG-KEZIA2/pull/1) integrada por fast-forward na master, preservando os commits dos avanços. [Evidências locais](reminder-scheduler.md). O recebimento externo de lembrete não foi ensaiado.

## CI e publicação

- [CI da PR](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/40037120829): application e database aprovados para esse commit. **256 unitários, 63 E2E aprovados e um omitido**; tipos/lint/Prettier/build e audit sem vulnerabilidades conhecidas. O cenário omitido é o PDF histórico duplicado no mobile. **146 testes SQL em cinco arquivos**, lint sem erros e quatro migrations reproduzidas em banco limpo, inclusive reset descartável do runner.
- [CI da master](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/40038347317): os dois jobs aprovados novamente para o mesmo SHA.
- Vercel: `dpl_5NiSciQaV9zZR2e79uqLTt9XqhsN`, production, **READY**. Commit/repositório conferidos; aliases incluem `tg-kezia2.vercel.app`, `tg-kezia2-eduwillls-projects.vercel.app` e alias da master. [Site](https://tg-kezia2.vercel.app).
- Preview do mesmo commit: `dpl_HPLdxjn74zEkBcL5ktK7jGB7jZ1i`, READY. Fetch autenticado retornou sessão `configured:false,user:null` e lembretes `available:false`. Novos previews não herdam URL/chave do Supabase de produção; deployments anteriores conservam sua configuração de build.

## Configuração e migrations

Nove variáveis de lembretes configuradas somente em production, com entrega **false**. Credenciais Supabase/Brevo, e-mail do remetente e segredos de máquina salvos como sensitive; URL/modo/flag/nome são configuração. Valores não foram impressos, publicados no Git ou copiados para campos públicos. O responsável preencheu e autorizou explicitamente a transferência do arquivo privado; a primeira tentativa havia sido recusada pela revisão automática por exigir consentimento sobre dados/destino. A operação posterior foi aceita, sem fallback ou contorno da recusa.

Chave de assinatura dedicada guardada também no Vault, com verificação de igualdade retornando apenas booleano. Cron nunca recebe esse segredo em seu comando/cabeçalhos.

As três migrations foram aplicadas ao Supabase `yjukuzgowqtkxvhozhbm`, sem reset ou alteração dos registros existentes. O plugin gera timestamps próprios; o responsável autorizou explicitamente alinhar somente version no histórico aos arquivos já testados:

| Nome | Versão criada pelo plugin | Versão canônica no Git/banco |
| --- | --- | --- |
| deadline_reminders | 20261023230335 | 20261023172741 |
| reminder_delivery_modes | 20261023230544 | 20261023184137 |
| reminder_scheduler | 20261023231128 | 20261023192044 |

Correção transacional limitada às três linhas identificadas por nome/versão, com aborto em caso de conflito ou quantidade diferente de três; SQL aplicado e demais linhas preservados. Consulta final confirmou a inicial `20261020001602` e essas três versões coincidentes. A tentativa inicial de ajuste foi recusada pela revisão automática antes da autorização específica.

Uma chamada de instalação do agendador retornou `Invalid or expired requestState`. Antes de repetir, consultas confirmaram ausência de histórico, tabelas, função e extensões. A revisão automática recusou a repetição por presumir instalação anterior; nova conferência comprovou ausência e a instalação aceita acrescentou guarda transacional para abortar se qualquer objeto já existisse. Não houve DDL aplicado duas vezes nem edição dos arquivos de migration já testados.

`prepare_scheduler()` criou um único job `prazo-claro-reminders`, frequência por minuto, **active=false**; configuração **enabled=false**. Histórico e fila tinham zero registros antes/depois. Permissões hospedadas: RLS habilitada nas três tabelas novas; anon/usuário não consomem nonce; serviço pode consumir, mas não emitir/ativar job ou ler invocações diretamente. Comando Cron é somente a chamada da função privada.

Advisors após instalação: sem novo WARN de segurança; permanece proteção de senhas vazadas desativada, anterior a este marco. Dois INFO de RLS sem política nas tabelas privadas são deliberados: sem acesso direto e sem exposição pública, administração por funções controladas. Três WARN antigos auth_rls_initplan no histórico e índices ainda sem uso permanecem documentados. Não criar políticas permissivas nem retirar índices só para suprimir avisos. [Remediação Auth](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [RLS privada](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) e [initplan](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan).

## Verificação do site e probe

Após READY, sessão anônima retornou HTTP 200/configured true, histórico retornou 401 e lembretes retornaram 200/available false. Uma consulta anterior a READY ainda encontrou a rota antiga ausente; isso não foi usado como evidência da nova versão.

Smoke de navegador anônimo (`node tmp/check-production-public.mjs`) aprovado para os três perfis: civil 06/10 + 5 → 14/10/2026; trabalhista 17/12 + 10 → 03/02/2027; criminal 28/10 + 5 → 03/11/2026. Dados fictícios, sem conta, persistência ou e-mail. A primeira execução aguardou networkidle e não chegou à conferência do resultado; repetida com DOMContentLoaded e espera nos elementos/datas, passou. [Captura publicada inspecionada](artifacts/production-multi-regime-2026-10-23.png): perfil criminal, contexto obrigatório, data estimada e avisos acadêmicos legíveis. Requisição probe sem autorização recebeu 401. Nenhum dos valores privados configurados apareceu no documento/scripts carregados nesse percurso; isso não é auditoria exaustiva de todos os artefatos.

Dois probes reais emitidos pelo pg_net foram consumidos uma única vez pela RPC no servidor publicado, comprovando interoperabilidade SQL/HMAC/Next/Supabase. Ambos receberam HTTP 503 com código fixo `provider_ip_blocked`, sem timeout. Não houve claim, envio ou tentativa de mensagem. O resumo privado preservou somente status/código, sem IP/corpo bruto/cabeçalhos.

O responsável liberou a primeira origem observada, mas o segundo probe usou outro IP. [Vercel documenta egress dinâmico por padrão e IPs fixos em Pro/Enterprise](https://vercel.com/kb/guide/how-to-allowlist-deployment-ip-address). [Brevo documenta o bloqueio por IP desconhecido, o controle por conta e sua desativação](https://help.brevo.com/hc/en-us/articles/5740111683858-Authorize-and-block-IP-addresses-for-API-and-SMTP-security). IPs individuais não são uma configuração estável desta infraestrutura; não foram copiadas faixas AWS amplas nem desativados controles automaticamente.

Depois da liberação da segunda origem, o terceiro probe retornou HTTP 200, consumido e com remetente pronto, entrega false. Brevo account consultado separadamente sem imprimir dados pessoais: plano free, sendLimit de 300. Esse diagnóstico não envia mensagem nem reserva cota e o limite é compartilhado com os demais usos da conta.

Uma ativação controlada publicou o mesmo SHA em `dpl_8eJeArKzNoXxUs17vdJ4HfepbmeA`, READY, com entrega true e Cron ainda inativo. GET anônimo passou a exigir identidade (401). O probe desse novo deployment encontrou uma terceira origem não autorizada e retornou 503; o gate de ativação não foi contornado. Flag de produção restaurada a false, `set_scheduler_enabled(false)` confirmado e deployment de preparação `dpl_5NiSciQaV9zZR2e79uqLTt9XqhsN` promovido novamente, mesmo código, sem rebuild. GET voltou a 200/available false. Nenhuma fila/mensagem foi criada nessa tentativa.

O responsável escolheu desativar o bloqueio de IPs desconhecidos das chaves API no Brevo e avisar após salvar, preservando o controle SMTP. Isso é uma decisão sobre o controle de origem da conta, mantendo autenticação e escopo restrito da chave. Até este registro, a confirmação da alteração ainda não chegou; não foi inferida a partir da intenção de fazê-la. Não houve alteração automática desse controle pelo agente.

## Retomada e ativação em 23/10 — 22h38, São Paulo

O responsável confirmou que salvou a desativação do bloqueio de IP das chaves API e preservou o controle SMTP. Novo probe consumido retornou HTTP 200 com remetente pronto/entrega false. A configuração production foi habilitada e o commit 90be5da, com CI aprovada em [40039529807](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/40039529807), foi publicado em `dpl_E3GjwJYzi7WHMb8rLjK8dRRStLbX`, READY. Código funcional preservado desde 5f1d116; 90be5da acrescenta somente documentação/evidências.

Novo probe hospedado consumido: **HTTP 200, probe_ok=true, delivery_enabled=true, sem timeout**. `set_scheduler_enabled(true)` passou pelo gate; leitura confirmou job ativo, frequência por minuto e configuração enabled true. Duas execuções automáticas observadas às 22h39 e 22h40 de 23/10, São Paulo (01h39/01h40 UTC de 24/10), retornaram succeeded. Fila vazia nessa conferência; não houve envio real. Execução SQL do job vazio não é evidência de despacho HTTP/recebimento.

API pública de cálculo confirmou a fixture para o aceite do proprietário: civil/TJSP/Capital, publicação 26/10/2026, um dia → vencimento estimado 27/10. O responsável confirmou salvar/recarregar/exportar e agendar no site. A primeira consulta mínima encontrou antecedência de um dia e envio em 26/10 às 09h. Informado da diferença em relação ao roteiro, o responsável cancelou e reagendou pelo site. Nova consulta confirmou o anterior cancelled e um único Brevo pending com lead_days 3, send_hour 9 e envio em **24/10/2026 às 09h de São Paulo (12h UTC)**. Nenhuma alteração administrativa de send_at ou da escolha do proprietário foi feita. Recebimento e conferência do link privado continuam pendentes.

## Estado vigente e próximo aceite

Conferência após relato de ausência de “e-mail de confirmação”: às 22h53 de 23/10 em São Paulo, o único lembrete ativo permanecia pending para 24/10 às 09h, attempt_count 0, sem error_code ou accepted_at. Cron ativo, última execução às 22h54 succeeded. O export fornecido pelo proprietário conserva publicação 26/10, vencimento estimado 27/10 e exportação em 24/10 01h43 UTC (23/10 22h43 em São Paulo); ele é memória de cálculo, não comprovante de entrega. A rota de agendamento registra a fila e retorna 201, sem envio de confirmação imediata. Portanto, nesta conferência o horário de envio ainda não havia chegado; não há evidência de tentativa falha ou atraso. Sem alteração funcional, teste de regressão, reenvio ou antecipação administrativa. Recebimento real continua pendente para o horário salvo.

Aplicativo ampliado publicado; **entrega habilitada e Cron/configuração ativos**, após confirmação do Brevo e probe pronto. Nenhuma conta real foi alterada pelo agente. Recebimento externo ainda não comprovado; esse aceite depende do lembrete solicitado e confirmado pelo proprietário. Localhost requer Docker/Supabase e Next.js ativos; revalidação da retomada em [verificação final](finalization-2026-10-23.md).

Próximo aceite: repetir o ensaio após a exclusão relatada abaixo, por opt-in do proprietário para horário futuro, mantendo o cálculo até conferir recebimento/link privado. Não antecipar send_at, contornar consentimento ou criar mensagem real para uma fixture. Para suspender ou revalidar após nova configuração, seguir o [procedimento](../reminder-scheduler-operations.md). Monitoramento contínuo, retenção institucional, backup/restauração e revisão jurídica continuam aceites próprios. Os relatos anteriores de entrega desligada preservam o histórico da preparação e das falhas, não o estado atual.

## Ensaio das 09h inconclusivo — conferência de 24/10 às 13h30

Consulta hospedada confirmou zero linhas em deadline_reminders, inclusive no modo Brevo; job prazo-claro-reminders ainda ativo. A consulta às invocações de operação dispatch não retornou registros. O responsável informou que não recebeu a mensagem e excluiu o cálculo de teste, mas não lembra se foi antes ou depois das 09h.

A migration 20261023172741 define ON DELETE CASCADE do cálculo para a fila. Isso explica a ausência do registro depois da exclusão, mas não determina quando ele foi removido nem prova a causa da ausência de e-mail. Classificação: **ensaio inconclusivo, recebimento não validado**. Não houve restauração de linha, reenvio ou alteração administrativa de horário. Os probes anteriores comprovam somente autenticação/configuração, não entrega externa.

Às 13h38 de São Paulo foi proposta uma repetição para 24/10 às 18h, ainda futura: mesma simulação civil/TJSP/Capital, publicação 26/10, um dia, vencimento estimado 27/10; três dias antes às 18h. O proprietário precisa recriar/salvar e solicitar pelo site, com consentimento. Esse horário é proposta de teste, não evidência de que já foi agendado. Manter o cálculo e o lembrete até conferir e-mail/spam e abrir o vínculo privado; registrar o estado antes de qualquer exclusão. [Passos](../entrega/conferencia-final.md).
