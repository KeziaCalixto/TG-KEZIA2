# Avanços do Prazo Claro

## 08/11/2026 — portal de documentação e recuperação dos materiais

- Continuação na cópia Documents e no repositório KeziaCalixto/TG-KEZIA2; branch login/prazo. Proposta aprovada e execução pelo workflow Matt Pocock.
- Recuperados 114 arquivos de materiais acadêmicos e aceite posterior, com hashes e sem alteração do código funcional ou migrations. [Lista de recuperação](docs/documentation-portal/recovered-materials.json).
- Portal Docusaurus isolado em website/, com fontes explícitas, manual, engenharia, banco, infraestrutura, base jurídica, evidências e downloads. Build, revisão e publicação têm resultados próprios no registro de testes.
- Publicação Pages confirmada no workflow 42505166931. Corrigida a barra indevida nos links de download, com regressão no HTML e conferência pública de busca, diagramas, PDF, recarga e 11 arquivos da biblioteca.

## 24/10/2026 — aceite do lembrete permanece inconclusivo

- Responsável informou ausência de e-mail e exclusão do cálculo de teste, sem lembrar o horário. Conferência às 13h30: fila vazia, sem invocação de despacho registrada, Cron ativo. Exclusão em cascata explica a remoção da fila, sem provar a causa da ausência de envio.
- [Repetição documentada](docs/entrega/conferencia-final.md) para novo opt-in futuro, mantendo cálculo/lembrete até conferir recebimento e memória. Proposta de 24/10 às 18h ainda depende de agendamento pelo proprietário; nenhum envio, restauração ou alteração de horário foi realizado.
- Publicação anterior da página de cadastro registrada com CI aprovada e versão exata nas [evidências](docs/testing/signup-confirmation-page.md). Alterações deste marco são documentais.

## 24/10/2026 — orientação dedicada após cadastro

- Cadastro aceito abre /conta/confirmar-email, com instruções de confirmação no mesmo navegador, spam e volta ao acesso; mensagem neutra e URL sem dados pessoais. Erro mantém o formulário.
- Responsável confirmou cadastro, confirmação e entrada com conta nova e recuperação hospedada. Novo fluxo validado por teste que falhou antes da implementação, check/build, quatro E2E desktop/celular e cadastro real Supabase/Mailpit com PKCE e limpeza.
- [Evidências e limites](docs/testing/signup-confirmation-page.md). API, template, callback, SMTP e permissões preservados; recebimento do lembrete mantém aceite separado.

## 24/10/2026 — publicação do feedback e fechamento técnico

- Três commits enviados; 3e16db6 publicado em production/READY no domínio canônico. CI application/database aprovada: 256 unitários, 146 SQL e 63 E2E/um omitido.
- Três cálculos públicos conferidos no navegador; histórico anônimo protegido, novo texto no bundle e probe assinado HTTP 200 com entrega habilitada, sem envio.
- [Evidências da publicação](docs/testing/release-2026-10-24.md) e [checklist humano final](docs/entrega/conferencia-final.md). Recebimento do lembrete, reensaio externo de conta e apresentação aguardam responsável; revisão jurídica/relatório/avaliação têm aceites próprios.

## 24/10/2026 — clareza do agendamento e pacote fonte

- Commits assinados retomados: evidências hospedadas em c920da8 e materiais em 8a90800. Pacote fonte dos materiais gerado por commit, com manifesto/SHA-256 e integridade conferida, sem configuração privada.
- Histórico explica que a confirmação aparece no site e o e-mail chega no horário escolhido; estado Agendado identifica a data como envio previsto. Sem alteração da fila, consentimento ou regras.
- Lint, formatação, build, 256 unitários e oito E2E desktop/celular aprovados. Execução inicial do check interrompida no lint foi registrada separadamente. [Resultados e limites](docs/testing/reminder-schedule-feedback.md). Ajuste ainda local; recebimento real continua pendente.

## 23/10/2026 — fechamento dos materiais e revalidação local

