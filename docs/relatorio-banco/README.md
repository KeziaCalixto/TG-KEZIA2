# Relatório do banco de dados e arquitetura

Edição de 04/11/2026 para revisão de Kezia Calixto e orientação. Para compartilhar com outra pessoa, envie somente o [PDF completo de 36 páginas](../../output/documents/prazo-claro-relatorio-banco-de-dados-2026-11-04.pdf). Ele contém todo o texto, dicionário, segurança, funcionamento, infraestrutura e os diagramas, sem depender dos arquivos auxiliares para a leitura.

As páginas 35 e 36 são pranchas vetoriais em A3 horizontal: diagrama geral do banco com todas as 65 colunas das sete tabelas próprias e diagrama completo da arquitetura. Amplie no leitor de PDF. Para imprimir, escolha ajuste à área da folha ou A3 para essas duas páginas. O restante é A4 vertical.

## Conteúdo e base documental

Treze capítulos, três apêndices, seis figuras explicativas e duas pranchas ampliadas. Concepção, requisitos de persistência, modelo conceitual, modelo físico, JSONB, normalização, chaves, índices, RLS, funções, histórico, fila, concorrência, agendamento, Vercel, Supabase, Brevo, ambientes, migrations, evidências e limites. O catálogo registra as 22 definições finais de funções.

O modelo deriva das quatro migrations versionadas e da implementação do repositório em `49c256d`; a base funcional publicada identificada é `9632fd2`. A edição incorpora o aceite humano do lembrete de 24/10. Não houve consulta ao banco remoto, alteração de schema, envio de mensagem nem nova execução dos testes PostgreSQL nesta tarefa.

## Arquivos editáveis e conferência

- [Word do corpo do relatório](../../output/documents/prazo-claro-relatorio-banco-de-dados-2026-11-04.docx), com navegação e tabelas editáveis. As pranchas ampliadas são incorporadas na consolidação do PDF.
- [Texto-fonte](relatorio.md). Marcadores `@dictionary`, `@indexes`, `@functions`, `@migrations`, `@figure` e `@references` são expandidos pelo gerador.
- [Dicionário CSV](dicionario-de-dados.csv), com coluna, tipo, nulabilidade, default, definição SQL e descrição.
- [Inventário estático](schema-inventario.json), com arquivo, linha, definições e hashes das migrations.
- [Fontes e manifesto](fontes-e-manifesto.json), com 38 arquivos-fonte e referências oficiais.
- [Verificação final e hashes dos artefatos](verificacao.json).
- [Diagramas](diagramas/): PNG para uso comum, PDF/SVG vetoriais e Mermaid editável.
- [Comandos e resultados reais](../testing/database-report-2026-11-04.md).

## Reprodução

Python com `python-docx`, `reportlab`, `pypdf` e Poppler. O gerador resolve o Poppler no runtime do Codex deste computador. Para outro computador, ajuste esse caminho ou use sua instalação equivalente. Os scripts não executam SQL nem acessam credenciais do aplicativo.

```powershell
python -X utf8 docs/relatorio-banco/inspecionar_schema.py
python -X utf8 docs/relatorio-banco/gerar_relatorio.py
python -X utf8 docs/relatorio-banco/renderizar.py output/documents/prazo-claro-relatorio-banco-de-dados-2026-11-04.docx --output_dir tmp/relatorio-banco/render-final --emit_pdf
python -X utf8 docs/relatorio-banco/gerar_anexos.py --consolidar tmp/relatorio-banco/render-final/prazo-claro-relatorio-banco-de-dados-2026-11-04.pdf
python -X utf8 docs/relatorio-banco/verificar.py
```

O adaptador de renderização usa o `render_docx.py` do plugin Documents e a imagem LibreOffice já disponível no Docker local, com conversão sem rede e montagens limitadas. Requer Docker ativo e o plugin instalado no caminho documentado no script. Em outro ambiente, pode-se exportar o Word pelo LibreOffice/Word e passar o PDF resultante a `gerar_anexos.py --consolidar`.

Depois de editar o texto ou os diagramas, gere novamente, confira todas as páginas e atualize as evidências. O verificador fixa as contagens desta edição; mudança de paginação exige nova revisão visual e atualização deliberada desses valores.
