# Continuação do Prazo Claro

Atualizado: 24/10/2026. Autorização: continuar o trabalho e as melhorias, mantendo o progresso documentado e em commits separados. Etapas local e hospedada registradas separadamente. [Auditoria de cobertura](scope-audit-2026-10-21.md).

## Fechamento da entrega atual

Prioridade confirmada pelo responsável: finalizar aplicativo e materiais de entrega. Referência vigente: [guia da entrega](entrega/README.md) e [matriz atual de aceite](entrega/aceite.md). Os registros históricos abaixo preservam as condições de cada marco; expressões como “somente local” nesses registros não descrevem a publicação atual.

- [x] Publicar perfis parciais civil/criminal TJSP e trabalhista TRT-2 Capital, atos, histórico e exportação; CI e smoke hospedado registrados.
- [x] Instalar migrations, credenciais e agendador inativo com assinaturas de uso único; preservar fila local.
- [x] Ativar lembretes hospedados após confirmação do ajuste no Brevo, deployment READY, probe consumido com entrega true e gate; Cron ativo com execuções automáticas observadas. [Evidências](testing/reminders-production.md).
- [x] Revalidar cadastro/histórico/três perfis/isolamento, convite, recuperação e lembretes locais após iniciar Docker e Next.js; quatro helpers aprovados e fixtures limpas. [Resultados](testing/finalization-2026-10-23.md).
- [x] Aceite humano hospedado de histórico: proprietário confirmou salvar, recarregar, exportar e agendar; fila pending conferida.
- [x] Conferir cancelamento/reagendamento pelo proprietário de um para três dias antes: anterior cancelled, novo pending em 24/10 às 09h de São Paulo.
- [ ] Repetir o aceite de recebimento/vínculo privado: teste das 09h inconclusivo, pois o responsável excluiu o cálculo e não lembra o horário. Proposta de novo opt-in para 24/10 às 18h, mantendo o registro até conferir. [Roteiro](entrega/conferencia-final.md).
- [x] Consolidar instalação, demonstração, operação, limites e matriz de aceite; matriz civil anterior preservada como histórico.
- [x] Retomar commits assinados após autorização de 24/10: evidências hospedadas em c920da8 e consolidação dos materiais em 8a90800.
- [x] Gerar pacote fonte dos materiais em 8a90800, com manifesto, SHA-256 e integridade conferida; sem configuração privada ou backup de banco. Repetir para novos commits; manifesto identifica cada versão.
- [x] Esclarecer localmente na interface que o lembrete chega no horário escolhido; confirmação imediata é exibida no site, sem e-mail adicional. Build, lint, formatação, 256 unitários e oito E2E aprovados. [Resultados](testing/reminder-schedule-feedback.md).
- [x] Publicar a melhoria de feedback: 3e16db6, Vercel production READY, CI application/database aprovada, três cálculos públicos e probe habilitado conferidos. [Evidências de 24/10](testing/release-2026-10-24.md).
- [x] Cadastro/confirmação/entrada da conta nova e recuperação hospedados confirmados pelo responsável em 24/10. [Relato e melhoria](testing/signup-confirmation-page.md).
- [x] Criar orientação dedicada após cadastro em /conta/confirmar-email; mensagem neutra, sem credenciais na URL e PKCE real preservado. Check/build, quatro E2E e integração local aprovados.
- [ ] Ensaiar apresentação conforme [checklist final](entrega/conferencia-final.md). Convite externo tem aceite próprio na matriz; recebimento do lembrete mantém o aceite separado acima.

Revisão jurídica profissional e avaliação com participantes precisam de responsáveis/evidências próprios. Cadastro completo de processos, equipes, administração normativa, novos meios/atos/calendários e relatório do TG ficam fora deste fechamento; permanecem rastreados no backlog. Não anunciar cobertura integral nem operação profissional validada.

## Marco concluído localmente — perfis trabalhista e criminal

