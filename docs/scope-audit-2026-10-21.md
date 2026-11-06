# Auditoria de cobertura do projeto — 21/10/2026

## Resultado

**O MVP civil demonstrativo foi entregue; o sistema completo dos documentos originais ainda está parcialmente implementado.** Trabalhista e penal/criminal estão previstos e não funcionam no aplicativo. A ausência não é só visual: os tipos, o schema HTTP e o motor aceitam exclusivamente `civil`. A descrição de entrega concluída precisa sempre identificar esse recorte.

O [master prompt](MASTER%20PROMPT%20—%20Sistema%20de%20Contagem%20de%20Prazos%20Processuais%20Brasileiros.md), seção 5.1, linhas 223–238, prevê evolução para civil, trabalhista, penal, quatro modalidades de juizados e procedimentos especiais; prioriza civil no MVP. Nas linhas 844–847 determina começar pela primeira fatia civil, sem implementar todos os ramos na primeira entrega. Isso justifica a ordem inicial, mas não encerra os requisitos de destino. A prioridade territorial mais recente do responsável continua sendo SP.

Esta auditoria compara **pedido original → recorte documentado → código/evidência existente**. Não acrescenta interpretação jurídica nem valida novas regras. Documentos originais foram preservados; relatórios datados de testes/deploy continuam sendo registros históricos.

## Fontes e método

- Master prompt completo, seções 1–18, e [requisito adicional Vercel/Supabase](REQUISITO%20ADICIONAL%20OBRIGATÓRIO%20—%20Vercel%20+%20Supabase.md), seções 1–6.
- Nota, documentação jurídica original e PDF: [leitura complementar com páginas/linhas](review-original-documents-2026-10-21.md). Há conflitos e trechos-modelo; não se transportam automaticamente para regras funcionais.
- [Requisitos da primeira fatia](requirements.md), [glossário](../GLOSSARY.md), [arquitetura](architecture.md), ADRs, [backlog](backlog.md), [aceite](entrega/aceite.md), documentação de segurança, fontes e casos civis.
- Inspeção dos arquivos de `src/`, testes, migration SQL e CI; comparação com [verificação final local](testing/final-delivery.md) e [publicação](testing/final-deployment.md).
- Referência de código anterior à auditoria: `46a0359`. Apenas documentação alterada nesta revisão. Nenhuma suíte reexecutada ou nova configuração remota inspecionada; os resultados de testes citados são os já registrados. Comandos de inspeção: `rg --files`, `rg -n`, `Get-Content` com numeração de linhas, `git status` e `git log`.

Estados: **implementado no recorte** não significa revisão jurídica concluída; **parcial** exige ampliação; **ausente** não tem fluxo funcional; **verificação pendente** não permite afirmar conclusão nem ausência de configuração remota sem inspecioná-la.

## Regimes, comunicações e contagem

