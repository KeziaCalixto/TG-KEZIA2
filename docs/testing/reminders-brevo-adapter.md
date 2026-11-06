# Adaptador Brevo — evidências de 23/10/2026

Contrato: [lembretes externos](../email-reminders-external.md). Dependências já verificadas: [sandbox real](brevo-preparation.md), commit `00991bf`, e [fila por modo](reminder-delivery-modes.md), commit `f141b4a`.

## Implementação e TDD

- Caso HTTP de listagem externa falhou porque a configuração era exclusivamente local; após configuração protegida e RPC por modo, passou. Caso de agendamento externo falhou por usar a RPC antiga; após seleção do servidor, passou.
- Caso de envio Brevo falhou porque o dispatcher só consultava Mailpit. Após adaptador HTTP, retornou aceite simulado com payload mínimo, UUID de idempotência e link canônico. Credenciais e transporte do Mailpit não são utilizados no ramo Brevo.
- Caso de tela local antiga ativando envio real falhou; o POST externo agora exige `externalEmailConsent:true`. Ausência desse campo no modo externo ou presença no local retorna 409 antes de consultar dados. A UI tem consentimento próprio inicialmente desmarcado e reinicia a escolha ao mudar o modo.
- Caso de `duplicate_parameter` falhou ao ser tratado como rejeição definitiva; agora fica incerto para conferir possível aceite anterior. Timeout, 5xx e confirmação ilegível também ficam incertos, sem reenvio automático. 400/429 explícitos são falha; remetente inativo bloqueia antes do POST.
- Testes recusam configuração incompleta, URL/projeto divergente e execução em preview/development. Somente configuração completa, ambiente de produção e habilitação explícita permitem Brevo. Nenhuma credencial desse adaptador foi instalada na Vercel nesta etapa.

`pnpm check` aprovou typecheck/lint/formatação e **245 testes em 18 arquivos**. Após limitar também a listagem local à RPC por modo e atualizar Ajuda/Privacidade, `pnpm typecheck` e `pnpm test` retornaram exit 0 novamente, com os mesmos 245 testes. As alterações finais de UI/API foram formatadas explicitamente. `pnpm build` final retornou exit 0, 22 rotas/páginas geradas. Uma tentativa de build anterior foi interrompida durante TypeScript para incorporar a correção da listagem antes da execução final.

## Navegador e integração

`pnpm test:e2e`: 64 cenários, **62 aprovados, um ignorado e uma falha** de foco na paginação desktop. O indicador recebia foco em `requestAnimationFrame` disparado antes de garantir a montagem da nova lista. O foco foi movido para um efeito após o commit da resposta atual, mantendo a intenção de navegação. A asserção existente capturou a falha; não foi relaxada nem substituída por atraso artificial.

Após a correção, `pnpm lint`, `pnpm format:check` e `pnpm build` retornaram exit 0. `pnpm exec playwright test tests/e2e/history-organization.spec.ts tests/e2e/reminders.spec.ts`: **16 cenários aprovados**, desktop/mobile, incluindo a paginação que havia falhado, consentimento externo, aceite distinto de entrega, cancelamento/foco e erros. Não se afirma nova execução integral dos outros arquivos após esse ajuste de foco.

[Captura desktop do consentimento](artifacts/reminder-external-consent-desktop.png) inspecionada: escolha desmarcada, ativação desabilitada antes da escolha, aviso de e-mail confirmado e estimativa original. Fixture fictícia com HTTP interceptado; isso não é prova de login/entrega externa. Axe sem violações nos cenários de lembretes cobertos. Artefatos históricos regravados pela suíte são restaurados, mantendo somente a nova captura desta etapa.

`pnpm start` iniciou o build final em `http://127.0.0.1:3000`. **`pnpm db:test:reminders` retornou exit 0**: opt-in real no navegador, opções originais, isolamento entre duas contas, cancelamento geral, nova geração, duas execuções simultâneas com apenas uma mensagem Mailpit, link privado, exclusão e logout. Segundo PASS confirmou remoção de usuários/cálculos/lembretes/mensagens fictícios. O ensaio antecipa somente `send_at` da fixture no banco local; não existe parâmetro de produção para forçar envio. Essa execução comprovou a regressão local após a nova migration e não enviou mensagens ao Brevo.

## Limites operacionais

Nenhuma migration remota, implantação Vercel, job Cron ou mensagem real foi criada neste marco. Consulta de extensões no Supabase hospedado identificou Vault 0.3.1 instalado; `pg_cron` e `pg_net` ainda não estão instalados. Scheduler permanece uma tarefa própria. A liberação do IP local não comprova nem configura o egress da Vercel.

Próxima sequência: instalar/verificar scheduler inativo, preparar credenciais exclusivas de produção e observação HTTP, conferir cotas atuais, publicar/applicar migrations com habilitação controlada e ensaiar um lembrete solicitado pelo proprietário. Recebimento deve ser confirmado por ele. Calendários parciais e revisão jurídica pendente continuam identificados; o motor não foi alterado.
