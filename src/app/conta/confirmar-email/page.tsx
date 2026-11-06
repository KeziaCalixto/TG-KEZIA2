import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Confirme seu e-mail",
  robots: { index: false, follow: false },
};

export default function ConfirmEmailPage() {
  return (
    <AppShell active="/entrar">
      <section className="content-card auth-card">
        <p className="eyebrow">CONFIRMAÇÃO DE E-MAIL</p>
        <h1>Confira seu e-mail.</h1>
        <p className="status-message" role="status">
          Se o cadastro puder ser realizado, você receberá um e-mail de
          confirmação. Verifique sua caixa de entrada.
        </p>
        <p>
          Abra o link da mensagem no mesmo navegador em que iniciou o cadastro
          para confirmar seu e-mail e concluir o acesso.
        </p>
        <h2>Não encontrou a mensagem?</h2>
        <p>
          Confira a pasta de spam e aguarde alguns minutos. Se informou um
          endereço incorreto, volte à tela de acesso e escolha Criar conta para
          tentar novamente.
        </p>
        <div className="history-actions">
          <Button asChild>
            <Link href="/entrar">Voltar para entrar</Link>
          </Button>
        </div>
        <p>
          <Link href="/" className="text-link">
            Continuar na calculadora
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