- [x] Registrar fontes primárias, vigência, exceções e casos de referência de cada perfil: [trabalhista](legal/rules/labor-djen-research-2026-10-21.md), [calendário TRT-2](legal/sources/labor-sp-2026-research.md) e [criminal](legal/rules/criminal-djen-research-2026-10-21.md).
- [x] Implementar primeira fatia trabalhista: TRT-2, São Paulo Capital, 2026, comunicação pelo DJEN, dias úteis, procedimento comum sem prerrogativa/especialidade.
- [x] Implementar primeira fatia criminal: TJSP, São Paulo Capital, 2026, DJEN, prazo processual em dias, contexto ordinário explicitamente confirmado. Não abrange prazo penal material, réu preso, violência doméstica, urgência ou procedimento especial.
- [x] Impedir combinações incompatíveis de regime, tribunal, localidade e contexto; dúvidas/exceções produzem incompleto sem vencimento.
- [x] Preservar o perfil civil 0.2.0, suas versões e os snapshots existentes.
- [x] Identificar perfil, tipo de contagem, tribunal, fontes e pendências na interface, memória, exportação e histórico.
- [x] Atualizar calendário e base normativa para distinguir os tribunais e a cobertura real de cada perfil.
- [x] Rodar verificações e registrar resultados reais: 114 unitários, 35 E2E aprovados e integração local real de Auth/histórico/isolamento. [Resultados e falhas corrigidas](testing/multi-regime.md). Revisão jurídica continua pendente.
- [x] Atualizar plano, backlog, requisitos, arquitetura, API, ajuda, base normativa e roteiro de demonstração; pesquisa salva em `af692ec` e implementação validada em `34eff0e`.

Fronteiras de teste já adotadas no projeto e mantidas nesta etapa: `calculateDeadline(input,calendar)`/`calculateForMvp(input)` (regra, marcos, sequência e cobertura), Route Handlers (contrato/validação, sem comprovar banco por mock), `historySnapshotSchema` (legibilidade/compatibilidade) e navegador (formulário → API → memória/exportação). Casos esperados são enumerados independentemente; testes de fixture não tornam um calendário oficial completo.

## Histórico dos marcos e da sequência anterior

