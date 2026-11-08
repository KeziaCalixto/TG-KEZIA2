# Portal de documentação do Prazo Claro

Data: 08/11/2026. Estado: aprovada pelo responsável em 08/11/2026; implementação pelo workflow Matt Pocock.

## Objetivo e destinatários

Criar a documentação completa do projeto em um portal Docusaurus hospedado no GitHub Pages do repositório da autora. A leitura deve atender autora, orientação/banca, usuários da demonstração e quem precisar instalar ou manter o sistema. Conteúdo em pt-BR, com navegação por assunto e distinção entre implementação, demonstração acadêmica e expansão planejada.

Solicitação explícita: Docusaurus e GitHub Pages; repositório da amiga. Escolhas propostas pelo agente: diretório website/, organização editorial abaixo, integração de diagramas e automação baseada em artefatos.

## Contexto conferido

- Projeto atual: C:/Users/Eduardo/Documents/TG-KEZIA2.
- Origin: https://github.com/KeziaCalixto/TG-KEZIA2.git.
- Branch local e padrão remota: login/prazo. Base local: bf3abaf; diretório limpo no início.
- Conector GitHub indica repositório público e permissão de push, sem administração.
- A cópia atual possui 110 arquivos versionados em docs/. Não contém docs/relatorio-banco, docs/relatorio-tg2, docs/apresentacao-tg2 nem output/documents.
- A cópia anterior em C:/Users/Eduardo/Desktop/TG-KEZIA2 preserva os materiais produzidos posteriormente, inclusive o relatório de banco de 04/11 e o aceite humano do lembrete de 24/10.
- Aplicação Next.js, domínio e configuração Supabase/Vercel permanecem decisões do sistema. O portal é estático e não acessa contas, banco, Mailpit ou Brevo.

## Abordagens e recomendação

1. Portal no mesmo repositório, em website/, com publicação por GitHub Actions: recomendada. Permite versionar a documentação junto do código e preservar docs/ e os materiais originais. Docusaurus produz os arquivos estáticos; Pages hospeda o resultado.
2. Repositório separado só de documentação: acrescenta sincronização, permissões e referências entre projetos. A necessidade de separação não foi solicitada.
3. Substituir a raiz Next.js pelo Docusaurus: conflita com o aplicativo existente e não atende à preservação do projeto.

Docusaurus e Pages já foram escolhidos pelo usuário. A separação website/ é uma proposta de implementação, não uma preferência atribuída ao usuário. Não haverá migração de hospedagem do aplicativo.

## Conteúdo e navegação

Página inicial com identidade Prazo Claro, contexto do TG II, acesso aos principais percursos e aviso acadêmico conciso. Menu lateral, sumário por página, links anteriores/próximos e navegação responsiva. Organizar:

1. Visão geral: problema, concepção, objetivos, escopo implementado, versões e limites.
2. Manual do usuário: simulação civil/criminal/trabalhista, calendário e fontes, memória, exportação, conta, Google, convite, recuperação, histórico e lembretes.
3. Engenharia: requisitos, glossário, arquitetura modular, domínio determinístico, versionamento, decisões ADR e contratos de API.
4. Banco de dados: modelo conceitual e físico, dicionário completo das sete tabelas e 65 colunas, chaves, índices, RLS, funções e fila. Diagramas gerais do banco e da arquitetura disponíveis no site e em PDF/SVG ampliável.
5. Desenvolvimento: pré-requisitos, instalação, ambiente local, comandos, testes e contribuição.
6. Infraestrutura e operação: Vercel, Supabase, autenticação, canais SMTP/API, agendador, ativação/suspensão, retenção e diagnóstico. Somente nomes de variáveis e exemplos seguros.
7. Qualidade e segurança: estratégia, evidências datadas, limites da revisão, isolamento e proteção de dados.
8. Base jurídica e calendários: documentação e fontes já levantadas, cobertura, revisão pendente e casos de referência; sem alterar regras ou declarar nova validação jurídica.
9. Entrega acadêmica: guia, relatório TG2, relatório do banco, apresentação, pôster, roteiro e downloads efetivamente disponíveis.
10. Evolução: backlog, limitações e registro dos marcos. Evidências históricas não serão apresentadas como execução nova em novembro.

