# Continuação local — comarcas de SP, recuperação e histórico

Data: 20/10/2026. Windows, Node 22, pnpm 11.0.8, Supabase CLI 2.121.0. App: `http://127.0.0.1:3000`; Auth/Data API: `127.0.0.1:54321`; Mailpit: `127.0.0.1:54324`. Nenhuma alteração desta etapa foi enviada ao GitHub, Vercel ou Supabase hospedado.

## Alterações e limites

- Dez comarcas no formulário e no calendário; versão `2026-10-20.demo.2`, motor 0.2.0. Fonte, âmbito, vigência, transcrição e pendências na [ficha SP 2026](../legal/sources/sp-comarcas-2026.md). Calendário anterior preservado. Nada aprovado juridicamente; 2027 e levantamento exaustivo de suspensões locais pendentes.
- Recuperação por e-mail via PKCE, com callback fixo, mensagens genéricas, template local próprio e definição de senha sob sessão verificada. Link deve abrir no mesmo navegador da solicitação.
- Histórico original apresentado com marcos, tabela de dias/motivos, fontes/versões e aviso de registro não verificado. JSON técnico recolhido. Exportação histórica contém `originalSnapshot` integral e `integrity: unverified`; não troca por versão atual. Snapshot inválido ou com link executável não é renderizado como resultado.
- Impressão abre detalhes temporariamente e restringe o histórico à memória selecionada, preservando o aviso de integridade. O diálogo/arquivo final de impressão física não foi homologado nesta execução.

## Testes e correções observados

1. `pnpm test -- tests/sp-calendars.test.ts tests/password-recovery.test.ts`: falha inicial antes da implementação, módulos novos ausentes. Após implementação: nove casos aprovados.
2. `pnpm test -- tests/history-snapshot.test.ts`: falha inicial por módulo ausente; implementação adicionada. Regressão completa posterior: 77 casos aprovados. Novos casos municipais ampliaram a execução final para **81 casos aprovados em 11 arquivos**, exit 0.
3. `pnpm typecheck`: exit 0. `pnpm build`: exit 0; repetido após correções visuais/impressão, novamente exit 0, incluindo TypeScript e geração de 18 páginas/rotas.
4. `pnpm lint`: exit 0 na árvore da implementação inicial. `pnpm exec eslint src/components/calculation-result.tsx src/components/password-recovery-form.tsx tests/sp-calendars.test.ts supabase/scripts/verify-local-recovery.mjs --max-warnings 0`: exit 0 nos arquivos ajustados depois.
5. `pnpm format:check`: exit 0; todos os arquivos cobertos pelo script conforme Prettier. Template e helper de recuperação também formatados explicitamente.
6. Primeira execução `pnpm test:e2e`: 16/18 aprovados; Axe apontou `target-size` no link de retorno da recuperação, em desktop e mobile. Corrigido para área mínima de 44px e espaçamento. Repetição final: **18/18 aprovados**, exit 0, aproximadamente 1,1 minuto. Axe sem violações nos cenários cobertos; não equivale a auditoria completa com usuários/leitores de tela.

## Integração real local

`supabase stop` preservou backup/dados (`backup: true`); `supabase start` retornou exit 0, sem reset/migration. Apenas configuração de callback/template local mudou. Auth, Mailpit e banco funcionaram nos testes. Vector reiniciava e Realtime apareceu temporariamente unhealthy na inspeção durante startup; não são usados pelos fluxos desta entrega e não foram diagnosticados aqui.

Primeira tentativa de `pnpm db:test:recovery` parou no status local, antes de criar fixture. O helper ganhou estágios mais precisos, tolerância a BOM e limite de subprocesso de 60s. Execuções seguintes retornaram exit 0; não foi determinada uma causa mais específica para a primeira falha.

Última execução real, com fixture local efêmera:

```text
PASS: local recovery email delivered with custom template and exact callback; credentials kept in memory.
PASS: PKCE recovery creates verified SSR session only in initiating context; unauthenticated password change refused.
PASS: recovered account saves and retrieves original Santos snapshot; signed-out context cannot read history.
PASS: new password logs in after logout; old password and replayed link refused.
PASS: local account and captured fixture messages removed.
```

O helper não usa navegador, screenshots ou traces autenticados; somente API com cookie jar e Mailpit locais. Conta temporária excluída ao final, incluindo histórico por cascade; mensagem local removida. Senhas aleatórias, chaves, cookies e links de recuperação não são impressos. Não houve envio externo nem uso de contas reais.

A conferência de limpeza encontrou duas mensagens das execuções anteriores: a rota de exclusão inicialmente usada não existia. Corrigido conforme o Swagger servido pelo próprio Mailpit: DELETE `/api/v1/messages` com `{IDs:[...]}`, protegido por lista não vazia. Removidas somente essas fixtures, contagem residual zero. Nova execução completa confirmou exclusão por resposta 200 e consulta individual 404. Helpers antigos de convite/cadastro ainda precisam ter sua limpeza padronizada, sem impacto na limpeza verificada deste helper.

E2E de histórico usa resposta controlada para conferir apresentação/exportação de uma versão original; o teste real por API acima verifica persistência sob identidade recuperada. Isso não substitui reensaio hospedado com duas contas reais. Os testes de RLS com duas identidades de 19/10 continuam documentados em [local-supabase.md](local-supabase.md); não houve mudança de schema/RLS nesta etapa.

## Conferência visual

No navegador do Codex, selecionados Santos, publicação 04/09/2026 e um dia útil: estimativa exibida **09/09/2026**, com 08/09 excluído como feriado municipal e aviso de simulação. [Captura local](artifacts/local-sp-santos.png). Não contém identidade real ou credenciais.

Atualização da revisão final: os helpers de convite/cadastro já usavam exclusão com corpo e IDs. A suspeita de pendência registrada acima estava desatualizada; as novas execuções confirmaram limpeza. Ver [evidências finais](final-delivery.md).

## Aceite pendente

Revisão jurídica e levantamento extraordinário por comarca/unidade; cobertura 2027; testes de usabilidade com participantes; política de retenção/exclusão, controles de abuso e operação; roteiro/relatório do TG. Recuperação hospedada exigirá adicionar os callbacks exatos com `?flow=recovery` e aplicar o template no Auth, somente quando uma publicação for autorizada.
