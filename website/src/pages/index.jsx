import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
const paths = [
  [
    "01",
    "Usar e conferir",
    "Simule um prazo, leia os marcos e preserve sua memória.",
    "/docs/manual/uso",
  ],
  [
    "02",
    "Entender a engenharia",
    "Concepção, requisitos, arquitetura e decisões que orientam o sistema.",
    "/docs/engenharia/concepcao",
  ],
  [
    "03",
    "Explorar o banco",
    "Modelo completo, dicionário de dados, segurança e fluxos.",
    "/docs/banco/visao-geral",
  ],
  [
    "04",
    "Instalar e manter",
    "Ambiente local, testes e operação da infraestrutura.",
    "/docs/desenvolvimento/instalacao",
  ],
  [
    "05",
    "Preparar a apresentação",
    "Relatórios, guia, slides, pôster e diagramas para download.",
    "/docs/entrega/biblioteca",
  ],
  [
    "06",
    "Conferir evidências",
    "O que foi entregue, o que foi verificado e quais limites permanecem.",
    "/docs/visao-geral/estado",
  ],
];
export default function Home() {
  return (
    <Layout
      title="Documentação"
      description="Documentação completa do Prazo Claro: manual, engenharia, banco de dados, infraestrutura e materiais do TG II."
    >
      <main>
        <section className="portalHero">
          <div className="container heroGrid">
            <div>
              <p className="eyebrow">DOCUMENTAÇÃO DO PROJETO · TG II</p>
              <h1>
                Da primeira hipótese
                <br />
                <em>à memória do prazo.</em>
              </h1>
              <p className="heroLead">
                Conheça o Prazo Claro por dentro. Um lugar para usar, entender,
                desenvolver e apresentar o sistema.
              </p>
              <div className="heroActions">
                <Link
                  className="button button--primary button--lg"
                  to="/docs/visao-geral/introducao"
                >
                  Começar a leitura <span aria-hidden="true">→</span>
                </Link>
                <Link
                  className="button button--outline button--secondary button--lg"
                  to="/docs/entrega/biblioteca"
                >
                  Ver materiais de entrega
                </Link>
              </div>
              <p className="heroCaption">
                Kezia Calixto · Análise e Desenvolvimento de Sistemas
                <br />
                FATEC Campinas · Orientação: Prof. Eduardo Freitas
              </p>
            </div>
            <aside className="scopePanel" aria-label="Escopo documentado">
              <p className="eyebrow">O SISTEMA EM CONTEXTO</p>
              <h2>Uma data, com explicação.</h2>
              <p>
                Evento, regra, calendário e trilha preservados em uma memória de
                cálculo.
              </p>
              <dl>
                <div>
                  <dt>Perfis demonstrativos</dt>
                  <dd>Civil · Criminal · Trabalhista</dd>
                </div>
                <div>
                  <dt>Engenharia</dt>
                  <dd>Motor determinístico e versões explícitas</dd>
                </div>
                <div>
                  <dt>Persistência</dt>
                  <dd>Histórico individual e lembretes opcionais</dd>
                </div>
              </dl>
              <Link to="/docs/visao-geral/estado">
                Conferir cobertura e limites →
              </Link>
            </aside>
          </div>
        </section>
        <section
          className="container readingSection"
          aria-labelledby="reading-title"
        >
          <div className="sectionIntro">
            <p className="eyebrow">ENCONTRE SEU PONTO DE PARTIDA</p>
            <h2 id="reading-title">Leia pelo que você precisa fazer.</h2>
            <p>
              Do uso cotidiano às decisões de projeto, com fontes e evidências
              em cada percurso.
            </p>
          </div>
          <div className="readingGrid">
            {paths.map(([n, title, description, to]) => (
              <Link className="readingCard" to={to} key={n}>
                <span className="cardNumber" aria-hidden="true">
                  {n}
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="cardArrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="academicNote container">
          <strong>Clareza sobre o alcance.</strong>
          <p>
            Esta é uma demonstração acadêmica. Os calendários são parciais e a
            revisão jurídica permanece pendente. Testes técnicos não certificam
            tempestividade em processos reais.
          </p>
          <Link to="/docs/visao-geral/estado">
            Estado da entrega e evidências →
          </Link>
        </section>
      </main>
    </Layout>
  );
}
