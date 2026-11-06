import { AppShell } from "@/components/app-shell";
import { DeadlineCalculator } from "@/components/deadline-calculator";

export default function Home() {
  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONTAGEM DE PRAZOS PROCESSUAIS</p>
          <h1>Cada prazo, com clareza.</h1>
          <p className="page-description">
            Calcule, entenda e confira cada etapa do seu prazo processual.
          </p>
        </div>
        <span className="scope-tag">DJEN · Perfis processuais</span>
      </div>
      <DeadlineCalculator />
    </AppShell>
  );
}
