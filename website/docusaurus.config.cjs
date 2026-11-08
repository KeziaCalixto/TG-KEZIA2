const { themes } = require("prism-react-renderer");
module.exports = {
  title: "Prazo Claro",
  tagline: "Documentação do sistema e do Trabalho de Graduação II",
  favicon: "img/logo.svg",
  url: "https://keziacalixto.github.io",
  baseUrl: "/TG-KEZIA2/",
  trailingSlash: true,
  organizationName: "KeziaCalixto",
  projectName: "TG-KEZIA2",
  deploymentBranch: "gh-pages",
  onBrokenLinks: "throw",
  i18n: { defaultLocale: "pt-BR", locales: ["pt-BR"] },
  markdown: {
    format: "detect",
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: "throw" },
  },
  presets: [
    [
      "classic",
      {
        docs: {
          path: ".generated/docs",
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.cjs"),
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: { customCss: require.resolve("./src/css/custom.css") },
      },
    ],
  ],
  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        docsDir: ".generated/docs",
        indexBlog: false,
        language: ["pt", "en"],
        indexDocs: true,
        indexPages: true,
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: "/docs",
      },
    ],
  ],
  themeConfig: {
    image: "img/logo.svg",
    colorMode: { defaultMode: "light", respectPrefersColorScheme: true },
    navbar: {
      title: "prazo claro",
      logo: { alt: "Prazo Claro — documentação", src: "img/logo.svg" },
      items: [
        {
          to: "/docs/visao-geral/introducao",
          label: "Documentação",
          position: "left",
        },
        { to: "/docs/banco/visao-geral", label: "Diagramas", position: "left" },
        {
          to: "/docs/entrega/biblioteca",
          label: "Materiais",
          position: "left",
        },
        {
          href: "https://github.com/KeziaCalixto/TG-KEZIA2",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Leia por objetivo",
          items: [
            { label: "Usar o aplicativo", to: "/docs/manual/uso" },
            { label: "Entender o banco", to: "/docs/banco/visao-geral" },
            {
              label: "Manter o projeto",
              to: "/docs/desenvolvimento/instalacao",
            },
          ],
        },
        {
          title: "Projeto acadêmico",
          items: [
            { label: "Estado e limites", to: "/docs/visao-geral/estado" },
            {
              label: "Relatórios e apresentação",
              to: "/docs/entrega/biblioteca",
            },
            {
              label: "Código-fonte",
              href: "https://github.com/KeziaCalixto/TG-KEZIA2",
            },
          ],
        },
      ],
      copyright:
        "Prazo Claro · Kezia Calixto · TG II / FATEC Campinas. Demonstração acadêmica; revisão jurídica pendente.",
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ["sql", "powershell", "bash", "json", "typescript"],
    },
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    mermaid: { theme: { light: "neutral", dark: "dark" } },
  },
};
