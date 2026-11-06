# Preparação de implantação — Vercel + Supabase

Estado em 19/10/2026: primeira demonstração pública em **https://tg-kezia2-eduwillls-projects.vercel.app**, deployment `READY` do commit assinado `acbf37e` e CI Linux aprovada. Supabase remoto `TG-KEZIA2` com migration inicial/RLS, Site URL, callback exato e templates de convite/confirmação configurados. Cálculo, origem HTTPS e falhas seguras sem sessão foram verificados no destino; entrega Brevo e fluxo autenticado hospedado continuam pendentes de teste pelo usuário. [Evidências remotas](testing/first-deployment.md). A integração local com duas contas já foi verificada; [evidências locais](testing/local-supabase.md).

Na tentativa de 18/10, os downloads Docker não concluíram antes da interrupção. A nova execução de 19/10 concluiu a imagem PostgreSQL e a stack, criou `.env.local` ignorado pelo Git e verificou a persistência local. O histórico dessa tentativa anterior permanece em `docs/testing/results.md`.

## Desenvolvimento local

Atualização em 20/10/2026: login Google publicado no commit assinado `b202109`, deployment `READY`, CI aprovada e retorno com indicador Conectado confirmado pelo usuário e logs Auth. [Configuração](google-login.md) e [evidências/limites do ensaio](testing/google-login.md).

Publicação da finalização em 20/10: os quatro marcos até `ff9d3cc` foram enviados a `master`; Vercel confirmou `READY` em produção, nos dois aliases. Dez comarcas de SP, recuperação, memória do histórico, exportação/impressão, ajuda e privacidade estão publicados. [Evidências](testing/final-deployment.md).

No Auth hospedado foram adicionados os callbacks exatos `https://tg-kezia2.vercel.app/auth/callback?flow=recovery` e `https://tg-kezia2-eduwillls-projects.vercel.app/auth/callback?flow=recovery`, preservando os dois callbacks existentes. Site URL observado e preservado: `https://tg-kezia2.vercel.app/auth/callback`. Aplicado `supabase/templates/recovery.html` em Reset password, assunto “Recupere sua senha no Prazo Claro”, com `{{ .ConfirmationURL }}`. O envio externo/definição de nova senha ainda deve ser ensaiado pelo responsável no mesmo navegador da solicitação. A configuração local inteira não foi enviada ao projeto remoto; não houve alteração de schema nesta publicação.

Use Node.js 22.14+ e a versão de pnpm definida em `package.json`. Instale com `pnpm install --frozen-lockfile`. O CLI Supabase está fixado no projeto. Instale/inicie Docker compatível, e execute na raiz:

```sh
pnpm exec supabase start
pnpm exec supabase db reset --local
pnpm exec supabase test db --local
pnpm exec supabase db advisors --local --type security --fail-on warn
pnpm exec supabase migration list --local
```

`db reset --local` apaga e recria **apenas o banco local deste projeto**; não use para dados a preservar. A migration foi criada pelo CLI em `supabase/migrations/`; o seed é intencionalmente vazio. Fixtures de teste são fictícias, transacionais e revertidas.

Com a stack pronta, execute `./supabase/scripts/write-local-env.ps1` no PowerShell para capturar o status do CLI em memória e criar `.env.local` somente com URL loopback e chave publicável. O script recusa sobrescrever arquivo existente sem `-Force`. Alternativamente, copie `.env.example` para `.env.local` e preencha URL e chave publicável do ambiente local (prefixo `sb_publishable_`). Não cole chave secreta ou JWT legado no campo público. Refaça o build após configurar as variáveis públicas. O aplicativo permanece demonstrativo, sem conta/histórico remoto, quando não configurado. Verifique o endereço do visualizador de e-mail em `supabase status` localmente, sem copiar saída de credenciais para documentação ou logs públicos.

O script `node supabase/scripts/verify-local-isolation.mjs` verifica autenticação por senha e RLS contra a Data API local com dois usuários efêmeros. Ele usa a chave administrativa **somente localmente e em memória** para criar/remover fixtures confirmadas; recusa URLs remotas. Não comprova confirmação por e-mail nem SSR, que precisam do fluxo de navegador descrito abaixo.

Com o aplicativo ativo em `http://127.0.0.1:3000`, execute `pnpm db:test:app` para automatizar cadastro, confirmação no Mailpit, callback no mesmo navegador, sessão, histórico e isolamento via aplicação. O harness não salva senhas/cookies/links de confirmação e remove as próprias fixtures. O Mailpit desta configuração está em `http://127.0.0.1:54324`.

Para convites enviados pelo Studio/CLI, execute também `pnpm db:test:invite`: ele abre o link do Mailpit em navegador sem sessão e verifica definição de senha, autenticação no servidor, recarga, indicador conectado e erros de reuso. O cadastro comum continua usando PKCE; o convite administrativo retorna por fragmento e é tratado pelo cliente oficial antes da navegação para a conta. [Evidências](testing/invitation-login.md).

Para editar os e-mails de convite e confirmação, siga [a configuração dos templates locais](../supabase/templates/README.md). Após mudar o TOML, pare e inicie a stack pelo CLI para aplicar a configuração. [Verificação de assunto/HTML e PKCE](testing/email-templates.md).

```sh
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Teste cadastro, e-mail local, callback no mesmo navegador, login, salvamento de cálculo demonstrativo completo, recarga do histórico e logout. Depois crie uma segunda conta fictícia e comprove que leitura/exclusão do primeiro usuário falham, inclusive com requisições diretas. Teste também JSON inválido, resultado adulterado, Origin externo, sessão ausente e Supabase indisponível. Registre resultados reais em `docs/testing/`.

## Preview e produção

1. Identificar explicitamente organização, projeto Supabase e ambiente de destino. Usar projetos/branches e dados distintos para desenvolvimento, preview e produção; preview não acessa dados de produção.
2. Revisar a migration e executá-la primeiro no ambiente isolado. Rodar testes RLS e advisors. Mudanças futuras devem ser compatíveis com a versão anterior da aplicação; preferir correção incremental revisada, sem reset de produção.
3. Conectar o repositório ao projeto Vercel, configurar framework Next.js, Node.js 22+ e instalação/build pelos scripts fixados. Habilitar previews de pull requests e proteção dos previews conforme o ambiente.
4. Configurar, por ambiente, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. O código não exige secret key nem `service_role`. Alterar variável pública requer novo build. Nunca enviar `.env.local` ao Git.
5. Em Supabase Auth, configurar Site URL correto, confirmação de e-mail e allowlist dos callbacks `/auth/callback` de cada origem permitida. Para produção, verificar SMTP próprio e rate limits; testar a mensagem real e não apenas a presença da configuração.
6. No preview: executar todos os checks de CI, testes do motor, integração e E2E; validar cadastro/retorno SSR, sessão após refresh, RLS entre usuários, snapshot identificado e falha segura quando indisponível. Verificar headers de cache e ausência de segredos em bundles/logs.
7. Promover para produção apenas versão aprovada e testada. Exigir a revisão da migração e as proteções do ambiente GitHub/Vercel. A regra de aprovação requer configuração real no provedor, não é garantida por um arquivo YAML isolado.
8. Validar health check de cálculo sintético sem dados reais, taxas de erro/latência e alertas operacionais. Definir retenção, backup/restauração, exclusão e procedimento de rollback da aplicação; banco deve continuar compatível.

Nenhum deploy é necessário para executar motor e testes locais. Nenhuma data demonstrativa pode ser anunciada como juridicamente validada na publicação. Os critérios que ainda dependem de contas, credenciais, Docker ou revisão humana devem permanecer registrados como pendentes.