| ID | Previsto nos originais | Estado encontrado e evidência | O que falta |
| --- | --- | --- | --- |
| D01 | Civil comum — master §5.1 | Implementado no recorte DJEN/dias úteis, com revisão pendente. [Schema](../src/domain/deadlines/schema.ts), [motor](../src/domain/deadlines/calculate.ts). | Revisão jurídica e cobertura de calendário suficiente ao uso pretendido. Não equivale a todos os procedimentos civis. |
| D02 | Trabalhista — master §5.1; nota original | **Ausente**. `regime` é literal `civil` no schema e nos [tipos](../src/domain/deadlines/types.ts). | Perfil próprio, fontes, tribunal/calendário compatível com SP, marcos e exceções especificados, testes e revisão. |
| D03 | Penal/criminal — master §5.1; nota original | **Ausente**. Testes atuais verificam a recusa de `penal`; não calculam esse regime. [Teste](../tests/deadline-engine.test.ts). | Mesmo trabalho específico por perfil, sem reutilizar automaticamente a regra civil ou tratar “corridos” como ramo processual. |
| D04 | Juizados cíveis, criminais, federais e Fazenda Pública — master §5.1 | **Ausentes**, sem perfis independentes. | Especificações e fontes por modalidade, compatibilidade territorial e testes próprios. Não basta acrescentar uma opção “Juizados”. |
| D05 | Procedimentos especiais — master §5.1 | **Ausentes**. | Definir procedimentos, condições de aplicação, fontes e casos antes de habilitar. |
| D06 | Autos físicos e eletrônicos — master §5.2 | **Parcial**. Ambos são selecionáveis no [formulário](../src/components/deadline-calculator.tsx), mas o cálculo suportado continua sendo de diário. | Não anunciar cobertura completa de comunicação física ou todos os sistemas eletrônicos. |
| D07 | Publicação e disponibilização DJEN — master §5.2/§7 | Implementadas com distinção de marcos, ressalvas e bloqueios. | Demais comunicações não são substituídas por esses campos. |
| D08 | Diário impresso, AR, oficial de justiça, edital e carga — master §5.2 | **Ausentes**. `communication` só admite `publication` e `availability`. | Entradas e regras de ocorrência/juntada específicas, testes e revisão. |
| D09 | Intimação pessoal eletrônica, Domicílio, citação e ciência automática — master §5.2/§12 | **Ausentes**. | Perfis de comunicação, datas/instantes e exceções próprias; consulta do usuário e comunicação automática quando aplicáveis. |
| D10 | Dias úteis — master §5.3 | Implementados no perfil civil selecionado. | Não generalizar para os ramos pendentes. |
| D11 | Dias corridos, horas, meses e anos — master §5.3; nota/PDF | **Ausentes**. Entrada aceita apenas quantidade `days`; não há unidade nem modo de contagem selecionável. | Contrato de unidade, instantes/fuso para horas e regras aplicáveis a cada perfil. |
| D12 | Exclusão inicial, primeiro computado e inclusão final — master §5.3/§7 | Implementados no recorte civil, com trilha. | Outros marcos e regimes exigem casos próprios. |
| D13 | Suspensão, prorrogação e interrupção — master §5.3 | **Parcial**. Suspensões cadastradas e exclusões são contadas; interrupção, indisponibilidade e expediente parcial conhecidos interrompem o processamento com resultado incompleto. | Tratamento funcional e explícito de cada efeito; reconhecer e bloquear uma exceção não equivale a calculá-la. |
| D14 | Dobro, prerrogativas e prazos diferenciados — master §5.3/§7 | **Ausentes**. Sem entrada de prerrogativa/condição. | Condições, exclusões, marcos e cálculos específicos. |
| D15 | Presets por ato, como contestação e recurso — nota original | **Ausentes**. Botões 5/10/15/30 são atalhos numéricos; usuário informa a duração. | Especificar o ato, contexto, ramo e fundamento. Preset da nota não é regra jurídica pronta. |
| D16 | Seleção de regra e vigência — master §4/§7 | **Parcial**. Regra civil fixa `RULE_VERSION`, sem catálogo funcional de seleção de perfis por âmbito/vigência. | Seleção determinística de regras compatíveis, critérios de vigência e conflitos; não só ampliar o dropdown. |
| D17 | Instância, classe processual e ato/prazo — documentação original, linhas 173–179; master §10 | **Ausentes** como entradas condicionais. Regime civil e quantidade de dias não identificam essas condições. | Definir quais campos cada perfil realmente requer; distinguir ramo, classe, ato e processo cadastrado. Não acrescentar campos sem efeito especificado. |

## Calendários, memória e telas

