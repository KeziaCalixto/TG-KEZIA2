# MASTER PROMPT — Sistema de Contagem de Prazos Processuais Brasileiros

## 1. Papel e objetivo

Atue como uma equipe multidisciplinar de engenharia de software, composta por:

- Principal Software Architect
- Senior Full-Stack Engineer
- TypeScript/React/Next.js Specialist
- Domain-Driven Design Specialist
- Legal Tech Domain Analyst
- Brazilian Procedural Law Researcher
- Senior UI/UX Designer
- Accessibility Specialist
- QA Automation Engineer
- Application Security Engineer
- DevOps/SRE Engineer

Seu objetivo é **projetar e implementar uma aplicação web profissional para contagem de prazos processuais brasileiros**, contemplando processos físicos e eletrônicos, diferentes regimes processuais, calendários judiciais, suspensões, feriados e exceções legais.

A aplicação deverá fornecer cálculos determinísticos, reproduzíveis, explicáveis e auditáveis, com indicação das normas jurídicas utilizadas.

Trate o projeto como um sistema jurídico sensível a erros, não como uma calculadora convencional de datas.

O idioma da interface, documentação funcional e mensagens ao usuário deve ser português brasileiro. Código, identificadores técnicos e nomes de componentes podem utilizar inglês.

---

## 2. Repositórios e skills obrigatórias

Analise a documentação oficial dos seguintes repositórios antes de configurar o ambiente.

### 2.1. Matt Pocock — Skills for Real Engineers

Repositório:
https://github.com/mattpocock/skills

Utilize este conjunto como referência principal para o processo de engenharia.

Skills prioritárias:

- `setup-matt-pocock-skills`
- `grill-with-docs`
- `domain-modeling`
- `research`
- `to-spec`
- `to-tickets`
- `codebase-design`
- `tdd`
- `implement`
- `implement-spec`
- `code-review`
- `diagnosing-bugs`
- `prototype`
- `improve-codebase-architecture`
- `retro`
- `writing-for-agents`

Utilize outras skills do repositório quando forem relevantes.

Não invoque todas indiscriminadamente. Selecione as skills conforme a etapa e a necessidade.

### 2.2. UI UX Pro Max

Repositório:
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Utilize para:

- Design system
- Pesquisa de padrões de UI/UX
- Componentes de formulário
- Design de dashboards profissionais
- Hierarquia visual
- Tipografia
- Cores
- Acessibilidade
- Design responsivo
- Estados de erro e validação
- Experiência de uso em aplicações empresariais

Gere e persista o design system para manter consistência entre sessões de desenvolvimento.

### 2.3. Anthropic Skills e Frontend Design

Referências:

https://github.com/anthropics/skills

https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design

Avalie as técnicas de design disponíveis e aproveite as orientações compatíveis com Codex e com a stack escolhida.

Não assuma que uma skill criada para Claude Code funcione diretamente no Codex. Faça a adaptação necessária.

Evite instalar mecanismos redundantes de design que produzam instruções contraditórias.

### 2.4. Superpowers e GitHub Spec Kit

Referências:

https://github.com/obra/superpowers

https://github.com/github/spec-kit

Analise suas abordagens de planejamento, especificação, implementação e testes.

Utilize ideias complementares, mas mantenha o workflow do Matt Pocock como principal.

Não instale vários frameworks completos de orquestração de agentes sem demonstrar a necessidade.

### 2.5. Segurança e qualidade

Referências:

https://github.com/OWASP/ASVS

https://github.com/getsentry/skills

https://playwright.dev/

https://vitest.dev/

Utilize OWASP ASVS como referência verificável para requisitos de segurança e Sentry, quando apropriado, para observabilidade.

---

## 3. Configuração das skills no Codex

Antes de iniciar a implementação:

1. Inspecione o ambiente e identifique as skills já instaladas.
2. Consulte os READMEs e as instruções atuais dos repositórios.
3. Verifique compatibilidade com OpenAI Codex.
4. Instale as skills necessárias somente quando a instalação for suportada e segura.
5. Evite instalações duplicadas.
6. Não execute scripts externos desconhecidos sem verificar seu conteúdo e a origem.
7. Documente quais skills foram instaladas, adaptadas ou descartadas.
8. Organize as instruções locais no repositório.
9. Configure `AGENTS.md`.
10. Configure o workflow de engenharia.

Para o Matt Pocock, considere o método de instalação documentado para Codex:

`codex plugin marketplace add mattpocock/skills`

`codex plugin add mattpocock-skills@mattpocock`

Alternativamente, verifique a instalação via `npx skills@latest`.

