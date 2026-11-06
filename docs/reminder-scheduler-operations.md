# Operação do agendador de lembretes

Aplicável ao projeto Supabase `yjukuzgowqtkxvhozhbm` e ao site `https://tg-kezia2.vercel.app`. [Contrato externo](email-reminders-external.md), [ADR 0006](architecture/adr/0006-agendamento-com-assinatura-descartavel.md) e [evidências por ambiente](testing/reminder-scheduler.md). Instalar a migration não ativa envios.

## Preparação

1. Aprovar checks/CI e conferir versions das migrations. Aplicar as três migrations de lembretes preservando a inicial e os dados existentes; nunca executar reset no projeto hospedado.
2. Manter `REMINDERS_DELIVERY_ENABLED=false` durante a preparação. Configurar os campos do contrato externo somente no alvo production da Vercel, como segredos quando aplicável. Preview não recebe URL/chave do banco de produção nem credenciais de lembretes.
3. Armazenar o mesmo segredo aleatório dedicado, de pelo menos 32 caracteres, em `REMINDERS_SCHEDULER_SECRET` na Vercel e no Vault com nome `prazo_claro_scheduler_secret`. Usar campo privado/ferramenta autenticada, sem colar o valor em SQL salvo, terminal, documentação ou logs. Não trocar uma chave em operação sem suspender o job e coordenar novo deploy.
4. Como administrador postgres, executar `select reminder_private.prepare_scheduler();`. Conferir `active=false` em cron.job e `enabled=false` em reminder_private.scheduler_config. Só há um job `prazo-claro-reminders`, com frequência por minuto; prepará-lo novamente preserva o estado atual.

## Probe e ativação

Com o deploy de preparação pronto, executar como administrador:

```sql
select reminder_private.dispatch_tick(true);
```

O UUID devolvido identifica a tentativa. Aguardar a resposta assíncrona e coletar em outra transação:

```sql
select reminder_private.collect_scheduler_results();
select nonce, operation, created_at, used_at, http_status, completed_at,
       timed_out, summary
from reminder_private.scheduler_invocations
order by created_at desc limit 10;
```

Probe verifica assinatura/RPC e remetente ativo sem obter fila ou enviar mensagem. Na preparação, HTTP 200 com `probe_ok=true` e `delivery_enabled=false` é o resultado esperado. Não forjar `used_at`, status ou summary para passar o gate. Sem resposta, observar estado HTTP/timeout; sucesso SQL do Cron só confirma que a instrução executou.

Se o Brevo recusar a origem, a resposta autenticada pode incluir somente o IPv4 validado e código fixo. Conferir a tentativa nos IPs bloqueados do Brevo; liberar apenas a origem identificada. IP local não representa a Vercel, cujo egress pode variar; não presumir IP fixo ou desativar proteção global. Confirmar cotas/limites atuais antes do ensaio real. O resumo privado não copia IP, cabeçalhos ou corpo integral do provedor.

Depois de conferir o probe e as permissões, habilitar a entrega no alvo production com novo deploy, **ainda com job inativo**. Executar novo probe e coletar resultado. A ativação exige tentativa consumida, HTTP 200, provedor pronto e entrega habilitada nos últimos 15 minutos:

```sql
select reminder_private.set_scheduler_enabled(true);
select jobname, schedule, active from cron.job
where jobname='prazo-claro-reminders' and username='postgres';
```

O proprietário deve entrar no site, salvar uma simulação elegível, marcar o consentimento e escolher um horário futuro. Não antecipar relógio ou send_at de dados reais. Acompanhar execução/estado sem expor e-mail ou tokens. Somente o proprietário pode confirmar o recebimento; estado aceito significa aceite do provedor.

## Suspensão e diagnóstico

```sql
select reminder_private.set_scheduler_enabled(false);
```

Esse comando desativa job e configuração juntos. Retirar também a habilitação no servidor e publicar se necessário. Cancelar lembretes ativos pela conta quando aplicável. Uma requisição já em curso pode terminar; suspensão não recolhe mensagem aceita. Nunca repetir automaticamente uma tentativa incerta.

Cron chama o endpoint somente quando há trabalho externo elegível ou lease a verificar; a fila local não é promovida. Os metadados privados mantêm por sete dias apenas nonce, tempos, operação e status/contagens limitadas. Coleta ocorre no tick ou manualmente; com job suspenso, executar coleta administrativa para manter a retenção. Não consultar/publicar headers da fila pg_net: a plataforma permite leitura por papéis do banco e não oferece isolamento por projeto nessa fila. Ali transitam apenas assinaturas curtas de uso único, nunca credenciais duradouras.

Antes de religar após falha/pausa: conferir filas, tentativas incertas, cotas/origem, segredos/deploy atual e novo probe. Não enviar retroativamente compromissos que perderam a janela. Retenção institucional, alertas automáticos, restauração de backup e monitoramento contínuo permanecem aceites próprios.
