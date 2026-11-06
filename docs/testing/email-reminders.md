# Lembretes opcionais — evidências locais

Etapa de **23/10/2026**, America/Sao_Paulo. Contrato/decisão registrados em `0551e31`, fila/migration em `2777d21` e interface/envio/evidências em `eea7ca6`; [escopo e critérios](../email-reminders.md). Primeira fatia concluída e verificada localmente, inclusive regressão geral. Nenhum serviço de e-mail externo, cron remoto, deploy ou dado real utilizado.

## Persistência

| Comando / ciclo | Resultado observado |
| --- | --- |
| `pnpm db:test`, caso de agendamento antes da implementação | Exit 1: 28 testes anteriores aprovados e um falho por função inexistente. |
| Após tabela/RPC de agendamento | Exit 0: 29 testes SQL. |
| Novos casos de horário/propriedade/cancelamento | Exit 1: oito casos novos aprovados, execução interrompida por função de cancelamento ainda inexistente. |
| Após implementar cancelamento | Exit 0: 37 testes SQL. |
| Caso de claim antes da implementação | Exit 1: função inexistente; nove casos novos aprovados e um falho. |
| Após claim/preparação/registro do resultado | Exit 0: 38 testes SQL. |
| Regressões de permissões, cancelamento em curso, lease e janela | Exit 0: 65 testes SQL. |
| Regresso de tentativas, confirmação atual do destinatário, vencimento passado e incompleto | Exit 0: **77 testes SQL em três arquivos**. Inclui os 28 anteriores. |
| `supabase db advisors --local --type security --level warn --fail-on warn` | Exit 0: nenhum achado de segurança. |
| `supabase db advisors --local --level warn --fail-on warn` | Três avisos de desempenho nas políticas antigas de `deadline_calculations`; o aviso da política nova foi corrigido envolvendo `auth.jwt()` inteiro em subconsulta. Sem ampliar acesso. Avisos antigos permanecem como pendência, não falha de isolamento. |
| `supabase db pull deadline_reminders --local --schema 'public,reminder_private' --yes` | Migration `20261023172741_deadline_reminders.sql` gerada e registrada no banco **local**. A CLI usa a palavra “remote” no resultado genérico mesmo com `--local`; o destino deste comando foi a stack local. |
| `supabase migration list --local` | Migration inicial e nova migration com versões locais/aplicadas coincidentes. |
| `supabase db diff --local --schema 'public,reminder_private'` | Exit 0: ambas migrations reproduzidas no banco de comparação descartável, nenhuma diferença encontrada. Banco em uso não foi resetado. |

Falhas de ferramenta corrigidas: `db query --local --file` recusou múltiplas instruções em prepared statement; transações locais aplicadas pelo `psql` do contêiner. Duas comparações inicialmente não detectaram objetos porque o PowerShell enviou a lista não citada como um único nome `public reminder_private`. Com argumento citado, a CLI reconheceu os dois schemas e gerou/reproduziu a migration. Não foi necessário trocar SDK, afrouxar permissões ou acessar o projeto hospedado.

Casos SQL observam 04/01/2030 12:00Z para três dias antes de 07/01 às 09h SP; 06/01/2030 12:00Z para um dia antes (domingo); e 07/01/2030 21:00Z para aviso às 18h. Também verificam duas contas/anon/identidade anônima, proibição de escrita direta, funções exclusivas do servidor, versões originais, uma geração ativa, claim repetido, cancelamento antes da preparação, aceite concorrente preservado, lease incerto sem reenvio, perda de janela, espera de cinco minutos e terceira tentativa terminal. Fixtures SQL são transacionais e revertidas.

## Aplicação e envio local

Primeiros casos HTTP foram executados antes da existência dos novos módulos: suites falharam na resolução do import. Após implementação inicial, proteção de origem e dispatcher desativado passaram. Regressões de API: **20 testes aprovados** para habilitação local, URL remota recusada, campos arbitrários, identidade/confirmação, memória inválida/incompleta, instante igual ao agora, agendamento pelo original, erros sem conteúdo sensível, cancelamento e limites de consulta.

Teste adicional de retransmissão externa no Mailpit: primeiro **um falho e dez aprovados**, porque o código ainda aceitava envio com relay ativo; após conferir `MessageRelay.Enabled:false` antes do POST, **11 aprovados**. Casos também cobrem segredo ausente, cancelamento antes de preparar, falha pré-envio, timeout após iniciar POST sem segunda tentativa, 4xx/5xx, confirmação ilegível e falha ao persistir aceite. Mocks substituem apenas Auth/transportes externos e relógio; não comprovam políticas do banco.