- Quatro integrações reais aprovadas após iniciar Docker/Next.js: cadastro/sessão/histórico/isolamento, convite, recuperação e lembrete único no Mailpit. Fixtures limpas; sem mudança de código funcional ou migration.
- Instalação, roteiro com três perfis, operação e matriz de aceite atualizados; matriz civil anterior preservada como histórico. Plano/backlog distinguem o recorte entregue, recebimento externo pendente, revisão jurídica e expansões.
- Conferência de links locais e de valores privados no material aprovada; pacote fonte por commit com manifesto/SHA-256, separado de configuração privada e backup do banco. [Resultados e limites](docs/testing/finalization-2026-10-23.md) e [guia da entrega](docs/entrega/README.md).

## 23/10/2026 — ativação hospedada dos lembretes

- Responsável confirmou o ajuste das chaves API no Brevo, preservando SMTP. Production READY para 90be5da; probe autenticado consumido com HTTP 200 e entrega habilitada. Gate aprovado e Cron ativo, com execuções automáticas observadas.
- Proprietário confirmou salvar/recarregar/exportar e agendar no site; reagendamento conferido: anterior cancelado, novo pending de três dias em 24/10 às 09h de São Paulo. Recebimento/link privado ainda precisam de confirmação.
- [Evidências, horários e limites](docs/testing/reminders-production.md). Diagnóstico e job vazio não comprovam entrega de e-mail.

## 23/10/2026 — publicação dos perfis e preparação hospedada

