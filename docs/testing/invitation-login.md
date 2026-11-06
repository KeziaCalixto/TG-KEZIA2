# Convite administrativo e indicador de sessão — 19/10/2026

História verificada: convite enviado por Supabase Auth local → Mailpit → link aberto em navegador sem sessão → autenticação reconhecida pelo servidor → definição de senha → recarga/logout/login → indicador global de conta. Ambiente Windows, Edge/Chromium, Supabase CLI 2.121.0 e stack Docker existente. Sem migrations, reset ou alterações remotas nesta correção.

## Reprodução e causa

Antes da correção, `node supabase/scripts/verify-local-invite.mjs` falhou por timeout na etapa de aceitação do convite e persistência SSR; usuário/mensagem efêmeros foram removidos. O site abria sem capturar o fragmento de sessão enviado pelo convite administrativo. O callback existente só trocava códigos PKCE do cadastro comum. O cliente de navegador existia, mas não era inicializado nesse retorno; apenas ativá-lo com PKCE não resolveria a diferença de fluxo.

Foram inspecionados o código instalado de Auth/SSR e as referências oficiais: [fluxo implícito](https://supabase.com/docs/guides/auth/sessions/implicit-flow), [cookies SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [setSession](https://supabase.com/docs/reference/javascript/auth-setsession) e [convite administrativo](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail).

## Comportamento corrigido

O bridge global captura apenas o retorno suportado, limpa o fragmento da barra antes de inicializar Auth, valida o usuário junto ao provedor, estabelece a sessão com o adaptador oficial de cookies e compara a identidade com `/api/auth/session`. A navegação seguinte tem destino fixo. Convite aceito leva à definição de senha; erro/reuso leva à mensagem genérica acessível. O cadastro PKCE permanece em seu callback.

O cabeçalho distingue carregamento, visitante, erro de consulta e conta conectada. O estado conectado inclui texto, ícone e e-mail abreviado visualmente, com nome acessível completo. Atualiza após login/logout, navegação e foco da janela. A indicação é informativa; a autorização continua no servidor e na RLS.

## Resultados reais

| Comando/atividade | Resultado |
| --- | --- |
| `pnpm test` | 6 arquivos, **55 testes aprovados**: motor, contratos HTTP, origem, dependência, parser do convite e definição de senha. |
| `pnpm build` | Build de produção aprovado, incluindo `/conta/definir-senha` e `/api/auth/password`. |
| `pnpm lint` | Aprovado, exit 0 nesta revisão. Supera a execução anterior interrompida; não altera a evidência histórica. |
| `pnpm typecheck` | Aprovado, sem erros. |
| `pnpm format:check` | Aprovado. Harness adicional também formatado explicitamente. |
| `pnpm db:test:invite` | Aprovado: link do Mailpit em navegador sem sessão, identidade SSR, senha, recarga, logout/login e indicação no cabeçalho, inclusive 375px; reuso e fragmento inválido recusados sem sessão; atualização de senha anônima HTTP 401 e origem externa HTTP 403. |
| `pnpm db:test:app` | Aprovado: regressão do cadastro por e-mail/PKCE, login/logout, histórico/recarga/exclusão e isolamento entre duas contas. |
| `pnpm test:e2e --workers=1` | **12 testes aprovados em 31,2s**, desktop e viewport móvel. |
| Inspeção visual adicional | Indicador em desktop/375px, tela de senha móvel sem rolagem horizontal; Axe WCAG A/AA sem violações automatizadas na tela observada. |

Os testes de convite não gravam traces, screenshots de autenticação, URLs, senhas ou cookies; capturam o status do CLI somente em memória para fixtures locais. As contas e mensagens criadas pelo harness foram removidas. Um convite já consumido não pode ser reutilizado para um novo teste.

As prévias abaixo usam sessão **simulada somente para apresentação**, com e-mail fictício e sem credenciais; não substituem a integração real aprovada acima. Foram inspecionadas visualmente:

- [Cabeçalho desktop](artifacts/account-connected-desktop.png) e [celular](artifacts/account-connected-mobile.png).
- [Definição de senha em celular](artifacts/invite-set-password-mobile.png).

Não foram verificados SMTP externo, ambiente remoto, todos os navegadores ou recuperação de senha esquecida. O estado acadêmico do cálculo permanece inalterado.
