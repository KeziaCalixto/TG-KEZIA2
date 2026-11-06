"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  ArrowDownToLine,
  Printer,
  BookmarkPlus,
  ArrowRight,
  Info,
  Check,
  ExternalLink,
} from "lucide-react";
import type { CalculationResult } from "@/domain/deadlines/types";
import { formatDate } from "@/lib/utils";
import { regimeLabels } from "@/domain/deadlines/types";
import { Button } from "./ui/button";

function downloadResult(
  result: CalculationResult,
  historicalSnapshot?: unknown,
) {
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          historicalSnapshot === undefined
            ? { exportedAt: new Date().toISOString(), ...result }
            : {
                exportedAt: new Date().toISOString(),
                integrity: "unverified",
                originalSnapshot: historicalSnapshot,
              },
          null,
          2,
        ),
      ],
      { type: "application/json;charset=utf-8" },
    ),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `prazo-claro-${result.eventDate ?? "sem-data"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
function printResult(root: HTMLElement | null) {
  if (!root) return;
  const panels = [...root.querySelectorAll<HTMLDetailsElement>("details")];
  const previous = panels.map((panel) => panel.open);
  panels.forEach((panel) => {
    panel.open = true;
  });
  document.body.classList.add("printing-calculation");
  root.classList.add("print-target");
  const cleanup = () => {
    window.removeEventListener("afterprint", cleanup);
    document.body.classList.remove("printing-calculation");
    root.classList.remove("print-target");
    panels.forEach((panel, index) => {
      panel.open = previous[index];
    });
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  try {
    window.print();
  } catch {
    cleanup();
  }
}

export function CalculationResultPanel({
  result,
  historicalSnapshot,
}: {
  result: CalculationResult | null;
  historicalSnapshot?: unknown;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const memoryId = useId();
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  async function save() {
    if (!result?.input) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: result.input, title }),
      });
      const data = await response.json();
      setSaveMessage(
        response.ok
          ? "Cálculo salvo. Consulte seu histórico."
          : (data.error ?? "Não foi possível salvar."),
      );
    } catch {
      setSaveMessage("Não foi possível conectar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }
  if (!result)
    return (
      <aside className="result-column" aria-label="Prévia do resultado">
        <div className="result-placeholder">
          <div className="panel-kicker">
            <span className="tiny-dot" />
            SEU RESULTADO
          </div>
          <div className="calendar-art" aria-hidden="true">
            <div className="calendar-art-top" />
            <CalendarCheck2 size={57} strokeWidth={1.1} />
            <span className="calendar-check">
              <Check size={16} />
            </span>
          </div>
          <h2>
            O próximo passo é<br />
            ter o prazo à vista.
          </h2>
          <p>
            Preencha os dados ao lado para consultar a data estimada e
            acompanhar a memória de cálculo.
          </p>
          <div className="placeholder-divider" />
          <div className="placeholder-step">
            <span>1</span>Identifique a comunicação
          </div>
          <div className="placeholder-step">
            <span>2</span>Informe o prazo em dias
          </div>
          <div className="placeholder-step">
            <span>3</span>Confira a contagem e as fontes
          </div>
        </div>
        <div className="info-card">
          <BookIcon />
          <div>
            <strong>Uma conta que você pode conferir</strong>
            <p>
              O resultado apresenta os dias contados, os dias excluídos e os
              fundamentos utilizados.
            </p>
            <Link href="/base-normativa">
              Ver base normativa <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </aside>
    );
  const countedDays = result.trace.filter((day) => day.counted).length;
  const excludedDays = result.trace.filter(
    (day) => day.phase === "counting" && !day.counted,
  ).length;
  return (
    <aside
      ref={panelRef}
      className="result-column"
      aria-label="Resultado do cálculo"
      aria-live="polite"
    >
      <section
        className={`result-card ${result.status === "incomplete" ? "incomplete" : ""}`}
      >
        {historicalSnapshot !== undefined ? (
          <p className="snapshot-warning">
            <strong>Memória original do histórico · não verificada.</strong>{" "}
            Dados apresentados como foram salvos. Não houve substituição por
            calendário ou cálculo atual.
          </p>
        ) : null}
        <div className="panel-kicker">
          <span className="tiny-dot" />
          RESULTADO DO CÁLCULO
        </div>
        <span className="result-state">
          {result.status === "provisional"
            ? "SIMULAÇÃO · REVISÃO PENDENTE"
            : "DADOS INSUFICIENTES"}
        </span>
        <h2>
          {result.dueDate
            ? "Vencimento estimado"
            : "É preciso conferir mais dados"}
        </h2>
        {result.dueDate ? (
          <p className="due-date" data-testid="due-date">
            {formatDate(result.dueDate)}
          </p>
        ) : null}
        <p className="result-context">
          {result.input
            ? `${result.input.days} ${result.input.regime === "criminal" ? "dias corridos após início útil" : result.input.days === 1 ? "dia útil" : "dias úteis"} · ${regimeLabels[result.input.regime]} · ${result.input.court === "TRT2" ? "TRT-2" : "TJSP"} — ${result.snapshot.calendar.locality}`
            : "Entrada não reconhecida."}
        </p>
        {result.snapshot.act ? (
          <p className="result-context">
            <strong>Ato:</strong> {result.snapshot.act.label}
          </p>
        ) : null}
        {!result.dueDate ? (
          <p className="result-context">Nenhum vencimento foi emitido.</p>
        ) : null}
        <>
          <div className="result-metrics">
            <div>
              <strong>{countedDays}</strong>
              <span>
                {countedDays === 1 ? "dia computado" : "dias computados"}
              </span>
            </div>
            <div>
              <strong>{excludedDays}</strong>
              <span>
                {excludedDays === 1 ? "dia excluído" : "dias excluídos"}
              </span>
            </div>
          </div>
          <dl className="milestones">
            {result.nominalDueDate ? (
              <div>
                <dt>Fim nominal (antes da prorrogação)</dt>
                <dd>{formatDate(result.nominalDueDate)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Evento informado</dt>
              <dd>{formatDate(result.eventDate)}</dd>
            </div>
            <div>
              <dt>Publicação / marco excluído</dt>
              <dd>{formatDate(result.publicationDate)}</dd>
            </div>
            <div>
              <dt>Primeiro dia computado</dt>
              <dd>{formatDate(result.firstCountedDate)}</dd>
            </div>
            <div>
              <dt>Dia do começo (excluído)</dt>
              <dd>{formatDate(result.legalStartDate)}</dd>
            </div>
            <div>
              <dt>Comunicação</dt>
              <dd>
                {result.input?.communication === "availability"
                  ? "Disponibilização no DJEN"
                  : "Publicação no DJEN"}
              </dd>
            </div>
            <div>
              <dt>Suporte dos autos</dt>
              <dd>
                {result.input?.medium === "physical"
                  ? "Físicos"
                  : "Eletrônicos"}
              </dd>
            </div>
          </dl>
        </>
        <div className="result-warnings">
          {result.warnings.map((warning) => (
            <p key={warning}>
              <Info size={16} aria-hidden="true" />
              <span>{warning}</span>
            </p>
          ))}
        </div>
        {historicalSnapshot === undefined &&
        result.status === "provisional" &&
        result.dueDate ? (
          <div className="field save-title">
            <label htmlFor={`${memoryId}-title`}>
              Título para salvar (opcional)
            </label>
            <input
              id={`${memoryId}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              aria-describedby={`${memoryId}-title-hint`}
            />
            <p className="field-hint" id={`${memoryId}-title-hint`}>
              Até 120 caracteres. Use uma referência fictícia, sem dados de
              partes ou processos reais.
            </p>
          </div>
        ) : null}
        <div className="result-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadResult(result, historicalSnapshot)}
          >
            <ArrowDownToLine size={16} aria-hidden="true" />
            Exportar memória
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => printResult(panelRef.current)}
            aria-label="Imprimir memória de cálculo"
          >
            <Printer size={18} aria-hidden="true" />
          </Button>
          {historicalSnapshot === undefined &&
          result.status === "provisional" &&
          result.dueDate ? (
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={save}
              aria-label="Salvar cálculo no histórico"
            >
              <BookmarkPlus size={18} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        {saveMessage ? (
          <p role="status" className="save-message">
            {saveMessage} <Link href="/historico">Histórico</Link> ·{" "}
            <Link href="/entrar">Entrar</Link>
          </p>
        ) : null}
      </section>
      {result.trace.length ? (
        <details className="trace-panel" open>
          <summary>
            Memória de cálculo <span>{result.trace.length} registros</span>
          </summary>
          <div className="trace-scroll">
            <table>
              <caption className="sr-only">
                Datas percorridas e motivos de inclusão ou exclusão
              </caption>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Contagem</th>
                  <th scope="col">Motivo</th>
                  <th scope="col">Fundamento</th>
                </tr>
              </thead>
              <tbody>
                {result.trace.map((day) => (
                  <tr
                    key={`${day.phase}-${day.date}`}
                    className={day.counted ? "counted" : "excluded"}
                  >
                    <td>{formatDate(day.date)}</td>
                    <td>
                      {day.ordinal
                        ? `${day.ordinal}º dia`
                        : day.phase === "extension"
                          ? "Prorrogação"
                          : "Excluído"}
                    </td>
                    <td>{day.reasons.join(" · ")}</td>
                    <td>
                      {day.sourceIds.map((id) => {
                        const index = result.sources.findIndex(
                          (source) => source.id === id,
                        );
                        const source = result.sources[index];
                        return source ? (
                          <a
                            key={id}
                            className="trace-reference"
                            href={`#${memoryId}-source-${index}`}
                            onClick={() => {
                              const sources =
                                panelRef.current?.querySelector<HTMLDetailsElement>(
                                  ".sources-panel",
                                );
                              if (sources) sources.open = true;
                            }}
                            aria-label={`Fundamento ${index + 1}: ${source.title}, ${source.provision}`}
                          >
                            [{index + 1}]
                          </a>
                        ) : (
                          <span key={id}>Fonte não localizada</span>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
      <details className="sources-panel">
        <summary>Fontes e versões utilizadas</summary>
        <div className="sources-body">
          {result.snapshot.act ? (
            <div className="act-memory">
              <p>
                <strong>Ato: {result.snapshot.act.label}</strong>
                <br />
                {result.snapshot.act.days} dias · versão{" "}
                {result.snapshot.act.version}
                <br />
                {result.snapshot.act.scope}
                <br />
                Consulta: {formatDate(result.snapshot.act.consultedOn)} ·
                revisão jurídica pendente.
                <br />
                Condições declaradas:{" "}
                {result.input?.act?.eligibility === "confirmed"
                  ? "confirmadas pelo usuário"
                  : "não confirmadas ou incompatíveis"}
                .
              </p>
              <p>
                <strong>Condições do catálogo</strong>
              </p>
              <ul>
                {result.snapshot.act.conditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
              <p>
                <strong>Hipóteses excluídas</strong>
              </p>
              <ul>
                {result.snapshot.act.exclusions.map((exclusion) => (
                  <li key={exclusion}>{exclusion}</li>
                ))}
              </ul>
              <p>
                As fontes do ato estão identificadas abaixo. O catálogo não
                decide admissibilidade ou efeitos sobre outros prazos.
              </p>
            </div>
          ) : null}
          <p>
            <strong>
              {result.metadata.calendarCompleteness === "demonstration"
                ? "Calendário demonstrativo · cobertura parcial"
                : "Calendário com cobertura revisada"}
            </strong>
            <br />
            {result.snapshot.calendar.court === "TRT2"
              ? "TRT-2"
              : "TJSP"} — {result.snapshot.calendar.locality}
            <br />
            Cobertura: {formatDate(result.snapshot.calendar.from)} a{" "}
            {formatDate(result.snapshot.calendar.to)}
            <br />
            Revisão jurídica pendente.
          </p>
          {result.snapshot.rule ? (
            <p>
              Perfil: {regimeLabels[result.snapshot.rule.regime]} ·{" "}
              {result.snapshot.rule.countingMode === "continuous"
                ? "Curso contínuo após início útil"
                : "Dias úteis"}
              . {result.snapshot.rule.scope}
            </p>
          ) : null}
          {result.snapshot.calendar.components ? (
            <div>
              <p>
                <strong>Versões anuais que compõem a cobertura</strong>
              </p>
              <ul>
                {result.snapshot.calendar.components.map((part) => (
                  <li key={`${part.id}@${part.version}`}>
                    {part.id} · versão {part.version} · {formatDate(part.from)}{" "}
                    a {formatDate(part.to)}
                    {part.completeness === "demonstration"
                      ? " · demonstração / cobertura parcial"
                      : " · cobertura revisada"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.sources.map((source, index) => (
            <a
              key={source.id}
              id={`${memoryId}-source-${index}`}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              [{index + 1}] {source.title}
              <ExternalLink size={12} aria-hidden="true" />
              <small>{source.provision}</small>
              <span className="print-source-url">{source.url}</span>
            </a>
          ))}
          <p>
            Motor {result.metadata.engineVersion}
            {result.metadata.countingEngineVersion ? (
              <> · contagem {result.metadata.countingEngineVersion}</>
            ) : null}
            <br />
            Regra {result.metadata.ruleVersion}
            <br />
            Calendário {result.metadata.calendarVersion}
            <br />
            Consulta do calendário:{" "}
            {formatDate(result.metadata.calendarConsultedOn)}
            <br />
            Fuso: {result.metadata.timeZone}
          </p>
        </div>
      </details>
    </aside>
  );
}
function BookIcon() {
  return (
    <div className="info-card-icon">
      <Info size={21} aria-hidden="true" />
    </div>
  );
}
