# Operação e manutenção da entrega acadêmica

Responsável operacional: mantenedor da instalação/repositório. Esta entrega não define uma pessoa, contato de atendimento ou prazo institucional inexistentes. Quem disponibilizar acesso deve informar esses dados aos participantes e registrar as decisões abaixo antes de ampliar o uso.

## Dados e retenção

O cálculo público não é salvo automaticamente. Histórico contém entrada, título, memória, fontes, versões e proprietário; evita-se coletar número de processo ou partes. Auth é gerenciado pelo Supabase. Não há analytics publicitário configurado. [Descrição pública no aplicativo](../../src/app/privacidade/page.tsx).

Não há expiração automática. A retenção atual é até exclusão pelo proprietário ou pelo administrador. A continuação local permite paginação e filtro por ramo; o tamanho de página (até 50 registros) não é uma política de descarte. Para um pedido que envolva registros mais antigos, o responsável deve tratar todos os registros da identidade verificada, sem limitar-se à página exibida na interface.

O usuário pode exportar e excluir cada memória. A interface confirma a exclusão antes de enviar a requisição. Backups, logs de provedores e arquivos exportados não são apagados por esse botão. Definir período de conservação, rotina de descarte e tratamento de backups com a instituição antes de uso com dados reais.

## Exclusão integral de conta — procedimento administrativo

1. Receber a solicitação por canal informado pelo responsável. Não pedir senha, token ou código; verificar a identidade por procedimento adequado.
2. Permitir a exportação solicitada pelo titular por canal autorizado. Usar somente os dados dessa identidade; não exportar a tabela inteira de usuários para atender um pedido individual.
3. Encerrar/revogar sessões pelos recursos administrativos do Auth e aplicar o procedimento de exclusão no projeto correto, em Authentication → Users. Não executar em outro ambiente por engano.
4. A FK do histórico usa `on delete cascade`; verificar que não restam registros ativos do usuário. Não há Storage no app; se for introduzido, objetos/ownership passam a fazer parte do procedimento.
5. Confirmar atendimento, registrar somente os metadados necessários e aplicar a política definida para backups/logs. Se restaurar um backup, reaplicar exclusões para não reintroduzir dados removidos.

Limite do provedor: excluir um usuário não invalida por si só um JWT já emitido antes do vencimento. Endpoints privados consultam `getUser`, e o histórico excluído não permanece acessível por RLS/cascade; isso não equivale a revogação universal imediata de todos os tokens. Fonte: [gerenciamento de usuários Supabase](https://supabase.com/docs/guides/auth/managing-user-data). Não foi executada exclusão de conta real nesta entrega.

## Backup e recuperação

`supabase stop` preserva os volumes/dados locais por padrão; não é evidência de backup externo ou teste de restauração. Backups do projeto hospedado dependem do plano/configuração reais. Não se afirma que existe backup remoto recuperável ou rotina de restauração ensaiada.

Antes de alterar migrations ou ambiente com dados, registrar backup disponível, responsável e procedimento de restauração. Segredos e dumps devem ficar fora do Git, protegidos e com acesso limitado. Nunca substituir migration já aplicada para alinhar históricos; criar alterações novas e ensaiar em ambiente isolado.

## E-mail, abuso e observabilidade

Publicação de 23/10: [estado hospedado e evidências](../testing/reminders-production.md), [probe/ativação/suspensão](../reminder-scheduler-operations.md). O responsável confirmou o ajuste do controle de IP das chaves API no Brevo, mantendo autenticação/escopo restrito e preservando SMTP. Probe com entrega true aprovado e Cron ativo; recebimento pelo proprietário ainda pendente. Vercel pode trocar a origem entre chamadas/deployments; liberar um IP isolado não comprovou estabilidade. Não alterar controles da conta automaticamente. Para pausar, desativar Cron/configuração pela função administrativa e publicar a flag desligada, conforme o procedimento.

Lembretes locais de 23/10 são um serviço de aplicação separado do SMTP do Auth. Precisam de ativação por cálculo, e-mail confirmado e watcher local ativo; consultar [configuração e estados](../email-reminders.md). O adaptador recusa retransmissão externa ativa no Mailpit. Janela de uma hora perdida não dispara retroativamente; falha pré-envio tem até três tentativas, e possível aceite fica incerto para conferência. Cancelar um/todos não recolhe envio em curso. Exclusão de cálculo/conta remove a fila em cascata, mas não mensagens já recebidas; não há expiração automática dos registros de tentativa enquanto o cálculo existir.

Continuação externa: [contrato de configuração/isolamento](../email-reminders-external.md) e [preparação Brevo](../brevo-setup.md). A API restrita foi validada em sandbox, sem mensagem real. A fila distingue Mailpit/Brevo; credenciais e habilitação externas não são herdadas da configuração local. Scheduler e origem/IP de produção precisam de ensaio próprio. Para desligar, suspender o job e retirar a habilitação do servidor; um POST em curso pode terminar depois. Nunca tratar aceite da API como prova de recebimento.

Local: Mailpit captura e-mails sem envio externo. Hospedado: SMTP Brevo configurado pelo responsável. Templates locais não atualizam automaticamente os templates do Dashboard. A recuperação nova precisa de callbacks exatos com `?flow=recovery` e template no Auth hospedado, conforme [implantação](../deployment.md).

Supabase tem limites de Auth; a aplicação comunica limite de envio sem revelar detalhes SMTP. Rate limiting distribuído, proteção de cadastro/CAPTCHA e alertas de abuso não foram configurados nesta finalização. Cookies, senhas e links de confirmação não entram em logs ou traces de teste. Consultar logs hospedados somente com filtros mínimos e sem copiar credenciais para relatórios.

## Alterar calendário

Preservar versões antigas; acrescentar nova versão com fonte primária, âmbito, vigência, consulta, revisão e testes. Conferir atos por comarca/foro/sistema. Nunca retirar o aviso de demonstração apenas porque os testes passaram. [Workflow de calendário](../../.agents/skills/judicial-calendar/SKILL.md) e [fontes atuais](../legal/sources/sp-comarcas-2026.md).

## Promoção futura

O MVP civil desta finalização foi publicado em 20/10/2026, com CI aprovada e callbacks/template de recuperação configurados; [evidências e ensaios externos ainda pendentes](../testing/final-deployment.md). A [auditoria de 21/10](../scope-audit-2026-10-21.md) separa essa entrega do sistema completo ainda em desenvolvimento.

Com a integração GitHub/Vercel configurada, enviar commits pode disparar deployment; não tratar `git push` como mera cópia de segurança. Antes de nova publicação: revisar ambiente, callbacks/templates, dependências e pendências de operação; testar cadastro, convite, recuperação, Google e isolamento no destino. O CI remoto de uma nova versão só poderá ser afirmado depois de execução observada.