- `5f1d116` integrado pela [PR #1](https://github.com/Eduwilll/TG-KEZIA2/pull/1); CI da PR e master aprovada: 256 unitários, 146 SQL, 63 E2E e um omitido. Site ampliado publicado e três perfis conferidos no navegador.
- Configuração de preview isolada; credenciais de lembretes somente em production/Vault após autorização explícita. Migrations instaladas sem reset, versões alinhadas ao Git com autorização específica e permissões verificadas.
- Probe assinado sem envio aprovado com entrega false. Novo deployment com entrega true revelou outra origem bloqueada no Brevo; entrega e job restaurados a desligados. Aguardar confirmação do ajuste de IP da API escolhido pelo responsável antes de ativar e ensaiar recebimento.
- [Evidências hospedadas, decisões, resultados e limites](docs/testing/reminders-production.md). Nenhum lembrete real enviado.

## 23/10/2026 — agendamento com assinatura descartável

- Migration e job inativo em `173eae8`, assinatura curta vinculada à operação e nonce consumido uma única vez; segredo permanente fica fora da fila pg_net.
- Probe autenticado sem claim/envio, diagnóstico mínimo e ativação condicionada à configuração habilitada. [Operação e suspensão](docs/reminder-scheduler-operations.md).
- Integração real capturou HTTP 400 no POST vazio do Next.js; regressão falhou antes da correção e passou depois. Fila exclusiva e um único envio Mailpit confirmados com limpeza. Configuração externa recusa chave publicável no campo de servidor.
- 256 unitários, 146 SQL, checks/build e [evidências com limites dos E2E](docs/testing/reminder-scheduler.md). CI/instalação hospedada/credenciais e recebimento externo são aceites separados; não houve nova publicação neste marco.

## 23/10/2026 — adaptador externo e isolamento dos lembretes

- Sandbox Brevo real aprovado em `00991bf`; filas por modo, legados preservados e 105 testes SQL em `f141b4a`.
- Adaptador HTTP Brevo, remetente ativo, conteúdo mínimo, idempotência limitada e possível aceite incerto. Configuração apenas em produção com habilitação explícita; preview bloqueado.
- Consentimento externo próprio, inicialmente desmarcado; tela local antiga não autoriza envio real. Interface distingue aceite de entrega; Ajuda/Privacidade/contratos atualizados.
- 245 unitários, build/checks, 16 E2E afetados e integração real Mailpit/duas contas/limpeza aprovados. Corrigido foco de paginação identificado na suíte integral; [resultados exatos](docs/testing/reminders-brevo-adapter.md). Scheduler, configuração hospedada e recebimento externo ainda pendentes; sem nova publicação.

## 23/10/2026 — preparação da API Brevo

- Guia para criar e guardar a credencial da aplicação, separado do SMTP do Auth, e comando `pnpm reminders:check:brevo` com sandbox obrigatório.
- Verificação de remetente ativo, timeout, URLs fixas e logs mínimos; nenhuma conexão à fila ou envio real neste helper.
- Sintaxe/lint/typecheck/formatação e 224 testes de regressão aprovados; configuração vazia recusada. [Evidências e pendências](docs/testing/brevo-preparation.md). Validação remota aguarda o preenchimento local; adaptador externo e scheduler continuam pendentes.

## 23/10/2026 — lembretes opcionais locais

- Contrato/ADR em `0551e31`; fila privada, RPCs limitadas, RLS e migration reproduzida em `2777d21`. Histórico original e motor preservados.
- Opt-in por cálculo elegível, e-mail confirmado, 3/1/0 dias corridos e 09h/12h/18h em São Paulo. Cancelamento individual/todos, inclusive de outras páginas; exclusão em cascata.
- Claim transacional, token e tentativas limitadas; possível aceite fica incerto, sem reenvio automático. Cancelamento em curso não apaga evidência de aceite.
- Mensagem mínima profissional no Mailpit, retransmissão externa bloqueada, link com ID sob proprietário e script local de execução única/a cada minuto. Ajuda, privacidade e materiais atualizados; configuração restrita a loopback/segredos no servidor.
- 224 unitários, 77 SQL, 61 E2E, build/check e integrações reais aprovados. Duas execuções simultâneas produziram uma mensagem; fixtures limpas. [Evidências e limites](docs/testing/email-reminders.md). Sem publicação, entrega externa ou scheduler remoto; próximos passos no [plano](docs/continuation-plan.md).

## 23/10/2026 — organização do histórico privado

- Filtro civil/trabalhista/criminal e paginação no servidor, com contagens sob o proprietário, ordem estável no empate e recuperação de página esvaziada. Contrato em `70a12c6`.
- Situação futura/hoje/vencida pela data original salva, referência em São Paulo e atualização ao voltar foco ou por botão. Snapshot e motor preservados; sem indicar cumprimento do ato.
- Busca textual explicitamente restrita à página, filtros disponíveis no vazio/erro, cancelamento de requisições antigas e exclusão com total/foco atualizados. Ajuda, privacidade e materiais de demonstração atualizados.
- 192 unitários, 55 E2E e integração real com Supabase local, dados fictícios e duas contas. [Comandos, correções e limites](docs/testing/history-organization.md). Sem migration, alteração de privilégios/RLS ou publicação. Próxima fatia: lembretes opcionais, primeiro no Mailpit local.

## 22/10/2026 — catálogo inicial de atos processuais

- Apelação civil (15 úteis), recurso ordinário de Vara do Trabalho (8 úteis) e declaração da sentença penal (2 processuais), com fontes, condições e exclusões próprias. [Pesquisa](docs/legal/rules/procedural-acts-2026-10-22.md) em `e225182`.
- Escolha opcional e confirmação inicialmente desconhecida; duração fixa validada no servidor. Inconsistência ou dúvida não emite vencimento. Quantidade manual e versões anteriores preservadas.
- Motor de composição 0.4.0 identifica contagem delegada 0.2.0/0.3.0; ficha e fontes do ato acompanham memória, exportação, impressão e histórico, sem migration ou mudança de RLS.
- [Resultados e limites dos testes locais](docs/testing/procedural-acts.md). Sem publicação ou revisão jurídica profissional; lembretes por e-mail continuam planejados.

## 22/10/2026 — planejamento de lembretes por e-mail

- Lembretes de vencimento adicionados ao [plano](docs/continuation-plan.md#lembretes-de-prazo-por-e-mail--planejado) e backlog, com ativação pelo usuário, antecedência configurável e cancelamento.
- Critérios de privacidade, versões do cálculo, deduplicação, falhas e ensaio local/externo registrados. Recurso apenas planejado; nenhum agendamento ou envio criado.

## 22/10/2026 — TRT-2 Capital 2027 e composição entre anos

- Calendário anual de 2027 pela Portaria GP 19/2026; datas extraídas do ato próprio, sem copiar transferências/suspensão extraordinária de 2026.
- Travessia trabalhista com composição contígua que preserva versões, eventos e fontes dos dois anos. Resultados de 2026 já calculáveis mantêm a seleção anterior; motor 0.3.0 preservado.
- Ano na consulta do calendário, cobertura explícita no formulário e componentes visíveis na memória, JSON, impressão e histórico. TJSP continua limitado a 2026.
- 154 unitários, 39 E2E, build/check, integração real e PDF A4 inspecionado. [Evidências](docs/testing/labor-2027.md), [proveniência](docs/legal/sources/labor-sp-2027.md) e [próxima tarefa](docs/continuation-plan.md). Local, parcial e com revisão jurídica pendente.

## 22/10/2026 — expansão criminal municipal local

- Criminal TJSP ampliado para dez comarcas de SP em 2026; calendários municipais e regra de âmbito `.demo.2` nas nove novas localidades. Capital e motor civil preservados.
- Calculadora, calendário, ajuda, base normativa e contratos atualizados; exportação/histórico conservam fontes e versões. Trabalhista não recebe expansão territorial implícita.
- 138 unitários, 37 E2E, build/check e integração real com memória de Santos, isolamento e limpeza. [Evidências](docs/testing/criminal-sp-expansion.md).
- [Pesquisa de 2027](docs/legal/sources/calendar-2027-research.md) e especificação em `6ea4e51`: ato TRT-2 localizado; TJSP ainda sem fonte suficiente na consulta. Continuação local, revisão jurídica pendente.

## 21/10/2026 — continuação local por perfis

- Auditoria do escopo original (`82df885`) e plano/fontes da continuação (`af692ec`), com pendências e critérios separados da entrega civil publicada.
- Perfis ordinários trabalhista TRT-2 Capital e criminal TJSP Capital (`34eff0e`), ambos em DJEN e calendário parcial 2026. Contexto obrigatório, bloqueio de exceções e memória com fontes/versões. Motor civil 0.2.0 preservado; novos perfis 0.3.0.
- Calendário/base normativa por perfil, regras de transferência próprias do TRT-2, fim nominal/prorrogação criminal e leitura/exportação/histórico compatíveis. Busca também encontra regime/tribunal.
- Correção do nome acessível da marca encontrada por Axe; resultado invalidado ao trocar perfil ou contexto. [Evidências e limites](docs/testing/multi-regime.md); [retomada](docs/continuation-plan.md).

Esta continuação permanece local. Revisão jurídica, ampliação de cobertura e nova publicação são etapas próprias.

## 20/10/2026 — publicação da entrega

Os quatro marcos até `ff9d3cc` foram enviados a `master` e publicados na Vercel. Callbacks exatos de recuperação e template/assunto configurados no Supabase, com verificação de cálculo e páginas públicas. [Evidências e aceites externos](docs/testing/final-deployment.md).

## 20/10/2026 — finalização local

Cada marco tem commit próprio; consulte `git log --oneline` para os identificadores completos.

- **Calendários, conta e histórico** (`a424ed9`): dez comarcas de SP com fonte municipal, recuperação por e-mail e histórico original legível; calendário anterior preservado.
- **Exportação e impressão** (`25bc3a4`): memória incompleta exportável sem vencimento, fundamentos por dia, cobertura/revisão no PDF e impressão apenas do registro selecionado.
- **Experiência de entrega** (`2f642e0`): ajuda e privacidade dentro do app, título opcional, busca no histórico e confirmação com cancelamento/foco antes de excluir.
- **Materiais e aceite**: instalação, demonstração, operação, matriz de requisitos e evidências finais reunidas em `docs/entrega/`.

Os marcos foram inicialmente concluídos e verificados localmente; sua publicação posterior está registrada acima. Revisão jurídica e avaliação com participantes permanecem aceites separados.

## Publicação anterior

- `b202109`: Google OAuth com PKCE/SSR; login hospedado confirmado pelo usuário.
- `ed5838a`: orientação de cadastro/convite, mensagens de limite de envio e favicon.
- `acbf37e`: primeira implantação e templates hospedados.
- `f4cfacd`: aceitação de convite, senha e indicador de sessão.
- `2911bd1`: primeira implementação local com Supabase e testes.
