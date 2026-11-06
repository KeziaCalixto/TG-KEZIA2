# Confirmação de agendamento — 24/10/2026

## Motivo e alteração

O responsável esperava receber um e-mail de confirmação imediatamente após agendar. A funcionalidade existente confirma no site e envia somente o lembrete no horário escolhido. A ausência do e-mail antes desse horário não reproduziu uma falha de envio: às 00h36 de 24/10 em São Paulo, o registro real permanecia pending para 09h, com zero tentativas e sem erro.

O histórico agora explica onde aparece a confirmação e quando o e-mail é enviado. A mensagem de sucesso informa que o envio está previsto para o horário escolhido; o registro pending identifica sua data como “Envio previsto”. Mantidos horário/fuso, consentimento desmarcado, foco no feedback e distinção entre aceite do provedor e recebimento. Não houve mudança em motor, API, fila, credenciais, migrations, cancelamento ou conteúdo de e-mail.

Aplicadas as regras do design system existente e a orientação de feedback de ação da skill UI/UX Pro Max (busca local action confirmation feedback, domínio ux). Ajustada somente a expectativa textual no teste E2E existente. Sem novo caso de negócio ou regra a implementar por TDD.

## Verificações reais

| Execução | Resultado |
| --- | --- |
| pnpm check, tentativa inicial | Tipos concluídos; lint permaneceu sem progresso e foi interrompido. A cadeia não foi declarada aprovada. |
| pnpm exec eslint src/components/calculation-reminders.tsx tests/e2e/reminders.spec.ts --max-warnings 0 --debug | Exit 0, sem diagnóstico de código. Importação da configuração e leitura dos arquivos tiveram espera; causa ambiental não foi atribuída sem evidência. |
| pnpm lint, nova execução completa | Exit 0, regras/configuração originais preservadas. |
| pnpm format:check | Exit 0 em todo o escopo definido no projeto. |
| pnpm test | Exit 0: 18 arquivos, 256 testes aprovados. |
| pnpm build | Exit 0: compilação, TypeScript e geração das páginas concluídos. |
| pnpm exec playwright test tests/e2e/reminders.spec.ts | Exit 0: oito cenários aprovados, desktop 1440px e celular 375px. Consentimento, aceite distinto de entrega, foco, cancelamento individual/todos, erro sem falso sucesso e link privado. Axe sem violações nos cenários que o executam; cenário de ativação/cancelamento sem overflow horizontal. |

Os E2E usam respostas controladas de API: comprovam comportamento da interface e não envio externo. [Captura com dados fictícios inspecionada](artifacts/reminder-schedule-copy-2026-10-24.png). A captura histórica regravada pelo helper foi restaurada; a nova evidência está em arquivo separado. Instrumentação temporária de importação ficou em tmp e foi removida; nenhum log de diagnóstico foi introduzido no produto. Não foi repetida a suíte SQL porque não houve mudança de persistência, permissões ou RPC.

## Pacote e próximos aceites

Pacote dos materiais em 8a90800a18257d137a3659e11810ab90f88299fd gerado com git archive em tmp/delivery/prazo-claro-2026-10-24-8a90800.zip: 252 arquivos, integridade ZIP e igualdade com git ls-tree aprovadas, sem caminhos de configuração privada/dependências/build. SHA-256 a6d38b1e685477623f3a623b61a3a2261bbef41bb97528c0818c01fa68583044; manifesto ao lado do ZIP. Não é dump nem backup do Supabase. Após o commit desta melhoria, repetir o procedimento para incluir o novo texto e sua evidência; o manifesto de cada pacote identifica o conteúdo exato.

O marco acima registra a verificação local. A melhoria foi depois publicada em 3e16db6, com CI completa e verificações reais aprovadas; [publicação de 24/10](release-2026-10-24.md). Recebimento do lembrete real e abertura de seu vínculo continuam pendentes para o horário salvo. [Estado hospedado e diagnóstico anterior](reminders-production.md), [aceite vigente](../entrega/aceite.md) e [procedimento de operação](../reminder-scheduler-operations.md).
