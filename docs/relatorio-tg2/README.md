# Relatório do Trabalho de Graduação II — Prazo Claro

**Adendo de aceite, posterior à geração em 24/10:** o responsável confirmou recebimento do lembrete externo e abertura da memória original na conta. [Registro da confirmação](../testing/reminder-receipt-2026-10-24.md). A pendência correspondente nos Word/PDFs e fontes desta edição retrata o corte anterior. Nesta atualização, os artefatos gerados e seus manifestos foram preservados; considerar o adendo na revisão acadêmica.

Edição de 24/10/2026, para revisão da autora e do orientador. Autora **Kezia Calixto**, curso **Análise e Desenvolvimento de Sistemas**, **FATEC Campinas**, orientação do **Prof. Eduardo Felipe Fonseca de Freitas**. Metadados confirmados pelo responsável. A documentação descreve a base funcional `9632fd2` e conserva os limites dos calendários e dos aceites.

## Entregáveis

- [Pacote completo de documentação](../../output/documents/prazo-claro-documentacao-tg2-2026-10-24.zip), com Word, PDFs, fontes LaTeX e manifesto.
- [Relatório editável Word](../../output/documents/prazo-claro-relatorio-tg2-2026-10-24.docx).
- [PDF do Word](../../output/documents/prazo-claro-relatorio-tg2-2026-10-24.pdf).
- [PDF compilado do LaTeX](../../output/documents/prazo-claro-relatorio-tg2-latex-2026-10-24.pdf).
- [Projeto LaTeX](main.tex), com capítulos, referências e figuras no mesmo diretório.
- [Guia de entrega do aplicativo](../entrega/guia-do-aplicativo.md), também em Word/PDF.

O texto inclui sete capítulos, seis apêndices, requisitos, casos de uso, modelos, banco, API, segurança, instalação, testes e resultados. [Matriz FATEC](matriz-fatec.md) e [fontes de pesquisa](fontes-pesquisa.md) explicam a correspondência institucional e os limites de consulta.

## Editar e regenerar

`conteudo.md` é a fonte narrativa compartilhada. `metadados.json` contém capa, resumos e palavras-chave; `referencias.json` contém as referências e os rótulos de citação. Marcadores `[CHAVE]`, `@figure` e `@table` são interpretados por `gerar_documentos.py`.

Para regenerar Word e arquivos TeX, usar Python com python-docx, reportlab e Pillow, além de Poppler (`pdftoppm`) para gerar as imagens dos diagramas quando ausentes:

```text
python docs/relatorio-tg2/gerar_documentos.py
```

O gerador foi executado com o runtime de documentos fornecido pelo aplicativo Codex. Os arquivos TeX e as figuras já prontos podem ser editados e compilados sem executar Python. Abrir `main.tex` como documento principal no editor LaTeX; compilar até estabilizar sumário, listas e referências. Não é necessário BibTeX/Biber: `referencias.tex` é gerado com rótulos e links a partir do JSON. É possível enviar a pasta para um editor LaTeX compatível com pdfLaTeX.

O sumário e as listas do Word são materializados pelo gerador e vinculados aos títulos. Após mudar o texto, **revisar a paginação e regenerar os números**; não presumir que editar um parágrafo atualize uma lista estática. O PDF de cada formato possui sua própria paginação. Os resultados de compilação, revisão e contagem são registrados em [docs/testing/documentacao-tg2.md](../testing/documentacao-tg2.md).

Depois de exportar o Word atualizado para PDF, executar `python docs/relatorio-tg2/verificar_paginacao.py CAMINHO_DO_PDF --write` (requer pypdf), regenerar com `python docs/relatorio-tg2/gerar_documentos.py --pages docs/relatorio-tg2/paginacao-word.json` e exportar novamente. Repetir a verificação sem `--write` até não haver diferenças. O arquivo de paginação é específico do PDF inspecionado nesta edição.

## Antes de submeter

Depois de gerar e revisar os artefatos, `python docs/relatorio-tg2/empacotar_documentacao.py` monta o ZIP por lista restrita, confere integridade e produz manifesto/SHA-256. O pacote é somente documental; não inclui aplicativo, usuários, credenciais, originais institucionais ou backup do banco.

Revisar texto, autoria, fontes e declaração de assistência tecnológica com a autora/orientação. Confirmar a redação final do título e os formulários atuais. A folha de aprovação e a ficha catalográfica devem ser obtidas com os responsáveis institucionais; não foram criadas como se houvesse banca ou aprovação. Dedicatória e agradecimentos são opcionais e pessoais.

O recebimento do lembrete externo permanece com aceite próprio, conforme o corte documental. Atualizar os resultados somente após nova evidência. Revisão jurídica, estudo com participantes, desempenho sob carga e operação institucional não são apresentados como concluídos. Os materiais originais de `docs/FATEC-CAMPINAS/` permanecem preservados e não são redistribuídos no pacote LaTeX.
