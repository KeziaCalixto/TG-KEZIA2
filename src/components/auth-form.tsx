"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [session, setSession] = useState<{
    configured: boolean;
    user: { email: string } | null;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionFailed, setSessionFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((response) => response.json())
      .then((current) => {
        setSession(current);
        const params = new URLSearchParams(window.location.search);
        if (params.get("auth") === "invite-error") {
          setMessageIsError(true);
          setMessage(
            "Link inválido ou expirado. Solicite um novo convite ou entre com sua senha.",
          );
        } else if (params.get("auth") === "google-error") {
          setMessageIsError(true);
          setMessage(
            "Não foi possível iniciar o acesso com Google. Tente novamente ou use e-mail e senha.",
          );
        } else if (params.get("auth") === "callback-error") {
          setMessageIsError(true);
          setMessage(
            "Não foi possível confirmar o acesso. Ele pode ter sido cancelado ou expirado. Tente novamente no mesmo navegador em que iniciou.",
          );
        } else if (params.get("senha") === "definida")
          setMessage("Senha definida. Sua conta está pronta para usar.");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setSessionFailed(true);
      });
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setMessageIsError(false);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessageIsError(true);
        setMessage(result.error ?? "Não foi possível acessar.");
      } else if (mode === "signup")
        window.location.replace("/conta/confirmar-email");
      else {
        const current = await fetch("/api/auth/session");
        setSession(await current.json());
        setMessage("Você entrou na sua conta.");
        window.dispatchEvent(new Event("prazo-claro:auth-change"));
      }
    } catch {
      setMessageIsError(true);
      setMessage("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    setMessageIsError(false);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setSession((previous) =>
          previous ? { ...previous, user: null } : null,
        );
        setMessage("Sessão encerrada.");
        window.dispatchEvent(new Event("prazo-claro:auth-change"));
      } else {
        setMessageIsError(true);
        setMessage("Não foi possível encerrar a sessão. Tente novamente.");
      }
    } catch {
      setMessageIsError(true);
      setMessage("Falha de conexão ao sair.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="content-card auth-card">
      <p className="eyebrow">SEU ESPAÇO NO PRAZO CLARO</p>
      <h1>{session?.user ? "Sua conta." : "Seus cálculos, organizados."}</h1>
      <p>Entre para salvar e consultar seu histórico privado de cálculos.</p>
      {sessionFailed ? (
        <p className="status-message" role="alert">
          Não foi possível verificar a conexão. Recarregue a página.
        </p>
      ) : null}
      {session && !session.configured ? (
        <p className="status-message" role="status">
          O acesso à conta ainda não está configurado neste ambiente. A
          calculadora demonstrativa está disponível sem cadastro.
        </p>
      ) : null}
      {session?.user ? (
        <>
          <p>Conectado como {session.user.email}</p>
          <div className="history-actions">
            <Button asChild>
              <Link href="/historico">Consultar histórico</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/conta/definir-senha">Definir senha</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={signOut}
            >
              Sair da conta
            </Button>
          </div>
        </>
      ) : (
        <>
          <form action="/api/auth/google" method="post">
            <Button
              type="submit"
              variant="outline"
              className="google-auth-button"
              disabled={busy || !session?.configured}
            >
              <Image
                src="/google-g.png"
                alt=""
                width={20}
                height={20}
                unoptimized
              />
              Continuar com Google
            </Button>
          </form>
          <p className="auth-divider">ou use seu e-mail</p>
          <form onSubmit={submit}>
            <div className="auth-tabs" aria-label="Tipo de acesso">
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => {
                  setMode("login");
                  setMessage("");
                  setMessageIsError(false);
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                aria-pressed={mode === "signup"}
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                  setMessageIsError(false);
                }}
              >
                Criar conta
              </button>
            </div>
            <p className="field-hint">
              {mode === "signup"
                ? "Cadastre um novo endereço de e-mail. Se recebeu um convite, abra o link do e-mail e defina sua senha para concluir o acesso."
                : "Recebeu um convite? Abra o link do e-mail e defina sua senha antes de entrar por aqui."}
            </p>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="field-hint">
                Use de 8 a 128 caracteres. Você pode colar sua senha ou usar um
                gerenciador.
              </p>
            </div>
            <Button type="submit" disabled={busy || !session?.configured}>
              {busy
                ? "Aguarde…"
                : mode === "signup"
                  ? "Criar minha conta"
                  : "Entrar na conta"}
            </Button>
            {mode === "login" ? (
              <p>
                <Link href="/conta/recuperar-senha" className="text-link">
                  Esqueci minha senha
                </Link>
              </p>
            ) : null}
            {mode === "signup" ? (
              <p className="field-hint">
                Após o cadastro, confirme o link enviado para o seu e-mail.
              </p>
            ) : null}
          </form>
        </>
      )}
      {message ? (
        <p
          className="status-message"
          role={messageIsError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
      <p>
        <Link href="/" className="text-link">
          Voltar para a calculadora
        </Link>
      </p>
    </section>
  );
}
