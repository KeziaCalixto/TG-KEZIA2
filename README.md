# Prazo Claro

**Entrega acadêmica de 23/10:** perfis parciais civil, trabalhista e criminal de SP, atos e histórico organizado no [site](https://tg-kezia2.vercel.app). **256 unitários, 146 SQL e 63 E2E** aprovados na CI, com um cenário omitido. Lembretes Brevo habilitados e Cron ativo após diagnóstico de produção; o recebimento pelo proprietário ainda precisa ser confirmado. [Guia da entrega](docs/entrega/README.md), [aceite vigente](docs/entrega/aceite.md), [evidências hospedadas](docs/testing/reminders-production.md) e [operação](docs/reminder-scheduler-operations.md).

**Atualização publicada em 24/10:** feedback do lembrete esclarece confirmação no site e envio no horário escolhido; 3e16db6 production READY e CI completa aprovada. [Publicação e verificações](docs/testing/release-2026-10-24.md). Restam os aceites humanos do [checklist final](docs/entrega/conferencia-final.md), incluindo recebimento/link do lembrete marcado para 09h de São Paulo. Revisão jurídica, avaliação e relatório têm estados próprios.

Histórico organizado localmente em 23/10: filtro por regime, paginação no servidor, situação pelo vencimento original estimado e referência em São Paulo. Busca textual somente na página. [Contrato](docs/history-organization.md) e [evidências](docs/testing/history-organization.md).

Catálogo local de 22/10: apelação civil, recurso ordinário de Vara do Trabalho e declaração de sentença penal, com confirmação de condições, duração fixa e fontes/versionamento na memória. Quantidade manual preservada. [Escopo jurídico](docs/legal/rules/procedural-acts-2026-10-22.md); revisão jurídica pendente.

**Entrega acadêmica:** [site publicado](https://tg-kezia2.vercel.app) e [instalação, demonstração, aceite e operação](docs/entrega/README.md). Avanços por marco em [CHANGELOG.md](CHANGELOG.md). A finalização de 20/10 está publicada; [evidências do deploy](docs/testing/final-deployment.md).

**Cobertura do produto:** perfis demonstrativos publicados: civil, trabalhista TRT-2 Capital e criminal nas dez comarcas TJSP cadastradas. O sistema completo permanece parcial: juizados, outras comunicações, demais localidades e gestão continuam pendentes. [Plano de retomada](docs/continuation-plan.md), [evidências dos novos perfis](docs/testing/multi-regime.md) e [auditoria do estado anterior](docs/scope-audit-2026-10-21.md).

TG de contagem de prazos processuais. Civil comum: TJSP, dez comarcas de SP, DJEN e dias úteis. Perfis também publicados: trabalhista TRT-2 Capital em dias úteis e criminal TJSP nas mesmas dez comarcas, com primeiro dia útil, curso contínuo e prorrogação. Calendários parciais de 2026 no TJSP e **2026–2027 no TRT-2 Capital**, com fonte e contexto obrigatório nos novos perfis; [cobertura civil](docs/legal/sources/sp-comarcas-2026.md), [criminal](docs/legal/sources/criminal-sp-comarcas-2026.md), [TRT-2 2026](docs/legal/sources/labor-sp-2026-research.md) e [TRT-2 2027/composição](docs/legal/sources/labor-sp-2027.md).

**Estado jurídico: demonstração acadêmica.** Os calendários têm cobertura parcial e as regras aguardam revisão por profissional do Direito. Datas calculadas aparecem como estimativas; lacunas de cobertura e exceções conhecidas ainda não modeladas produzem resultado incompleto, sem vencimento. Os testes comprovam comportamento técnico sob as premissas registradas, sem certificar tempestividade em processos reais.

## Executar localmente

Marco local mais recente (23/10): **256 unitários, 146 SQL**, checks/build e integração real de lembretes aprovados. [Execuções, correções e limites](docs/testing/reminder-scheduler.md). O marco anterior teve 245 unitários, 105 SQL e 16 E2E afetados; esses e os números dos marcos abaixo são históricos.

TRT-2 2027 e travessia (22/10): **154 unitários, 39 E2E**, build/check e integração real aprovados. [Evidências](docs/testing/labor-2027.md) e [PDF A4 produzido pelo aplicativo](output/pdf/memoria-travessia-trt2-2026-2027.pdf).

Ampliação criminal municipal validada em 21–22/10: **138 unitários, 37 E2E**, build/check e integração local real com memória de Santos. [Evidências e limites](docs/testing/criminal-sp-expansion.md). Os números do primeiro marco abaixo permanecem como registro histórico.

Requisitos: Node.js 22.14+ e pnpm 11.0.8. Na raiz do projeto:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000). A calculadora funciona sem credenciais ou conexão com banco. Clique em **Preencher um exemplo** e depois **Calcular prazo**: publicação em 06/10/2026, cinco dias úteis, estimativa de 14/10/2026 nas premissas da demonstração.

Para conta e histórico, siga [o desenvolvimento local com Supabase](docs/deployment.md). O código usa apenas URL e chave publicável; não exige `service_role`. Sem configuração, a interface informa que conta/histórico estão indisponíveis. Arquivos `.env.local` são ignorados pelo Git.

Supabase local validado em 19/10/2026: migration, 28 testes pgTAP, Auth/RLS com duas identidades e fluxo completo de cadastro, confirmação, sessão e histórico pelo navegador. Veja as [evidências da execução](docs/testing/local-supabase.md). Para repetir a integração com a stack e o aplicativo ativos: `pnpm db:test:auth` e `pnpm db:test:app`.

## Implementado

- Interface responsiva em português, com calculadora, calendário, fontes, conta e histórico.
- Ajuda e privacidade dentro do app; título opcional, busca no histórico e exclusão com confirmação e foco.
- Histórico local com filtro por regime antes da paginação, tamanhos de 10/20/50, atualização e situação pelo vencimento original estimado com data/fuso explícitos. Busca textual considera somente a página carregada.
- Lembretes locais opcionais: 3/1/0 dias corridos, 09h/12h/18h em São Paulo, cancelamento, fila persistida e envio Mailpit com link privado. Configurar com `pnpm reminders:configure:local`, reiniciar o app e manter `pnpm reminders:watch` ativo. Não usa o SMTP do Auth nem envia externamente.
- Motor puro com Temporal: distinção de disponibilização/publicação, exclusão do marco, dias úteis e suspensão de 20/12 a 20/01 inclusive.
- Calendário parcial versionado com fontes, alteração do Dia do Servidor para 30/10/2026 e bloqueios para exceções ainda não interpretadas.
- Memória dia a dia, fundamentos, avisos, snapshot do calendário e versões; exportação JSON e impressão pelo navegador.
- Validação Zod no cliente e no servidor; resultado anterior deixa de aparecer se as entradas mudam.
- Adaptadores Supabase Auth/SSR e histórico privado: sessão verificada no servidor, controle de origem e RLS. Snapshots privados são identificados como não verificados; novas consultas não substituem silenciosamente a memória original.
- Convite administrativo com aceitação em novo navegador, definição de senha e indicação de conta conectada com e-mail no cabeçalho; verificação local com `pnpm db:test:invite`.
- Google OAuth publicado e login confirmado pelo usuário; [evidências](docs/testing/google-login.md).
- Recuperação de senha por e-mail/PKCE e histórico com memória legível na etapa local de 20/10; [verificações e limites](docs/testing/local-finishing.md).
- Migration SQL, testes pgTAP de isolamento e CI/Vercel. A demonstração em [tg-kezia2.vercel.app](https://tg-kezia2.vercel.app) inclui os avanços de 20/10, com callbacks e template de recuperação configurados no Supabase.
- Quatro skills jurídicas locais em `.agents/skills/`, glossário, especificação, ADRs e design system persistido.
- Continuação local de 21/10: trabalhista TRT-2 Capital e criminal em dez comarcas TJSP, calendário e base normativa por perfil, fim nominal/prorrogação, contexto obrigatório e busca por regime/tribunal. Revisão jurídica pendente.

## Verificar

```sh
pnpm check
pnpm audit --audit-level high
pnpm build
pnpm test:e2e
```

Playwright inicia `pnpm start` após o build. No Windows usa o Microsoft Edge instalado; em Linux/CI usa Chromium (`pnpm exec playwright install --with-deps chromium`). O conjunto E2E cobre desktop e viewport de celular; emulação não substitui testes em aparelhos reais. Axe cobre somente critérios automatizáveis de acessibilidade.

`pnpm check` reúne tipos, lint, formatação e testes unitários e também é usado pela CI. Verificação local de 21/10: 114 unitários, 35 E2E aprovados (um PDF duplicado omitido no mobile) e integração real de Auth/histórico/isolamento com os novos perfis. A execução E2E final usou `pnpm test:e2e --workers=1` após timeout isolado na máquina local. [Comandos, falhas corrigidas e limites](docs/testing/multi-regime.md). Os 28 testes SQL e as demais integrações de Auth já tinham sido aprovados na [entrega civil anterior](docs/testing/final-delivery.md); não foram todos reexecutados nesta continuação sem migration.

Resultados observados, falhas corrigidas e limites de execução: [evidências iniciais](docs/testing/results.md), [entrega local](docs/testing/local-finishing.md) e [publicação atual](docs/testing/final-deployment.md).

A auditoria de ferramentas encontrou um alerta em `braces`, sem versão oficial corrigida disponível na consulta. Há [mitigação local testada e exceção específica documentada](docs/security/dependency-mitigation.md), com revisão prevista; isso não equivale à ausência de advisories upstream.

## Estrutura

```text
src/domain/          Motor, contratos e calendário versionado
src/application/     Seleção do recorte/regra/calendário
src/app/             Páginas, Route Handlers e callback de autenticação
src/components/      Formulário, memória, calendário e área de conta
src/lib/supabase/    Clientes SSR, configuração e controles HTTP
supabase/            Configuração local, migration e testes RLS
tests/               Referências do motor, contratos HTTP e Playwright
docs/legal/          Fontes, regras candidatas e casos de referência
.agents/skills/      Quatro skills jurídicas do projeto
design-system/       Design system e adaptação à calculadora
```

## Documentação e TG

- [Leitura crítica do que já foi feito](docs/review-existing-work.md): inconsistências do rascunho, partes preenchidas do PDF e lacunas do relatório.
- [Requisitos e critérios de aceitação](docs/requirements.md), [arquitetura](docs/architecture.md), [glossário](GLOSSARY.md) e [backlog priorizado](docs/backlog.md).
- [Fontes jurídicas](docs/legal/sources/index.md), [regras candidatas](docs/legal/rules/civil-mvp.md), [casos de referência](docs/legal/validation-cases/civil.md).
- [API](docs/api/README.md), [segurança](docs/security/README.md), [implantação](docs/deployment.md) e [skills/referências avaliadas](docs/skills.md).

Os documentos originais fornecidos em `docs/` foram preservados. Não foram inventados resultados de pesquisa com usuários, percentuais de cobertura, validação jurídica, custos, aprovação de banca ou evidências de produção.

## Expansão planejada

Revisão jurídica, demais comarcas, calendário por foro/unidade e 2027 vêm primeiro. Organizações, cadastro de processos, administração normativa, alertas, Domicílio Judicial Eletrônico, demais meios de comunicação, dobro, interrupções, penal, trabalhista e juizados estão no backlog. Nenhum desses recursos é anunciado como funcional nesta versão.
