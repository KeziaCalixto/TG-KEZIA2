"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

export function PasswordRecoveryForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const feedback = useRef<HTMLParagraphElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setFailed(!response.ok);
      setMessage(
        response.ok
          ? data.message
          : (data.error ?? "Não foi possível solicitar a recuperação."),
      );
    } catch {
      setFailed(true);
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  return (
    <section className="content-card auth-card">
      <p className="eyebrow">ACESSO À SUA CONTA</p>
      <h1>Recupere sua senha.</h1>
      <p>
        Informe o e-mail da conta. Solicite e abra o link no mesmo navegador
        para continuar com segurança.
      </p>
      <form onSubmit={submit} aria-busy={busy}>
        <div className="field">
          <label htmlFor="recovery-email">E-mail da conta</label>
          <input
            id="recovery-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-describedby="recovery-hint"
          />
          <p className="field-hint" id="recovery-hint">
            O link é temporário e permite escolher uma nova senha.
          </p>
        </div>
        {message ? (
          <p
            ref={feedback}
            tabIndex={-1}
            className="status-message"
            role={failed ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Enviando…" : "Enviar link de recuperação"}
        </Button>
      </form>
      <Link href="/entrar" className="text-link recovery-back-link">
        Voltar para entrar
      </Link>
    </section>
  );
}
