# Agendamento hospedado com assinatura descartável

Estado: aceito para implementação incremental em 23/10/2026; instalação e ativação exigem evidências próprias.

## Contexto

Os lembretes precisam de execução por minuto e mantêm autorização, fila e envio no Next.js. O plano gratuito da Vercel limita Cron a uma execução diária por job, com precisão de até uma hora. Supabase Cron é a alternativa proposta, mas a documentação atual informa que papéis com acesso ao banco conseguem ler os cabeçalhos na fila do pg_net; revogar grants/RLS nessa fila não é um controle suportado por projeto. Ler a chave do Vault e colocá-la em Authorization exporia uma credencial permanente enquanto a requisição aguarda envio.

## Decisão

Usar pg_cron e pg_net, com chave de assinatura dedicada guardada no Vault e na configuração privada de produção do app. A chave nunca integra o comando Cron, os cabeçalhos ou a resposta HTTP. Cada chamada carrega operação, timestamp UTC em segundos, UUID aleatório e HMAC-SHA256. Formato canônico: seis linhas `POST`, `/api/internal/reminders/dispatch`, `brevo`, operação, timestamp e nonce, separadas por LF, sem LF final.

Operações: `dispatch` processa somente lembretes externos elegíveis; `probe` verifica autenticação/configuração/remetente sem obter fila ou enviar mensagem. Alterar operação invalida a assinatura. Validade máxima de dois minutos, comparação constante e consumo transacional único de nonce por RPC exclusiva de serviço antes de qualquer processamento. Tabela privada registra apenas dados operacionais e resumo de contagens/status, sem destinatário, mensagem, segredo ou assinatura.

Instalação cria schema/funções e permite preparar job **inativo**. Ativação é uma ação operacional explícita, após probe hospedado e verificação do ambiente. Sem trabalho pendente o tick evita chamada HTTP. Sem segredo/assinatura válidos não processa. Execuções em curso e leases existentes continuam protegidas pelas regras da fila. Resultado SQL do Cron não significa resultado HTTP nem entrega do e-mail.

## Consequências

Há mais código e uma RPC de consumo para evitar que uma credencial duradoura passe pela fila legível. Um leitor da fila ainda pode tentar antecipar a mesma operação durante a curta validade; o nonce permite no máximo um processamento e não concede acesso a destinatários, parâmetros arbitrários ou reenvio de um lembrete aceito. Administradores do banco/Vault e portadores da chave privilegiada continuam confiáveis; esta decisão não elimina seus privilégios.

Reter metadados operacionais por sete dias e coletar status HTTP/contagens sem copiar corpos/headers do provedor. Respostas pg_net têm retenção da plataforma, separada da tabela privada. Não alterar grants de pg_net para alegar isolamento que a plataforma não suporta. Limites/IPs/cotas e recebimento real dependem do ensaio de produção.

## Fontes

[Limitação de cabeçalhos pg_net](https://supabase.com/docs/guides/troubleshooting/database-roles-can-read-request-headers-queued-by-pg_net-ad6357), [API/retorno assíncrono pg_net](https://supabase.com/docs/guides/database/extensions/pg_net), [instalação Cron](https://supabase.com/docs/guides/cron/install), [Vault e agendamento](https://supabase.com/docs/guides/functions/schedule-functions), [limites Cron Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing).

Testes nas fronteiras já adotadas: pgTAP para desativação/permissões/consumo/isolamento, Route Handler para assinatura/operação/replay/probe e integração real controlada. Preservar a compatibilidade do dispatcher local.
