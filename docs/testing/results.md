# Evidências da primeira entrega local

**Atualização de 19/10/2026:** o Supabase local e o fluxo completo de conta/histórico passaram na nova execução. Consulte [os resultados atuais](local-supabase.md). As limitações de infraestrutura relatadas abaixo documentam a tentativa anterior de 18/10.

Data: 18/10/2026, fuso America/Sao_Paulo. Ambiente: Windows, Node.js 22.14.0, pnpm 11.0.8; Next.js 16.4.2, Vitest 5.0.5, Playwright 1.64.1 com Edge instalado. Diretório inicial continha apenas `docs/`, sem código ou repositório Git inicializado. Nenhum resultado deste documento representa homologação jurídica ou ensaio de usabilidade com participantes.

## Verificações observadas

| Comando / atividade | Resultado observado |
| --- | --- |
| `pnpm install --frozen-lockfile` após registro do patch | Concluído, lockfile reproduzível. |
| `pnpm typecheck` | Aprovado, sem erros. |
| `pnpm lint` | Aprovado após excluir diretório temporário de preparação do patch. |
| `pnpm format:check` | Aprovado nos arquivos correspondentes ao script. |
| `pnpm test` | **3 arquivos, 42 testes aprovados**: 29 motor, 7 contratos HTTP, 6 mitigação de dependência. O teste de propriedade executa 50 amostras, semente 42, dentro de um desses casos. |
| `pnpm build` | Build de produção aprovado, geração das páginas e rotas da primeira fatia. |
| `pnpm test:e2e --workers=1` | **12 testes aprovados em 42,6s**, 6 cenários em desktop 1440px e viewport móvel 375px. |
| Axe no E2E | Nenhuma violação nas verificações automatizadas das páginas/estados efetivamente observados; não representa conformidade integral WCAG. |
| `pnpm audit --prod --audit-level high` | Nenhuma vulnerabilidade conhecida encontrada na consulta. |
| `pnpm audit --audit-level high` | Um alerta alto conhecido, especificamente ignorado por mitigação local testada; nenhum outro alerta na consulta. Ver [registro da mitigação](../security/dependency-mitigation.md). Não é uma auditoria upstream limpa. |
| Quatro skills locais | Validação pelo `quick_validate.py`: quatro aprovadas, executada na subtarefa de documentação. |

Capturas reais, inspecionadas visualmente: [desktop](artifacts/calculadora-desktop.png) e [viewport móvel](artifacts/calculadora-mobile.png). O navegador de testes não reportou exceção JavaScript no fluxo de cálculo/exportação observado. Não houve teste de aparelho físico, leitor de tela completo, carga ou medição formal de desempenho.

## O que os testes demonstraram

- Disponibilização e publicação não recebem a mesma transformação. Marco excluído, primeiro dia computado e vencimento permanecem distintos.
- O exemplo da aplicação é publicação em **06/10/2026 + 5 úteis → 14/10/2026**, com feriado de 12/10 e premissas demonstrativas visíveis.
- O oráculo **05/10 + 5 → 13/10** é fixture artificial que omite exceções supervenientes, explicitamente identificada nos casos jurídicos. O catálogo da aplicação bloqueia 05/10 por certidão de indisponibilidade conhecida ainda não interpretada pelo MVP.
- A mudança 28→30/10 é aplicada, suspensão preserva saldo, limite de cobertura impede emitir data de 2027, e a indisponibilidade 24→25/06 inclui o segundo dia.
- Exportação contém entrada, memória, avisos, versões e snapshot do calendário. Alterar a entrada invalida a apresentação do resultado anterior.
- Formulário inválido foca resumo de erros e associa mensagem ao campo; layout observado não cria rolagem horizontal na calculadora nas duas larguras.
- Endpoints recusam regime/campos não suportados, resultado/calendário injetado, JSON inválido, corpo excessivo e origem externa em mutação do histórico. Ausência de configuração não se disfarça de persistência bem-sucedida.

## Falhas encontradas e tratadas

1. Primeiro teste do motor falhou com implementação ausente; passou após a primeira contagem civil. A descoberta de certidão em 05/10 exigiu separar fixture didática do catálogo usado pelo aplicativo.
2. Os primeiros seletores E2E eram ambíguos: “quantidade de dias” também encontrava o grupo de atalhos; `role=alert` também encontrava o anunciador do Next.js. Seletores foram tornados específicos.
3. React Hook Form tomava o foco após o resumo de erro. `shouldFocusError:false` preserva o foco programado no resumo; regressão passou em desktop e móvel.
4. Durante download/extração das imagens Docker, houve timeouts transitórios de E2E. Após encerrar a tentativa de infraestrutura, a suíte serial completa passou; não se infere uma métrica de performance desse episódio.
5. Auditoria ampliada encontrou braces sem versão corrigida publicada. O pacote original falhou nos testes de proteção; patch registrado pelo pnpm passou nos seis testes da instância realmente usada pelo lint. O advisory continua documentado e requer revisão.

## Integração de banco: não validada

O Docker Desktop foi iniciado e respondeu com Server 29.8.0. Tentativas de `supabase start` completo e reduzido fizeram downloads de imagens, mas não concluíram a imagem PostgreSQL nem criaram o banco antes de serem encerradas por Ctrl+C, código 1. As tentativas anteriores de advisors/list/test retornaram conexão recusada. Não há teste SQL aprovado a reportar.

Por isso, migrations aplicadas, pgTAP/RLS real, signup/entrega de e-mail, sessão SSR, gravação/leitura/exclusão com duas identidades e advisors permanecem **pendentes**. Os scripts de preparação/teste têm sintaxe verificada, o código de integração compila, mas esses fatos não comprovam funcionamento operacional. Nenhum `.env.local` com credenciais foi criado; nenhum recurso remoto foi alterado.

O fluxo demo sem banco foi testado, incluindo mensagens de indisponibilidade de conta/histórico. O usuário pediu concluir localmente antes de criar projetos; Vercel e Supabase remotos não foram provisionados. CI foi configurada, não executada no GitHub.

## Próximas evidências necessárias

1. Concluir preparação do Supabase local, aplicar migration isolada e executar pgTAP/advisors.
2. Testar confirmação por e-mail e fluxo SSR real; comprovar isolamento com duas contas e tentativas diretas na Data API.
3. Revisão jurídica identificada e calendário completo por unidade/período, inclusive 2027.
4. Avaliação com participantes, leitor de tela e preenchimento do relatório acadêmico com dados observados.