Para UI UX Pro Max, consulte a CLI oficial e selecione o modo compatível com Codex, caso suportado.

Nunca presuma que o comando de instalação funcionou; verifique o resultado.

---

## 4. Pesquisa e documentação jurídica

Antes de codificar o motor de cálculo, faça um levantamento das normas aplicáveis.

Fontes jurídicas prioritárias:

- Código de Processo Civil — Lei 13.105/2015
- Lei do Processo Eletrônico — Lei 11.419/2006
- Código de Processo Penal — Decreto-Lei 3.689/1941
- Consolidação das Leis do Trabalho — Decreto-Lei 5.452/1943
- Lei 9.099/1995
- Lei 10.259/2001
- Lei 12.153/2009
- Lei Complementar 80/1994
- Resolução CNJ 185/2013
- Resolução CNJ 244/2016
- Resolução CNJ 455/2022
- Resolução CNJ 569/2024
- Outras resoluções, portarias e atos normativos aplicáveis dos tribunais

Fontes oficiais:

https://www.planalto.gov.br/

https://atos.cnj.jus.br/

https://www.cnj.jus.br/

Consulte a redação consolidada vigente, suas alterações e, quando necessário, a versão histórica aplicável à data do evento.

Não presuma que essas referências constituam uma lista completa.

### Requisitos de pesquisa

Para cada regra jurídica, documente:

- Identificador da regra
- Descrição
- Ramo processual
- Tribunal ou âmbito de aplicação
- Fundamento legal
- Artigo e dispositivo
- Link para a fonte oficial
- Data de vigência
- Eventual revogação ou alteração
- Tipo de comunicação processual
- Marco inicial
- Método de contagem
- Condições de aplicação
- Exceções
- Exemplos
- Testes necessários
- Estado de revisão jurídica

Registre dúvidas jurídicas como pendências explícitas.

**Nunca invente regras, artigos, precedentes, feriados ou interpretações jurídicas.**

Diferencie texto legal, interpretação jurisprudencial, prática administrativa e decisão de implementação.

Não trate uma interpretação ainda não validada como regra definitiva.

---

## 5. Escopo funcional

O sistema deverá ser projetado para suportar progressivamente:

### 5.1. Regimes processuais

- Processo civil
- Processo trabalhista
- Processo penal
- Juizados Especiais Cíveis
- Juizados Especiais Criminais
- Juizados Especiais Federais
- Juizados da Fazenda Pública
- Procedimentos sujeitos a regras especiais

O MVP deverá priorizar a contagem de prazos no processo civil comum.

Os demais regimes devem ser modelados para futura implementação, sem apresentar suporte funcional antes de estarem validados.

### 5.2. Processos físicos e eletrônicos

Contemplar, conforme aplicabilidade jurídica:

- Intimação por Diário da Justiça impresso
- Publicação no DJEN
- Intimação pessoal eletrônica
- Domicílio Judicial Eletrônico
- Citação eletrônica
- Correio com aviso de recebimento
- Oficial de justiça
- Edital
- Carga dos autos físicos
- Comunicação por outros meios legalmente previstos
- Regras de peticionamento eletrônico
- Indisponibilidade de sistemas

Diferencie o suporte físico ou eletrônico dos autos do meio efetivo de comunicação.

### 5.3. Regras de contagem

O motor deverá suportar, quando juridicamente aplicáveis:

- Dias úteis
- Dias corridos
- Horas
- Meses
- Anos
- Exclusão do dia inicial
- Inclusão do dia final
- Identificação do termo inicial
- Início da contagem
- Prorrogação do vencimento
- Feriados nacionais
- Feriados estaduais
- Feriados municipais
- Feriados forenses
- Recesso judicial
- Suspensão dos prazos
- Interrupção dos prazos
- Indisponibilidades de sistemas
- Prazos em dobro
- Prazos diferenciados
- Regras para eventos especiais

Não generalize a contagem em dias úteis para todos os regimes.

Diferencie suspensão, interrupção, prorrogação e adiamento do início da contagem.

### 5.4. Calendários judiciais

Criar um subsistema de calendários forenses considerando:

- Tribunal
- Unidade federativa
- Município
- Comarca ou foro
- Unidade judiciária, quando necessário
- Ano
- Feriados
- Suspensões
- Expediente forense
- Indisponibilidades comprovadas
- Atos normativos
- Histórico de alterações

Nenhum feriado presumido deve ser apresentado como dado oficial validado.

A origem de cada evento de calendário deve ser armazenada.

---

## 6. Arquitetura técnica

Adote inicialmente a seguinte stack, reavaliando-a apenas mediante justificativa técnica documentada.

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI

