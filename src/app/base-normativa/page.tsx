import { AppShell } from "@/components/app-shell";
import { cpcSource, electronicDiarySource } from "@/domain/calendars/tjsp-2026";
import { spCalendars2026 } from "@/domain/calendars/sp-2026";
import { RULE_VERSION } from "@/domain/deadlines/calculate";
import { proceduralActs } from "@/domain/deadlines/acts";
import { laborSp2026 } from "@/domain/calendars/labor-sp-2026";
import { laborSp2027 } from "@/domain/calendars/labor-sp-2027";
import { criminalSp2026 } from "@/domain/calendars/criminal-sp-2026";
import {
  laborSource,
  criminalSource,
  saturdaySource,
  extendedProfiles,
  laborDiarySource,
  criminalDiarySource,
  criminalSpProfile,
} from "@/domain/deadlines/profiles";
import { Info } from "lucide-react";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Base normativa" };
export default function RulesPage() {
  const sources = [
    ...new Map(
      [
        cpcSource,
        electronicDiarySource,
        laborSource,
        criminalSource,
        saturdaySource,
        laborDiarySource,
        criminalDiarySource,
        ...proceduralActs.flatMap((act) => act.sources),
        ...laborSp2026.events.map((event) => event.source),
        ...laborSp2027.events.map((event) => event.source),
        ...criminalSp2026.events.map((event) => event.source),
        ...Object.values(spCalendars2026).flatMap((calendar) =>
          calendar.events.map((event) => event.source),
        ),
      ].map((source) => [source.id, source]),
    ).values(),
  ];
  return (
    <AppShell active="/base-normativa">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CRITÉRIOS E PROVENIÊNCIA</p>
          <h1>Uma contagem explicável.</h1>
          <p className="page-description">
            Consulte os fundamentos e os limites de cada perfil demonstrativo.
          </p>
        </div>
      </div>
      <div className="notice">
        <Info size={19} aria-hidden="true" />
        <p>
          <strong>Revisão jurídica pendente.</strong> Estas regras foram
          pesquisadas em fontes oficiais. A verificação técnica não representa
          homologação por profissional do Direito.
        </p>
      </div>
      <section className="content-card">
        <h2>Atos com duração predefinida</h2>
        <p>
          Catálogo inicial: escolha opcional no formulário, com confirmação
          específica das condições. Dúvida, hipótese excluída ou duração
          incompatível não gera vencimento. A quantidade manual continua
          disponível, sob conferência do usuário.
        </p>
        {proceduralActs.map((act) => (
          <div className="source-item" key={act.id}>
            <h3>
              {act.label} · {act.days}{" "}
              {act.countingMode === "business"
                ? "dias úteis"
                : "dias processuais, curso contínuo após início útil"}
            </h3>
            <p>
              {act.scope} Versão {act.version}; consulta em 22/10/2026; revisão
              jurídica pendente.
            </p>
            <ul>
              {act.conditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
            <p>Fora desta seleção: {act.exclusions.join(" ")}</p>
          </div>
        ))}
        <p>
          Não verifica admissibilidade, protocolo, interrupção ou reinício de
          outros prazos. Fontes do ato são distintas das regras de contagem e
          dos eventos do calendário.
        </p>
      </section>
      <section className="content-card">
        <h2>Perfil civil comum — DJEN</h2>
        <div className="source-item">
          <h3>1. Identificação da publicação</h3>
          <p>
            Quando você informa a disponibilização no DJEN, considera-se como
            publicação o primeiro dia útil seguinte. Se você já informa a
            publicação, esse avanço não é aplicado novamente.
          </p>
        </div>
        <div className="source-item">
          <h3>2. Exclusão do marco e contagem em dias úteis</h3>
          <p>
            Exclui-se a publicação. A contagem registra os dias úteis seguintes,
            descontando fins de semana e eventos cadastrados. O período de 20/12
            a 20/01 é suspensão da contagem civil.
          </p>
        </div>
        <div className="source-item">
          <h3>3. Situações que exigem conferência</h3>
          <p>
            Calendário sem cobertura suficiente, publicação em dia incompatível,
            expediente parcial, indisponibilidade e interrupção ainda não
            modelados geram resultado incompleto, sem vencimento.
          </p>
        </div>
        <p>
          Regra: <code>{RULE_VERSION}</code>. Escopo: procedimento civil comum,
          dias úteis, publicação sem exigência de intimação pessoal, dez
          comarcas do TJSP em SP. Prazos especiais permanecem fora deste perfil.
        </p>
      </section>
      <section className="content-card">
        <h2>Perfil trabalhista — TRT-2 Capital</h2>
        <p>
          Dias úteis, com exclusão da publicação e suspensão legal inclusiva de
          20/12 a 20/01 (CLT, arts. 775 e 775-A). O calendário próprio do TRT-2
          inclui os fechamentos de 2026 e 2027. A suspensão extraordinária de 21
          a 23/01 pertence somente a 2026, sem repetição automática em 2027.
          Suspensão do prazo não transforma um dia de expediente em feriado de
          publicação.
        </p>
        <p>
          O anexo da Portaria GP 19/2026 fundamenta o calendário de 2027. A
          travessia usa uma composição explícita das duas versões anuais,
          identificadas na memória, sem alterar a versão anterior de 2026.
          Cobertura parcial até 31/12/2027; atos locais supervenientes ainda
          exigem conferência.
        </p>
        <p>
          {extendedProfiles.labor.scope} Regra:{" "}
          <code>
            {extendedProfiles.labor.id}@{extendedProfiles.labor.version}
          </code>
          . Contexto ordinário deve ser confirmado; dúvidas e exceções não geram
          vencimento.
        </p>
      </section>
      <section className="content-card">
        <h2>Perfil criminal — TJSP em SP</h2>
        <p>
          Prazo processual comunicado pelo DJEN: primeiro dia computado útil,
          seguido de curso contínuo (CPP, art. 798; Lei 11.419/2006, art. 4º).
          Fins de semana e feriados intermediários consomem dias. O fim nominal
          não útil é prorrogado sem acrescentar unidades, inclusive sábado (Lei
          1.408/1951, art. 3º).
        </p>
        <p>
          A suspensão de 20/12 a 20/01 segue o CPP, art. 798-A. Réu preso
          vinculado, Maria da Penha, urgência e procedimentos especiais não são
          calculados. Júri é exclusão de escopo, não uma quarta exceção expressa
          desse artigo.
        </p>
        <p>
          {criminalSpProfile.scope} Regra da Capital preservada:{" "}
          <code>
            {extendedProfiles.criminal.id}@{extendedProfiles.criminal.version}
          </code>
          ; demais nove comarcas:{" "}
          <code>
            {criminalSpProfile.id}@{criminalSpProfile.version}
          </code>
          . A confirmação também exige publicação válida a advogado constituído
          e ausência de intimação pessoal exigível.
        </p>
      </section>
      <section className="content-card">
        <h2>Fontes oficiais</h2>
        {sources.map((source) => (
          <article className="source-item" key={source.id}>
            <h3>{source.title}</h3>
            <p>{source.provision}</p>
            <a
              className="text-link"
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              Consultar fonte oficial
              <span className="sr-only">: {source.title}</span> ↗
            </a>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