Publicação concluída em 23/10 para o código `5f1d116`: [PR #1](https://github.com/Eduwilll/TG-KEZIA2/pull/1), CI da PR/master aprovada (**256 unitários, 146 SQL, 63 E2E e um omitido**), três perfis conferidos no site e migrations hospedadas alinhadas às versões Git após autorização específica. Credenciais de produção e Vault configurados com autorização explícita. Job preparado inativo. Probe com entrega false passou após liberar duas origens, mas novo deployment com entrega true revelou um terceiro IP bloqueado; flag/job restaurados a desligados. O responsável escolheu desativar apenas o bloqueio de IP das chaves API no Brevo, preservando SMTP, e avisará quando salvar. **Próxima ação: aguardar essa confirmação, repetir probe, publicar entrega habilitada, validar novo probe e ativar pelo gate; depois opt-in/recebimento pelo proprietário.** [Evidências e operação atual](testing/reminders-production.md). Nenhum e-mail externo enviado nesta etapa. Os marcos locais abaixo preservam seu estado histórico.

Atualização do agendador em 23/10: estrutura SQL/ADR/operação em `173eae8`, job preparado inativo, chamadas HMAC curtas e consumo único. Probe verifica remetente sem claim/envio; ativação exige probe recente consumido e entrega habilitada. **256 unitários, 146 SQL**, checks/build e integração real local aprovados após corrigir POST vazio representado como stream pelo Next.js. [Evidências completas](testing/reminder-scheduler.md). Chave Secret preenchida pelo responsável e aceita em consulta vazia ao projeto correto. Variáveis públicas do Supabase na Vercel foram limitadas a production, retirando acesso de novos previews/development ao banco hospedado. Transferência das credenciais de lembretes recusada pela revisão automática por exigir autorização explícita para os dados/destino; nenhuma variável secreta criada nessa tentativa. Finalizar commits/CI antes da implantação; job/entrega hospedados continuam desativados/não instalados.

Etapa externa iniciada em 23/10: [guia de configuração do Brevo](brevo-setup.md) e `pnpm reminders:check:brevo` preparados em `d6188bc`, diagnóstico SMTP em `4e0d490`. Após troca pela API restrita e liberação da origem pelo responsável, **sandbox real aprovado** em `00991bf`: remetente ativo, HTTP 201 e confirmação válida, sem envio de mensagem/fila. [Fila isolada e 105 SQL](testing/reminder-delivery-modes.md) em `f141b4a`. Adaptador Brevo, consentimento externo, bloqueio de preview e regressão local implementados/verificados: **245 unitários**, build/lint/formatação, **16 E2E afetados** aprovados após corrigir foco, e integração real Mailpit/duas contas/limpeza. [Evidências completas, inclusive a falha inicial da suíte integral](testing/reminders-brevo-adapter.md). Scheduler, configuração de produção e ensaio de recebimento continuam pendentes; este avanço não publica o recurso.

Fatias concluídas: ampliação criminal para as dez comarcas TJSP em 2026 (`27b1982`), [fontes/casos](legal/sources/criminal-sp-comarcas-2026.md) e [138 unitários, 37 E2E e integração real](testing/criminal-sp-expansion.md); TRT-2 Capital 2027 e travessia explícita desde 2026 (`5c5c13a`), [fontes/versões](legal/sources/labor-sp-2027.md), [154 unitários, 39 E2E, PDF A4 e integração real](testing/labor-2027.md). Pesquisa de 2027 e especificação territorial registradas em `6ea4e51`. Permanecem locais, parciais e sem revisão jurídica profissional.

1. Completar e revisar cobertura de SP por tribunal/unidade e ano, inclusive 2027 quando houver fonte e necessidade de travessia.
2. Especificar outras comunicações, atos/presets e prerrogativas por perfil; depois juizados separados.
3. Cadastro mínimo de processos e associação de cálculos, com política de dados definida.
4. Organização do histórico implementada e verificada localmente em 23/10: filtro por regime, paginação e situação do vencimento na aplicação, mantendo relógio fora do motor. [Contrato](history-organization.md) e [evidências](testing/history-organization.md).
5. Lembretes opcionais locais concluídos em 23/10, com ativação/cancelamento, fila e mensagem Mailpit verificadas; entrega externa e scheduler hospedado continuam como etapa própria, conforme critérios abaixo.
6. Configurações de conta e administração de versões com seus aceites próprios.
7. Ensaios externos de Auth, preview isolado, promoção condicionada a checks, monitoramento e restauração de backup.
8. Relatório TG e avaliação com participantes com evidências reais.

Não expandir automaticamente todos esses itens no mesmo marco. Ao encerrar uma sessão, registrar aqui o que foi efetivamente concluído, comandos/resultados, commit e próxima tarefa concreta. O estado detalhado do produto continua na auditoria e no backlog; esta página orienta a retomada.

## Lembretes de prazo por e-mail — planejado

Adicionado em 22/10/2026 por solicitação do responsável. Objetivo: o usuário receber lembretes antes do vencimento de uma simulação salva. A primeira fatia foi implementada e verificada **somente localmente** em 23/10; entrega externa e operação hospedada permanecem planejadas. Mantém-se o título desta seção para preservar links anteriores.

Concluído localmente em 23/10: [contrato](email-reminders.md)/ADR em `0551e31`; fila/RPCs/migration em `2777d21`, reproduzida sem diferença e sem reset do banco em uso. API/controles/dispatcher, duas contas, envio único ao Mailpit, link privado e limpeza aprovados; **224 unitários, 77 SQL e 61 E2E**. [Evidências e limites](testing/email-reminders.md). Nenhum envio externo ou scheduler remoto configurado. Opções: 3/1/0 dias corridos, 09h/12h/18h e fuso fixo de São Paulo. Watcher local precisa estar ativo.

- Ativação opcional por cálculo salvo, somente pelo proprietário autenticado, com envio ao e-mail confirmado da própria conta. Permitir consultar os lembretes ativos e desativar um lembrete ou todos os envios.
- Antecedência configurável, com opções iniciais propostas de **3 dias antes, 1 dia antes e no dia**, além de horário e fuso identificados; padrão proposto `America/Sao_Paulo`. Especificar que a antecedência usa dias corridos de calendário, separada da contagem processual do motor. Opções e horário serão refinados na especificação da implementação.
- Agendar somente cálculos com vencimento definido e futuro. Não emitir lembrete de resultado incompleto nem disparar retroativamente horários já passados. Usar a data e as versões do snapshot salvo; nova regra/calendário não altera silenciosamente o compromisso. Se o usuário substituir o prazo por novo cálculo, cancelar/reagendar mediante ação explícita.
- E-mail com identificação mínima do cálculo, vencimento, antecedência e link autenticado para a memória. Preservar indicação de estimativa/calendário parcial/revisão pendente. Não incluir partes, documentos, número processual real, senha ou token de sessão; conferir necessidade de expor o título informado pelo usuário.
- Agendamento e envio executados no servidor, com relógio fora do motor determinístico, autorização por proprietário, prevenção de duplicatas, tentativas limitadas e registro mínimo de pendência, envio e falha. Revalidar ativação, destinatário e existência do cálculo antes de enviar. Exclusão do cálculo/conta ou desativação cancela envios pendentes. Mensagem aceita pelo provedor não deve aparecer como entrega confirmada sem evidência correspondente.
- Definir o serviço de envio da aplicação e seus limites antes de implementar; a configuração de e-mail de autenticação existente não conclui este recurso. Validar primeiro localmente com Mailpit e dados fictícios, depois ensaiar entrega externa controlada como etapa própria.
- Aceite: testes de antecedência, horário/fuso, prazo incompleto/vencido, propriedade, desativação/exclusão, duplicidade, repetição do agendador e falha do provedor; fluxo UI → agendamento → e-mail local → memória privada. Registrar resultados reais em `docs/testing/`. Cadastro completo de processos não é dependência obrigatória da primeira fatia: o histórico privado pode identificar o cálculo lembrado.

## Registro histórico — retomada anterior à publicação de 23/10

- Aplicação local em `http://127.0.0.1:3000`; build validado. Publicação hospedada ainda é a versão civil anterior.
- Catálogo inicial concluído localmente: apelação civil (15 úteis), recurso ordinário de decisão da Vara do Trabalho (8 úteis) e declaração da sentença penal (2 processuais, curso contínuo após início útil). Seleção/declaração opcional com duração fixa, validação no servidor, bloqueios e ficha/fontes na memória, JSON, impressão e histórico. Quantidade manual, calendários e contagens anteriores preservados. [Pesquisa](legal/rules/procedural-acts-2026-10-22.md) registrada em `e225182`; implementação em `ed705ce`; [175 unitários, 47 E2E, build/check, integração local real e PDF de duas páginas](testing/procedural-acts.md). Catálogo parcial, com revisão jurídica pendente.
- Histórico organizado localmente em 23/10: filtro por regime antes do intervalo/contagem, páginas de 10/20/50, situação pelo vencimento original e data de referência em São Paulo, busca textual somente na página, atualização e recuperação após exclusão. Contrato em `70a12c6`, implementação/evidências em `ed466cf`; [192 unitários, 55 E2E aprovados e integração real com duas contas](testing/history-organization.md). Motor, snapshots, grants e RLS preservados; sem nova publicação.
- Lembretes opcionais locais concluídos: contrato `0551e31`, fila `2777d21`, app/envio/evidências `eea7ca6`; [224 unitários, 77 SQL, 61 E2E e Mailpit real](testing/email-reminders.md). UI de opt-in/cancelamento, versões originais, processamento exclusivo e tratamento de incerteza preservados; dados fictícios limpos. [Como executar o watcher](email-reminders.md#executar-localmente).
- Próxima tarefa concreta: **preparar e verificar o agendamento hospedado**, começando inativo. Supabase hospedado tem Vault instalado; pg_cron/pg_net não estão instalados. Usar chamada ao dispatcher com segredo no Vault, observar resultado HTTP (execução SQL bem-sucedida não prova envio), limites/cotas atuais e procedimento de desativação. Depois aplicar migrations/configuração de produção, conferir origem/IP do Brevo e publicar com habilitação controlada; ensaio de recebimento por opt-in do proprietário. Não promover a fila local nem copiar suas credenciais. [Contrato](email-reminders-external.md). Outras comunicações e ampliação de atos exigem fichas próprias; TJSP 2027 não localizado na pesquisa registrada e TRT-15 não habilitado.
- Permanecem pendentes: revisão jurídica por responsável habilitado, calendários completos, juizados, comunicações/prerrogativas especiais, cadastro de processos/alertas/equipes e controles operacionais do backlog.
- Para demonstrar agora, seguir a seção de perfis locais do [roteiro](entrega/demonstracao.md). Não usar processos reais nem interpretar a estimativa como aprovação jurídica.
