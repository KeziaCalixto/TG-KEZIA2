# Requisitos e recorte da primeira entrega

Base: master prompt e requisito adicional Vercel + Supabase, preservados neste diretório. Prioridade informada pelo usuário: TJSP — São Paulo. A primeira localidade é a Comarca de São Paulo (Capital); especificidades de foro e unidade permanecem pendentes de levantamento. Este documento define o contrato de aceitação; evidências de execução pertencem a `docs/testing/` e o estado de implantação ao README.

Estado consolidado em 23/10: [guia da entrega](entrega/README.md) e [matriz vigente](entrega/aceite.md). Os registros de continuação abaixo conservam a ordem histórica dos contratos; o site atual já inclui os três perfis e histórico organizado. A cobertura de cada perfil e os aceites locais/hospedados não são intercambiáveis. O fechamento acordado é aplicativo e materiais, mantendo o objetivo completo dos originais no backlog.

**Limite deste contrato:** os requisitos abaixo especificam a primeira fatia civil; não substituem todas as metas dos originais. A [auditoria de 21/10](scope-audit-2026-10-21.md) rastreia regimes e funcionalidades ainda ausentes ou parciais. A primeira entrega publicada não encerra o sistema completo.

Ampliação autorizada em 20/10/2026: outras comarcas de SP, mantendo desenvolvimento local nesta etapa. Primeira ampliação: Capital, Campinas, Guarulhos, Osasco, Ribeirão Preto, Santo André, Santos, São Bernardo do Campo, São José dos Campos e Sorocaba. Seleção explícita; fontes e limites na [ficha de cobertura](legal/sources/sp-comarcas-2026.md). Não se presume suporte a todas as comarcas de SP.

## Objetivo

Continuação autorizada em 21/10/2026: novos perfis locais trabalhista (TRT-2 Capital) e criminal (TJSP Capital), DJEN e prazos processuais em dias, com contextos ordinários explicitamente confirmados e bloqueio de exceções. A primeira fatia civil abaixo permanece como contrato histórico preservado; os novos aceites/casos estão no [plano ativo](continuation-plan.md), nas fichas jurídicas e em [multi-regime](testing/multi-regime.md). O alcance territorial não foi ampliado para todo o Estado nem há revisão jurídica concluída.

Permitir estudar e conferir uma contagem civil explicável com indicação da regra e do calendário usados. A qualidade jurídica é separada da qualidade técnica. A primeira fatia é demonstrativa enquanto a cobertura do calendário ou a revisão profissional não estiver concluída.

## Fluxo da primeira fatia

Continuação de 22/10: TRT-2 Capital com calendário demonstrativo de 2027 e composição explícita para travessia desde 2026, preservando a seleção anterior quando suficiente. [Aceites por ano, fontes e compatibilidade](legal/sources/labor-sp-2027.md). Não amplia TJSP para 2027, TRT-15, outras localidades ou contextos excepcionais. Os registros acima descrevem a sequência histórica dos marcos.

Ampliação local subsequente: criminal TJSP nas dez comarcas já cadastradas para o civil, município sede, ainda em 2026. [Aceites e fontes próprios](legal/sources/criminal-sp-comarcas-2026.md). Trabalhista permanece TRT-2 Capital. A [pesquisa de 2027](legal/sources/calendar-2027-research.md) encontrou ato TRT-2, porém essa cobertura não foi implementada neste marco. A primeira versão criminal da Capital e o civil permanecem preservados.

1. Informar meio de comunicação suportado, data pertinente e quantidade inteira positiva de dias processuais.
2. Selecionar explicitamente a regra civil e o calendário versionado da comarca TJSP cadastrada.
3. Validar entradas e compatibilidade de âmbito/cobertura antes de calcular.
4. Determinar os marcos de comunicação e início, contar em dias úteis e registrar cada inclusão/exclusão.
5. Mostrar resultado demonstrativo ou incompleto, fundamentos e pendências; oferecer impressão e exportação da memória.
6. Quando Supabase estiver configurado e houver sessão válida, permitir persistência e consulta do histórico privado. Falta de configuração deve produzir estado compreensível.

## Requisitos funcionais

Continuação local de 22/10 — catálogo inicial de atos: escolha opcional de apelação civil (CPC 1.003, § 5º/1.009, 15 úteis), recurso ordinário contra decisão de Vara do Trabalho (CLT 895, I, 8 úteis) e declaração da sentença penal de primeiro grau (CPP 382, 2 processuais, curso contínuo após início útil). [Pesquisa, vigência, condições e casos independentes](legal/rules/procedural-acts-2026-10-22.md). Suporte territorial/temporal permanece o de cada perfil; catálogo parcial com revisão jurídica pendente.

Aceites do catálogo: confirmação específica inicialmente desconhecida; ciência anterior, audiência, comunicação pessoal e hipóteses excluídas não são convertidas em novo marco pelo DJEN. Verificar ID/versão, ramo e duração no servidor; inconsistência deixa vencimento nulo. A duração fixa fica somente para leitura, e quantidade manual continua disponível sem carregar a identificação/declaração do ato anterior. Memória, exportação, impressão e histórico preservam ato/versionamento/condições/fontes separadamente da contagem e calendário. Memórias antigas continuam legíveis. Não decidir admissibilidade, protocolo ou efeitos em outro prazo.