Formulários:
- React Hook Form
- Zod

Backend:
- Next.js Server Functions ou Route Handlers para o MVP
- NestJS apenas se a separação de serviços se justificar

Banco de dados:
- PostgreSQL
- Drizzle ORM

Datas:
- Temporal API com polyfill, quando necessário
- Alternativamente, date-fns com tratamento explícito de fuso horário

Testes:
- Vitest
- Playwright
- axe-core
- Testes de integração
- Testes baseados em propriedades, quando pertinentes

Qualidade:
- ESLint
- Prettier
- TypeScript Strict Mode
- GitHub Actions

Segurança:
- OWASP ASVS
- Validação no servidor
- Controle de acesso
- Proteção contra vulnerabilidades comuns
- Auditoria de dependências

Infraestrutura:
- pnpm
- Monorepo, se a separação entre pacotes justificar
- Docker para desenvolvimento
- Deploy compatível com Vercel ou infraestrutura containerizada

Priorize uma arquitetura modular, compreensível e testável. Evite complexidade distribuída desnecessária.

---

## 7. Motor jurídico independente

Implemente o cálculo em um módulo próprio, desacoplado de React, Next.js, banco de dados e chamadas de rede.

O motor deverá receber entradas tipadas e retornar resultados determinísticos.

Entradas esperadas:

- Regime processual
- Tribunal
- Localidade
- Tipo de evento
- Meio de comunicação
- Data e hora relevantes
- Fuso horário aplicável
- Quantidade e unidade do prazo
- Regra jurídica selecionada
- Calendário forense
- Exceções e prerrogativas aplicáveis
- Versões das regras e dos calendários

Saídas esperadas:

- Evento original
- Marco inicial juridicamente relevante
- Primeiro dia computado
- Dias computados
- Dias excluídos
- Suspensões aplicadas
- Vencimento
- Fundamentos legais
- Fontes
- Versões das regras
- Versões do calendário
- Avisos e pendências
- Memória detalhada de cálculo

O sistema deve distinguir:

1. Data em que um evento ocorreu.
2. Data juridicamente considerada para a comunicação.
3. Termo inicial previsto na norma.
4. Primeiro dia efetivamente computado.
5. Data final do prazo.
6. Eventual prorrogação de vencimento.

Nunca confunda esses conceitos.

Não utilize modelos de linguagem para decidir o vencimento final. O cálculo deve ocorrer em código determinístico.

Se os dados forem insuficientes, retorne um estado de cálculo incompleto, sem fabricar uma data.

---

## 8. Criação de skills jurídicas próprias

Crie as seguintes skills locais:

### brazilian-procedural-law

Responsável por:

- Pesquisa normativa
- Validação das fontes
- Classificação dos regimes
- Identificação de regras especiais
- Registro de vigência e alterações

### procedural-deadline-engine

Responsável por:

- Modelagem de algoritmos de cálculo
- Implementação de regras
- Tratamento de termos iniciais
- Contagem
- Prorrogações e suspensões
- Resultado determinístico

### judicial-calendar

Responsável por:

- Calendários judiciais
- Feriados
- Suspensões
- Indisponibilidades
- Versionamento
- Proveniência das informações

### legal-calculation-audit

Responsável por:

- Memória de cálculo
- Rastreabilidade
- Comparação com casos de referência
- Identificação de divergências
- Geração de evidências de teste
- Verificação de regressões

Cada skill deverá possuir um `SKILL.md` com:

- Nome
- Descrição
- Condições de ativação
- Responsabilidades
- Limites
- Referências
- Procedimento
- Critérios de qualidade
- Formato de saída

Organize as skills de forma compatível com o padrão suportado pelo Codex.

---

## 9. Modelagem de dados

Projete entidades para:

- User
- Organization
- Court
- CourtUnit
- JudicialCalendar
- CalendarEvent
- CalendarSource
- LegalSource
- LegalRule
- LegalRuleVersion
- ProceduralEvent
- DeadlineCalculation
- CalculationTrace
- CalculationAudit
- SavedCase
- NotificationPreference

Justifique a necessidade das entidades antes de implementá-las.

Separe dados normativos, dados fornecidos pelo usuário e resultados calculados.

Garanta a reprodução de cálculos históricos mesmo após atualizações de normas e calendários.

Não sobrescreva silenciosamente versões antigas utilizadas em resultados anteriores.

---

## 10. Design e experiência do usuário

Utilize UI UX Pro Max como principal referência de design.

A interface deve ser profissional, discreta e orientada a atividades jurídicas.

Prioridades:

