# Publicação da entrega — 20/10/2026

Publicação solicitada pelo responsável após a finalização local. Destino: projeto Vercel `tg-kezia2`, equipe `eduwillls-projects`, e Supabase `TG-KEZIA2` (`yjukuzgowqtkxvhozhbm`). Repositório privado `Eduwilll/TG-KEZIA2`, branch `master`.

## Versão e integração

- `git fetch origin` confirmou `0 4` em `origin/master...master`; árvore limpa antes do envio.
- `git push origin master`: exit 0, avanço de `b202109` a `ff9d3ccab18a94b10b92cd10f86dce5dc2e47178`. Inclui os quatro marcos de finalização registrados no changelog.
- Deployment `dpl_BXxaFVM19PjfGWJNnvv2ieexGZKz`: `READY`, `production`, source `git`, SHA `ff9d3ccab18a94b10b92cd10f86dce5dc2e47178`, sem erro de alias.
- Aliases confirmados pela Vercel: `tg-kezia2.vercel.app` e `tg-kezia2-eduwillls-projects.vercel.app`.
- [CI 39481501631](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/39481501631): `completed/success`, jobs `application` e `database` aprovados. Inclui check, audit, build, E2E, migrations e testes SQL locais no runner.
- Supabase remoto consultado: `ACTIVE_HEALTHY`. Nenhuma migration/schema alterada nesta publicação; o diff desta finalização não contém migrations novas.
- Build executado pela integração Git com configuração hospedada. `.env.local` e build local não foram enviados. Nenhuma chave privilegiada adicionada.

As evidências anteriores de 81 unitários, 29 E2E aprovados (um PDF duplicado omitido no mobile), 28 pgTAP e integrações locais reais estão em [final-delivery.md](final-delivery.md). O audit mantém a exceção específica de `braces` descrita na revisão de segurança; exit 0 não significa ausência de advisory upstream.

## Auth hospedado

Pelo dashboard autenticado do Supabase, preservados os dois callbacks existentes e adicionados exatamente:

- `https://tg-kezia2.vercel.app/auth/callback?flow=recovery`
- `https://tg-kezia2-eduwillls-projects.vercel.app/auth/callback?flow=recovery`

A listagem confirmou quatro URLs. Site URL existente e preservado: `https://tg-kezia2.vercel.app/auth/callback`. Não foram acrescentados curingas ou novas origens.

Em Emails → Reset password, aplicado o arquivo versionado `supabase/templates/recovery.html` e o assunto **Recupere sua senha no Prazo Claro**. Salvamento confirmado pelo botão desabilitado e prévia renderizada com botão/fallback `{{ .ConfirmationURL }}` e instrução de abrir no mesmo navegador. SMTP e Google não foram alterados. [Prévia salva](artifacts/recovery-template-hosted.png).

Não foi enviado e-mail externo nesta publicação nem alterada senha de conta real. O responsável deve solicitar a recuperação pelo site e abrir o e-mail no mesmo navegador, definir a nova senha e conferir login/recarga/logout. O ensaio local desse fluxo passou; isso não comprova sua entrega externa pelo Brevo.

## Smoke tests hospedados

Requisições HTTP reais sem sessão para `https://tg-kezia2.vercel.app`, sem dados processuais reais:

| Verificação | Resultado observado |
| --- | --- |
| `/`, `/ajuda`, `/privacidade`, `/entrar` | HTTP 200 |
| `/conta/recuperar-senha`, `/conta/definir-senha`, `/favicon.ico` | HTTP 200 |
| `/api/history` sem conta | HTTP 401, `Cache-Control: private, no-store` |
| Headers das páginas | `X-Content-Type-Options: nosniff` |
| Capital, publicação 06/10/2026, cinco dias | HTTP 200, `provisional`, vencimento 14/10/2026 |
| Santos, publicação 04/09/2026, um dia | HTTP 200, `provisional`, vencimento 09/09/2026 |
| Capital, mesma publicação e duração | HTTP 200, `provisional`, vencimento 08/09/2026 |
| Capital, publicação 18/12/2026, dois dias | HTTP 200, `incomplete`, `dueDate: null` |
| POST recovery com Origin externa e e-mail inválido | HTTP 403; nenhum e-mail solicitado |

Uma checagem inicial usou `/recuperar-senha` e recebeu 404; o endereço implementado é `/conta/recuperar-senha`, que respondeu 200. Não é falha do link da interface.

No navegador, observados os dez municípios no seletor, novos links Ajuda/Privacidade e título opcional. **Preencher um exemplo → Calcular prazo** retornou 14/10/2026 com nove datas, fundamentos e aviso de simulação/revisão pendente. [Captura do site publicado](artifacts/final-deployment.png).

## Limites e continuidade

Calendários continuam parciais de 2026 e com revisão jurídica pendente. A publicação não amplia o âmbito jurídico da aplicação. Recuperação externa, novo cadastro/convite com senha e isolamento entre contas hospedadas exigem ensaio próprio; login Google já tinha sido confirmado pelo responsável na publicação anterior. Avaliação humana, backups/restauração, retenção institucional e controles de abuso seguem no backlog.

Este registro e as atualizações de estado são um commit documental posterior à versão de aplicação acima. A publicação Git desse commit mantém o mesmo código de aplicação; o SHA/deployment podem ser consultados no histórico da Vercel e do GitHub.
