import { AppShell } from "@/components/app-shell";
import { CalculationHistory } from "@/components/calculation-history";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Histórico" };
export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ calculationId?: string | string[] }>;
}) {
  const params = await searchParams;
  const calculationId =
    typeof params.calculationId === "string"
      ? params.calculationId
      : params.calculationId
        ? "invalid"
        : undefined;
  return (
    <AppShell active="/historico">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEMÓRIA E RASTREABILIDADE</p>
          <h1>Seu histórico de cálculos.</h1>
          <p className="page-description">
            Consulte os cálculos salvos na sua conta, com suas versões
            originais.
          </p>
        </div>
      </div>
      <CalculationHistory
        key={calculationId ?? "all"}
        calculationId={calculationId}
      />
    </AppShell>
  );
}
