# Primeiro deploy acadêmico — 19/10/2026

Destino autorizado: acesso público pelo link para testes com a amiga e a banca. Repositório privado `Eduwilll/TG-KEZIA2`, branch `master`. O ambiente continua demonstrativo, sem revisão jurídica concluída.

## Preparação executada

- Supabase `TG-KEZIA2` (`yjukuzgowqtkxvhozhbm`, região `us-east-1`): migration inicial aplicada pelo plugin; quatro tabelas com RLS e advisors de segurança sem apontamentos.
- O provedor registrou a migration como `20261020001602`. O arquivo local foi renomeado da versão `20261019021156`, sem alterar o SQL (SHA-256 `A8DE1CED42B5F8B2B169AE949BAA8C19A821FDAE83ECB4CECA24B4EF24DC7091`). O histórico remoto foi preservado; somente o histórico local foi alinhado com `supabase migration repair --local`. `supabase migration list --local` confirmou ambas as colunas em `20261020001602`.
- Vercel: projeto `tg-kezia2`, equipe `eduwilll's projects`, Node 22.x, fonte privada e acesso público ao aplicativo. Variáveis públicas Supabase do destino remoto e Corepack configurados; nenhuma chave privilegiada exigida. O arquivo `.env.local` continua apontando ao ambiente local.
- CI passou a incluir pushes em `master`; intervalo Node limitado à versão 22.
- Usuário informou SMTP Brevo salvo no painel Supabase. Isso ainda não comprova entrega real.

## Verificações executadas nesta preparação

| Comando | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | Aprovado, lockfile preservado. |
| `pnpm format:check` e `git diff --check` | Aprovados. |
| `pnpm test` | 55 testes aprovados. |
| `pnpm db:test` | 28 testes pgTAP aprovados após alinhamento local. |

## Validação remota pendente

Entrega externa pelo Brevo, cadastro/convite completos com cookies após confirmação e isolamento entre duas contas no ambiente hospedado ainda dependem de execução real. O usuário escolheu fazer o cadastro e confirmar o e-mail pessoalmente. Nenhum envio externo foi automatizado. As evidências locais anteriores permanecem em [invitation-login.md](invitation-login.md) e [local-supabase.md](local-supabase.md).

As primeiras tentativas reais de cadastro e convite falharam no SMTP Brevo com `525 5.7.1 Unauthorized IP address`. [Diagnóstico e próximos passos](hosted-smtp-diagnosis.md). Entrega e autenticação hospedada permanecem pendentes até novo teste após ajuste no Brevo.

## Interrupção solicitada pelo usuário

O usuário cancelou a confirmação GPG e pediu para deixar para mais tarde. O commit não foi criado; `HEAD` e `origin/master` permanecem em `f4cfacd`. A tentativa de push retornou `Everything up-to-date`. As alterações continuam preparadas localmente. Não foi iniciado deployment nem alterado Site URL, callbacks ou templates hospedados. O painel Supabase foi acessado, mas o template de convite ainda exibia o conteúdo padrão. O GPG também informou chave expirada; verificar a configuração de assinatura antes de retomar o commit.

## Retomada em 19/10/2026

Usuário solicitou a retomada e optou por corrigir a chave GPG e manter a assinatura. Os templates de convite e confirmação foram aplicados no Dashboard remoto com os assuntos em pt-BR e o HTML do repositório, preservando `ConfirmationURL`. Prévia visual conferida e gravação confirmada pelo painel. Evidências: [convite](artifacts/hosted-invite-template.png) e [confirmação](artifacts/hosted-confirmation-template.png). Nova consulta aos advisors remotos retornou zero apontamentos. Nenhum e-mail externo de teste foi enviado nesta etapa.

## Publicação concluída

- Commit assinado `acbf37e0566ca202325ae60c17454b92ccd747e5`, assinatura válida (`git log` indicou `G`), enviado para `origin/master`.
- Deployment Vercel `dpl_F3D2EYtVrH8KjkoQSJvEYMWUWyXj`, destino `production` da plataforma, estado `READY`, sem erro de alias. Trata-se de demonstração acadêmica pública, não de aprovação jurídica para operação.
- URL estável configurada: **https://tg-kezia2-eduwillls-projects.vercel.app**. HTTP 200 sem autenticação Vercel. A plataforma também atribuiu `tg-kezia2.vercel.app`; o endereço de autenticação adotado nesta entrega é o primeiro.
- Build remoto clonou o commit exato, reconheceu Corepack com pnpm 11.0.8, instalou com lockfile congelado e concluiu em `/vercel/output`. Não foi usado `.env.local` nem chave administrativa na aplicação.
- [CI GitHub 39351648988](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/39351648988): `completed/success`, jobs `application` e `database` aprovados, incluindo tipos, lint, testes unitários, auditoria com a exceção documentada de braces, build, E2E, reset/pgTAP/lint do banco isolado do runner.
- Supabase Site URL passou de localhost para a URL HTTPS acima. Allowlist contém somente o callback exato `https://tg-kezia2-eduwillls-projects.vercel.app/auth/callback`, sem curingas. [Evidência do painel](artifacts/hosted-auth-urls.png). Credenciais SMTP preservadas.

## Testes hospedados executados

| Verificação | Resultado real |
| --- | --- |
| Página inicial pública | HTTP 200, título Prazo Claro e avisos acadêmicos visíveis. |
| `GET /api/auth/session` sem conta | 200, `configured: true`, sem usuário, `private, no-store`. |
| `GET /api/history` sem conta | 401, `private, no-store`. |
| `POST /api/auth/signup`, `{}` e Origin HTTPS correto | 400 de validação; origem aceita, sem envio de e-mail. |
| Mesmo POST com Origin externo | 403. |
| `POST /api/auth/password` sem sessão | 401, `private, no-store`. |
| `/auth/callback` sem código | 307 para a mesma origem HTTPS com `?auth=error`; sem retorno a localhost. |
| `POST /api/calculate`, publicação 06/10/2026, 5 dias | 200, `provisional`, vencimento simulado 14/10/2026, `no-store`. |
| Exemplo pela interface hospedada | Mesmo resultado, memória com 9 datas e identificação de simulação/calendário parcial/revisão pendente. [Captura](artifacts/hosted-calculation.png). |

Os testes sem conta não comprovam o fluxo autenticado hospedado nem substituem a revisão jurídica. O banco remoto contém as quatro tabelas com RLS e as políticas de leitura/inserção/exclusão do proprietário; não foram criadas fixtures remotas de usuários ou cálculos nesta etapa.
