# Aceite da entrega acadêmica — estado vigente

Atualizado: 24/10/2026. Estado: **aplicativo publicado; verificação técnica e aceites humanos identificados separadamente**. Recorte: perfis demonstrativos civil/criminal TJSP nas dez comarcas cadastradas, 2026, e trabalhista TRT-2 Capital, 2026–2027, DJEN e contextos suportados. Este aceite técnico não é autorização para uso jurídico profissional nem comprovação de avaliação com participantes. Publicação dos perfis/feedback em 3e16db6 com CI aprovada: [evidências de 24/10](../testing/release-2026-10-24.md). A melhoria posterior de confirmação do cadastro e o aceite humano de conta estão em [registro próprio](../testing/signup-confirmation-page.md); [roteiro de conferência final](conferencia-final.md).

A [matriz civil anterior de 20/10](aceite-2026-10-20.md) fica preservada como histórico. Contratos: [requisitos](../requirements.md), [perfis](../testing/multi-regime.md), [atos](../legal/rules/procedural-acts-2026-10-22.md), [histórico](../history-organization.md) e [lembretes](../email-reminders-external.md). A [auditoria do objetivo completo](../scope-audit-2026-10-21.md) continua válida para separar expansões desta entrega. Nenhuma pendência é encerrada apenas pela existência de um arquivo.

## Requisitos funcionais

| Requisito | Resultado no recorte | Evidência |
| --- | --- | --- |
| RF01 — comunicação explícita | Publicação/disponibilização DJEN separadas do suporte dos autos; outros meios indisponíveis | Formulário, testes do motor e E2E |
| RF02 — exclusão e contagem | Regras próprias por perfil, marcos, curso/suspensão/prorrogação e condições de contexto | Casos independentes; suíte geral com 256 unitários e 63 E2E aprovados, um omitido |
| RF03 — eventos por âmbito | TJSP nas dez comarcas em 2026; TRT-2 Capital 2026–2027 e componentes anuais | [Civil](../legal/sources/sp-comarcas-2026.md), [criminal](../legal/sources/criminal-sp-comarcas-2026.md) e [trabalhista](../legal/sources/labor-sp-2027.md); cobertura parcial/revisão pendente |
| RF04 — memória conferível | Datas, inclusão/exclusão, motivos, referências por dia e fontes/versões | Memória em tela, exportação e PDF |
| RF05 — lacunas explícitas | Sem vencimento em incompletude; opções limitadas ao catálogo; estado demonstrativo identificado | Travessia, expediente parcial e indisponibilidade |
| RF06 — exportação/impressão | JSON com snapshot, inclusive incompleto; PDF conserva avisos e original selecionado | [PDF e regressão](../testing/export-print.md) |
| RF07 — conta e histórico | E-mail/convite/senha/recuperação, OAuth, identidade SSR e RLS; filtros/paginação e proprietário no servidor | [Integração local anterior](../testing/final-delivery.md), [histórico](../testing/history-organization.md) e revalidação final; aceite humano hospedado ainda identificado abaixo |
| RF08 — calendário/fontes | Consulta por comarca/mês e base normativa; sem painel administrativo anunciado | E2E, fontes e navegação local |
| RF09 — lembretes | Opt-in por cálculo, antecedência/horário/fuso, cancelamento, fila exclusiva, modo local/Brevo, estados de aceite/incerteza | Mailpit real aprovado; Brevo/Cron habilitados após probe autenticado com entrega true; recebimento externo pelo proprietário ainda pendente. [Operação hospedada](../testing/reminders-production.md) |
| Atos — catálogo inicial | Um ato específico por perfil, confirmação de condições e duração no servidor; quantidade manual preservada | [Fontes e casos](../legal/rules/procedural-acts-2026-10-22.md), [testes](../testing/procedural-acts.md); não é catálogo exaustivo |

## Qualidade e plataforma

| Requisito | Resultado / limite |
| --- | --- |
| RNF01 — determinismo | Motor sem rede/React/banco/relógio; entradas e versões controladas; testes de repetição/propriedades |
| RNF02 — datas civis | Temporal e ISO sem hora para contagem; fuso declarado |
| RNF03 — acessibilidade | Desktop/375px, Axe nos fluxos cobertos, foco e mensagens. Auditoria completa, leitor de tela e participantes pendentes |
| RNF04 — segurança | Origem, validação, RLS, cache privado, segredo fora do cliente e headers; [recorte e limites](../security/release-review.md) |
| RNF05 — histórico | Original preservado e não verificado; versão antiga indisponível não é substituída por atual |
| RNF06 — verificações | Tipos, lint, formatação, unitários, audit, build, 63 E2E/um omitido e 146 SQL aprovados; CI application/database aprovada para 5f1d116 e 90be5da. [Evidências hospedadas](../testing/reminders-production.md) |
| RNF07 — Vercel/Supabase | Aplicativo publicado, migrations coincidentes com o Git, preview isolado, credenciais server-only, probe e job habilitados; recebimento/aceite humano têm estado próprio |

## Critérios técnicos cobertos

- [x] App executável localmente, com instalação documentada.
- [x] Conta, recuperação e histórico testados com fixtures reais locais, sem envio externo.
- [x] Títulos, busca e exclusão confirmada, com cancelamento e foco.
- [x] Ajuda e privacidade dentro do aplicativo.
- [x] PDF e JSON demonstrativos com avisos e proveniência.
- [x] Roteiro de apresentação e procedimentos de operação.
- [x] Avanços em commits locais separados.
- [x] Perfis/atos/histórico publicados com verificações da CI e smoke de navegador.
- [x] Cron preparado, probe de produção validado e ativação explícita; aceite do provedor distinto de recebimento.

## Aceites externos ao encerramento técnico

- [ ] Revisão jurídica profissional de regras, casos e cobertura; sem responsável ou aprovação inventados.
- [ ] Conferência exaustiva de atos extraordinários e cobertura parcial; expansões como TJSP 2027 não estão anunciadas como suportadas.
- [ ] Participantes, leitor de tela completo e aparelhos físicos.
- [ ] Responsável/canal de atendimento, retenção, backup/restauração e controles de abuso antes de ampliar operação.
- [x] Publicação autorizada da nova versão, callbacks/template e smoke tests sem sessão.
- [x] Aceite humano no site publicado: proprietário confirmou salvar/recarregar/exportar memória e agendar. Cancelamento do lembrete anterior e novo pending de três dias conferidos: 24/10 às 09h de São Paulo. Recebimento tem aceite separado abaixo.
- [ ] Recebimento de um lembrete solicitado pelo proprietário e conferência do link privado. Ensaio das 09h de 24/10 inconclusivo: cálculo excluído pelo proprietário, sem horário conhecido; repetir mantendo o registro.
- [x] Cadastro externo, recebimento da confirmação, abertura do link e entrada com conta nova confirmados pelo responsável em 24/10, antes da melhoria visual da orientação.
- [x] Recuperação de senha no site confirmada pelo responsável em 24/10.
- [ ] Reensaio externo de convite desta versão; integração local já aprovada, sem registrar senha ou links de Auth.
- [ ] Relatório acadêmico não incluído nesta etapa, cujo foco é aplicativo e materiais de entrega.

Organizações, cadastro completo de processos, administração normativa, outros canais de alerta, juizados e regras especiais são expansão no [backlog](../backlog.md). O relatório do TG e a avaliação com participantes não fazem parte do fechamento técnico do aplicativo. Backups/restauração, retenção institucional e controles de abuso continuam requisitos operacionais antes de ampliar o uso; não foram declarados configurados ou ensaiados sem evidência.