| Comando | Resultado observado |
| --- | --- |
| `pnpm check`, após API/controles iniciais | Exit 0: 223 unitários em 18 arquivos, tipos, lint e Prettier. |
| `pnpm check`, após teste de ID/proprietário no link | Exit 0: **224 unitários em 18 arquivos**, tipos, lint e Prettier. |
| `pnpm check`, após ajuda/privacidade finais | Exit 0: mesmos 224 unitários e demais checks. |
| `pnpm build`, antes do fluxo real e após ajuda/privacidade | Exit 0 nas duas execuções: 22 rotas na geração, histórico dinâmico e endpoints novos compilados. |
| `pnpm test:e2e tests/e2e/reminders.spec.ts --workers=1` | Exit 0: **seis aprovados**, desktop/mobile, 44,7 s. |
| `pnpm db:test:reminders` | Exit 0: opt-in real, horário original, duas contas, cancelamento de todos, nova geração, dois dispatchers concorrentes com um único aceite/mensagem, link privado, exclusão/logout e limpeza. |
| `pnpm test:e2e --workers=1`, build final | Exit 0: **61 aprovados e um omitido**, 4,3 min; omitido: PDF histórico duplicado no mobile, como nos marcos anteriores. |
| `pnpm db:test:app`, build final | Exit 0: cadastro/Mailpit/PKCE/sessão, três perfis/atos, histórico/paginação, duas contas, exclusão/logout e limpeza. |
| `node tmp/check-delivery-links.mjs`, `git diff --check`, `git check-ignore .env.local` | 108 links locais em nove materiais, nenhum ausente; sem erro de whitespace; `.env.local` confirmado ignorado. |
| Runner de execução única, segredo fictício inválido | HTTP 401 e exit 1 esperado, sem processar mensagens; erro genérico. |
| `pnpm reminders:dispatch`, configuração local correta | Exit 0: lote vazio, todas as contagens zero após a limpeza. Prettier e ESLint do runner aprovados após ajustar exit code de falhas. |

Os seis cenários novos verificam checkbox inicialmente desmarcado/botão desabilitado, horários, contrato POST, feedback/foco, cancelamento individual, confirmação/cancelamento de todos, erro sem falso sucesso e link abrindo a memória original. Axe sem violações nos estados cobertos e ausência de rolagem horizontal no percurso ensaiado. Os testes antigos de histórico isolam o recurso indisponível em seus mocks; mocks de conta não são sessões reais para consultar lembretes.

## Conferência real e limites

O helper usa duas contas confirmadas descartáveis. Ativação pela UI para memória trabalhista de 10/11/2027 preservou data e horário 09/11/2027 às 09h SP (12:00Z); outra conta não leu, agendou ou cancelou o lembrete. Payload com destinatário arbitrário recebeu 400. Cancelar todos atingiu dois cálculos, e reativar criou outro UUID, sem apagar a tentativa cancelada.

Para exercitar envio imediato, o helper antecipou **somente `send_at` da linha fictícia da nova geração**, pelo psql local; memória, vencimento, versões e privilégios não mudaram. Não existe override de relógio na API de produto. A captura do histórico mostra essa hora de execução artificial; não é um agendamento de caso real. Duas chamadas HTTP simultâneas ao dispatcher somaram um claim e um aceite. Terceira chamada não enviou; Mailpit continha exatamente uma mensagem para o destinatário fictício.

[E-mail real renderizado pelo Mailpit](artifacts/reminder-email-local.png) e [retorno à memória privada](artifacts/reminder-history-local.png), ambos inspecionados: conteúdo legível, botão/link, aviso de simulação e estado de aceite, sem corte/sobreposição. E-mail não contém título livre nem credencial de sessão. O link abriu a memória original com a conta proprietária; outra conta recebeu lista vazia e requisição anônima recebeu 401. Excluir cálculo com nova geração pendente removeu os registros e não gerou envio; contas, cálculos, lembretes e mensagens do teste foram removidos.

Mailpit real é somente caixa local. Não houve envio SMTP de aplicação pelo Brevo, entrega externa, agendamento remoto, avaliação com participantes, leitor de tela integral ou revisão jurídica. Watcher local precisa permanecer ativo; dados de tentativa não expiram automaticamente enquanto o cálculo existir. Estado aceito não é comprovação de entrega. Janela de uma hora e tratamento de incerteza são limites deliberados, conforme ADR 0005. Evidências anteriores de calculadora/PDF/histórico são preservadas após os testes.
