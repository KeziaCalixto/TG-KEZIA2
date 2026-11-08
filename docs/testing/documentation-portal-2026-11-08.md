# Portal Docusaurus — verificação de 08/11/2026

## Escopo e processo

Portal estático independente, no repositório KeziaCalixto/TG-KEZIA2 e na branch login/prazo. Proposta aprovada pelo responsável; execução com as skills Matt Pocock implement, TDD e code-review. As interfaces sob teste são o publisher, o HTML estático final e a navegação no navegador. Não foi alterado o motor, calendário, regra, banco, Auth, Brevo ou Vercel.

Materiais recuperados: 114 arquivos, 13.654.925 bytes, com hashes em docs/documentation-portal/recovered-materials.json. Comparação normalizada LF/CRLF encontrou igualdade dos 71 arquivos de aplicação/migrations entre as duas cópias. Hashes de commits históricos pertencem à origem, sem fabricação de histórico no novo repositório.

## Comandos executados e resultados

- `node --test website/tests/publisher.test.mjs` e depois `npm --prefix website test`: cinco testes aprovados. Cada novo comportamento foi observado falhando antes de sua implementação: geração/link/download; arquivo privado/credencial; nome com espaço/acento; rota duplicada; referência original removida.
- `npm --prefix website run build`: build de produção concluído, com Docusaurus 3.10.2 e Node.js 22.14.0. Dependências e fontes fixadas em lockfile próprio.
- `npm --prefix website run verify:build`: 91 páginas HTML, 88 documentos e 6.416 referências locais conferidas sem erro no primeiro build aprovado. Inclui links, âncoras, imagens, scripts, CSS e downloads sob /TG-KEZIA2/.
- `pnpm check`: tipos, lint, formatação e 256 testes unitários em 18 arquivos aprovados. O primeiro check parou na formatação por CRLF da cópia Windows; os arquivos foram normalizados para o LF já existente no Git, sem alteração de conteúdo lógico. .gitattributes protege os binários e estabelece LF para texto. O cache Git de 102 arquivos idênticos byte a byte ao commit foi atualizado sem alterar seu conteúdo.
- Browser de diagnóstico: desktop 1440×1000 e celular 390×844; navegação, busca local, recarga, duas imagens de diagramas, PDF por assinatura %PDF-, Mermaid e dicionário completos aprovados. Axe com tags WCAG 2 A/AA e 2.1 AA encontrou zero violações nas páginas inicial e de banco após a correção de contraste do atalho da busca. Essa primeira etapa usou o CSS-fonte para isolar o ajuste e foi seguida de build novo; não é o aceite final do artefato compilado.

## Correções encontradas pela verificação

IDs numéricos de ADRs passaram a ser explícitos; links com espaços/acentos foram normalizados; a dependência opcional de layout requerida pelo tema Mermaid foi fixada. ESM explícito causava require.resolveWeak na geração SSR, e CommonJS explícito impedia os imports do código gerado; o pacote do portal passou a usar a detecção automática, mantendo scripts .mjs e configurações .cjs. Referência primária: https://github.com/facebook/docusaurus/discussions/11326 .

O atalho Ctrl K da busca tinha contraste insuficiente; foi ligado à cor de texto secundária do design system. A revisão Standards identificou aria-label Search na biblioteca; um wrapper local adapta o controle interativo para Pesquisar após hidratação, sem copiar/editar node_modules. O teste de navegador exige esse nome. Placeholder e skip-link traduzidos; Lato e EB Garamond servidos localmente.

A auditoria de links-fonte identificou uma referência a docs/6-Template_Relatorio_TG-II.pdf, removido na nova cópia pelo commit bf3abaf. O publisher identifica a referência como arquivo indisponível, em vez de fabricar um link para um arquivo inexistente. Fontes presentes fora do portal têm link para o repositório; imagens não permitidas impedem a geração.

## Revisão Matt Pocock

Ponto fixo 5f21224. Standards e Spec foram revisados separadamente sobre a recuperação e o portal (ba11afb, 13ad0ca). Spec: sem achados acionáveis, incluindo recuperação/hash e cobertura. Standards: um achado P2 de nome acessível em inglês; adaptação revisada e aceita para o estado funcional após hidratação. Fontes locais atendem ao design system. Não foi exigida nova validação jurídica.

## Aceites finais e limites

**Artefato final aprovado localmente:** novo build de produção com fontes locais e rótulo corrigido; verificador repetido com 91 páginas/88 documentos/6.416 referências locais e zero erros. Browser sem injeção de CSS aprovado em desktop e celular: atalho por Tab/Enter continua no conteúdo, menu móvel, busca com seleção de resultado, recarga, duas imagens de diagramas, download real do PDF, Mermaid e dicionário. Lato e EB Garamond confirmadas como carregadas por document.fonts. Modo escuro desktop conferido com axe e captura; zero violações nas páginas e estados automatizados. Capturas públicas: docs-portal-desktop.png, docs-portal-mobile.png e docs-portal-dark.png. Licenças das fontes preservadas como asset estático. O teste de teclado verifica o comportamento de navegação para o primeiro link do conteúdo, sem depender do foco transitório usado internamente pelo framework. Publicação GitHub Pages não deve ser inferida do build. A credencial ativa tem push, sem admin; consulta de Pages retornou 404, e o responsável recebeu orientação para habilitar Source = GitHub Actions na conta administradora. Workflows têm validação em PR, publicação restrita a login/prazo e permissões de Pages/OIDC somente no deploy.

Não houve nova execução SQL, reset, migração, envio de e-mail ou inspeção de dados de produção. Testes históricos citados no conteúdo conservam sua data. Testes automatizados de acessibilidade não equivalem a auditoria completa de todas as páginas ou tecnologias assistivas.

## Publicação e correção de downloads

O workflow [42504267382](https://github.com/KeziaCalixto/TG-KEZIA2/actions/runs/42504267382), commit `315298f`, concluiu build e deploy com sucesso. Home e rota direta do banco responderam HTTP 200. A verificação hospedada detectou um erro adicional nos downloads: a URL do PDF terminava em `.pdf/` e retornava 404; a mesma URL sem a barra retornava 200 com assinatura `%PDF-`. O arquivo estava publicado e a diferença de maiúsculas não era a causa.

O servidor local e `path.resolve` no Windows toleravam essa barra. O verificador de HTML passou a rejeitar âncoras cujo caminho termina em barra e aponta a arquivo: execução vermelha sobre o build anterior, seguida de zero erros no build corrigido (91 páginas, 88 documentos, 6.416 referências). O publisher usa `pathname://` para downloads e o `baseUrl` canônico da configuração; imagens mantêm o processamento anterior. Referência primária: [roteamento e arquivos estáticos do Docusaurus](https://docusaurus.io/docs/advanced/routing#escaping-from-spa-redirects). Cinco testes da geração novamente aprovados. Revisão complementar Standards e Spec: zero achados concretos.

As capturas aguardam/encerram transições finitas. A medição de contraste do tema escuro passou a aguardar `Animation.finished`: o atributo do tema mudava antes de as cores terminarem a transição, produzindo uma falha intermediária de contraste no botão. A asserção não foi removida nem o limite de contraste reduzido. A primeira tentativa de conferência externa por `networkidle` expirou; a conferência pública usa DOM pronto e espera os estados visíveis de cada recurso.
