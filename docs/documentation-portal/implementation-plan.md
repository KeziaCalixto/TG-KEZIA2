# Portal Docusaurus — implementação aprovada

Aprovação recebida em 08/11/2026. Referência: docs/superpowers/specs/2026-11-08-documentation-portal-design.md. Workflow solicitado: Matt Pocock implement, TDD em interfaces relevantes e code-review. Tarefas locais registradas aqui e no backlog; sem exigir novo coordenador, instalação de skills ou escolha de processo.

Base da implementação: 5f21224. Permanecer na branch login/prazo e fazer commits por avanço.

## Etapas

- [ ] Recuperar materiais posteriores com lista explícita e SHA-256, preservando código e migrations.
- [ ] Criar publisher determinístico: manifest de páginas/arquivos → Markdown e assets permitidos. Testar reescrita de links, arquivo ausente, rota e bloqueio de credenciais/travessia de caminho.
- [ ] Criar website/ isolado com Docusaurus, identidade Prazo Claro, navegação e configuração do prefixo /TG-KEZIA2/.
- [ ] Escrever percursos atuais e publicar referências existentes, relatório de banco expandido, diagramas e biblioteca acadêmica. Distinguir referências históricas do estado atual.
- [ ] Validar testes do publisher, build, todos os links/âncoras/arquivos locais do HTML, desktop/celular/teclado e regressões pertinentes da aplicação.
- [ ] Criar workflow de PR e Pages, registrar operação, evidências e revisão Standards/Spec conforme Matt Pocock.
- [ ] Enviar commits e verificar a publicação; se Pages exigir ação administrativa indisponível, informar exatamente a etapa restante com o portal já validado.

## Interfaces de verificação aprovadas pelo escopo

Publisher público prepareSite: verifica geração, publicação seletiva e links sem rede. Build/HTML e navegador: verificam as rotas, downloads, prefixo, responsividade e navegação finais. As regras processuais e a integração de banco não são alteradas por esta entrega.

## Decisões de implementação

Pacote website independente com lockfile próprio e comandos separados; o app Next.js mantém suas dependências. Docs geradas são ignoradas pelo Git; o manifest identifica cada fonte canônica e destino. Cache/artefatos locais não são publicados. Nenhum recurso do app será usado como backend da documentação.
