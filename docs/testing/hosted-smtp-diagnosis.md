# Falha de envio SMTP hospedado — 19/10/2026

Usuário relatou cadastro no site com HTTP 400, histórico sem sessão com HTTP 401 e convite pelo Dashboard com `Error sending invite email`. Também relatou um recurso 404 sem informar o caminho.

## Evidência observada

Consulta de leitura pelo plugin Supabase à fonte `auth_logs`, filtrada por mensagens de e-mail/SMTP, retornou a mesma falha em duas operações reais do usuário:

| Horário America/Sao_Paulo | Operação Auth | Resultado interno |
| --- | --- | --- |
| 19/10/2026 22:20:08 | `POST /signup` | 500, `unexpected_failure`, SMTP `525 "5.7.1 Unauthorized IP address"`. |
| 19/10/2026 22:20:47 | `POST /invite` | 500, `unexpected_failure`, mesmo erro SMTP. |

O endpoint do aplicativo converte falha do provedor em resposta genérica 400, sem revelar o erro interno ao visitante. O 401 de histórico sem conta corresponde à autorização esperada. O 404 permanece sem identificação; não foi atribuído a favicon ou outro arquivo por suposição.

Não houve novo envio de e-mail automatizado: foram usadas as tentativas reais já registradas. Logs brutos, e-mails, identificadores de usuários e credenciais não foram gravados neste documento.

## Diagnóstico e próximo teste

O código 525 observado corresponde ao bloqueio de IP desconhecido para chaves SMTP no Brevo, conforme [documentação oficial de diagnóstico](https://help.brevo.com/hc/en-us/articles/115000188150-Troubleshooting-Issues-with-Brevo-SMTP). Conferir no Brevo a lista de IPs não autorizados e correlacionar com a chave SMTP e os horários acima antes de autorizar o endereço de saída legítimo. A [documentação de IPs autorizados](https://help.brevo.com/hc/en-us/articles/5740111683858-Authorize-and-block-IP-addresses-for-API-and-SMTP-security) explica que a lista é compartilhada por API e SMTP.

O campo `remote_addr` dos logs Auth identifica o cliente da requisição HTTP; não é evidência do IP de saída SMTP do Supabase. Não usar esse campo nem o IP do computador do usuário para preencher a allowlist sem confirmação no Brevo. Nenhuma proteção de IP foi desativada e nenhuma configuração SMTP foi alterada neste diagnóstico.

Após corrigir a autorização no Brevo, o usuário deve repetir uma tentativa e verificar recebimento, aceitação do link e sessão conectada. Reconsultar os logs dessa nova tentativa somente após ela ocorrer. Ainda não há evidência de correção ou de entrega externa bem-sucedida.

## Nova tentativa e causa restante

Usuário informou um IP bloqueado no Brevo e, depois, confirmou recebimento do convite. A consulta seguinte aos logs, limitada às operações de Auth, confirmou:

| Horário America/Sao_Paulo | Operação | Resultado |
| --- | --- | --- |
| 19/10/2026 22:27:02 | `/invite` | 200, sem erro SMTP. Usuário confirmou envio bem-sucedido. |
| 19/10/2026 22:27:48 | `/signup` | 429, `over_email_send_rate_limit`; provedor pediu aguardar mais 13 segundos. O identificador de usuário corresponde ao convite anterior. |
| 19/10/2026 22:27:57 | `/token`, senha | 400, `invalid_credentials`; aplicativo respondeu 401 no endpoint de login. |

O envio de convite foi recuperado, mas isso ainda não comprova aceitação do convite, definição de senha, cadastro independente ou sessão hospedada. O fluxo convidado deve continuar pelo link recebido e pela definição de senha; o formulário de cadastro não é necessário para concluir esse mesmo convite.

O usuário identificou o 404 como `/favicon.ico`. Foi adicionado favicon ICO e ícone SVG com a identidade do aplicativo. A requisição bloqueada ao domínio Kaspersky pertence ao software que injetou `main.js?attr=...` no navegador; os logs Auth fornecem causas próprias para as falhas observadas. Nenhuma proteção do navegador/antivírus foi desativada.

## Correções de recuperação e rastreabilidade

- Cadastro preserva o status 429 do provedor e apresenta orientação genérica de espera/convite, sem expor mensagem interna ou existência de conta.
- Formulário orienta aceitar o convite e definir senha antes do login.
- Allowlist remota passou a conter os callbacks exatos das duas URLs atribuídas à aplicação: a URL longa original e `https://tg-kezia2.vercel.app/auth/callback`. Isso preserva o retorno ao navegador/origem que iniciou o cadastro; Site URL continua na URL longa, sem curingas.
- Teste de regressão do handler de cadastro falhou antes da correção (`expected 400 to be 429`); após a alteração, os três casos passaram: limite, erro SMTP genérico e callback HTTPS com resposta sem enumeração de conta. `pnpm test`: 58 aprovados; `pnpm typecheck`, `pnpm lint`, `pnpm format:check` e `pnpm build` aprovados.
- Aplicação local reiniciada com o novo build. Formulário conferido nos modos Entrar/Criar conta, com orientações de convite visíveis. [Captura local](artifacts/signup-guidance-local.png).
- Usuário confirmou que ainda não havia aceitado o convite/definido senha e decidiu concluir esses passos. Portanto, não há evidência de defeito novo na validação de senha ou de sucesso de sessão hospedada nesta tentativa.

## Verificação da correção publicada

Commit assinado `ed5838abd7a1653d20358a4594f89bd05d1e9180`, enviado a `origin/master`. A integração Git iniciou automaticamente o deployment `dpl_2BiZ15YUYDnNPJFQGBqUQqRVNdz6`, confirmado `READY` com o SHA correto e aliases curto/longo atribuídos.

Nos dois domínios públicos, `/favicon.ico` respondeu 200 com 7.843 bytes e tipo ICO; `/api/auth/session` respondeu 200 e `configured: true`. O cadastro com corpo vazio e Origin de cada domínio respondeu 400 de validação, sem enviar e-mails. A tela hospedada na URL curta exibiu a orientação de convite no login e no cadastro; [captura](artifacts/signup-guidance-hosted.png). Os dois callbacks exatos foram conferidos no painel Supabase, sem curingas.

[CI desta correção](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/39354080978): `completed/success`, jobs de aplicação (incluindo E2E) e banco aprovados. Isso não comprova cadastro externo independente nem aceitação do convite pelo usuário, que seguem aguardando seu teste.
