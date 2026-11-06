import { formatDate } from "@/lib/utils";

export function reminderEmail(
  input: {
    calculationId: string;
    dueDate: string;
    leadDays: number;
    hour: number;
  },
  appUrl: string,
  mode: "local" | "brevo" = "local",
) {
  const url = new URL("/historico", appUrl);
  url.searchParams.set("calculationId", input.calculationId);
  const date = formatDate(input.dueDate);
  const timing =
    input.leadDays === 0
      ? "No dia do vencimento estimado"
      : `${input.leadDays} ${input.leadDays === 1 ? "dia antes" : "dias antes"} do vencimento estimado`;
  const warning =
    "Simulação acadêmica: calendário parcial e revisão jurídica pendente. O lembrete usa a memória original não verificada e não comprova cumprimento do ato. Confira as fontes e as condições do seu caso.";
  const Text = `Prazo Claro — lembrete solicitado\n\nVencimento estimado: ${date}\n${timing}, às ${String(input.hour).padStart(2, "0")}h · America/Sao_Paulo. Antecedência em dias corridos.\nCálculo ${input.calculationId.slice(0, 8)}\n\nConsulte a memória na sua conta: ${url.href}\nÉ necessário entrar na conta proprietária. Se precisar entrar, reabra este link depois.\n\n${warning}\n\nVocê pode cancelar lembretes ativos no histórico. Mensagens já em processamento podem ser aceitas após o cancelamento. Ambiente local de testes.`;
  const HTML = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f4f6f8;color:#173044;font-family:Arial,sans-serif;line-height:1.6"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3e9;border-radius:12px;overflow:hidden"><tr><td style="padding:28px 32px;background:#152e42;color:#fff"><span style="font-size:27px;font-weight:bold">prazoclaro</span><br><span style="font-size:11px;letter-spacing:2px;color:#e3c28a">CLAREZA PARA CONFERIR</span></td></tr><tr><td style="padding:32px"><p style="font-size:12px;letter-spacing:1px;color:#765522">LEMBRETE SOLICITADO · TESTE LOCAL</p><h1 style="font-size:26px;line-height:1.3;margin:12px 0 24px">Uma data para conferir.</h1><p style="margin-bottom:4px">Vencimento estimado original</p><p style="font-family:Georgia,serif;font-size:36px;margin:0 0 20px">${date}</p><p>${timing}, às ${String(input.hour).padStart(2, "0")}h<br>America/Sao_Paulo · antecedência em dias corridos</p><p style="font-size:13px">Cálculo ${input.calculationId.slice(0, 8)}</p><p style="margin:28px 0"><a href="${url.href}" style="display:inline-block;background:#223b8e;color:#fff;text-decoration:none;border-radius:6px;padding:13px 22px;font-weight:bold">Conferir memória original</a></p><p style="font-size:13px">Entre na conta proprietária para abrir a memória. Se precisar entrar, reabra o link após o login.</p><div style="padding:16px;background:#fff8e9;border-left:3px solid #b58b4c;font-size:13px">${warning}</div><p style="font-size:12px;margin-top:24px">Você pode cancelar lembretes ativos no histórico. Um envio já em curso pode ser aceito após o cancelamento.</p><p style="font-size:12px;overflow-wrap:anywhere">O botão não abriu? Copie este endereço:<br><a href="${url.href}" style="color:#223b8e">${url.href}</a></p></td></tr><tr><td style="padding:20px 32px;border-top:1px solid #dbe3e9;color:#536779;font-size:12px">Prazo Claro · Projeto acadêmico · Ambiente local de testes</td></tr></table></td></tr></table></body></html>`;
  return {
    Subject: "Prazo Claro — lembrete de vencimento estimado",
    Text:
      mode === "local"
        ? Text
        : Text.replace(
            "Ambiente local de testes.",
            "Envio solicitado na sua conta.",
          ),
    HTML:
      mode === "local"
        ? HTML
        : HTML.replace(
            "LEMBRETE SOLICITADO · TESTE LOCAL",
            "LEMBRETE SOLICITADO",
          ).replace(
            "Ambiente local de testes",
            "Lembrete solicitado na sua conta",
          ),
  };
}
