import { AppShell } from "@/components/app-shell";
import { JudicialCalendarView } from "@/components/judicial-calendar-view";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Calendário judicial" };
export default function CalendarPage() {
  return (
    <AppShell active="/calendario">
      <div className="page-heading">
        <div>
          <p className="eyebrow">TRIBUNAL DE JUSTIÇA DE SÃO PAULO</p>
          <h1>Calendário judicial.</h1>
          <p className="page-description">
            Eventos cadastrados para 10 comarcas de SP, com origem e versão.
            Selecione a comarca para consultar os feriados locais.
          </p>
        </div>
        <span className="scope-tag">2026 · Cobertura parcial</span>
      </div>
      <JudicialCalendarView />
    </AppShell>
  );
}
