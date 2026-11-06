# Skills e referências de engenharia

Inspeção em 18/10/2026. A instalação global já existia nesta máquina; esta etapa verificou arquivos e disponibilidade, sem reinstalar pacotes ou executar instaladores externos. Skills globais são recursos do ambiente e não foram copiadas integralmente para o projeto.

## Inventário e seleção

As 16 skills prioritárias do master prompt possuem `SKILL.md` em `C:/Users/Eduardo/.codex/skills/`: `setup-matt-pocock-skills`, `grill-with-docs`, `domain-modeling`, `research`, `to-spec`, `to-tickets`, `codebase-design`, `tdd`, `implement`, `implement-spec`, `code-review`, `diagnosing-bugs`, `prototype`, `improve-codebase-architecture`, `retro` e `writing-for-agents`. UI UX Pro Max também está presente no mesmo diretório raiz, com seu catálogo local. Presença em disco não comprova que todas foram invocadas ou testadas.

Para a documentação do domínio foram lidas `domain-modeling` (incluindo formatos de glossário/ADR), `writing-for-agents` (incluindo `SKILL-MECHANICS.md`) e `skill-creator`. A criação local mantém descoberta automática e frontmatter `name`/`description`; a orientação do criador do Codex prevalece sobre campos de invocação específicos de outros agentes. O processo principal usa especificação incremental e TDD conforme a etapa. Nenhuma skill exige instalar todo o ecossistema.

## Fontes oficiais consultadas e decisão

Os READMEs/páginas abaixo foram consultados por navegação nesta etapa. As orientações foram avaliadas como documentação; comandos publicados nas páginas não foram executados por esta avaliação.

| Referência | Aproveitamento e decisão |
| --- | --- |
| [Matt Pocock Skills](https://github.com/mattpocock/skills) | Principal referência de engenharia: linguagem de domínio, especificação e tarefas pequenas com testes/revisão. Reutilizar instalação existente; compatibilidade com Codex consta no projeto. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Principal referência visual, com suporte documentado a Codex e geração persistente de design system. Reutilizar a instalação; o design do projeto fica em `design-system/prazo-claro/MASTER.md`. |
| [Anthropic Skills](https://github.com/anthropics/skills) | Referência de empacotamento autocontido e divulgação progressiva. O repositório declara implementação para Claude; não presumir equivalência de ferramentas/comandos com Codex. Sem instalação redundante. |
| [Frontend Design](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design) | Aproveitar hierarquia e intenção visual. O incentivo a animações de impacto é subordinado ao requisito local de sobriedade/acessibilidade. Sem instalar um segundo coordenador visual. |
| [Superpowers](https://github.com/obra/superpowers) | Avaliado o ciclo planejamento, TDD, revisão e verificação; existe suporte documentado a Codex. Não instalar framework adicional, pois duplica o processo escolhido. |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | Aproveitar encadeamento especificação → plano → tarefas → implementação e verificações de consistência. Não adicionar CLI/orquestração paralela ao workflow principal. |
| [OWASP ASVS](https://github.com/OWASP/ASVS) | Referência verificável para requisitos de segurança, com versão estável consultada 5.0.0. Vincular requisitos à versão nos registros de segurança; não alegar conformidade/certificação por citar a referência. |
| [Sentry Skills](https://github.com/getsentry/skills) | O README distingue skills da equipe do material para configurar Sentry em aplicações. Observabilidade fica condicionada à necessidade e privacidade; sem instalar o conjunto inteiro ou declarar telemetria configurada. |
| [Playwright](https://playwright.dev/) | E2E com isolamento, locators acessíveis e rastros de falha. Configurar testes da aplicação; instalar browsers não equivale a executá-los. |
| [Vitest](https://vitest.dev/) | Testes TypeScript do motor e contratos, inclusive fora de apps Vite. Usar versão fixada no projeto; resultados somente após comando real. |

## Skills jurídicas locais

| Skill | Quando usar | Saída principal |
| --- | --- | --- |
| [brazilian-procedural-law](../.agents/skills/brazilian-procedural-law/SKILL.md) | Pesquisar/alterar norma, vigência ou enquadramento jurídico | Ficha de regra com fonte e pendências. |
| [procedural-deadline-engine](../.agents/skills/procedural-deadline-engine/SKILL.md) | Alterar contrato, marcos ou algoritmo de contagem | Regra determinística, casos e evidência técnica. |
| [judicial-calendar](../.agents/skills/judicial-calendar/SKILL.md) | Incluir/alterar feriado, suspensão, cobertura ou versão | Eventos com proveniência e cobertura explícita. |
| [legal-calculation-audit](../.agents/skills/legal-calculation-audit/SKILL.md) | Conferir memória, regressão ou divergência | Relatório reproduzível e pendências classificadas. |

As quatro são instruções locais em formato `SKILL.md`, sem instaladores, hooks ou dependência de ferramentas exclusivas do Claude. A leitura é acionada também pelos ponteiros em `AGENTS.md`. Nenhuma transforma testes técnicos em validação jurídica ou amplia autorização para criar recursos remotos.
