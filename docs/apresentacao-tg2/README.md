# Apresentação e pôster do TG II

**Adendo posterior à geração em 24/10:** recebimento externo do lembrete e abertura da memória original na conta confirmados pelo responsável. [Evidência e frase atualizada para o ensaio](../testing/reminder-receipt-2026-10-24.md). Os PowerPoints/PDFs e o ZIP desta edição conservam o corte anterior a esse aceite; a pendência correspondente deve ser apresentada como encerrada para o ensaio confirmado. Não houve nova exportação nesta atualização.

Materiais do Prazo Claro, edição de **24/10/2026**, para revisão e ensaio de **Kezia Calixto**, ADS, FATEC Campinas, sob orientação do **Prof. Eduardo Felipe Fonseca de Freitas**. Conteúdo derivado do relatório acadêmico, base funcional `9632fd2`.

## Arquivos de uso

- [Pacote para compartilhar](../../output/presentations/prazo-claro-materiais-apresentacao-tg2-2026-10-24.zip), com os quatro arquivos abaixo, roteiro e instruções.
- [Apresentação editável](../../output/presentations/prazo-claro-apresentacao-tg2-2026-10-24.pptx) e [PDF dos slides](../../output/presentations/prazo-claro-apresentacao-tg2-2026-10-24.pdf).
- [Pôster editável](../../output/presentations/prazo-claro-poster-tg2-2026-10-24.pptx) e [PDF do pôster](../../output/presentations/prazo-claro-poster-tg2-2026-10-24.pdf).
- [Roteiro de fala](roteiro-de-fala.md), também nas notas do PowerPoint, com fontes e demonstração.

São **20 slides**, sendo 18 de exposição/demonstração e dois de apoio. O ensaio sugerido soma **16 min 5 s**, incluindo uma demonstração de 90 segundos. O tempo é uma proposta de ensaio, não uma regra atribuída à FATEC. Confirmar a duração com a orientação e ajustar o roteiro.

## Correspondência com os modelos

Os dois PPTX originais de `docs/FATEC-CAMPINAS/APRESENTACAO/` foram lidos e renderizados antes da adaptação. Foram preservados logotipos, faixa vermelha, fundo branco, fonte Arial e dimensões. O modelo de apresentação fornece capa e páginas de conteúdo, que foram duplicadas para acomodar a narrativa. O cabeçalho antigo de workshop/2022 passou a identificar TG II, ADS e 2026, sem inventar número de evento ou data de defesa.

O pôster conserva as posições e o estilo dos cinco cabeçalhos: introdução, revisão bibliográfica, materiais e métodos, considerações finais e referências. Materiais e métodos também reúne implementação, arquitetura e resultados. Textos e tabelas são editáveis; a captura real do aplicativo e os logotipos são imagens incorporadas. Não há redesenho dos logotipos nem imagem gerada apresentada como evidência.

**Dimensões do pôster: aproximadamente 90 × 100 cm**, conforme o modelo fornecido, e não 90 × 120 cm. O PDF mantém o tamanho físico do slide. Para imprimir nesse tamanho, solicitar escala de 100% à gráfica. Confirmar antes com a instituição se há exigência diferente, além de acabamento e margem de segurança. O PDF é RGB e não possui sangria ou certificação PDF/X. Não imprimir com ajuste automático a A4 como se fosse o pôster em tamanho real.

Os e-mails da autora e do orientador não foram fornecidos. Foram omitidos, sem substituir pelo e-mail pessoal do operador. O link público do aplicativo consta nos materiais. Confirmar os contatos acadêmicos antes da versão institucional final, se exigidos.

## Conteúdo e limites

A apresentação cobre problema, objetivos, recorte, fundamentação, método, requisitos, arquitetura, dados, motor, exemplo diário, autenticação, histórico, exportação, lembretes, testes, resultados e continuidade. Fontes específicas e observações de fala estão nas notas. O pôster sintetiza o mesmo recorte.

Os números **256 unitários, 146 SQL e 67 cenários de navegador aprovados, com um omitido**, pertencem à CI `40061653068`, citada no relatório. Nenhum teste do aplicativo foi reexecutado para produzir os slides. Calendários continuam parciais e a revisão jurídica pendente. O recebimento externo do lembrete não ganhou aceite nesta tarefa. Não foi criada avaliação fictícia com participantes, aprovação de banca, medição de carga ou certificação de tempestividade.

## Editar e regenerar

O PowerPoint permite editar diretamente textos, tabelas e notas. Depois de editar, exportar novamente os PDFs e revisar todas as páginas alteradas. Alterações diretas no PPTX não voltam automaticamente ao JSON ou ao relatório.

`conteudo.json` é a fonte de texto desta apresentação e do pôster. `gerar.mjs` usa `@oai/artifact-tool` do runtime de apresentações do Codex, importa os modelos e escreve os rascunhos em `tmp/apresentacao-tg2/`. A skill de apresentações usada nesta edição está no plugin instalado, versão `26.1022.11436`. Nenhuma biblioteca substituta foi instalada. Dependências e originais são necessários para regenerar; o ZIP de uso contém os arquivos finais editáveis, sem redistribuir os modelos completos.

```text
node docs/apresentacao-tg2/gerar.mjs
node docs/apresentacao-tg2/gerar.mjs --poster-only
node docs/apresentacao-tg2/gerar.mjs --finalize
python docs/apresentacao-tg2/verificar.py
python docs/apresentacao-tg2/empacotar.py
```

Executar com Node/Python do runtime fornecido pelo aplicativo. As variáveis opcionais `PRAZO_RUNTIME_MODULES`, `PRAZO_RUNTIME_PYTHON` e `PRAZO_PRESENTATIONS_SKILL` permitem localizar esses recursos em outra instalação. O finalizador não sobrescreve um arquivo final existente: para uma nova edição, alterar os destinos de saída ou usar um nome novo. A conversão PPTX/PDF usa um aplicativo de apresentações, como PowerPoint ou LibreOffice; o gerador não a faz automaticamente. Na execução documentada, LibreOffice em Docker sem rede e Poppler produziram os PDFs e as imagens de revisão.

Registros de geração, conferência e limites estão em [evidências](../testing/apresentacao-tg2.md). Os originais institucionais permanecem preservados.
