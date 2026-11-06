"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

export interface SavedReminder {
  id: string;
  calculation_id: string;
  status:
    | "pending"
    | "processing"
    | "accepted"
    | "failed"
    | "cancelled"
    | "uncertain";
  send_at: string;
  time_zone: string;
  lead_days: number;
  accepted_at: string | null;
}
interface ReminderResponse {
  available: boolean;
  mode?: "local" | "brevo";
  reminders: SavedReminder[];
}
export function useHistoryReminders(ids: string, historyKey: string) {
  const [version, setVersion] = useState(0);
  const [listing, setListing] = useState<{
    key: string;
    ids: string;
    data?: ReminderResponse;
    error?: string;
  }>({ key: "", ids: "" });
  const key = `${ids}:${historyKey}:${version}`;
  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    fetch(`/api/reminders?ids=${encodeURIComponent(ids)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (controller.signal.aborted) return;
        setListing(
          response.ok
            ? { key, ids, data }
            : {
                key,
                ids,
                error: data.error ?? "Não foi possível consultar os lembretes.",
              },
        );
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setListing({
            key,
            ids,
            error: "Não foi possível consultar os lembretes.",
          });
      });
    return () => controller.abort();
  }, [ids, key]);
  const current = ids && listing.ids === ids ? listing : null;
  async function change(body: unknown, method: "POST" | "DELETE") {
    const response = await fetch("/api/reminders", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error ?? "Não foi possível alterar o lembrete.");
    setVersion((value) => value + 1);
  }
  return {
    available: current?.data?.available ?? false,
    mode: current?.data?.mode ?? "local",
    reminders: current?.data?.reminders ?? [],
    error: current?.error,
    busy: !!ids && listing.key !== key,
    change,
  };
}
type Change = (body: unknown, method: "POST" | "DELETE") => Promise<void>;
const labels: Record<SavedReminder["status"], string> = {
  pending: "Agendado",
  processing: "Em processamento",
  accepted: "Aceito pela caixa de testes",
  failed: "Não enviado",
  cancelled: "Cancelado",
  uncertain: "Envio incerto · confira antes de reagendar",
};
export function ReminderControls({
  calculationId,
  dueDate,
  asOfDate,
  reminder,
  busy,
  onChange,
  mode = "local",
}: {
  calculationId: string;
  dueDate: string | null;
  asOfDate: string;
  reminder?: SavedReminder;
  busy: boolean;
  onChange: Change;
  mode?: "local" | "brevo";
}) {
  const [leadDays, setLeadDays] = useState(1);
  const [hour, setHour] = useState(9);
  const [confirmed, setConfirmed] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const feedback = useRef<HTMLParagraphElement>(null);
  const active =
    reminder &&
    ["pending", "processing", "uncertain"].includes(reminder.status);
  const eligible = dueDate && dueDate >= asOfDate;
  async function act(cancel = false) {
    setWorking(true);
    setMessage("");
    setError("");
    try {
      await onChange(
        cancel
          ? { id: reminder?.id }
          : {
              calculationId,
              leadDays,
              hour,
              ...(mode === "brevo" ? { externalEmailConsent: true } : {}),
            },
        cancel ? "DELETE" : "POST",
      );
      setConfirmed(false);
      setMessage(
        cancel
          ? "Lembrete cancelado."
          : mode === "brevo"
            ? "Lembrete agendado. O envio ao e-mail confirmado da sua conta está previsto para o horário escolhido."
            : "Lembrete ativado para a caixa local de testes.",
      );
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Não foi possível alterar o lembrete.",
      );
    } finally {
      setWorking(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  return (
    <div
      className="reminder-panel"
      aria-label="Lembrete por e-mail"
      role="group"
      aria-busy={busy || working}
    >
      <h4>Lembrete por e-mail</h4>
      {reminder ? (
        <p>
          <strong>
            {reminder.status === "accepted" && mode === "brevo"
              ? "Aceito pelo serviço de e-mail · entrega não confirmada"
              : labels[reminder.status]}
          </strong>
          <br />
          {reminder.status === "pending" ? "Envio previsto: " : ""}
          {new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "America/Sao_Paulo",
          }).format(new Date(reminder.send_at))}{" "}
          · America/Sao_Paulo
        </p>
      ) : null}
      {reminder?.status === "cancelled" && reminder.accepted_at ? (
        <p>O envio foi aceito enquanto o cancelamento estava em curso.</p>
      ) : null}
      {message || error ? (
        <p
          ref={feedback}
          tabIndex={-1}
          role={error ? "alert" : "status"}
          className={error ? "error-summary" : "status-message"}
        >
          {error || message}
        </p>
      ) : null}
      {active ? (
        <>
          <p className="field-hint">
            Cancelar impede novas tentativas. Uma mensagem já em curso pode
            ainda ser aceita.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={busy || working}
            onClick={() => act(true)}
          >
            {working ? "Cancelando…" : "Cancelar lembrete"}
          </Button>
        </>
      ) : eligible ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void act();
          }}
        >
          <div className="reminder-fields">
            <div className="field">
              <label htmlFor={`lead-${calculationId}`}>
                Antecedência do lembrete
              </label>
              <select
                id={`lead-${calculationId}`}
                value={leadDays}
                disabled={busy || working}
                onChange={(event) => setLeadDays(Number(event.target.value))}
              >
                <option value={3}>3 dias antes</option>
                <option value={1}>1 dia antes</option>
                <option value={0}>No dia</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor={`hour-${calculationId}`}>
                Horário em São Paulo
              </label>
              <select
                id={`hour-${calculationId}`}
                value={hour}
                disabled={busy || working}
                onChange={(event) => setHour(Number(event.target.value))}
              >
                {[9, 12, 18].map((value) => (
                  <option key={value} value={value}>
                    {String(value).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="field-hint">
            Dias corridos, independentes da contagem processual. O horário
            escolhido precisa estar no futuro.
          </p>
          <label className="reminder-consent">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={busy || working}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            {mode === "brevo"
              ? "Quero receber este lembrete no e-mail confirmado da minha conta."
              : "Quero receber este lembrete na caixa local de testes."}
          </label>
          <Button type="submit" disabled={!confirmed || busy || working}>
            {working ? "Ativando…" : "Ativar lembrete"}
          </Button>
        </form>
      ) : (
        <p className="field-hint">
          Este cálculo não possui vencimento futuro elegível para um novo
          lembrete.
        </p>
      )}
    </div>
  );
}
export function CancelAllReminders({
  onChange,
  busy,
  mode = "local",
}: {
  onChange: Change;
  busy: boolean;
  mode?: "local" | "brevo";
}) {
  const [confirm, setConfirm] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const feedback = useRef<HTMLParagraphElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  async function cancel() {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      await onChange({ all: true }, "DELETE");
      setConfirm(false);
      setMessage("Todos os lembretes ativos foram cancelados.");
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Não foi possível cancelar.",
      );
    } finally {
      setWorking(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  return (
    <div className="reminder-overview" aria-busy={busy || working}>
      <h3>
        {mode === "local"
          ? "Lembretes por e-mail · teste local"
          : "Lembretes por e-mail"}
      </h3>
      <p>
        {mode === "local"
          ? "Neste teste, as mensagens ficam na caixa local de testes, sem envio ao endereço externo."
          : "Os lembretes que você ativar serão enviados ao e-mail confirmado atual da sua conta."}{" "}
        Usam o vencimento original estimado e não comprovam cumprimento do ato.{" "}
        {mode === "brevo"
          ? "A confirmação do agendamento aparece aqui no site. Você receberá por e-mail apenas o lembrete no horário escolhido. O recebimento depende do serviço de e-mail; mantenha sua própria conferência do prazo."
          : ""}
      </p>
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        disabled={busy || working}
        onClick={() => {
          setConfirm(true);
          requestAnimationFrame(() => confirmation.current?.focus());
        }}
      >
        Cancelar todos os lembretes ativos
      </Button>
      {confirm ? (
        <div
          role="group"
          aria-label="Confirmar cancelamento dos lembretes"
          tabIndex={-1}
          ref={confirmation}
          className="delete-confirmation"
        >
          <p>
            Cancelar todos os lembretes ativos da sua conta, inclusive em outras
            páginas? Mensagens já em curso podem ainda ser aceitas.
          </p>
          <div className="history-actions">
            <Button
              variant="outline"
              type="button"
              disabled={working}
              onClick={() => {
                setConfirm(false);
                trigger.current?.focus();
              }}
            >
              Manter lembretes
            </Button>
            <Button
              type="button"
              disabled={busy || working}
              onClick={() => void cancel()}
            >
              Confirmar cancelamento de todos
            </Button>
          </div>
        </div>
      ) : null}
      {message || error ? (
        <p
          role={error ? "alert" : "status"}
          ref={feedback}
          tabIndex={-1}
          className={error ? "error-summary" : "status-message"}
        >
          {error || message}
        </p>
      ) : null}
    </div>
  );
}
