# Instalação e verificação local

Lembretes opcionais locais de 23/10: após preparar a stack/ambiente abaixo, aplicar migrations pendentes com `pnpm exec supabase migration up --local`, executar `pnpm reminders:configure:local` e reiniciar o app. Em outro terminal, `pnpm reminders:watch` consulta a fila a cada minuto; Ctrl+C encerra. Nenhum e-mail externo é enviado. Não resetar banco com dados para habilitar o recurso. [Configuração, limites, caixa de testes e integração](../email-reminders.md#executar-localmente).

Ambiente ensaiado: Windows, Node.js 22.14+ da linha 22, pnpm 11.0.8, Docker Desktop e Supabase CLI 2.121.0 fixado no projeto. O aplicativo e a CI também têm execução em Linux; os helpers de integração local usam PowerShell e foram ensaiados no Windows.

## Instalação

Na pasta do repositório:

```sh
pnpm install --frozen-lockfile
pnpm db:start
```

Para gerar a configuração local, no PowerShell:

```powershell
./supabase/scripts/write-local-env.ps1
```

O helper aceita somente URL loopback e grava apenas URL/chave publicável. Recusa sobrescrever `.env.local` existente; revise o arquivo antes de usar a opção `-Force`. Não copie senha de banco, chave privilegiada ou segredo Google para `NEXT_PUBLIC_*`.

Confira `pnpm exec supabase migration list --local` e aplique as pendentes com `pnpm exec supabase migration up --local`, conforme [implantação](../deployment.md). O repositório contém quatro migrations: base, fila de lembretes, modos de entrega e agendador. Não use reset para atualizar uma instalação com dados a preservar. A preparação do Cron é administrativa e inativa por padrão; não iniciar agendamento hospedado a partir da stack local.

```sh
pnpm dev
```

Abra `http://127.0.0.1:3000`. Mailpit: `http://127.0.0.1:54324`; Studio: `http://127.0.0.1:54323`. Use o mesmo host e navegador durante cadastro, confirmação e recuperação PKCE. Evite alternar entre `localhost` e `127.0.0.1`, pois são origens e cookies diferentes.

## Modo de demonstração reproduzível

Encerre o servidor de desenvolvimento antes de iniciar outro processo na porta 3000:

```sh
pnpm build
pnpm start
```

Sem configuração Supabase, a calculadora continua disponível; conta e histórico informam indisponibilidade. Google local depende de configuração própria do provedor. Para a demonstração local padrão, use e-mail/senha e Mailpit.

## Verificações

```sh
pnpm check
pnpm audit --audit-level high
pnpm build
pnpm test:e2e
```

`pnpm check` executa tipos, lint, formatação e unitários. A auditoria, build e E2E são etapas adicionais, como nos comandos acima.

Para integração real, mantenha Supabase e a versão atual do aplicativo ativos na porta 3000:

```sh
pnpm db:test
pnpm db:test:auth
pnpm db:test:app
pnpm db:test:invite
pnpm db:test:recovery
pnpm db:test:reminders
```

Execute os helpers sequencialmente, com o watcher de lembretes pausado durante o teste da fila, para evitar competição pelas fixtures. Eles usam contas locais efêmeras e não devem ser adaptados para contas reais. A suíte E2E usa Edge instalado no Windows; Linux/CI requer `pnpm exec playwright install --with-deps chromium`. Artefatos de falha ficam em `test-results/` e `playwright-report/`, ignorados pelo Git. As suítes autenticadas não gravam traces ou capturas com tokens.

A auditoria tem uma exceção específica documentada para a dependência de desenvolvimento `braces`, mitigada por patch e testes. Consulte [a decisão e prazo de revisão](../security/dependency-mitigation.md); exit 0 não significa ausência do advisory original.

## Encerramento e problemas comuns

Encerre o servidor Next.js com Ctrl+C. `pnpm exec supabase stop` preserva os dados por padrão. Não use `--no-backup`, `--all`, exclusão de volumes ou reset como procedimento rotineiro.

Se um e-mail não aparecer, confira se está usando o Supabase local e o Mailpit correto, aguarde o intervalo de envio e solicite um link novo. Se o link expirou ou abriu em outro navegador, inicie novamente no navegador original. Para erro por indisponibilidade/expediente parcial do calendário, leia a pendência; o app deliberadamente não emite uma data nesses casos.

Se o helper parar em local configuration, confirme que Docker Desktop e a stack estão ativos. Se parar ao abrir o navegador e a porta 3000 recusar conexão, inicie pnpm dev ou o build com pnpm start. Reiniciar serviços preserva os volumes; não usar reset como correção automática. [Ocorrências e revalidação desta entrega](../testing/finalization-2026-10-23.md).