| ID | Comportamento e aceite |
| --- | --- |
| RF01 | Separar disponibilização, publicação já conhecida e juntada de AR/mandado. Labels indicam a data exigida; um campo genérico de intimação não substitui esses conceitos. |
| RF02 | Na regra civil selecionada, excluir o dia do começo e contar somente dias computáveis conforme fonte e calendário; distinguir o primeiro dia efetivamente computado. |
| RF03 | Aplicar eventos versionados por âmbito; apresentar fonte, natureza e motivo dos dias excluídos. Uma data móvel calculada matematicamente não comprova sua suspensão local. |
| RF04 | Exibir evento original, comunicação considerada, termo inicial, primeiro dia computado, dias contados/excluídos e vencimento quando possível. |
| RF05 | Tratar calendário fora da cobertura, regra incompatível e entrada inválida sem inventar vencimento. Um calendário de demonstração dentro da cobertura deve manter aviso em todo resultado. |
| RF06 | Exportar memória com entrada, resultado, trilha, fontes, versões, estado de revisão e pendências. Impressão deve manter esses elementos. |
| RF07 | Autenticar pelo Supabase Auth e verificar identidade no servidor; salvar/listar cálculos do usuário com RLS. Aceite exige execução real com duas identidades e tentativa anônima. |
| RF08 | Consultar calendário e regras/fontes da fatia suportada. Não apresentar consulta como painel de administração funcional. |
| RF09 / continuação local | Permitir ativação explícita de um lembrete por cálculo elegível, e-mail confirmado da própria conta, antecedência em dias corridos e horário/fuso identificados. Cancelar um ou todos, preservar memória/versões e distinguir aceite de entrega. Ensaiar fila, duplicidade, falhas e link privado somente no Mailpit local; entrega externa e scheduler hospedado exigem etapa própria. [Contrato](email-reminders.md). |

Continuação externa de RF09 em 23/10: [contrato incremental](email-reminders-external.md), com modo de entrega persistido sem promover legados, consentimento específico para envio real, modo escolhido pelo servidor, preview bloqueado e adaptador Brevo com confirmação de aceite distinta de entrega. [Sandbox real](testing/brevo-preparation.md) e [isolamento SQL local](testing/reminder-delivery-modes.md) têm evidências próprias; scheduler/recebimento hospedados ainda não concluídos.

## Requisitos não funcionais

Histórico organizado (continuação local de 22/10): filtrar todo o ramo no servidor antes da paginação; manter contagem e leitura sob o proprietário, com ordem estável e limites de consulta. Busca textual identificada como local à página. Mostrar situação comparativa do vencimento original (futuro, hoje, passado ou indeterminado), referência e fuso de São Paulo; relógio fora do motor e ausência de alegação de cumprimento do ato. Atualização manual/ao voltar foco, erros, ausência de resultados, requisição antiga e exclusão da última página com foco acessível fazem parte do aceite. [Contrato detalhado](history-organization.md).

| ID | Critério |
| --- | --- |
| RNF01 | Mesmo conjunto de entradas, regras e calendário produz o mesmo resultado; motor sem rede, banco ou dependência do horário atual. |
| RNF02 | Datas civis usam representação sem hora; eventuais instantes mantêm fuso explícito `America/Sao_Paulo`. Conversão para UTC não pode deslocar uma data civil. |
| RNF03 | Interface responsiva em pt-BR com WCAG 2.2 AA como meta: teclado, labels, foco, erros associados e estados além de cores; evidência automatizada e revisão manual são complementares. |
| RNF04 | Validar no servidor; RLS em tabelas expostas; separar credenciais de desenvolvimento, preview e produção; minimizar dados pessoais. |
| RNF05 | Preservar versões históricas e snapshots suficientes para reprodução, incluindo calendário e regra efetivamente usados. |
| RNF06 | CI com tipos, lint, testes, build, auditoria de dependências, verificação de migrations e E2E conforme ambiente. Checks de produção só se consideram protegidos após configuração e verificação remotas. |
| RNF07 | Vercel hospeda Next.js; Supabase fornece PostgreSQL/Auth/RLS e migrations. Integração exige funcionamento observado, não somente arquivos/variáveis. |

## Limites explícitos

Na primeira fatia civil, os demais ramos e unidades ficaram adiados. A continuação local de 21/10 acrescenta somente os perfis ordinários trabalhista TRT-2 Capital e criminal TJSP Capital descritos acima. Juizados, outras localidades dos novos perfis, horas, meses, anos, dobro, pluralidade de réus, ciência automática, Domicílio Judicial Eletrônico, citação eletrônica, efeitos de indisponibilidade/interrupção e procedimentos especiais continuam pendentes. Não existe modo genérico de dias corridos intercambiável entre ramos. A publicação em diário não equivale à intimação pessoal eletrônica.

Cadastro completo de processos, organizações, entrega externa de notificações de vencimento, administração remota de regras/calendários, arquivos em Storage, Realtime e modo offline ficam no backlog. A continuação de 23/10 acrescenta somente a primeira fatia local de lembretes opcionais, conforme RF09 e seu contrato. Google OAuth foi implementado e validado na demonstração hospedada; recuperação por e-mail e histórico legível integram a etapa local de 20/10/2026. Login sem confirmação de e-mail é uma sugestão de `note.txt`, não critério para relaxar a segurança do Auth.

## Portões de aceitação

- Técnico: implementação tipada, testes pertinentes executados, build e verificações aprovados, documentação e erros acessíveis.
- Jurídico: fonte primária, âmbito e vigência registrados; calendário conferido no período e unidade; casos revisados por profissional identificado. Consulta à legislação não equivale à conclusão dessa revisão.
- Integração: migrations aplicadas em ambiente isolado, Auth real, testes de isolamento com duas contas, preview acessível e configuração de ambientes verificada.

Nenhum portão está aprovado apenas pela existência deste documento. Ver pendências em `backlog.md`.
