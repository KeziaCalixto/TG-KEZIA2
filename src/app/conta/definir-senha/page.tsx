import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { SetPasswordForm } from "@/components/set-password-form";

export const metadata: Metadata = { title: "Definir senha" };
export default function SetPasswordPage() {
  return (
    <AppShell active="/entrar">
      <SetPasswordForm />
    </AppShell>
  );
}