A organização deve cobrir toda a documentação pública pertinente. Registros históricos extensos podem ficar numa seção de referência com data e contexto; não precisam interromper os guias atuais.

## Preservação, fontes e publicação de arquivos

Recuperar somente os materiais pertinentes e já identificados da pasta anterior, com lista explícita de arquivos e comparação de hashes. Preservar nomes/datas dos artefatos anteriores. Não copiar .git, .env, dependências, diretórios temporários, cópias locais, RARs ou documentos pessoais. Os originais institucionais não entram automaticamente no portal público.

Manter uma fonte identificável para cada conteúdo publicado. Reutilizar Markdown e diagramas existentes quando forem compatíveis; adaptar os textos que exigem navegação web ou expansão de marcadores do gerador de relatórios. Se houver geração/cópia, fazê-la determinística, documentada e com lista explícita de entradas. Não manter duas versões manuais silenciosamente divergentes.

Links de edição, código e desenvolvimento apontam para KeziaCalixto/TG-KEZIA2 e a branch vigente. Hashes de execuções do repositório anterior continuam históricos, com proveniência correta; não devem ser fabricados no novo histórico Git. Corrigir resumos atuais que ainda anunciam recebimento do lembrete e materiais acadêmicos como pendentes, usando a evidência existente.

O portal não incorpora mensagens de e-mail reais, links de autenticação, dados de contas ou capturas que exponham esses dados. PDFs disponibilizados são os relatórios e exemplos de demonstração revisados.

## Interface e implementação

Seguir design-system/prazo-claro/MASTER.md: azul institucional, acento âmbar, tipografia e contraste legíveis. Acessibilidade: foco visível, teclado, títulos hierárquicos, alternativas textuais dos diagramas e bom comportamento em celular. Navegação e busca, se incluída, funcionam em hospedagem estática sem solicitar credenciais externas.

Docusaurus fica separado da execução Next.js. O implementador decide a versão estável compatível e o gerenciamento isolado de dependências, preservando os comandos existentes. Conteúdo essencial não depende de serviços de autenticação ou de rede em tempo de leitura além da entrega estática do site. Evitar analytics e integrações externas desnecessárias.

## GitHub Pages e entrega

Endereço esperado para site de projeto: https://keziacalixto.github.io/TG-KEZIA2/ . Configurar url, baseUrl e assets para o prefixo real, com links verificados sob esse prefixo. Não usar URLs antigas de proprietário para a navegação atual.

Workflow próprio: validação em PR e build/publicação a partir de login/prazo, com execução manual e permissões mínimas de Pages/OIDC. Usar artefato do build e ambiente github-pages, sem token pessoal ou segredos do aplicativo. A automação deve selecionar a branch correta e não publicar código de PR como produção.

Preparar e conferir o portal localmente antes da etapa hospedada. Verificar se Pages está habilitado com Source = GitHub Actions. Se a configuração administrativa não estiver disponível, entregar workflow e artefatos prontos e pedir somente a ação administrativa específica depois da validação. Não afirmar publicação sem URL e execução confirmadas.

Fazer commits por avanço, preservando alterações do usuário. Não alterar visibilidade do repositório nem configuração de Auth, banco ou Vercel para publicar a documentação.

## Critérios de aceite

- Conteúdo de todos os assuntos acima presente, navegável e coerente com as fontes.
- Relatórios e diagramas posteriores recuperados com proveniência e sem arquivos privados.
- Build de produção concluído com checagem de links internos e imagens; sem supressão geral de links quebrados.
- Rotas, downloads e assets funcionam sob /TG-KEZIA2/, inclusive acesso direto e recarga.
- Conferência local em desktop e celular: menu, títulos, imagens ampliadas e downloads; foco e teclado nos percursos principais.
- Workflow usa a branch login/prazo e permissões adequadas. Publicação remota tem aceite separado do build local.
- Comandos/resultados reais registrados em docs/testing/; backlog e instruções de manutenção atualizados.
- Código funcional, motor e migrations preservados. Nenhum teste antigo é alegado como reexecutado nesta tarefa.

## Referências técnicas consultadas

- https://docusaurus.io/docs/deployment
- https://docusaurus.io/docs/markdown-features
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

