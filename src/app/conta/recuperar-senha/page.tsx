import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
export const metadata: Metadata = {
  title: "Recuperar senha",
  robots: { index: false, follow: false },
};
export default function PasswordRecoveryPage() {
  return (
    <AppShell active="/entrar">
      <PasswordRecoveryForm />
    </AppShell>
  );
}
