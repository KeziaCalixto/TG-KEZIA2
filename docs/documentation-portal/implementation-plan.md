# Portal Docusaurus — implementação aprovada

Aprovação recebida em 08/11/2026. Referência: docs/superpowers/specs/2026-11-08-documentation-portal-design.md. Workflow solicitado: Matt Pocock implement, TDD em interfaces relevantes e code-review. Tarefas locais registradas aqui e no backlog; sem exigir novo coordenador, instalação de skills ou escolha de processo.

Base da implementação: 5f21224. Permanecer na branch login/prazo e fazer commits por avanço.

## Etapas

- [x] Recuperar materiais posteriores com lista explícita e SHA-256, preservando código e migrations.
- [x] Criar publisher determinístico: manifest de páginas/arquivos → Markdown e assets permitidos. Testar reescrita de links, arquivo ausente, rota e bloqueio de credenciais/travessia de caminho.
- [x] Criar website/ isolado com Docusaurus, identidade Prazo Claro, navegação e configuração do prefixo /TG-KEZIA2/.
- [x] Escrever percursos atuais e publicar referências existentes, relatório de banco expandido, diagramas e biblioteca acadêmica. Distinguir referências históricas do estado atual.
- [x] Validar testes do publisher, build, todos os links/âncoras/arquivos locais do HTML, desktop/celular/teclado e regressões pertinentes da aplicação.
- [x] Criar workflow de PR e Pages, registrar operação, evidências e revisão Standards/Spec conforme Matt Pocock.
- [x] Enviar commits e verificar a publicação: workflow 42505166931 aprovado, site público com busca, diagramas, PDF, recarga e 11 downloads da biblioteca conferidos. Evidências em docs/testing/documentation-portal-2026-11-08.md.

## Interfaces de verificação aprovadas pelo escopo

Publisher público prepareSite: verifica geração, publicação seletiva e links sem rede. Build/HTML e navegador: verificam as rotas, downloads, prefixo, responsividade e navegação finais. As regras processuais e a integração de banco não são alteradas por esta entrega.

## Decisões de implementação

Pacote website independente com lockfile próprio e comandos separados; o app Next.js mantém suas dependências. Docs geradas são ignoradas pelo Git; o manifest identifica cada fonte canônica e destino. Cache/artefatos locais não são publicados. Nenhum recurso do app será usado como backend da documentação.
