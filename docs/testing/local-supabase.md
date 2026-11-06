# Supabase local — nova execução em 19/10/2026

Ambiente Windows, Node.js 22.14.0, pnpm 11.0.8, Supabase CLI 2.121.0 e Docker 29.8.2. Esta execução sucede a tentativa interrompida de 18/10 descrita em `results.md`. Nenhum projeto remoto foi provisionado ou alterado.

| Comando | Resultado observado |
| --- | --- |
| `docker pull public.ecr.aws/supabase/postgres:17.11.0.004` | Imagem preparada com sucesso. |
| `pnpm exec supabase start -x realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor` | Exit 0; banco saudável e Auth health HTTP 200. |
| `pnpm exec supabase db reset --local` | Migration `20261019021156` aplicada; reset concluído. |
| `pnpm exec supabase test db --local` | 2 arquivos, 28 testes pgTAP aprovados. |
| `pnpm exec supabase db lint --local --fail-on error` | Nenhum erro de schema encontrado. |
| `pnpm exec supabase db advisors --local --type security --fail-on warn` | Nenhum problema encontrado. |
| `pnpm exec supabase migration list --local` | Versão local correspondente a `20261019021156`. |
| `./supabase/scripts/write-local-env.ps1` | `.env.local` criado somente com URL loopback e chave publicável; ignorado pelo Git. |
| `pnpm db:test:auth` | Auth por senha, identidade verificada, inserção/leitura/exclusão do proprietário, bloqueio entre usuários, UPDATE recusado e acesso anônimo recusado. Fixtures removidas com cascade. |
| `pnpm test` após correção da origem local | 4 arquivos, 46 testes aprovados. |
| `pnpm build` após correção | Build de produção aprovado, com configuração local. |
| `pnpm db:test:app` após correção | Exit 0: cadastro no navegador, e-mail local, callback PKCE, sessão SSR, senha incorreta recusada, login/logout e sessão após recarga; cálculo, gravação e memória original após recarga; isolamento entre duas contas, proprietário/resultado injetados ignorados, anônimo recusado; exclusão pela UI e bloqueio após logout. Fixtures e e-mail removidos. |
| `pnpm test:e2e --workers=1` | 12 testes aprovados em 55,0s, desktop e viewport móvel, com aplicativo configurado e usuário anônimo. |
| `pnpm typecheck` e `pnpm format:check` | Aprovados, sem erros de tipos ou formatação. O harness adicional foi formatado explicitamente com Prettier. |
| `pnpm lint` nesta nova execução | Interrompido após não retornar por vários minutos. Execução direcionada com `--debug` também não concluiu o carregamento da configuração/regras antes da interrupção; não há aprovação de lint desta revisão. O resultado aprovado de 18/10 é histórico. |

Antes do commit inicial, 96 arquivos preparados foram inspecionados: `.env.local` não rastreado e nenhuma ocorrência dos padrões de chave secreta Supabase, JWT ou chave privada pesquisados. `git diff --cached --check` nos arquivos novos de implementação passou; o arquivo original `docs/note.txt` e os espaços de contexto do patch da dependência foram preservados, apesar dos avisos de whitespace.

## Regressão identificada no aplicativo

O primeiro `pnpm db:test:app` encontrou HTTP 403 no cadastro iniciado em `127.0.0.1:3000`. Um POST mínimo com JSON vazio retornou 403 com Origin `127.0.0.1`, mas 400 (validação de corpo esperada) com Origin `localhost`: o proxy Next.js normaliza a URL interna. O teste de regressão falhou antes da correção (3 falhas/1 aprovação).

O adaptador HTTP passou a recuperar somente Host loopback na mesma porta quando a URL interna também é HTTP loopback. A mesma origem alimenta a comparação CSRF e os retornos de confirmação. Host externo, porta distinta e cabeçalhos forwarded não escolhem destinos; ausência de Origin e origens externas continuam recusadas. Quatro testes de regressão passaram. A topologia remota ainda precisa ser verificada antes de publicação.

O harness `pnpm db:test:app` usa navegador e duas contas efêmeras, recebe o e-mail no Mailpit local e testa o callback no mesmo navegador. A chave administrativa é lida somente em memória para fixtures locais; não é configurada no aplicativo. Senhas, cookies e URLs de confirmação não são gravados em traces ou capturas. O bloco de limpeza remove somente usuários/mensagens criados pelo teste.

Esta verificação técnica não aprova juridicamente regras ou calendário demonstrativo, nem comprova SMTP, CI ou operação em produção.
