# Lembretes externos — contrato incremental de 23/10/2026

Continuação autorizada pelo responsável após a primeira fatia local. Sandbox Brevo real aprovado em `00991bf`; isso não comprova entrega. Este contrato preserva [a fila local](email-reminders.md) e o ADR 0005. Motor, regras, calendários e snapshots originais não mudam.

## Isolamento e configuração

- Cada lembrete guarda `delivery_mode`, limitado a `local` ou `brevo`. Registros anteriores permanecem `local`; migrations não promovem a fila nem enviam mensagens.
- Agendamento e claim externos usam RPCs com nomes próprios e parâmetro de modo explícito. Chamadas antigas de agendamento/claim continuam exclusivamente locais. Modos inválidos falham; não existe fallback para outro provedor.
- Listagem da aplicação limita o modo corrente e mantém proprietário/RLS. O cancelamento geral continua abrangendo todos os lembretes ativos da própria conta. Um cálculo continua com no máximo uma geração ativa, independentemente do modo.
- O servidor escolhe o modo; o navegador não fornece destino, modo, e-mail ou credencial. Brevo exige habilitação explícita, chave privilegiada apenas no servidor, chave da API, remetente e segredo de dispatcher. Preview não pode agendar/disparar em produção.
- O POST externo acrescenta `externalEmailConsent:true`, emitido somente após marcar a escolha de envio ao e-mail confirmado. Esse campo confirma a ciência do destino; não escolhe o modo. Ausência desse consentimento em Brevo, ou sua presença em modo local, produz 409 antes de consultar dados. Troca de modo na interface reinicia a escolha desmarcada.
- Primeira configuração externa: somente ambiente Vercel `production`, origem `https://tg-kezia2.vercel.app`, Supabase `https://yjukuzgowqtkxvhozhbm.supabase.co` e `REMINDERS_DELIVERY_ENABLED=true`. Configuração ausente/incorreta desabilita o recurso. Local continua restrito a loopback e Mailpit sem relay.

## Envio e execução hospedada

Reutilizar o dispatcher Next.js com adaptador HTTP Brevo. Conferir remetente ativo antes de preparar a tentativa e revalidar proprietário/e-mail confirmado no banco imediatamente antes do POST. Conteúdo mínimo e avisos acadêmicos preservados; UI distingue caixa local de envio real solicitado.

Aceite exige HTTP 201 e `messageId` válido. Rejeição explícita 4xx é falha; timeout/5xx/confirmação inválida após começar o POST permanecem incertos, sem repetição automática. Falha anterior ao envio usa a política limitada existente. Idempotência do Brevo é apenas proteção adicional com janela limitada, sem promessa de entrega única permanente. Sandbox é ferramenta separada e nunca consome/encerra registros da fila.

O adaptador usa `headers.idempotencyKey` com o UUID da geração. A documentação do Brevo informa TTL de 30 minutos; resposta `duplicate_parameter` fica incerta para conferência, pois uma requisição anterior pode ter sido aceita. HTTP 429 é rejeição explícita nesta fatia, sem ciclo automático de novas tentativas. O dispatcher permite até 120 segundos para acomodar os limites por chamada de um lote de cinco; chamadas do scheduler precisam considerar esse limite e a possibilidade de processamento ainda em curso.

## Configuração prevista de produção

Aplicar primeiro as migrations versionadas e verificar permissões. Depois configurar somente no alvo **production** da Vercel, sem copiar o conjunto local:

```dotenv
REMINDERS_MODE=brevo
REMINDERS_DELIVERY_ENABLED=true
REMINDERS_APP_URL=https://tg-kezia2.vercel.app
REMINDERS_SUPABASE_SECRET_KEY=
REMINDERS_DISPATCH_SECRET=
REMINDERS_SCHEDULER_SECRET=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=Prazo Claro
```

Os campos vazios exigem credenciais do ambiente correto; o segredo do dispatcher deve ser aleatório, com pelo menos 32 caracteres. URL/chave publicável do Supabase hospedado são as já utilizadas pela aplicação. Usar armazenamento de segredos, nunca inserir valores na documentação, em argumento de comando ou em `NEXT_PUBLIC_`. O arquivo `.env.reminders.external.local` serve para a preparação privada; o app local não o carrega automaticamente.

Manter `REMINDERS_DELIVERY_ENABLED` ausente/false durante preparação e publicar configuração habilitada apenas quando fila, scheduler, limites e diagnóstico hospedados estiverem prontos. O IP autorizado no ensaio local não autoriza automaticamente a origem da Vercel; conferir o egress real no Brevo e preservar o controle de outros IPs. Nesta etapa não foi assumido IP fixo nem configuração paga.

Para suspender envio, desativar o job e retirar a habilitação no servidor, com nova implantação se necessária. Cancelar lembretes ativos previamente quando possível; não recolhe um POST já em curso. Religar não deve promover registros locais nem enviar retrospectivamente os que perderam a janela.

O agendador usa Supabase Cron + pg_net com **assinatura temporária e nonce de consumo único**. O segredo dedicado fica no Vault e no servidor, sem passar pelos cabeçalhos ou pelo comando Cron. A documentação atual do pg_net informa que seus cabeçalhos são legíveis por papéis com acesso ao banco; Vault sozinho não protege uma chave permanente copiada para essa fila. [Decisão e formato do protocolo](architecture/adr/0006-agendamento-com-assinatura-descartavel.md).

`prepare_scheduler()` instala o job inativo. `dispatch_tick(true)` emite probe assinado mesmo com entrega desligada, sem claim/envio; retorno inclui prontidão do provedor e se a entrega está habilitada. `set_scheduler_enabled(true)` exige probe autenticado, recente e com entrega habilitada; `false` suspende job/configuração. Resultados HTTP e contagens mínimas ficam em tabela privada por sete dias, separados do histórico processual e dos logs pg_net/Cron. A implantação exige cotas atuais e observação do HTTP; sucesso SQL do Cron não comprova envio. Cron da Vercel Hobby não atende consulta por minuto. Não criar job ativo antes de validar banco/app/configuração.

## Aceites e evidências

Fronteiras de teste já adotadas: SQL/pgTAP para propriedade/modo/transições, Route Handlers para configuração/HTTP/erros, navegador para consentimento/estado e integração local real para regressão. Mocks do Brevo não comprovam entrega. Caso → teste falho → implementação → regressão; registrar resultados em `docs/testing/`.

Casos obrigatórios: legado local; claim Brevo não obtém/muda registro local (inclusive lease/janela); claim antigo não obtém Brevo; agendamento/modo sob proprietário confirmado; listagem sem token/e-mail e isolada; configuração de preview/incompleta/URL divergente bloqueada; consentimento explícito; sucesso/rejeição/timeout/limite do provedor; cancelamento e link privado. Ensaio real só com lembrete solicitado pelo proprietário e conferência do recebimento por ele.

Fontes primárias consultadas: [funções Postgres e permissões](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Cron](https://supabase.com/docs/guides/cron), [pg_net/Vault](https://supabase.com/docs/guides/functions/schedule-functions), [limites Cron Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing), [sandbox Brevo](https://developers.brevo.com/docs/using-sandbox-mode), [remetentes](https://developers.brevo.com/reference/get-senders) e [idempotência limitada](https://developers.brevo.com/docs/heterogenous-versions-batch-emails).
