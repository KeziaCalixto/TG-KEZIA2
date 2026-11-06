import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Minha conta" };
export default function SignInPage() {
  return (
    <AppShell active="/entrar">
      <AuthForm />
    </AppShell>
  );
}
