"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { spCalendars2026 } from "@/domain/calendars/sp-2026";
import { spLocalities, type SpLocality } from "@/domain/calendars/localities";
import { formatDate } from "@/lib/utils";
import { laborSp2026 } from "@/domain/calendars/labor-sp-2026";
import { laborSp2027 } from "@/domain/calendars/labor-sp-2027";
import { criminalSpCalendars2026 } from "@/domain/calendars/criminal-sp-comarcas-2026";
import { regimeLabels, type ProceduralRegime } from "@/domain/deadlines/types";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const kindLabels = {
  holiday: "Sem expediente",
  suspension: "Suspensão",
  partial_closure: "Expediente parcial",
  unavailability: "Indisponibilidade",
  interruption: "Interrupção",
  publication_restriction: "Restrição de publicação",
};
export function JudicialCalendarView() {
  const [month, setMonth] = useState("all");
  const [locality, setLocality] = useState<SpLocality>("São Paulo");
  const [profile, setProfile] = useState<ProceduralRegime>("civil");
  const [year, setYear] = useState("2026");
  const calendar =
    profile === "civil"
      ? spCalendars2026[locality]
      : profile === "labor"
        ? year === "2027"
          ? laborSp2027
          : laborSp2026
        : criminalSpCalendars2026[locality];
  const events = calendar.events
    .filter((event) => month === "all" || event.start.slice(5, 7) === month)
    .toSorted((a, b) => a.start.localeCompare(b.start));
  return (
    <>
      <div className="notice">
        <Info size={19} aria-hidden="true" />
        <p>
          <strong>Calendário demonstrativo.</strong> A lista não certifica a
          ausência de outros atos ou suspensões por foro, vara ou sistema.
          Exceções ainda não modeladas bloqueiam o cálculo.
        </p>
      </div>
      <section className="content-card">
        <div className="filter-row">
          <label htmlFor="calendar-profile">Perfil do calendário</label>
          <select
            id="calendar-profile"
            value={profile}
            onChange={(event) => {
              setProfile(event.target.value as ProceduralRegime);
              setLocality("São Paulo");
              setYear("2026");
            }}
          >
            <option value="civil">Civil · TJSP</option>
            <option value="labor">Trabalhista · TRT-2 Capital</option>
            <option value="criminal">Criminal · TJSP</option>
          </select>
          <div>
            <h2>
              Eventos de {year} — {calendar.locality}
            </h2>
            <p className="field-hint">
              {regimeLabels[profile]} · {calendar.court} · Versão{" "}
              {calendar.version} · Consulta em{" "}
              {formatDate(calendar.consultedOn)}
            </p>
          </div>
          <label htmlFor="calendar-locality">Comarca de SP</label>
          <select
            id="calendar-locality"
            value={locality}
            onChange={(event) => setLocality(event.target.value as SpLocality)}
          >
            {(profile === "labor" ? ["São Paulo"] : spLocalities).map(
              (name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ),
            )}
          </select>
          <label htmlFor="calendar-year">Ano do calendário</label>
          <select
            id="calendar-year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="2026">2026</option>
            {profile === "labor" ? <option value="2027">2027</option> : null}
          </select>
          <label htmlFor="month" className="sr-only">
            Filtrar mês
          </label>
          <select
            id="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          >
            <option value="all">Todos os meses</option>
            {months.map((name, i) => (
              <option key={name} value={String(i + 1).padStart(2, "0")}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="calendar-table-wrap">
          <table className="calendar-list">
            <caption className="sr-only">
              Eventos do calendário demonstrativo {calendar.court} —{" "}
              {calendar.locality}
            </caption>
            <thead>
              <tr>
                <th scope="col">Data / período</th>
                <th scope="col">Evento</th>
                <th scope="col">Efeito</th>
                <th scope="col">Origem</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    {formatDate(event.start)}
                    {event.end !== event.start ? (
                      <>
                        {" "}
                        a<br />
                        {formatDate(event.end)}
                      </>
                    ) : null}
                  </td>
                  <td>{event.name}</td>
                  <td>{kindLabels[event.kind]}</td>
                  <td>
                    <a href={event.source.url} target="_blank" rel="noreferrer">
                      Consultar ato
                      <span className="sr-only">: {event.source.title}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!events.length ? (
            <p className="status-message">
              Nenhum evento cadastrado para o mês. Isso não comprova expediente
              normal.
            </p>
          ) : null}
        </div>
      </section>
      <div className="info-card">
        <Info size={22} aria-hidden="true" />
        <div>
          <strong>Suspensão legal: 20 de dezembro a 20 de janeiro</strong>
          <p>
            {profile === "civil"
              ? "Perfil civil: CPC, art. 220."
              : profile === "labor"
                ? year === "2026"
                  ? "Perfil trabalhista: CLT, art. 775-A; a suspensão local de 21–23/01/2026 também está cadastrada, sem fechar o expediente."
                  : "Perfil trabalhista: CLT, art. 775-A. O calendário de 2027 não copia a suspensão extraordinária de janeiro de 2026; continua parcial e sujeito a novos atos."
                : "Perfil criminal ordinário: CPP, art. 798-A. Fechamentos intermediários não interrompem o curso contínuo; as exceções legais não são calculadas neste perfil."}{" "}
            Suspensão de contagem e ausência de expediente são conceitos
            diferentes.{" "}
            {profile === "labor"
              ? "A cobertura termina em dezembro de 2027; não há calendário de 2028."
              : "O TJSP ainda não tem cobertura de 2027 nesta versão."}
          </p>
        </div>
      </div>
    </>
  );
}
