const { pages } = require("./content-manifest.json");
const groups = {
  "visao-geral": "Comece aqui",
  manual: "Manual do usuário",
  engenharia: "Engenharia do sistema",
  banco: "Banco de dados",
  desenvolvimento: "Desenvolvimento",
  operacao: "Infraestrutura e operação",
  qualidade: "Qualidade e segurança",
  juridico: "Base jurídica e calendários",
  entrega: "Entrega acadêmica",
  evolucao: "Evolução do projeto",
  evidencias: "Evidências históricas",
  referencias: "Referências de implementação",
};
module.exports = {
  documentation: Object.entries(groups)
    .map(([key, label]) => ({
      type: "category",
      label,
      collapsed: !["visao-geral", "manual"].includes(key),
      items: pages.filter((p) => p.group === key).map((p) => p.id),
    }))
    .filter((g) => g.items.length),
};
