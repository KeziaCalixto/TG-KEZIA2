// Standalone setup check. Never claims reminders or changes their delivery state.
import { z } from "zod";
import { isIP } from "node:net";

const configSchema = z.object({
  key: z
    .string()
    .min(16)
    .refine((value) => !/[\r\n]/.test(value)),
  email: z.email(),
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((value) => !/[\r\n]/.test(value)),
});

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function providerFailure(response, fallback) {
  // Inspect only an error message; never print the provider body or credentials.
  const payload = await response.json().catch(() => null);
  const message = typeof payload?.message === "string" ? payload.message : "";
  if (
    response.status === 401 &&
    /(?:unrecogni[sz]ed|unauthori[sz]ed).*ip|ip.*(?:authori[sz]|block|allow)/i.test(
      message,
    )
  ) {
    const address = message.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)?.[0];
    const detail = address && isIP(address) === 4 ? ` (IP ${address})` : "";
    fail(
      `Brevo bloqueou o IP de origem desta tentativa${detail}. Confira a chave e o horário em Configurações → Segurança → IPs autorizados antes de autorizar somente essa origem. Preserve o bloqueio de outros IPs.`,
    );
    return;
  }
  fail(
    `${fallback} (HTTP ${response.status}). Confira a chave de API ativa, as permissões e eventuais bloqueios de IP no painel.`,
  );
}

async function main() {
  if (process.env.BREVO_API_KEY?.startsWith("xsmtpsib-")) {
    fail(
      "BREVO_API_KEY contém uma chave SMTP. Gere uma chave na aba API Keys & MCP do Brevo e substitua somente este campo; preserve o SMTP do Supabase.",
    );
    return;
  }
  const config = configSchema.safeParse({
    key: process.env.BREVO_API_KEY,
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME ?? "Prazo Claro",
  });
  if (!config.success) {
    fail(
      "Configuração incompleta ou inválida. Preencha o arquivo local conforme docs/brevo-setup.md; não envie credenciais no chat.",
    );
    return;
  }

  const headers = {
    Accept: "application/json",
    "api-key": config.data.key,
    "Content-Type": "application/json",
  };
  const senders = await fetch("https://api.brevo.com/v3/senders", {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!senders.ok) {
    await providerFailure(senders, "Consulta ao Brevo recusada");
    return;
  }
  const senderList = z
    .object({
      senders: z.array(z.object({ email: z.email(), active: z.boolean() })),
    })
    .safeParse(await senders.json());
  if (
    !senderList.success ||
    !senderList.data.senders.some(
      (sender) =>
        sender.active &&
        sender.email.toLowerCase() === config.data.email.toLowerCase(),
    )
  ) {
    fail(
      "Remetente ativo não confirmado pela API. Confira o endereço e a verificação do remetente no painel do Brevo.",
    );
    return;
  }

  // The sandbox flag belongs to JSON headers, as specified by Brevo.
  // It is unconditional; this script offers no real-delivery switch.
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      sender: { email: config.data.email, name: config.data.name },
      to: [{ email: config.data.email }],
      subject: "Prazo Claro — verificação sandbox dos lembretes",
      textContent:
        "Validação técnica da integração. Nenhum cálculo ou dado de usuário participa desta verificação.",
      headers: { "X-Sib-Sandbox": "drop" },
    }),
  });
  if (response.status !== 201) {
    await providerFailure(response, "Verificação sandbox recusada");
    return;
  }
  const accepted = z
    .object({ messageId: z.string().min(1) })
    .safeParse(await response.json());
  if (!accepted.success) {
    fail("O Brevo não retornou a confirmação esperada do sandbox.");
    return;
  }
  console.log(
    "Brevo: chave aceita, remetente ativo e requisição sandbox validada. Nenhum e-mail enviado; entrega externa e agendamento ainda precisam de ensaio próprio.",
  );
}

main().catch(() => {
  fail(
    "Falha de rede ou resposta inválida na verificação sandbox. Nenhuma fila de lembretes foi processada. Confira a conexão e o painel do Brevo antes de repetir.",
  );
});