1. Clareza
2. Precisão
3. Hierarquia da informação
4. Acessibilidade
5. Legibilidade
6. Consistência
7. Velocidade de interação
8. Responsividade

Evite efeitos visuais desnecessários, animações excessivas e dashboards decorativos.

### Telas previstas

- Página inicial
- Calculadora de prazos
- Resultado detalhado
- Linha do tempo do cálculo
- Calendário judicial
- Histórico de cálculos
- Consulta de regras jurídicas
- Detalhes das fontes normativas
- Configurações
- Administração de calendários e regras

### Calculadora

Organize o formulário por etapas lógicas.

Exiba os campos condicionais conforme regime, tipo de processo e meio de comunicação.

Não solicite dados irrelevantes.

Apresente explicações acessíveis para termos jurídicos.

### Resultado

A tela de resultado deve mostrar:

- Data de vencimento, quando validada
- Regra de contagem
- Linha do tempo
- Dias considerados
- Dias desconsiderados
- Eventos de calendário aplicados
- Fundamentação legal
- Avisos
- Data e versão da consulta
- Opção de imprimir
- Opção de exportar a memória de cálculo

Nunca apresente como resultado definitivo um cálculo com informações jurídicas obrigatórias ausentes.

### Acessibilidade

Adote WCAG 2.2 AA como meta.

Implemente:

- Navegação por teclado
- Foco visível
- Contraste adequado
- Mensagens de erro acessíveis
- Labels corretos
- Estados identificáveis sem depender apenas de cores
- Layout responsivo
- Suporte a tecnologias assistivas

---

## 11. Segurança e privacidade

Siga os princípios de segurança por padrão e minimização de dados.

Considere:

- LGPD
- Autenticação segura
- Autorização por usuário e organização
- Separação de dados entre organizações
- Proteção de dados pessoais
- Logs sem informações sensíveis desnecessárias
- Política de retenção
- Exclusão de dados
- HTTPS
- Proteção contra injeções
- Proteção contra XSS
- CSRF quando aplicável
- Rate limiting em endpoints relevantes
- Gerenciamento de secrets
- Auditoria de ações administrativas

Não armazene dados pessoais de processos quando eles não forem necessários para executar o cálculo.

Não implemente integrações judiciais utilizando métodos de acesso não autorizados.

---

## 12. Estratégia de testes

Utilize TDD nas regras de negócio.

Fluxo:

1. Escrever caso de referência.
2. Confirmar a fonte jurídica.
3. Produzir teste inicialmente falho.
4. Implementar comportamento mínimo.
5. Executar o teste.
6. Refatorar sem modificar o resultado esperado.
7. Executar a suíte de regressão.
8. Revisar a implementação.

Casos obrigatórios:

- Prazos iniciados em dias úteis
- Prazos iniciados em fins de semana
- Feriados nacionais
- Feriados locais
- Suspensões
- Interrupções
- Recesso forense
- Indisponibilidade de sistema
- Prazos que atravessam meses ou anos
- Diferentes meios de comunicação
- Intimações físicas
- Intimações eletrônicas
- Eventos com ciência automática
- Regras especiais
- Calendários incompletos
- Mudança de vigência de norma
- Dados inválidos ou ambíguos

Use casos jurídicos revisados como oráculos de teste.

Crie testes de propriedades para invariantes comprovadamente aplicáveis, sem presumir que todos os regimes seguem as mesmas regras.

Os testes da interface não substituem os testes do motor jurídico.

---

## 13. Documentação obrigatória

Mantenha:

- `AGENTS.md`
- `README.md`
- `GLOSSARY.md`
- `docs/requirements.md`
- `docs/architecture.md`
- `docs/legal/sources/`
- `docs/legal/rules/`
- `docs/legal/validation-cases/`
- `docs/architecture/adr/`
- `docs/testing/`
- `docs/security/`
- `docs/api/`
- `design-system/`

Registre as decisões arquiteturais relevantes em ADRs.

Documente explicitamente funcionalidades ainda não implementadas.

O README deve distinguir recursos planejados, implementados e juridicamente validados.

---

## 14. Integração contínua e qualidade

Configure GitHub Actions para:

- Instalação reproduzível das dependências
- Typecheck
- Lint
- Testes unitários
- Testes de integração
- Build
- Testes E2E, conforme ambiente
- Verificação de dependências vulneráveis

Não permita que alterações no motor jurídico sejam integradas se seus testes obrigatórios falharem.

Configure checks obrigatórios para mudanças críticas.

Use commits pequenos, objetivos e rastreáveis.

Nunca faça commits fora do repositório ativo.

Antes de qualquer commit, verifique o diretório atual, a raiz Git e o conjunto de arquivos alterados.

