# Exportação e impressão de memória — 20/10/2026

Requisito RF06: conservar entrada, resultado, trilha, fontes, versões e estado de demonstração/incompletude. Não houve alteração de contagem ou calendário.

Caso inicialmente falho: publicação 18/12/2026, dois dias úteis, Capital. O motor devolvia incompleto, mas o botão Exportar memória não existia. `pnpm exec playwright test tests/e2e/memory.spec.ts --project=desktop --grep 'exporta memória incompleta'`: exit 1, botão ausente. Após correção, a exportação conserva `status: incomplete`, `dueDate: null`, avisos e snapshot demonstrativo; continua sem oferecer salvar cálculo incompleto.

Foi acrescentada referência numerada dos fundamentos por dia, com navegação às fontes. A memória impressa explicita comarca, cobertura, revisão, fontes com URL e versões. O ciclo de impressão restaura detalhes e seleção no evento `afterprint`, conforme [documentação do evento](https://developer.mozilla.org/en-US/docs/Web/API/Window/afterprint_event).

Validações executadas:

- `pnpm typecheck`: exit 0.
- `pnpm build`: exit 0; repetido após correção visual, exit 0.
- `pnpm exec eslint src/components/calculation-result.tsx tests/e2e/memory.spec.ts --max-warnings 0`: exit 0.
- `pnpm exec playwright test tests/e2e/memory.spec.ts --project=desktop`: dois testes aprovados, exit 0, aproximadamente 15 segundos na execução final.
- PDF histórico A4 com duas entradas controladas: somente a selecionada aparece, com aviso de registro não verificado. O diálogo nativo foi substituído no teste; o navegador gerou o PDF real com `page.pdf`, acionando o ciclo de impressão. A restauração da outra entrada na tela foi verificada.
- Poppler + pypdf: duas páginas; texto contém aviso de integridade, cobertura parcial e URL primária. Não contém título da outra entrada ou link Pular para o conteúdo. As duas páginas finais foram renderizadas e inspecionadas visualmente, sem corte ou sobreposição. A primeira inspeção encontrou o link de navegação sobre uma linha; ele foi removido da impressão e o caso recebeu regressão.

[PDF demonstrativo gerado pelo aplicativo](../../output/pdf/memoria-demonstrativa-santos.pdf). Dados controlados, sem identidade real. A tabela continua na segunda página com cabeçalho repetido. Impressora física, outros navegadores e leitor de tela de PDF não foram ensaiados. Testes não representam revisão jurídica.
