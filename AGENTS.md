# Prazo Claro

Aplicação acadêmica de contagem processual. Interface e documentação funcional em pt-BR; identificadores de código em inglês.

- Antes de alterar o domínio, leia `GLOSSARY.md` e `docs/requirements.md`. Para mudanças de fronteiras ou persistência, leia `docs/architecture.md` e os ADRs em `docs/architecture/adr/`.
- Preserve os documentos originais em `docs/`; a análise e as divergências estão em `docs/review-existing-work.md`.
- O primeiro recorte é processo civil comum, dias úteis, TJSP — Comarca de São Paulo (Capital). Outros regimes, unidades e meios de comunicação só entram com especificação, fonte, testes e revisão próprias.
- Motor determinístico separado de React, Next.js, Supabase, rede e relógio do sistema. Entradas carregam versões imutáveis de regras/calendário; saídas mantêm memória de cálculo.
- Ao pesquisar regras, use `.agents/skills/brazilian-procedural-law/SKILL.md`. Ao alterar contagem, use `procedural-deadline-engine`; ao alterar eventos/cobertura, use `judicial-calendar`; ao verificar rastreabilidade, use `legal-calculation-audit`, nos diretórios irmãos.
- Toda regra precisa de fonte primária, dispositivo, âmbito, vigência e estado de revisão. Dados ausentes produzem cálculo incompleto; calendário demonstrativo permanece identificado na tela, exportação e histórico. Aprovação técnica e revisão jurídica são estados distintos.
- Use TDD nas regras de negócio: caso e fonte → teste falho → implementação → regressão. Registre os comandos e resultados reais em `docs/testing/`; execute os scripts pertinentes definidos em `package.json` após alterações. Teste automatizado não equivale a revisão jurídica.
- Supabase e Vercel são decisões do projeto. Migrations versionadas, RLS em tabelas expostas e autorização no servidor; chave privilegiada exclusivamente no servidor quando necessária. Leia `docs/security/` ao alterar autenticação, acesso, logs ou retenção.
- Para UI, consulte `design-system/prazo-claro/MASTER.md`; mantenha erros acessíveis, foco visível, navegação por teclado e identificação de estados além da cor.
- Mantenha pendências e critérios de aceite em `docs/backlog.md`. Registre evidências antes de declarar testes, deploy, migrações ou integração concluídos. Para skills e referências de engenharia, consulte `docs/skills.md`.
