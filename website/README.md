# Portal Docusaurus

Instalação e comandos, a partir da raiz:

```sh
npm --prefix website ci --ignore-scripts
npm --prefix website start
npm --prefix website test
npm --prefix website run build
npm --prefix website run verify:build
npm --prefix website run serve
```

Desenvolvimento e serve: http://127.0.0.1:3001/TG-KEZIA2/ . Endereço de publicação esperado: https://keziacalixto.github.io/TG-KEZIA2/ .

O pacote é independente do Next.js e usa lockfile próprio. O manifest lista as fontes e assets permitidos. `content/` contém os guias editoriais; `.generated/docs/` e `static/generated/` são gerados, ignorados e não devem ser editados manualmente. `scripts/publisher.mjs` expande/revincula a documentação, bloqueia arquivos privados e produz hashes das fontes. O relatório de banco possui transformação explícita para tabelas e referências.

O workflow publica somente a branch login/prazo e necessita de Settings → Pages → Source: GitHub Actions, configurado por quem administra o repositório. Não usa chaves de Supabase, Brevo ou Vercel. A documentação segue Matt Pocock implement/TDD/code-review; proposta aprovada e plano estão em docs/documentation-portal/ e docs/superpowers/specs/ como registro da aprovação anterior.

Fontes da marca servidas localmente; licenças em static/NOTICE-fontes.txt. A adaptação em src/theme/SearchBar traduz o nome acessível do widget interativo após hidratação, sem editar sua dependência. Teste de navegador: `npm --prefix website run test:browser` (Edge no Windows; Chromium instalado pelo Playwright nos demais sistemas). Resultados e limites: docs/testing/documentation-portal-2026-11-08.md.
