import type { Metadata } from "next";
import "./globals.css";
import { InviteSessionBridge } from "@/components/invite-session-bridge";

export const metadata: Metadata = {
  title: {
    default: "Prazo Claro — Contagem de prazos processuais",
    template: "%s | Prazo Claro",
  },
  description:
    "Calculadora acadêmica com perfis civil, trabalhista e criminal, memória de cálculo e fontes normativas. Cobertura parcial em São Paulo.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <InviteSessionBridge />
        {children}
      </body>
    </html>
  );
}
