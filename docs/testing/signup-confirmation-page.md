# Página após cadastro — 24/10/2026

## Relato e aceite humano

O responsável recebeu o e-mail de cadastro, abriu o link e confirmou que voltou conectado com a conta nova. Também informou que a recuperação de senha pelo site funcionou normalmente. Esses aceites se referem ao fluxo hospedado anterior à melhoria visual; não são inferidos dos testes locais.

A expectativa de abrir uma página dedicada após solicitar o cadastro ainda não era atendida: a mensagem genérica permanecia em /entrar. Implementada a rota pública fixa /conta/confirmar-email, com título “Confira seu e-mail.”, instrução de mesmo navegador, orientação de spam/espera e links para entrar ou continuar na calculadora. Após resposta aceita do cadastro, o formulário navega para essa rota. Respostas de erro permanecem no formulário.

A página conserva a mensagem neutra que não revela se a conta existe. Não recebe e-mail, senha, token ou destino em parâmetros, props pessoais ou armazenamento do navegador. Navegação na mesma origem preserva cookies PKCE existentes; não altera confirmação, template, callback, SMTP ou concessão de sessão. Sem reenvio automático ou nova API. Design system existente preservado; recomendação UI/UX consultada sem regenerar MASTER.md.

Revisão React Best Practices: página estática no servidor, sem novo estado/hook/fetch nem dados pessoais serializados; navegação de resposta no handler já existente. Links e mensagens sem HTML dinâmico, ações sem alterações de autorização. Não foram aplicadas refatorações sem relação com a solicitação.

## Verificações

Fronteiras já adotadas: formulário/navegação no navegador e integração local real Auth/Mailpit. Não houve mudança no domínio processual, persistência ou permissões.

| Execução | Resultado |
| --- | --- |
| pnpm exec playwright test tests/e2e/signup.spec.ts --project=desktop, antes da implementação | Exit 1: esperava /conta/confirmar-email, mas continuava em /entrar. Reproduziu o relato com respostas de API controladas. |
| Mesmo teste após implementação | Exit 0, navegação e orientações corretas, recarga e volta para entrar; sem credenciais no conteúdo/URL. |
| pnpm check | Exit 0: tipos, lint, formatação e 256 unitários em 18 arquivos aprovados. |
| pnpm build | Exit 0: compilação/TypeScript e 23 páginas, incluindo a nova rota. |
| pnpm exec playwright test tests/e2e/signup.spec.ts | Exit 0 na execução final: quatro cenários, desktop 1440px e celular 375px. Sucesso/recarga/privacidade e erro 429 sem redirecionamento; Axe sem violações nas páginas de confirmação, sem rolagem horizontal. |
| pnpm exec eslint tests/e2e/signup.spec.ts --max-warnings 0 | Exit 0 na versão final dos testes. |
| pnpm db:test:app | Exit 0: cadastro real passa pela nova página antes de abrir Mailpit; confirmação PKCE/sessão SSR, senha errada recusada, login/logout/recarga, cálculo e persistência dos três perfis/atos, memória/paginação e isolamento entre duas contas/anon. Fixtures, registros associados e mensagem removidos. |

O teste de erro inicialmente usou um locator de alert genérico que também encontrou o anunciador de rota do Next.js. A execução intermediária teve dois sucessos e duas falhas de seletor; foi corrigido somente o locator para a mensagem do formulário e os quatro cenários passaram. Isso não foi tratado como falha corrigida no produto. A captura histórica regravada pelo helper local foi restaurada.

Capturas controladas inspecionadas: [desktop](artifacts/signup-confirmation-desktop.png) e [celular](artifacts/signup-confirmation-mobile.png). Não contêm dados de conta real. A integração local não grava senhas, tokens ou links de Auth em artefatos; não envia mensagens ao Brevo. Relato de recuperação hospedada não substitui o aceite ainda pendente do lembrete das 09h.

Publicação e versão exata são conferidas por SHA no GitHub/Vercel e registradas no manifesto do pacote da entrega. Os resultados acima foram obtidos antes do commit da implementação; teste de navegador com API simulada não comprova entrega externa.

Publicação conferida: 9632fd25e9faacaf9ab7d75622febce60b30b446, deployment dpl_8EvUsdcauJveSa4CnTXeiZKJunrX, production READY no domínio canônico. [CI 40061653068](https://github.com/Eduwilll/TG-KEZIA2/actions/runs/40061653068) aprovada: 256 unitários, 146 SQL, 67 E2E/um omitido. Navegação pública até a nova página e HTTP 200 conferidos com resposta de cadastro simulada, sem criar conta ou enviar mensagem real. O primeiro harness público tentou usar o formulário antes de ficar interativo e expirou; após aguardar o estado habilitado, passou sem alterar o produto. Evidência também registrada no manifesto do pacote 9632fd2.