| ID | Previsto nos originais | Estado encontrado e evidência | O que falta |
| --- | --- | --- | --- |
| C01 | Calendário por tribunal, UF, município, comarca/foro, unidade e ano — master §5.4 | **Parcial**. Dez comarcas TJSP, 2026; [cobertura declarada](legal/sources/sp-comarcas-2026.md). | Unidades/foros/sistemas, atos supervenientes, demais localidades prioritárias de SP e tribunais dos novos perfis. Limitar-se a SP continua sendo a orientação do responsável. |
| C02 | Feriados/suspensões com fonte e revisão — master §4/§5.4 | Proveniência implementada para os eventos cadastrados; calendário **demonstrativo e incompleto**. | Levantamento exaustivo e revisão identificada; não declarar ausência de evento como expediente confirmado. |
| C03 | Travessia de anos — master §12 | Testes com calendários controlados não ampliam o catálogo publicado: ele termina em 31/12/2026. | Cobertura oficial aplicável a 2027 para emitir resultados que atravessem o ano; hoje resulta em incompleto. |
| C04 | Reprodução histórica com mesmas regras/calendário — master §7/§9 | **Parcial**. Snapshot do calendário e versões preservados; histórico conserva original. [GET history](../src/app/api/history/route.ts) só oferece recálculo quando as versões coincidem com as atuais. | Registro de versões executáveis/definições de regras e reexecução histórica completa. Preservar JSON não é o mesmo que reproduzir qualquer versão. |
| C05 | Resultado, dias, motivos, fontes, versões e avisos — master §7/§10 | Implementados no recorte, com trilha cronológica tabular. [Resultado](../src/components/calculation-result.tsx). | Não há exigência de uma segunda tela gráfica para considerar existente a cronologia já apresentada; aprovação jurídica continua separada. |
| C06 | Data e versão da consulta — master §10 | **Parcial**. Versões/data de consulta do calendário; exportação registra `exportedAt` e histórico registra `created_at`. | Diferenciar e apresentar o instante original do cálculo/consulta, inclusive em resultado não salvo; exportação não prova o instante em que se calculou. |
| C07 | Imprimir/exportar memória — master §10 | Implementados, inclusive estado incompleto, avisos e fontes; impressão permite PDF pelo navegador. | PDF gerado no servidor ou exportação CSV não são exigências inequívocas desses trechos. |
| C08 | Inicial, calculadora, calendário, histórico, regras e fontes — master §10 | Implementados no recorte; regras/fontes são consulta estática do catálogo. | Consulta dinâmica a catálogos publicados e versões é evolução, sem painel de gestão atual. |
| C09 | Configurações — master §10 | **Ausente** como área de preferências/perfil. Entrar, sair e definir/recuperar senha existem. | Definir as configurações necessárias e implementar uma área coerente; exclusão integral de conta é administrativa. |
| C10 | Administração de regras e calendários — master §10 | **Ausente**. Não há rotas de administração, publicação ou revisão normativa. | Papéis protegidos, edição de novas versões, aprovação/reprovação, auditoria e testes de acesso. |
| C11 | Conteúdo coerente com âmbito atual | A base normativa ainda diz “TJSP Capital” no texto, apesar do seletor de dez comarcas. [Página](../src/app/base-normativa/page.tsx). | Corrigir a descrição da cobertura sem ampliar a regra nem retirar os avisos. |
| C12 | Dias restantes / vencido / vence hoje — nota original, linha 183 | **Ausente** como situação operacional. O estado do cálculo atual é provisório/incompleto, que tem outra finalidade. | Exibir situação relativa à data atual na aplicação, com fuso e significado definidos, sem introduzir relógio no motor nem confundir essa exibição com notificação. |

## Persistência, conta e operação

| ID | Previsto nos originais | Estado encontrado e evidência | O que falta |
| --- | --- | --- | --- |
| A01 | Autenticação, identidade no servidor e RLS — master §11; adicional §1 | Implementadas; testes locais reais, login Google hospedado confirmado. | Ensaio externo de recuperação/novo cadastro/convite e isolamento hospedado ainda pendentes nos registros. |
| A02 | Histórico de cálculos — master §9/§10 | Implementado individualmente, com título, busca entre 50 recentes, original, exportação e exclusão. | Paginação não existe, mas não é requisito explícito independente nos originais; torna-se necessária se o aceite exigir consultar todos os registros pela UI. |
| A03 | Cadastro/gestão de processos — adicional §1; nota/PDF | **Ausente**. Um título de cálculo não é processo cadastrado. A migration só tem fontes, versões de regras, versões de calendários e cálculos. | `SavedCase`, associação de cálculos, campos mínimos e acesso; definir dados/retenção antes de coletar dados processuais. |
| A04 | Organizações/equipes e autorização — master §9/§11; adicional §1 | **Ausentes**, adiados no [ADR 0003](architecture/adr/0003-historico-individual-antes-de-organizacoes.md). | Organização, memberships, papéis e isolamento entre equipes. É decisão incremental documentada, não funcionalidade entregue. |
| A05 | Alertas e preferências de notificação — master §9; nota/PDF | **Ausentes**. E-mails de Auth não são avisos de vencimento. | Especificar consentimento, canal, agendamento, fuso, alteração/exclusão e falhas; o PDF também os classifica como evolução. |
| A06 | Catálogos e entidades persistentes — master §9; adicional §1 | **Parcial**. Migration cria estrutura de versões/fontes; o cálculo usa catálogos TypeScript locais, sem aprovação administrativa remota. | Gestão de tribunais/unidades/eventos, publicação de versões e integração de leitura com a aplicação quando especificadas. Entidades embutidas no snapshot não exigem uma tabela por nome. |
| A07 | Auditoria administrativa — master §9/§11; adicional §1 | **Ausente**. Memória de cálculo existe, mas não é log de operações de administradores. | Autoria, alterações, revisão/publicação, acesso e retenção de logs. Não inventar garantia de imutabilidade. |
| A08 | Vercel, Supabase e CI — adicional §1–§3/§6 | Deploy e jobs comprovados. **Verificações operacionais parciais**. | Demonstrar preview isolado/testável, separação dos dados/configurações e bloqueio efetivo de promoção antes dos checks/aprovação. YAML da CI e CI verde não comprovam essas proteções remotas. |
| A09 | Observabilidade, monitoramento e tratamento operacional — master §15; adicional §2 | Erros tratados na aplicação; **monitoramento/alertas operacionais não demonstrados**. | Registrar responsável, métricas/erros mínimos sem segredos, alertas e procedimento de incidentes. Sentry é uma possibilidade, não requisito de fornecedor. |
| A10 | Abuso, retenção, exclusão e backup — master §11 | **Parcial**. Exclusão individual, minimização e procedimento administrativo existem. [Operação](entrega/operacao.md). | Proteção distribuída contra abuso, política institucional, backup/restauração ensaiados e canal/responsável definidos. Limites de e-mail do provedor não cobrem todos os endpoints. |
| A11 | Acessibilidade, testes e revisão — master §10/§12/§16 | Automação e verificações locais registradas para o recorte civil. | Casos dos novos regimes, revisão jurídica dos oráculos, avaliação humana e revisão completa com tecnologia assistiva. Contagem de testes não mede cobertura do sistema alvo. |
| A12 | Relatório TG e avaliação — nota/PDF | Materiais de uso/instalação/demonstração existem; relatório final e estudo com participantes não foram realizados nesta etapa. | Atualizar texto, diagramas, metodologia, resultados e limitações com evidências reais, conforme prioridade combinada. |

