"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Calculator,
  Info,
  LoaderCircle,
  RotateCcw,
  Scale,
} from "lucide-react";
import { calculationInputSchema } from "@/domain/deadlines/schema";
import { proceduralActs } from "@/domain/deadlines/acts";
import { spLocalities } from "@/domain/calendars/localities";
import type {
  CalculationInput,
  CalculationResult,
  ProceduralRegime,
} from "@/domain/deadlines/types";
import { Button } from "./ui/button";
import { CalculationResultPanel } from "./calculation-result";

const defaultValues: CalculationInput = {
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "",
  days: 15,
};
function focusErrors() {
  requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
}

export function DeadlineCalculator() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CalculationInput>({
    resolver: zodResolver(calculationInputSchema),
    defaultValues,
    shouldFocusError: false,
  });
  const values = useWatch({ control });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState("");
  const resultIsCurrent =
    result?.input &&
    Object.entries(result.input).every(
      ([key, value]) =>
        key === "act" || values[key as keyof CalculationInput] === value,
    ) &&
    result.input.act?.id === values.act?.id &&
    result.input.act?.version === values.act?.version &&
    result.input.act?.eligibility === values.act?.eligibility;
  const visibleResult = resultIsCurrent ? result : null;
  const regime = values.regime ?? "civil";
  const criminal = regime === "criminal";
  const selectedAct = proceduralActs.find(
    (act) => act.id === values.act?.id && act.version === values.act?.version,
  );
  function changeAct(id: string) {
    const act = proceduralActs.find(
      (candidate) => candidate.id === id && candidate.regime === regime,
    );
    const { act: _previous, ...current } = getValues();
    void _previous;
    reset(
      act
        ? {
            ...current,
            days: act.days,
            act: { id: act.id, version: act.version, eligibility: "unknown" },
          }
        : current,
    );
    setResult(null);
    setError("");
  }
  function changeRegime(next: ProceduralRegime) {
    const current = getValues();
    const common = {
      medium: current.medium,
      communication: current.communication,
      eventDate: current.eventDate,
      days: current.days,
    };
    reset(
      next === "civil"
        ? { ...common, regime: "civil", court: "TJSP", locality: "São Paulo" }
        : {
            ...common,
            regime: next,
            court: next === "labor" ? "TRT2" : "TJSP",
            locality: "São Paulo",
            context: "unknown",
          },
    );
    setResult(null);
    setError("");
  }
  async function submit(input: CalculationInput) {
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Não foi possível calcular.");
      setResult(data);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível conectar.",
      );
      focusErrors();
    }
  }
  return (
    <>
      <div className="notice">
        <Info size={19} aria-hidden="true" />
        <p>
          <strong>Transparência em primeiro lugar.</strong> Esta versão
          acadêmica usa calendários parciais: TJSP 2026 e TRT-2 Capital
          2026–2027. Os resultados são simulações, com revisão jurídica
          pendente.
        </p>
        <span className="notice-badge">PERFIS DEMONSTRATIVOS</span>
      </div>
      <div className="calculator-grid">
        <section className="calculator-card" aria-labelledby="form-title">
          <div className="card-heading">
            <span className="card-heading-icon">
              <Calculator size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="form-title">Novo cálculo</h2>
              <p>Comece pelas informações do prazo.</p>
            </div>
            <button
              type="button"
              className="reset-button"
              onClick={() => {
                reset(defaultValues);
                setResult(null);
                setError("");
              }}
              aria-label="Limpar formulário"
            >
              <RotateCcw size={17} aria-hidden="true" />
            </button>
          </div>
          <form noValidate onSubmit={handleSubmit(submit, focusErrors)}>
            {error || Object.keys(errors).length ? (
              <div
                id="form-errors"
                className="error-summary"
                role="alert"
                tabIndex={-1}
              >
                <strong>Revise os dados para continuar.</strong>
                {error ? (
                  <p>{error}</p>
                ) : (
                  <ul>
                    {Object.entries(errors).map(([field, issue]) => (
                      <li key={field}>
                        <a href={`#${field}`}>{issue.message}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            <fieldset className="form-section">
              <legend>
                <span className="step-number">01</span>Contexto do processo
              </legend>
              <div className="field">
                <label htmlFor="regime">Regime processual</label>
                <div className="input-with-icon">
                  <Scale size={17} aria-hidden="true" />
                  <select
                    id="regime"
                    {...register("regime")}
                    onChange={(event) =>
                      changeRegime(event.target.value as ProceduralRegime)
                    }
                  >
                    <option value="civil">Civil · Procedimento comum</option>
                    <option value="labor">Trabalhista · TRT-2 Capital</option>
                    <option value="criminal">
                      Criminal · Processo comum / DJEN
                    </option>
                  </select>
                </div>
                <p className="field-hint">
                  Cada perfil tem regra e calendário próprios. Revisão jurídica
                  pendente.
                </p>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="court">Tribunal</label>
                  <select id="court" {...register("court")}>
                    {regime === "labor" ? (
                      <option value="TRT2">TRT-2</option>
                    ) : (
                      <option value="TJSP">TJSP</option>
                    )}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="locality">Comarca / município</label>
                  <select
                    id="locality"
                    {...register("locality")}
                    aria-describedby="locality-hint"
                  >
                    {(regime === "labor" ? ["São Paulo"] : spLocalities).map(
                      (locality) => (
                        <option key={locality} value={locality}>
                          {locality === "São Paulo"
                            ? "São Paulo — Capital"
                            : locality}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <p className="field-hint" id="locality-hint">
                {regime === "labor"
                  ? "Trabalhista: somente TRT-2, São Paulo Capital, 2026–2027. Outras localidades e unidades ainda não estão cobertas neste perfil."
                  : "10 comarcas de SP · Calendários parciais de 2026, no município sede. Outras comarcas e atos específicos de foro/vara ainda não estão cobertos."}
              </p>
              {regime !== "civil" ? (
                <div className="field">
                  <label htmlFor="context">
                    Contexto do prazo (obrigatório)
                  </label>
                  <select
                    id="context"
                    {...register("context")}
                    aria-describedby="context-hint"
                  >
                    <option value="unknown">Não sei / ainda não conferi</option>
                    <option value="ordinary">
                      Confirmo o perfil comum descrito abaixo
                    </option>
                    {criminal ? (
                      <>
                        <option value="custody">
                          Réu preso no processo vinculado
                        </option>
                        <option value="domestic_violence">
                          Violência doméstica / Lei Maria da Penha
                        </option>
                        <option value="urgent">Medida urgente</option>
                      </>
                    ) : null}
                    <option value="special">
                      Procedimento, prerrogativa ou determinação especial
                    </option>
                  </select>
                  <p className="field-hint" id="context-hint">
                    {criminal
                      ? "Confirme somente para prazo processual comum, publicação válida a advogado constituído e sem intimação pessoal exigível, réu preso vinculado, Maria da Penha, urgência, júri/procedimento especial, prazo material, dobro ou determinação específica."
                      : "Confirme somente para prazo processual comum pelo DJEN, sem intimação pessoal exigível, prerrogativa, prazo em dobro, procedimento ou determinação especial."}{" "}
                    Contexto desconhecido ou fora do perfil não gera vencimento.
                  </p>
                </div>
              ) : null}
              <div className="field">
                <span className="field-label" id="medium-label">
                  Suporte dos autos
                </span>
                <div
                  className="segmented"
                  role="group"
                  aria-labelledby="medium-label"
                >
                  <label>
                    <input
                      type="radio"
                      value="electronic"
                      {...register("medium")}
                    />
                    <span>Eletrônicos</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="physical"
                      {...register("medium")}
                    />
                    <span>Físicos</span>
                  </label>
                </div>
                <p className="field-hint">
                  O suporte dos autos é diferente do meio de comunicação.
                </p>
              </div>
            </fieldset>
            <fieldset className="form-section">
              <legend>
                <span className="step-number">02</span>Comunicação processual
              </legend>
              <div className="field">
                <label htmlFor="communication">Qual data você possui?</label>
                <select id="communication" {...register("communication")}>
                  <option value="publication">
                    Data da publicação no DJEN
                  </option>
                  <option value="availability">
                    Data da disponibilização no DJEN
                  </option>
                </select>
                <p className="field-hint">
                  Disponibilização e publicação são marcos diferentes.
                </p>
              </div>
              <div className="field">
                <label htmlFor="eventDate">
                  {values.communication === "availability"
                    ? "Data da disponibilização"
                    : "Data da publicação"}
                  <span className="required-indicator" aria-hidden="true">
                    {" "}
                    *
                  </span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  min="2026-01-01"
                  max={regime === "labor" ? "2027-12-31" : "2026-12-31"}
                  {...register("eventDate")}
                  aria-required="true"
                  aria-invalid={!!errors.eventDate}
                  aria-describedby={
                    errors.eventDate ? "eventDate-error date-hint" : "date-hint"
                  }
                />
                {errors.eventDate ? (
                  <p id="eventDate-error" className="field-error">
                    {errors.eventDate.message}
                  </p>
                ) : null}
                <p id="date-hint" className="field-hint">
                  {regime === "labor"
                    ? "Cobertura demonstrativa: janeiro de 2026 a dezembro de 2027, com versões anuais preservadas."
                    : "Cobertura demonstrativa: janeiro a dezembro de 2026."}
                </p>
              </div>
            </fieldset>
            <fieldset className="form-section">
              <legend>
                <span className="step-number">03</span>Duração do prazo
              </legend>
              <div className="field">
                <label htmlFor="act">Ato processual</label>
                <select
                  id="act"
                  value={values.act?.id ?? ""}
                  onChange={(event) => changeAct(event.target.value)}
                  aria-describedby="act-hint"
                >
                  <option value="">
                    Quantidade manual — conferir a duração
                  </option>
                  {proceduralActs
                    .filter((act) => act.regime === regime)
                    .map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.label} · {act.days} dias
                      </option>
                    ))}
                </select>
                <p id="act-hint" className="field-hint">
                  Catálogo inicial e parcial. A escolha não comprova cabimento
                  nem validade da comunicação.
                </p>
              </div>
              {selectedAct ? (
                <div className="act-conditions">
                  <p>
                    <strong>Condições para este ato</strong>
                  </p>
                  <ul>
                    {selectedAct.conditions.map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                  <details>
                    <summary>Hipóteses excluídas e fontes</summary>
                    <ul>
                      {selectedAct.exclusions.map((exclusion) => (
                        <li key={exclusion}>{exclusion}</li>
                      ))}
                    </ul>
                    {selectedAct.sources.map((source) => (
                      <p key={source.id}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title} — {source.provision}
                        </a>
                      </p>
                    ))}
                  </details>
                  <div className="field">
                    <label htmlFor="act-eligibility">
                      Enquadramento do ato (obrigatório)
                    </label>
                    <select
                      id="act-eligibility"
                      {...register("act.eligibility")}
                      aria-describedby="act-eligibility-hint"
                    >
                      <option value="unknown">
                        Não sei / ainda não conferi
                      </option>
                      <option value="confirmed">
                        Conferi todas as condições e nenhuma exclusão se aplica
                      </option>
                      <option value="excluded">
                        Há hipótese excluída ou outro marco inicial
                      </option>
                    </select>
                    <p id="act-eligibility-hint" className="field-hint">
                      Dúvida ou incompatibilidade deixa o resultado incompleto.
                      Revisão jurídica pendente.
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="days-field">
                <div className="field">
                  <label htmlFor="days">Quantidade de dias</label>
                  <input
                    id="days"
                    type="number"
                    min={1}
                    max={365}
                    step={1}
                    readOnly={!!selectedAct}
                    {...register("days", { valueAsNumber: true })}
                    aria-invalid={!!errors.days}
                    aria-describedby={errors.days ? "days-error" : undefined}
                  />
                  {errors.days ? (
                    <p id="days-error" className="field-error">
                      {errors.days.message}
                    </p>
                  ) : null}
                </div>
                <span className="counting-unit">
                  {criminal ? "dias corridos após início útil" : "dias úteis"}{" "}
                  <span>
                    {criminal
                      ? "CPP, arts. 798 e 798-A"
                      : regime === "labor"
                        ? "CLT, arts. 775 e 775-A"
                        : "CPC, art. 219"}
                  </span>
                </span>
              </div>
              <div
                className="presets"
                aria-label="Preencher quantidade de dias"
              >
                {[5, 10, 15, 30].map((days) => (
                  <button
                    type="button"
                    key={days}
                    disabled={!!selectedAct}
                    aria-pressed={values.days === days}
                    onClick={() =>
                      setValue("days", days, { shouldValidate: true })
                    }
                  >
                    {days} dias
                  </button>
                ))}
              </div>
              <p className="field-hint">
                {selectedAct
                  ? "Duração fixa do ato selecionado. Para informar outra quantidade, escolha a opção manual."
                  : "A quantidade é informada por você; confira a duração legal aplicável. Os botões apenas preenchem dias e não identificam um ato."}
              </p>
            </fieldset>
            <div className="form-bottom">
              <p>
                <Info size={15} aria-hidden="true" />
                Citação, intimação pessoal, prazo em dobro e regras especiais
                ainda não são suportados.
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="calculate-button"
              >
                {isSubmitting ? (
                  <LoaderCircle className="spin" size={18} aria-hidden="true" />
                ) : (
                  <Calculator size={18} aria-hidden="true" />
                )}
                {isSubmitting ? "Calculando…" : "Calcular prazo"}
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <button
                type="button"
                className="example-button"
                onClick={() => {
                  reset(
                    regime === "civil"
                      ? { ...defaultValues, eventDate: "2026-10-06", days: 5 }
                      : {
                          ...defaultValues,
                          regime,
                          locality: "São Paulo",
                          court: regime === "labor" ? "TRT2" : "TJSP",
                          context: "unknown",
                          eventDate: "2026-10-06",
                          days: 5,
                        },
                  );
                  setResult(null);
                  setError("");
                }}
              >
                Preencher um exemplo
              </button>
            </div>
          </form>
        </section>
        <CalculationResultPanel
          key={
            visibleResult
              ? `${visibleResult.input?.regime}-${visibleResult.eventDate}-${visibleResult.input?.days}-${visibleResult.input?.communication}`
              : "empty"
          }
          result={visibleResult}
        />
      </div>
      <div className="method-note">
        <span className="method-number">i</span>
        <p>
          <strong>Como funciona a contagem?</strong> O dia da publicação é
          excluído.{" "}
          {criminal
            ? "O primeiro dia computado é útil; depois o curso é contínuo, com suspensão aplicável e prorrogação do vencimento não útil."
            : "Os dias úteis seguintes são computados, observando os eventos cadastrados e a suspensão aplicável ao perfil."}{" "}
          <a href="/base-normativa">
            Entenda os critérios <ArrowRight size={13} aria-hidden="true" />
          </a>
        </p>
      </div>
    </>
  );
}
