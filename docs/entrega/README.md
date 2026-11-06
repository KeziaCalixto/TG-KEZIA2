# Entrega do Prazo Claro

Este é o ponto de entrada para instalar, usar e demonstrar a entrega acadêmica. O foco acordado é o aplicativo e seus materiais; o relatório do TG não foi redigido nesta etapa.

**Entrega vigente: versão acadêmica publicada em 23/10/2026**, com perfis demonstrativos civil, trabalhista e criminal de SP. O encerramento considera o recorte descrito aqui e na [matriz atual de aceite](aceite.md). [Plano de fechamento](../continuation-plan.md) e [auditoria do objetivo completo](../scope-audit-2026-10-21.md). Juizados, novos meios de comunicação e demais expansões permanecem no backlog.

Histórico com filtro/paginação/situação e catálogo inicial de atos estão publicados. Lembretes têm envio Mailpit verificado localmente e infraestrutura Brevo/Cron instalada; o estado de ativação e recebimento deve ser conferido nas [evidências hospedadas](../testing/reminders-production.md). Não apresentar sandbox ou aceite do provedor como recebimento confirmado.

## O que foi entregue

| Recurso | Cobertura da entrega |
| --- | --- |
| Civil comum | TJSP, dez comarcas cadastradas, 2026, DJEN e dias úteis. |
| Criminal comum | TJSP, mesmas dez comarcas, 2026, DJEN; contexto obrigatório, início útil e curso contínuo com prorrogação própria. |
| Trabalhista comum | TRT-2 Capital, 2026–2027, DJEN e dias úteis; contexto obrigatório e versões anuais preservadas. |
| Atos | Catálogo inicial com um ato específico de cada perfil; confirmação de condições e quantidade manual preservadas. |
| Memória | Marcos, trilha diária, fontes, versões e avisos; JSON e impressão/PDF. |
| Conta e histórico | E-mail/senha, convite, recuperação e Google; histórico privado, filtro por ramo, paginação, exclusão e original preservado. |
| Lembretes | Opt-in por cálculo, 3/1/0 dias corridos, 09h/12h/18h em São Paulo, cancelamento e vínculo privado; local e hospedado têm aceites separados. |

Calendários têm cobertura parcial; revisão jurídica profissional continua pendente. A tela bloqueia contextos/coberturas incompatíveis em vez de inventar vencimento. Não contempla prazo material, procedimentos especiais, dobro/prerrogativas, Domicílio, AR/mandado, TRT-15 ou TJSP 2027.

Comarcas: São Paulo, Campinas, Guarulhos, Osasco, Ribeirão Preto, Santo André, Santos, São Bernardo do Campo, São José dos Campos e Sorocaba. [Fontes e limites de cobertura](../legal/sources/sp-comarcas-2026.md).

## Materiais

- [Instalação e verificação local](instalacao.md).
- [Roteiro de demonstração](demonstracao.md), com entradas e resultados esperados.
- [Aceite e limites da entrega](aceite.md).
- [Conferência final no site publicado](conferencia-final.md), incluindo conta e recebimento do lembrete.
- [Operação, dados e manutenção](operacao.md).
- Guia dentro do aplicativo: `/ajuda`; informações de dados: `/privacidade`.
- [Exemplo de memória PDF produzido pelo aplicativo](../../output/pdf/memoria-demonstrativa-santos.pdf).
- [Backlog completo](../backlog.md), incluindo expansões que não pertencem ao recorte entregue.

## Onde está cada versão

A versão ampliada e o feedback de agendamento estão publicados em [tg-kezia2.vercel.app](https://tg-kezia2.vercel.app). Local: `http://127.0.0.1:3000`, com Docker/Supabase/Mailpit ativos para conta e lembretes. Novos previews não recebem credenciais do banco de produção. [Publicação atual e CI de 24/10](../testing/release-2026-10-24.md), [ativação dos lembretes](../testing/reminders-production.md); [publicação civil anterior de 20/10](../testing/final-deployment.md) é um registro histórico.

O histórico pode ser consultado com `git log --oneline`; cada marco desta finalização tem commit próprio. [Registro de avanços](../../CHANGELOG.md).

## Pacote fonte

O procedimento gera o pacote local em `tmp/delivery/` a partir de um commit identificado com `git archive`, acompanhado por manifesto com commit e SHA-256. Os commits foram retomados em 24/10; confira no manifesto qual versão foi empacotada. A pasta é ignorada pelo Git; o pacote deve conter o código, migrations, fontes e materiais versionados, sem `.git`, dependências instaladas, builds ou arquivos privados `.env.local`. `.env.example` contém apenas o modelo de configuração. A instalação segue o guia acima e exige preencher a configuração própria do novo ambiente.

O ZIP não contém contas, sessões ou dados do banco e não substitui backup/restauração do Supabase. Não compactar a pasta inteira do computador: ela contém configuração privada e artefatos locais que não fazem parte da entrega.

## Critério de conclusão

O encerramento técnico considera o recorte acima, os contratos de requisitos/perfis/histórico/lembretes e os resultados reais da [matriz atual](aceite.md). Revisão jurídica, avaliação humana e recebimento externo continuam identificados conforme sua evidência. Relatório do TG, gestão completa de processos/equipes e administração normativa são etapas próprias. Não se declara o master prompt inteiro implementado.
