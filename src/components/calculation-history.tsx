"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CalculationResult } from "@/domain/deadlines/types";
import { regimeLabels } from "@/domain/deadlines/types";
import { formatDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { historySnapshotSchema } from "@/application/history-snapshot";
import { CalculationResultPanel } from "./calculation-result";
import {
  useHistoryReminders,
  ReminderControls,
  CancelAllReminders,
} from "./calculation-reminders";
import {
  historyDueLabels,
  type HistoryDueStatus,
  type HistoryPagination,
} from "@/application/history-query";

interface HistoryItem {
  id: string;
  title: string | null;
  created_at: string;
  result_snapshot: unknown;
  recomputed: CalculationResult | null;
  integrity: string;
  dueStatus: HistoryDueStatus;
}
interface HistoryResponse {
  calculations: HistoryItem[];
  pagination: HistoryPagination;
  asOfDate: string;
  timeZone: string;
}
export function CalculationHistory({
  calculationId,
}: { calculationId?: string } = {}) {
  const [listing, setListing] = useState<{
    key: string;
    data?: HistoryResponse;
    error?: string;
  }>({ key: "" });
  const [selection, setSelection] = useState({
    regime: "all",
    page: 1,
    pageSize: 10,
  });
  const [refresh, setRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState<string | null>(calculationId ?? null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const confirmationRef = useRef<HTMLDivElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const paginationRef = useRef<HTMLParagraphElement>(null);
  const focusPagination = useRef(false);
  const key = `${calculationId ?? "all"}:${selection.regime}:${selection.page}:${selection.pageSize}:${refresh}`;
  const current = listing.key === key ? listing : null;
  const loading = !current;
  const data = current?.data;
  const items = data?.calculations ?? [];
  const pagination = data?.pagination;
  const reminders = useHistoryReminders(
    items.map((item) => item.id).join(","),
    key,
  );
  function changeSelection(next: typeof selection, navigate = false) {
    focusPagination.current = navigate;
    setSelection(next);
    setActive(null);
    setPendingDeleteId(null);
    setQuery("");
    setMessage("");
  }
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(selection.page),
      pageSize: String(selection.pageSize),
    });
    if (selection.regime !== "all") params.set("regime", selection.regime);
    if (calculationId) params.set("calculationId", calculationId);
    fetch(`/api/history?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setListing({
            key,
            error: data.error ?? "Não foi possível consultar o histórico.",
          });
          return;
        }
        if (selection.page > data.pagination.totalPages) {
          setSelection((previous) =>
            previous === selection
              ? { ...previous, page: data.pagination.totalPages }
              : previous,
          );
          return;
        }
        setListing({ key, data });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setListing({ key, error: "Não foi possível conectar ao histórico." });
      });
    return () => controller.abort();
  }, [key, selection, calculationId]);
  useEffect(() => {
    if (data && focusPagination.current && paginationRef.current) {
      paginationRef.current.focus();
      focusPagination.current = false;
    }
  }, [data]);
  useEffect(() => {
    const update = () => setRefresh((value) => value + 1);
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, []);
  async function remove(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        setMessage(data.error ?? "Falha ao excluir.");
        return;
      }
      setRefresh((value) => value + 1);
      setPendingDeleteId(null);
      if (active === id) setActive(null);
      setMessage("Cálculo excluído.");
      requestAnimationFrame(() => messageRef.current?.focus());
    } catch {
      setMessage("Não foi possível excluir. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const records = items.map((item) => ({
    item,
    snapshot: historySnapshotSchema.safeParse(item.result_snapshot),
  }));
  const visibleRecords = records.filter(({ item, snapshot }) =>
    normalize(
      [
        item.title ?? "",
        formatDate(item.created_at.slice(0, 10)),
        snapshot.success
          ? `${snapshot.data.input ? regimeLabels[snapshot.data.input.regime] : ""} ${snapshot.data.snapshot.calendar.court} ${snapshot.data.snapshot.calendar.locality} ${formatDate(snapshot.data.dueDate)}`
          : "",
      ].join(" "),
    ).includes(normalize(query.trim())),
  );
  return (
    <section className="content-card" aria-busy={loading}>
      <h2>Cálculos salvos</h2>
      <p>
        O histórico requer uma conta Supabase ativa. As versões demonstrativas
        permanecem identificadas; snapshots armazenados não constituem prova de
        autenticidade.
      </p>
      {calculationId ? (
        <p>
          <Link href="/historico">Voltar ao histórico completo</Link> · Cálculo
          indicado no lembrete; somente a conta proprietária pode consultá-lo.
        </p>
      ) : null}
      {message ? (
        <p
          className="status-message"
          role="status"
          tabIndex={-1}
          ref={messageRef}
        >
          {message}
        </p>
      ) : null}
      <div className="history-actions">
        <Button asChild variant="outline">
          <Link href="/entrar">Acessar minha conta</Link>
        </Button>
        <Button asChild>
          <Link href="/">Novo cálculo</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading || !!deletingId}
          onClick={() => {
            setRefresh((value) => value + 1);
            setMessage("");
          }}
        >
          Atualizar histórico
        </Button>
      </div>
      <div className="history-filters">
        <div className="field">
          <label htmlFor="history-regime">Filtrar por regime</label>
          <select
            id="history-regime"
            value={selection.regime}
            disabled={!!deletingId}
            onChange={(event) =>
              changeSelection({
                ...selection,
                regime: event.target.value,
                page: 1,
              })
            }
          >
            <option value="all">Todos os regimes</option>
            {Object.entries(regimeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="history-page-size">Registros por página</label>
          <select
            id="history-page-size"
            value={selection.pageSize}
            disabled={!!deletingId}
            onChange={(event) =>
              changeSelection({
                ...selection,
                pageSize: Number(event.target.value),
                page: 1,
              })
            }
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} registros
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <p className="status-message" role="status">
          Carregando histórico…
        </p>
      ) : null}
      {current?.error ? (
        <p className="error-summary" role="alert">
          {current.error} Use Atualizar histórico para tentar novamente.
        </p>
      ) : null}
      {data ? (
        <>
          <p className="history-reference">
            Referência: {formatDate(data.asOfDate)} · {data.timeZone}. Situação
            pela data original estimada; não indica cumprimento do ato. Atualize
            para conferir mudanças.
          </p>
          <nav
            className="history-pagination"
            aria-label="Paginação do histórico"
          >
            <Button
              type="button"
              variant="outline"
              disabled={loading || !pagination?.hasPrevious || !!deletingId}
              onClick={() =>
                changeSelection(
                  { ...selection, page: selection.page - 1 },
                  true,
                )
              }
            >
              Página anterior
            </Button>
            <p tabIndex={-1} ref={paginationRef} role="status">
              Página {pagination?.page} de {pagination?.totalPages}
              <span>
                {pagination?.total}{" "}
                {pagination?.total === 1
                  ? "cálculo no filtro"
                  : "cálculos no filtro"}
              </span>
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={loading || !pagination?.hasNext || !!deletingId}
              onClick={() =>
                changeSelection(
                  { ...selection, page: selection.page + 1 },
                  true,
                )
              }
            >
              Próxima página
            </Button>
          </nav>
        </>
      ) : null}
      {reminders.error ? (
        <p role="alert" className="error-summary">
          {reminders.error} Use Atualizar histórico para tentar novamente.
        </p>
      ) : null}
      {reminders.available ? (
        <CancelAllReminders
          mode={reminders.mode}
          onChange={reminders.change}
          busy={reminders.busy}
        />
      ) : null}
      {data && !items.length ? (
        <p role="status">
          {selection.regime === "all"
            ? "Nenhum cálculo salvo. Faça um cálculo e use o botão Salvar no resultado."
            : "Nenhum cálculo neste regime. Escolha outro filtro ou crie uma simulação."}
        </p>
      ) : null}
      {items.length ? (
        <div className="field history-search">
          <label htmlFor="history-search">Buscar nesta página</label>
          <input
            id="history-search"
            value={query}
            maxLength={120}
            onChange={(event) => {
              setQuery(event.target.value);
              setPendingDeleteId(null);
            }}
            aria-describedby="history-search-hint"
          />
          <p className="field-hint" id="history-search-hint">
            Título, regime, tribunal, comarca ou data no formato DD/MM/AAAA. A
            busca considera apenas os registros desta página, sem consultar
            outras páginas.
          </p>
          <p role="status">
            {visibleRecords.length} de {items.length} registros nesta página.
          </p>
        </div>
      ) : null}
      {items.length && !visibleRecords.length ? (
        <p>Nenhum registro corresponde à busca nesta página.</p>
      ) : null}
      {visibleRecords.map(({ item, snapshot }) => {
        return (
          <article className="history-item" key={item.id}>
            <h3>{item.title || "Cálculo demonstrativo"}</h3>
            <p className={`history-due-status history-due-${item.dueStatus}`}>
              {historyDueLabels[item.dueStatus] ??
                historyDueLabels.undetermined}
            </p>
            <p>
              Registro: {formatDate(item.created_at.slice(0, 10))} · Snapshot
              não verificado
            </p>
            <p>
              {snapshot.success
                ? `Resultado original: ${formatDate(snapshot.data.dueDate)} · ${snapshot.data.input ? regimeLabels[snapshot.data.input.regime] : "Perfil não identificado"} · ${snapshot.data.snapshot.calendar.court} — ${snapshot.data.snapshot.calendar.locality} · ${snapshot.data.metadata.calendarVersion}`
                : "Memória com formato não suportado. Os dados originais permanecem disponíveis abaixo."}
            </p>
            {reminders.available ? (
              <ReminderControls
                key={`${item.id}:${reminders.mode}`}
                mode={reminders.mode}
                calculationId={item.id}
                dueDate={
                  snapshot.success && snapshot.data.status === "provisional"
                    ? snapshot.data.dueDate
                    : null
                }
                asOfDate={data?.asOfDate ?? ""}
                reminder={reminders.reminders.find(
                  (reminder) => reminder.calculation_id === item.id,
                )}
                busy={reminders.busy}
                onChange={reminders.change}
              />
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive(active === item.id ? null : item.id)}
              aria-expanded={active === item.id}
            >
              Ver memória original
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={deletingId === item.id}
              onClick={(event) => {
                deleteTriggerRef.current = event.currentTarget;
                setPendingDeleteId(item.id);
                requestAnimationFrame(() => confirmationRef.current?.focus());
              }}
            >
              {deletingId === item.id ? "Excluindo…" : "Excluir"}
            </Button>
            {pendingDeleteId === item.id ? (
              <div
                className="delete-confirmation"
                role="group"
                aria-label="Confirmar exclusão do cálculo"
                tabIndex={-1}
                ref={confirmationRef}
              >
                <p>
                  Excluir este cálculo da sua conta? Esta ação não pode ser
                  desfeita. Exporte a memória antes se quiser guardar uma cópia.
                </p>
                <div className="history-actions">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deletingId === item.id}
                    onClick={() => {
                      setPendingDeleteId(null);
                      deleteTriggerRef.current?.focus();
                    }}
                  >
                    Cancelar exclusão
                  </Button>
                  <Button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => remove(item.id)}
                  >
                    {deletingId === item.id
                      ? "Excluindo…"
                      : "Excluir definitivamente"}
                  </Button>
                </div>
              </div>
            ) : null}
            {active === item.id ? (
              <>
                {snapshot.success ? (
                  <CalculationResultPanel
                    result={snapshot.data}
                    historicalSnapshot={item.result_snapshot}
                  />
                ) : (
                  <p role="alert">
                    Não foi possível apresentar os detalhes com segurança.
                    Consulte os dados originais.
                  </p>
                )}
                <details className="history-raw">
                  <summary>Dados técnicos originais (JSON)</summary>
                  <pre className="history-json">
                    {JSON.stringify(item.result_snapshot, null, 2)}
                  </pre>
                </details>
                {!item.recomputed ? (
                  <p>
                    Reprodução indisponível: versões históricas precisam de
                    conferência.
                  </p>
                ) : null}
              </>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
