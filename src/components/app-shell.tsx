import Link from "next/link";
import {
  Calculator,
  CalendarDays,
  History,
  BookOpen,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { AccountStatus } from "./account-status";

const navigation = [
  { href: "/", label: "Calculadora", icon: Calculator },
  { href: "/calendario", label: "Calendário judicial", icon: CalendarDays },
  { href: "/historico", label: "Histórico de cálculos", icon: History },
  { href: "/base-normativa", label: "Base normativa", icon: BookOpen },
];

export function AppShell({
  children,
  active = "/",
}: {
  children: ReactNode;
  active?: string;
}) {
  const current =
    navigation.find((item) => item.href === active)?.label ??
    (active === "/ajuda"
      ? "Ajuda"
      : active === "/privacidade"
        ? "Privacidade"
        : "Acesso à conta");
  return (
    <div className="app-shell">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand" title="Ir para o início">
          <span className="brand-icon">
            <Scale aria-hidden="true" size={25} />
          </span>
          <span>
            prazo<span className="brand-light">claro</span>
            <small>PRECISÃO EM CADA DIA</small>
          </span>
        </Link>
        <div className="workspace-label">ÁREA DE TRABALHO</div>
        <nav aria-label="Navegação principal">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active === href ? "active" : ""}`}
              aria-current={active === href ? "page" : undefined}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
              {active === href ? (
                <ChevronRight size={15} aria-hidden="true" />
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ShieldCheck size={23} aria-hidden="true" />
            <strong>Clareza para conferir.</strong>
            <p>Regras, fontes e cada dia da contagem ao seu alcance.</p>
            <Link href="/base-normativa">
              Conheça a metodologia{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="academic-mark">
            <span />
            PROJETO ACADÊMICO · TG 2026
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            Área de trabalho <ChevronRight size={14} aria-hidden="true" />
            <span>{current}</span>
          </div>
          <div className="topbar-actions">
            <span className="jurisdiction">
              <span />
              Estado de SP · Perfis demonstrativos
            </span>
            <AccountStatus />
          </div>
        </header>
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>
            Prazo Claro <span className="footer-dot">·</span> Contagem com
            rastreabilidade
          </span>
          <nav className="footer-links" aria-label="Informações do aplicativo">
            <Link href="/ajuda">Ajuda</Link>
            <Link href="/privacidade">Privacidade</Link>
          </nav>
          <span>Civil · Trabalhista · Criminal · Versão acadêmica</span>
        </footer>
      </div>
    </div>
  );
}