## Decisões justificadas e requisitos condicionais

Não se classifica como funcionalidade obrigatória faltante: NestJS, monorepo, instalação de todos os frameworks de agentes, Realtime, Edge Functions ou Storage sem necessidade concreta. O master permite justificativas de arquitetura e o adicional condiciona esses serviços à necessidade. Drizzle foi adiado com justificativa no [ADR 0002](architecture/adr/0002-supabase-data-api-sem-orm-inicial.md); PostgreSQL/Supabase continuam implementados. Alertas e cadastro de processos têm menções conflitantes de momento nos originais, mas continuam lacunas em relação ao produto de destino.

Os ramos futuros aparecem na arquitetura/backlog em linguagem natural; ainda não possuem contratos funcionais, casos revisados e modelos de cálculo próprios. Um motor puro e modular facilita a evolução, mas isso não prova que a modelagem multirregime esteja pronta.

## Sequência proposta para continuar em SP

1. Assumir explicitamente **produto completo em desenvolvimento / MVP civil publicado**, sem apagar o trabalho concluído.
2. Especificar trabalhista e penal como entregas próprias: regime, tribunal/unidade, comunicação, unidade do prazo, calendário, condições e exceções, fonte e critérios de aceite. Não basta habilitar os nomes no formulário.
3. Criar casos de referência e testes falhos antes de alterar motor/API/histórico; manter compatibilidade e versões dos cálculos civis já salvos. Implementar e verificar uma fatia de cada vez, com commits separados.
4. Ampliar cobertura de calendários compatível com cada perfil; se houver travessia, levantar 2027. Manter o foco territorial em SP, sem prometer alcance nacional.
5. Especificar e concluir comunicações e casos especiais civis pendentes, depois juizados em perfis distintos, conforme prioridade e tempo disponíveis.
6. Planejar cadastro de processos, configurações, alertas, administração e equipes com seus próprios aceites; não misturar cadastro de processo com “tipo de processo” no cálculo.
7. Fechar ensaios hospedados e controles de operação, e alinhar o relatório acadêmico ao que efetivamente funcionar.

Esta sequência é proposta de planejamento derivada da auditoria; nenhuma dessas expansões foi implementada ou publicada por esta revisão. A prioridade entre trabalhista e penal e o subconjunto de comunicações/atos ainda precisam ser especificados antes de desenvolvimento jurídico.

## Inconsistências documentais adicionais

- `requirements.md` é o contrato da primeira fatia, não substitui todas as metas originais. A matriz acima mantém o vínculo com as metas adiadas.
- Descrições correntes de entrega agora apontam para esta auditoria. Registros históricos de testes antigos não serão reescritos como se descrevessem o estado atual.
- `docs/entrega/operacao.md` ainda dizia que a finalização permaneceu local; atualizado para apontar a publicação de 20/10.
- Textos antigos de segurança sobre tentativas sem Docker são registros datados de execução; as verificações posteriores estão em `docs/testing/`. Não devem ser usados isoladamente para concluir que Auth/RLS nunca foram testados.

## Verificação documental desta revisão

`git diff --check` retornou exit 0. Verificador local de destinos Markdown: oito arquivos revisados, 95 links locais existentes e 41 itens identificados nas três matrizes (D, C e A). A árvore Git confirmou alterações somente nos seis documentos derivados de estado e nos dois relatórios novos; originais, código e migrations preservados. Não houve execução de testes da aplicação nem alteração de cálculo, configuração hospedada ou deploy nesta auditoria.
