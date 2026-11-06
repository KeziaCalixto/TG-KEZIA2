"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

export function SetPasswordForm() {
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => setState(session?.user ? "ready" : "unavailable"))
      .catch(() => {
        if (!controller.signal.aborted) setState("unavailable");
      });
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");
    if (password !== confirmation) {
      setMessage("As senhas precisam ser iguais.");
      form.querySelector<HTMLInputElement>("#password-confirmation")?.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const result = await response.json();
      if (!response.ok)
        setMessage(result.error ?? "Não foi possível salvar a senha.");
      else {
        form.reset();
        window.location.replace("/entrar?senha=definida");
      }
    } catch {
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="content-card auth-card">
      <p className="eyebrow">BEM-VINDO AO PRAZO CLARO</p>
      <h1>Defina sua senha.</h1>
      <p>
        Escolha uma senha para entrar na sua conta. Esta página atende à
        aceitação de convite e à recuperação de senha por e-mail.
      </p>
      {state === "loading" ? (
        <p role="status">Verificando seu acesso…</p>
      ) : state === "unavailable" ? (
        <p role="alert">
          Não foi possível confirmar sua sessão. Abra um convite válido,{" "}
          <Link href="/conta/recuperar-senha" className="text-link">
            solicite a recuperação de senha
          </Link>{" "}
          ou{" "}
          <Link href="/entrar" className="text-link">
            entre na sua conta
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="new-password">Nova senha</label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-describedby="new-password-hint"
            />
            <p className="field-hint" id="new-password-hint">
              Use de 8 a 128 caracteres. Você pode colar a senha do seu
              gerenciador.
            </p>
          </div>
          <div className="field">
            <label htmlFor="password-confirmation">Confirme a nova senha</label>
            <input
              id="password-confirmation"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-describedby={message ? "password-error" : undefined}
              aria-invalid={message ? true : undefined}
            />
          </div>
          {message ? (
            <p className="status-message" role="alert" id="password-error">
              {message}
            </p>
          ) : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Salvando…" : "Salvar senha e continuar"}
          </Button>
          <Link href="/entrar" className="text-link">
            Definir depois e acessar minha conta
          </Link>
        </form>
      )}
    </section>
  );
}
