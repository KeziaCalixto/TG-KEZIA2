# Prontidão para primeiro deploy — 19/10/2026

Revisão do commit `f4cfacd` na branch `master`. O Git estava limpo antes deste relatório. Escopo: inspeção do repositório, consultas de leitura pelos plugins e auditoria de dependências. Nenhum projeto, migration remota, configuração de conta ou deployment foi criado/alterado.

## Parecer

O código está apto a iniciar a preparação de um **preview acadêmico para testes controlados**. Não há evidência de funcionamento remoto até criar os projetos, configurar Auth/e-mail, aplicar a migration e testar a URL hospedada. Não é necessário implementar organizações, novos regimes ou outros recursos do backlog para esse primeiro preview.

A publicação como ferramenta jurídica operacional continua dependente de revisão jurídica identificada e calendário completo. As indicações de demonstração devem permanecer no ambiente hospedado.

## Acessos e ambiente observados

| Item | Resultado |
| --- | --- |
| Supabase plugin | Consulta de projetos aprovada: nenhum projeto listado. Organização disponível: `Eduwilll's Org`. |
| Vercel plugin | Consulta aprovada: equipe `eduwilll's projects`; busca de projeto com nome contendo `prazo` nessa equipe não retornou projetos. |
| Vínculo local Vercel/Supabase | `.vercel/project.json` e `supabase/.temp/project-ref` ausentes. |
| Git remoto | Nenhum remote configurado. Branch local `master`; CI de push filtra somente `main`. |
| Aplicativo | Next.js, build/install configurados em `vercel.json`; URL e chave publicável Supabase são as duas variáveis exigidas pelo aplicativo. |

## Evidências técnicas

O [registro de autenticação](invitation-login.md) documenta, na mesma implementação commitada, 55 testes unitários, 12 E2E, build, lint, tipos, formatação e fluxos reais locais de cadastro, convite, senha e histórico aprovados. O [registro do banco](local-supabase.md) documenta migration/reset, 28 testes pgTAP, lint de schema e advisors locais aprovados. Essas execuções não foram repetidas integralmente nesta inspeção nem equivalem à CI Linux ou à validação remota.

Revisão de dependências executada nesta inspeção:

| Comando | Resultado real |
| --- | --- |
| `pnpm audit --prod --audit-level high` | Nenhuma vulnerabilidade conhecida encontrada na consulta. |
| `pnpm audit --audit-level high` | Um alerta alto, especificamente ignorado pela mitigação documentada de `braces`. |
| `pnpm exec vitest run tests/dependency-security.test.ts` | 6 testes aprovados. |

O [advisory upstream](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) foi consultado novamente. A exceção permanece uma decisão explícita com [patch, limites e prazo de revisão](../security/dependency-mitigation.md); o resultado não é uma auditoria upstream limpa.

## Preparações antes do primeiro preview

1. Criar/selecionar explicitamente o projeto Supabase e o projeto Vercel do TG. Escolher região e manter os dados de teste separados dos dados de produção.
2. Aplicar a migration versionada no projeto Supabase novo; conferir tabelas, concessões, RLS e advisors no destino. Não usar reset remoto nem importar as credenciais do ambiente local.
3. Configurar na Vercel URL/chave publicável do projeto hospedado; manter segredos administrativos fora do aplicativo e do repositório.
4. Tornar o build reproduzível: fixar Node 22 em vez do intervalo aberto `>=22.14.0` e habilitar `ENABLE_EXPERIMENTAL_COREPACK=1` para respeitar `packageManager: pnpm@11.0.8`. Ver [Corepack na Vercel](https://vercel.com/docs/builds/configure-a-build#corepack) e [versões Node](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
5. Configurar Site URL HTTPS, callbacks permitidos, confirmação de e-mail e templates no Supabase hospedado. `config.toml` e Mailpit são locais; seus valores `127.0.0.1` não devem ser promovidos ao destino remoto.
6. Configurar SMTP para destinatários externos. O [envio padrão Supabase](https://supabase.com/docs/guides/auth/auth-smtp) restringe destinatários aos membros da equipe e tem limites próprios. Uma demonstração só com esses endereços pode dispensar SMTP próprio inicialmente, mas não comprova convites externos.
7. Se usar integração GitHub, criar/vincular o repositório e alinhar a CI com `master` ou a branch escolhida; depois observar a execução real. Um primeiro preview pela CLI não depende de Git remoto, mas também não comprova CI.
8. Na URL do preview: testar origem HTTPS/CSRF, callbacks/cookies, cadastro/convite/senha, logout, recarga e isolamento de duas contas. Confirmar que nenhum link aponta ao localhost e que o calendário demonstrativo permanece identificado. Esses resultados somente podem ser registrados após o deploy.

Para acesso público amplo, também concluir os controles operacionais já previstos no backlog: proteção contra abuso, recuperação de senha, retenção/exclusão, observabilidade e backup/restauração conforme o uso. Eles não precisam ser confundidos com novos recursos de cálculo para uma demonstração restrita.