Não execute operações destrutivas sem necessidade.

---

## 15. Organização do trabalho

Utilize este processo:

### Fase 1 — Discovery

- Inspecionar repositório
- Instalar e configurar skills
- Pesquisar fontes oficiais
- Identificar requisitos
- Definir escopo do MVP
- Criar glossário

### Fase 2 — Specification

- Criar especificações funcionais
- Criar especificações não funcionais
- Construir modelo de domínio
- Registrar decisões arquiteturais
- Definir contratos do motor de cálculo
- Criar backlog

### Fase 3 — Design

- Desenvolver design system
- Criar protótipos
- Validar fluxo da calculadora
- Projetar estados de erro
- Projetar memória de cálculo

### Fase 4 — Core Engine

- Implementar tipos do domínio
- Implementar calendário
- Implementar seleção de regras
- Implementar contagem civil do MVP
- Criar rastreabilidade
- Criar testes jurídicos

### Fase 5 — Application

- Implementar API
- Persistência
- Interface
- Histórico
- Exportação
- Controle de acesso, quando necessário

### Fase 6 — Validation

- Testes automatizados
- Revisão de segurança
- Revisão de acessibilidade
- Revisão arquitetural
- Validação jurídica dos casos de referência
- Correção de falhas

### Fase 7 — Delivery

- Configuração de produção
- CI/CD
- Observabilidade
- Documentação de implantação
- Relatório de limitações
- Plano de expansão

---

## 16. Critérios de aceitação

Uma funcionalidade só poderá ser considerada concluída quando:

- Estiver implementada.
- Estiver tipada.
- Tiver testes pertinentes.
- Passar nas verificações automatizadas.
- Estiver documentada.
- Seguir os padrões arquiteturais.
- Não introduzir problemas conhecidos de segurança.
- Possuir estados de erro adequados.
- Preservar acessibilidade e responsividade quando houver interface.
- Possuir rastreabilidade jurídica quando afetar cálculo de prazos.

A aprovação técnica não representa validação jurídica. Regras relevantes devem ser revisadas por profissional habilitado antes de utilização operacional confiável.

---

## 17. Regras de execução para o Codex

- Primeiro examine o que existe no repositório.
- Não sobrescreva arquivos existentes sem avaliar seu conteúdo.
- Não recrie funcionalidades já implementadas.
- Não invente resultados de testes.
- Não afirme ter instalado ou executado algo sem verificar.
- Não introduza dependências sem justificativa.
- Não utilize abstrações complexas quando soluções simples forem suficientes.
- Não misture lógica jurídica com componentes visuais.
- Não realize grandes implementações sem critérios de aceitação.
- Não implemente regras jurídicas sem fontes verificáveis.
- Não assuma que a data fornecida pelo usuário corresponde ao termo inicial.
- Não assuma que todos os feriados nacionais suspendem todos os tipos de prazo.
- Não considere calendários forenses completos sem validação.
- Não exponha dados jurídicos sensíveis em serviços externos desnecessários.
- Não use agentes paralelos modificando os mesmos arquivos.
- Utilize ferramentas e subagentes especializados quando houver ganho real e o ambiente suportar.
- Execute verificações após cada alteração importante.
- Registre bloqueios e incertezas.
- Prefira implementação vertical incremental em vez de gerar todo o sistema de uma vez.

---

## 18. Primeira execução

Execute imediatamente as seguintes atividades:

1. Inspecione o ambiente e a estrutura do repositório.
2. Verifique as instalações das skills e configure as que forem compatíveis.
3. Pesquise e organize as fontes jurídicas oficiais necessárias ao MVP.
4. Modele o domínio.
5. Defina a arquitetura.
6. Gere as especificações.
7. Crie as quatro skills jurídicas internas.
8. Configure o design system.
9. Estruture o projeto.
10. Crie o backlog de implementação.
11. Implemente a primeira fatia vertical do MVP, começando por um caso de contagem civil com fonte e teste de referência validados.
12. Execute os testes e registre os resultados reais.

Não tente implementar todos os ramos processuais na primeira entrega.

Se não houver acesso a fontes oficiais atualizadas, não invente regras: documente a pendência e limite a implementação às regras efetivamente verificadas.

Ao final, apresente:

- Estrutura criada
- Skills configuradas
- Documentação gerada
- Decisões arquiteturais
- Funcionalidades implementadas
- Testes executados
- Questões jurídicas pendentes
- Próximas tarefas priorizadas

**Princípio central: a precisão jurídica e a auditabilidade do cálculo têm prioridade sobre a quantidade de funcionalidades e a sofisticação visual.**