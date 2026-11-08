# Manutenção deste portal

## Executar localmente

Na raiz do repositório, com Node.js 22.14 ou posterior:

```sh
npm --prefix website ci --ignore-scripts
npm --prefix website start
```

Abra `http://127.0.0.1:3001/TG-KEZIA2/`. O portal usa a porta 3001 para conviver com o app na porta 3000. Seu lockfile e suas dependências ficam em `website/`; não é necessário preencher chaves Supabase ou Brevo para ler ou gerar a documentação.

## Fonte canônica

Páginas editoriais ficam em `website/content/`. O manifest `website/content-manifest.json` identifica os documentos existentes e os arquivos públicos permitidos. A geração reescreve links, expande o relatório de banco e copia apenas os assets listados. Não edite `.generated/` ou `static/generated/`: são saídas descartáveis.

Para acrescentar um assunto, edite a fonte correspondente, inclua a entrada no manifest quando necessário e mantenha título, seção e ID estáveis. Para um download, confira o arquivo e acrescente o caminho à lista de assets. Nunca publique arquivos `.env`, chaves, convites reais, sessões ou capturas de dados de contas.

## Validar antes de publicar

```sh
npm --prefix website test
npm --prefix website run build
npm --prefix website run verify:build
npm --prefix website run serve
```

O verificador percorre HTML, links internos, âncoras, imagens e arquivos estáticos sob o prefixo `/TG-KEZIA2/`. Uma alteração de nome do repositório exige revisar esse prefixo e o endereço de configuração.

## GitHub Pages

O workflow da documentação usa GitHub Actions e a branch `login/prazo`. PRs validam o build; a publicação é restrita à branch de origem e ao ambiente `github-pages`. Em Settings → Pages, a fonte precisa ser **GitHub Actions**. Essa configuração pode exigir a proprietária/administradora do repositório.

O envio do código não prova publicação. Confira a execução do workflow e depois abra o endereço de Pages, incluindo uma rota interna diretamente. O portal é independente da hospedagem Vercel do aplicativo.

## Processo de engenharia

Este avanço segue as skills do Matt Pocock: implementação a partir da proposta aprovada, testes nas interfaces da geração e revisão por padrões e especificação. Pendências e resultados reais ficam nos documentos do projeto. O arquivo de proposta anterior é preservado como registro histórico da aprovação, sem adicionar outro framework ao processo.
