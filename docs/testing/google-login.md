# Login com Google — preparação e retomada em 20/10/2026

Escopo: login Google pelo Supabase Auth com PKCE e sessão SSR. Não altera regras processuais, schema, RLS ou papéis. Credenciais OAuth ficam no provedor hospedado; não foram solicitadas no chat nem adicionadas ao repositório.

## Evidências locais

| Comando/verificação | Resultado real |
| --- | --- |
| `pnpm exec vitest run tests/google-auth.test.ts` | 8 testes aprovados: mesma origem, provedor/destino fixos, falhas seguras e callback PKCE. |
| `pnpm test` | 66 testes aprovados, incluindo regressões de convite, senha e cálculo. |
| `pnpm typecheck` | Aprovado. |
| `pnpm format:check` | Aprovado. |
| `pnpm build` | Aprovado; `/api/auth/google` incluído como rota dinâmica. |
| Lint direcionado e `pnpm lint` completo | Aprovados; execução completa da retomada retornou exit 0. Carregamento da configuração no teste direcionado levou aproximadamente 74 segundos. Duas tentativas locais anteriores foram interrompidas durante o carregamento, sem resultado conclusivo. |
| `POST http://127.0.0.1:3001/api/auth/google`, Origin local, sem seguir redirecionamento | 303 para `/auth/v1/authorize` do Supabase local, provedor `google`, callback na mesma origem, desafio PKCE presente com método `s256`, cookie verificador presente e `private, no-store`. Valores de cookies/desafios não foram gravados. |
| Mesmo POST com Origin externo | 403. |
| Interface local | Botão Google separado do formulário de senha; e-mail/convite preservados. [Captura](artifacts/google-login-local.png). |
| Callback com cancelamento sintético | Retorno fixo `/entrar?auth=callback-error`, mensagem genérica com `role=alert`, sem refletir parâmetros do provedor. |

O build foi conferido em servidor temporário na porta 3001, preservando o servidor local principal e `.env.local`. Não foi feito login Google real contra a stack local. O ícone Google foi obtido do [recurso oficial](https://developers.google.com/static/identity/images/g-logo.png), sem carregamento de script Google na página.

## Configuração externa e pendências

O usuário escolheu configurar em seu próprio navegador e informou que salvou Client ID/Client Secret e habilitou Google no Supabase. [Guia com as duas camadas de callbacks](../google-login.md). Essa confirmação ainda não substitui teste real de consentimento, retorno, sessão verificada, recarga, histórico e logout.

Não foram coletadas senhas Google, cookies de conta, Client Secret ou códigos OAuth em capturas/logs do teste.

## Publicação e verificações hospedadas

Commit assinado `b202109aa359f195d5608812a549697fa90f9abb`, verificado com indicador `G` no Git e enviado a `origin/master`. Deployment automático `dpl_98ZtoVSqxRfEumu3wEZuiwYRF1QT`, confirmado `READY` com esse SHA, sem erro de alias, atribuído aos dois domínios públicos.

- Botão visível e habilitado em `https://tg-kezia2.vercel.app/entrar`; [captura](artifacts/google-login-hosted.png).
- POST de início nos dois domínios respondeu 303 para Auth Supabase, com `provider=google`, callback na mesma origem, `code_challenge_method=s256`, cookie verificador e `private, no-store`.
- O endpoint de autorização Supabase respondeu 302 para `accounts.google.com/o/oauth2/v2/auth`, usando callback Google `https://yjukuzgowqtkxvhozhbm.supabase.co/auth/v1/callback` e estado OAuth presente. Valores de estado, desafio e cookies permaneceram somente em memória.
- Clique real no botão pelo navegador chegou à tela Google “Faça login”, com campo de e-mail/telefone. O agente não inseriu credenciais, escolheu conta nem concedeu consentimento. A verificação parou nessa etapa; o usuário foi orientado a testar em seu próprio navegador.

[CI Linux 39465546933](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/39465546933): `completed/success`, jobs `application` e `database` aprovados, incluindo lint, testes, build e E2E da aplicação e checks do banco isolado do runner.

## Retorno Google validado

Em 20/10/2026, o usuário concluiu a escolha/consentimento em seu próprio navegador e confirmou: voltou ao site e apareceu **Conectado**. Esse indicador depende do endpoint de sessão com identidade verificada no servidor.

Consulta única aos logs Auth dos 30 minutos anteriores, selecionando somente horário, caminho, ação, provedor, status e código de erro, registrou em **20/10/2026 14:25:58 (America/Sao_Paulo)**:

- `/callback`, provedor `google`, ação `user_signedup`, status 302, sem código de erro.
- `/token`, ação `login`, status 200, sem código de erro, no mesmo instante.

Esses eventos e a confirmação do usuário validam o retorno autenticado do login Google hospedado. Não foram coletados e-mail, identificador pessoal, tokens ou códigos OAuth nessa consulta. Recarga, histórico, logout e uso com e-mail já existente não foram ensaiados especificamente com Google nesta execução; permanecem critérios complementares de regressão, sem impedir distinguir o login básico já validado.
