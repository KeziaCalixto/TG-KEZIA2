# Continuação local — perfis trabalhista e criminal

Data: 21/10/2026. Marco técnico local concluído e verificado nas fronteiras descritas abaixo. Nenhuma publicação desta etapa. Revisão jurídica pendente para ambos os perfis; calendários parciais de 2026. [Plano de retomada](../continuation-plan.md).

## Pesquisa e contrato

- [Trabalhista](../legal/rules/labor-djen-research-2026-10-21.md) e [calendário TRT-2 Capital](../legal/sources/labor-sp-2026-research.md): CLT 775/775-A, Lei 11.419, Provimento GP/CR 05/2025 e Portarias 50/2025 e 15/2025.
- [Criminal](../legal/rules/criminal-djen-research-2026-10-21.md): CPP 798/798-A, Lei 11.419, Lei 1.408, súmulas/precedentes e atos TJSP. Primeiro dia útil seguido de curso contínuo; fim nominal separado de prorrogação. Exceções/indisponibilidades não modeladas bloqueiam o resultado.
- Escopo dos novos perfis: São Paulo Capital. Civil continua nas dez comarcas. Motor civil e versões preservados; novos perfis guardam `snapshot.rule` e usam motor 0.3.0. Vigência de elegibilidade do perfil DJEN: atos locais desde 16/05/2025 (criminal) e 26/05/2025 (trabalhista); os calendários efetivos limitam a aplicação a 2026.
- Sem migration, nova permissão, chave privilegiada ou alteração de Auth. O helper de integração local foi ampliado para salvar/ler/excluir os novos perfis pelo aplicativo sob sessão de fixture, com limpeza no fim.

## TDD observado

Fronteiras públicas mantidas conforme estratégia existente: serviço puro, API de cálculo, schema de leitura histórica e fluxo do navegador. Casos esperados vieram das tabelas manuais das pesquisas, não da saída do algoritmo.

| Ciclo | Falha observada antes da correção | Resultado após implementação |
| --- | --- | --- |
| Trabalhista | Esperava provisório e recebia incompleto em publicação 09/10, um dia | Passou com vencimento 13/10, fonte CLT e calendário TRT-2 |
| Criminal | Mesmo bloqueio; sem perfil de curso contínuo | Passou: publicação 06/10, cinco unidades 07–11, fim nominal 11 e prorrogação a 13/10 |
| Histórico | `historySnapshotSchema` recusava memória TRT-2 | Novo perfil/regra/fases aceitos; leitura civil antiga continua coberta |
| Rastreabilidade da exceção | Trilha parava em 07/10 ao encontrar indisponibilidade de fixture em 08/10 | Data bloqueadora e fonte passaram a integrar a memória incompleta |
| Compatibilidade inversa | A fronteira pública ainda permitia calendário criminal sob entrada civil, pois o tribunal/localidade coincidiam | Bloqueio no dispatcher sem alterar a implementação civil preservada |

A primeira tentativa de Vitest no sandbox falhou na inicialização com `spawn EPERM`; não foi contabilizada como teste de negócio falho. A execução com autorização de processo produziu os testes falhos de asserção acima e as verificações posteriores.

## Resultados registrados até agora

- `pnpm exec vitest run tests/multi-regime.test.ts`: **33 aprovados**, incluindo datas transferidas trabalhistas, publicação durante suspensão com expediente, curso criminal, prorrogação, contextos excluídos, cobertura, determinismo, não mutação e contrato HTTP.
- `pnpm check`: exit 0, inicialmente **113 testes em 12 arquivos**. Após o último caso de incompatibilidade, `pnpm typecheck`, `pnpm lint`, `pnpm format:check` e `pnpm test` concluíram com exit 0 e **114 testes em 12 arquivos**.
- Build final `pnpm build`: **exit 0**, 20 rotas. Servidor reiniciado com esse build em `http://127.0.0.1:3000`.
- Comparação textual normalizada da implementação civil com o commit `82df885`, revertendo apenas renomeação da função/schema: `CivilImplementationPreserved: true`.
- E2E final `pnpm test:e2e --workers=1`: **exit 0, 35 aprovados e um omitido, 1,7 minuto**. O omitido é o PDF duplicado no mobile, executado no desktop. Inclui os seis cenários novos, com Axe no perfil trabalhista, contexto, troca de perfil, exportação e calendário/fontes. Nenhum timeout foi aumentado e nenhuma regra Axe foi desativada.
- `pnpm db:test:app`: **exit 0**. Cadastro/confirmação Mailpit/PKCE, login/logout/recarga, cálculo civil, gravação/leitura/renderização dos perfis trabalhista e criminal, isolamento entre duas contas, tentativa anônima e exclusão aprovados. Usuários, linhas e e-mail de fixture removidos. Nenhum e-mail externo enviado.
- Inspeção manual pelo navegador local: criminal 06/10 + 5, vencimento 13/10 e fim nominal 11/10, revisão pendente visível. [Captura](artifacts/criminal-local.png). Sem dados reais ou sessão de conta na captura.

## Falhas encontradas durante E2E

1. Primeira suíte: 31 aprovados, um omitido e quatro falhas nos testes novos. O seletor de teste da data usava igualdade exata sem considerar o asterisco do label; o controle existia e tinha nome acessível. Corrigido o seletor, sem alterar cálculo.
2. Os novos testes então verificaram mais regras Axe e encontraram `label-content-name-mismatch` na marca: `aria-label` sobrescrevia o texto visível. Removida a substituição; o nome vem do conteúdo e `title` informa a navegação inicial. Os testes finais dos três cenários novos passaram em desktop/mobile, inclusive a correção da marca.
3. Suíte completa posterior: 34 aprovados, um omitido, timeout em 60s na checagem antiga de calendário/acessibilidade desktop. Reexecução isolada dessa checagem: **1 aprovado em 9,3s**. Sem asserção funcional divergente. A verificação final usa `pnpm test:e2e --workers=1` para reduzir concorrência local; não se alterou o timeout nem se desabilitou regra de acessibilidade.

Na revisão dos componentes foram conferidos hooks fora de condicionais, campos/contexto reiniciados ao trocar perfil, labels/foco, memória atual invalidada após alteração da entrada, links seguros e distinção entre módulos puros e interface. A contagem da trilha agora é apresentada como registros, pois uma data pode ter etapa de contagem e de prorrogação; isso não soma unidades duas vezes.

## Limites e próxima atualização

Não há cobertura 2027, outras localidades TRT-2/TRT-15, prazos materiais, prerrogativas ou procedimentos especiais. Os contextos excepcionais não calculam automaticamente as exceções legais. A confirmação de contexto é declaração de entrada, sem prova de enquadramento. O catálogo civil e os snapshots salvos continuam identificados, sem aprovação jurídica presumida.

Verificação de documentos: 17 arquivos e 101 destinos locais Markdown válidos; `git diff --check` sem erro após corrigir uma linha vazia extra no plano. Diff e componentes revistos, com teste adicional do cruzamento inverso entre perfis. Não foi realizada nesta etapa aprovação jurídica, integração externa de e-mail, configuração remota ou inspeção de um PDF específico do novo perfil criminal; o ensaio geral de impressão civil foi mantido.

A auditoria datada de escopo de 21/10 permanece como registro do estado anterior; a continuação aponta as mudanças posteriores, sem reescrevê-la como se já existissem naquela inspeção. Retomada concreta: levantar atos disponíveis de 2027 e compatibilidade de ampliação territorial dos novos perfis, sem reaproveitar automaticamente o calendário TJSP em outro tribunal. Depois continuar demais comunicações/atos e cadastro mínimo de processos.
