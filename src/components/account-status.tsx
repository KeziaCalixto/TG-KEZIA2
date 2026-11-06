"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CircleCheck, UserRound } from "lucide-react";

export function AccountStatus() {
  const pathname = usePathname();
  const [account, setAccount] = useState<{ email: string } | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    let sequence = 0;
    async function refresh() {
      const current = ++sequence;
      try {
        const response = await fetch("/api/auth/session", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Session unavailable");
        const session = await response.json();
        if (current !== sequence || controller.signal.aborted) return;
        setAccount(session.user);
        setState("ready");
      } catch {
        if (!controller.signal.aborted && current === sequence) {
          setAccount(null);
          setState("error");
        }
      }
    }
    void refresh();
    window.addEventListener("prazo-claro:auth-change", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("prazo-claro:auth-change", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [pathname]);
  return account ? (
    <Link
      href="/entrar"
      className="account-link account-connected"
      aria-label={`Conta conectada: ${account.email}`}
    >
      <CircleCheck size={19} aria-hidden="true" />
      <span className="account-copy">
        <strong>Conectado</strong>
        <span className="account-email">{account.email}</span>
      </span>
    </Link>
  ) : (
    <Link
      href="/entrar"
      className="account-link"
      aria-label={
        state === "loading"
          ? "Verificando conta"
          : state === "error"
            ? "Verificar acesso à conta"
            : "Entrar na conta"
      }
    >
      <UserRound size={18} aria-hidden="true" />
      {state === "loading"
        ? "Verificando…"
        : state === "error"
          ? "Verificar conta"
          : "Entrar"}
    </Link>
  );
}
