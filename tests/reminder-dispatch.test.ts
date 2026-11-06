import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/internal/reminders/dispatch/route";
import { calculateForMvp } from "@/application/calculate";
vi.mock("server-only", () => ({}));
const id = "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  token = "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  calculationId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const secret = "test-only-secret-with-at-least-32-characters";
const snapshot = {
  ...calculateForMvp({
    regime: "civil",
    court: "TJSP",
    locality: "São Paulo",
    medium: "electronic",
    communication: "publication",
    eventDate: "2026-10-06",
    days: 5,
  }),
  dueDate: "2030-01-07",
};
const transport = vi.fn<typeof fetch>();
let relay = false,
  postFailure = false,
  cancelled = false,
  sendStatus = 200,
  badConfirmation = false,
  preflightFailed = false,
  settlementFailed = false;
let posted: Record<string, unknown> | null = null;
let outcome: string | undefined;
let sendDuplicate = false;
let invocationConsumed = false;
let providerBlocked = false;
function response(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
function request(authorized = true) {
  return new Request("http://localhost/api/internal/reminders/dispatch", {
    method: "POST",
    headers: authorized ? { Authorization: `Bearer ${secret}` } : {},
  });
}
it("accepts the zero-length stream supplied by Next.js for a legacy empty POST", async () => {
  const result = await POST(
    new Request("http://localhost/api/internal/reminders/dispatch", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Length": "0" },
      body: "",
    }),
  );
  expect(result.status).toBe(200);
  expect((await result.json()).accepted).toBe(1);
});
beforeEach(() => {
  vi.stubEnv("REMINDERS_MODE", "local");
  vi.stubEnv("REMINDERS_APP_URL", "http://127.0.0.1:3000");
  vi.stubEnv("REMINDERS_MAILPIT_URL", "http://127.0.0.1:54324");
  vi.stubEnv("REMINDERS_SUPABASE_SECRET_KEY", "sb_secret_test");
  vi.stubEnv("REMINDERS_DISPATCH_SECRET", secret);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  relay = false;
  postFailure = false;
  cancelled = false;
  sendStatus = 200;
  badConfirmation = false;
  preflightFailed = false;
  settlementFailed = false;
  posted = null;
  outcome = undefined;
  sendDuplicate = false;
  invocationConsumed = false;
  providerBlocked = false;
  transport.mockImplementation(async (input, init) => {
    const path = new URL(String(input)).pathname;
    if (path.endsWith("consume_reminder_invocation")) {
      const available = !invocationConsumed;
      invocationConsumed = true;
      return response(available);
    }
    if (
      path.endsWith("claim_deadline_reminders") ||
      path.endsWith("claim_deadline_reminders_for_mode")
    )
      return response([{ id, token }]);
    if (path.endsWith("prepare_deadline_reminder"))
      return response(
        cancelled
          ? null
          : {
              calculationId,
              dueDate: "2030-01-07",
              leadDays: 1,
              hour: 9,
              email: "owner@example.invalid",
              snapshot,
            },
      );
    if (path.endsWith("settle_deadline_reminder")) {
      outcome = JSON.parse(String(init?.body)).p_outcome;
      return settlementFailed
        ? response({ code: "internal", message: "private" }, 500)
        : response(true);
    }
    if (path === "/api/v1/webui")
      return preflightFailed
        ? response({}, 503)
        : response({ MessageRelay: { Enabled: relay } });
    if (path === "/api/v1/info")
      return preflightFailed ? response({}, 503) : response({});
    if (path === "/api/v1/send") {
      posted = JSON.parse(String(init?.body));
      if (postFailure) throw new TypeError("timeout-sensitive-data");
      return response(
        badConfirmation ? {} : { ID: "mailpit-fixture-id" },
        sendStatus,
      );
    }
    if (path === "/v3/senders" && providerBlocked)
      return response(
        {
          code: "unauthorized",
          message:
            "Unrecognised IP address 192.0.2.1. Please authorise this IP. PRIVATE-DATA",
        },
        401,
      );
    if (path === "/v3/senders")
      return preflightFailed
        ? response({}, 403)
        : response({
            senders: [{ email: "sender@example.invalid", active: !relay }],
          });
    if (path === "/v3/smtp/email") {
      posted = JSON.parse(String(init?.body));
      if (postFailure) throw new TypeError("timeout-sensitive-data");
      if (sendDuplicate) return response({ code: "duplicate_parameter" }, 400);
      return response(
        badConfirmation ? {} : { messageId: "brevo-fixture-id" },
        sendStatus,
      );
    }
    throw new Error("unexpected external path");
  });
  vi.stubGlobal("fetch", transport);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  transport.mockReset();
});
function signedProbe() {
  return new Request(
    "https://tg-kezia2.vercel.app/api/internal/reminders/dispatch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Prazo-Timestamp": "1893456000",
        "X-Prazo-Nonce": token,
        "X-Prazo-Signature":
          "b4248b6c118a67f4d44cee525b4c40982228b96dba3b0a5a146b7f557c8ae9fb",
      },
      body: JSON.stringify({ operation: "probe" }),
    },
  );
}
it("probe assinado verifica o remetente sem habilitar entrega nem obter fila", async () => {
  productionReminders();
  vi.stubEnv("REMINDERS_DELIVERY_ENABLED", "false");
  vi.stubEnv(
    "REMINDERS_SCHEDULER_SECRET",
    "fictitious-scheduler-secret-at-least-32-chars",
  );
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
  const result = await POST(signedProbe());
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({
    probe: true,
    providerReady: true,
    deliveryEnabled: false,
  });
  expect(posted).toBeNull();
  expect(
    transport.mock.calls.some(([url]) =>
      String(url).includes("claim_deadline_reminders"),
    ),
  ).toBe(false);
});
it("dispatcher desativado não processa mensagens", async () => {
  vi.stubEnv("REMINDERS_MODE", "");
  expect(
    (
      await POST(
        new Request("http://localhost/api/internal/reminders/dispatch", {
          method: "POST",
        }),
      )
    ).status,
  ).toBe(503);
  vi.unstubAllEnvs();
});
it("não dispara sem Bearer secreto", async () => {
  expect((await POST(request(false))).status).toBe(401);
  expect(transport).not.toHaveBeenCalled();
});
it("retransmissão externa habilitada no Mailpit bloqueia o POST de envio", async () => {
  relay = true;
  const result = await POST(request());
  expect((await result.json()).accepted).toBe(0);
  expect(posted).toBeNull();
  expect(outcome).toBe("preflight_failed");
});
it("envia somente mensagem mínima e registra aceite, não entrega", async () => {
  const result = await POST(request());
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({
    claimed: 1,
    accepted: 1,
    failed: 0,
    uncertain: 0,
    skipped: 0,
  });
  expect(outcome).toBe("accepted");
  const message = posted as Record<string, unknown> | null;
  expect(message?.Text).toContain(
    `http://127.0.0.1:3000/historico?calculationId=${calculationId}`,
  );
  expect(message?.HTML).toContain("revisão jurídica pendente");
  expect(JSON.stringify(message)).not.toContain(secret);
  expect(message?.To).toEqual([{ Email: "owner@example.invalid" }]);
});
it("cancelamento antes da preparação não envia", async () => {
  cancelled = true;
  const result = await POST(request());
  expect((await result.json()).skipped).toBe(1);
  expect(posted).toBeNull();
});
it("falha antes de postar permite tentativa segura limitada pelo banco", async () => {
  preflightFailed = true;
  await POST(request());
  expect(outcome).toBe("preflight_failed");
  expect(posted).toBeNull();
});
it("timeout depois de iniciar POST fica incerto, sem segunda tentativa", async () => {
  postFailure = true;
  const result = await POST(request());
  expect((await result.json()).uncertain).toBe(1);
  expect(outcome).toBe("send_uncertain");
  expect(
    transport.mock.calls.filter(([url]) =>
      String(url).endsWith("/api/v1/send"),
    ),
  ).toHaveLength(1);
});
it.each([400, 500])(
  "rejeição explícita ou erro do envio %s preserva classificação",
  async (status) => {
    sendStatus = status;
    await POST(request());
    expect(outcome).toBe(status === 400 ? "send_rejected" : "send_uncertain");
  },
);
it("resposta de aceite ilegível fica incerta", async () => {
  badConfirmation = true;
  await POST(request());
  expect(outcome).toBe("send_uncertain");
});
it("falha ao persistir aceite não aparece como sucesso confirmado", async () => {
  settlementFailed = true;
  const result = await POST(request());
  expect((await result.json()).uncertain).toBe(1);
});
function productionReminders() {
  vi.stubEnv("REMINDERS_MODE", "brevo");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("REMINDERS_DELIVERY_ENABLED", "true");
  vi.stubEnv("REMINDERS_APP_URL", "https://tg-kezia2.vercel.app");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://yjukuzgowqtkxvhozhbm.supabase.co",
  );
  vi.stubEnv("BREVO_API_KEY", "xkeysib-fictitious-test-key");
  vi.stubEnv("BREVO_SENDER_EMAIL", "sender@example.invalid");
  sendStatus = 201;
}
it("Brevo obtém apenas sua fila e envia conteúdo mínimo ao dono confirmado", async () => {
  productionReminders();
  const result = await POST(request());
  expect(await result.json()).toEqual({
    claimed: 1,
    accepted: 1,
    failed: 0,
    uncertain: 0,
    skipped: 0,
  });
  expect(String(transport.mock.calls[0][0])).toContain(
    "/rpc/claim_deadline_reminders_for_mode",
  );
  expect(JSON.parse(String(transport.mock.calls[0][1]?.body))).toEqual({
    p_mode: "brevo",
    p_limit: 5,
  });
  const message = posted as Record<string, unknown> | null;
  expect(message?.to).toEqual([{ email: "owner@example.invalid" }]);
  expect(message?.headers).toEqual({ idempotencyKey: id });
  expect(message?.textContent).toContain(
    `https://tg-kezia2.vercel.app/historico?calculationId=${calculationId}`,
  );
  expect(message?.htmlContent).toContain("revisão jurídica pendente");
  expect(message?.htmlContent).not.toContain("TESTE LOCAL");
  expect(JSON.stringify(message)).not.toContain(secret);
  expect(
    transport.mock.calls.some(([url]) => String(url).includes("/api/v1/")),
  ).toBe(false);
});
it("duplicata informada pelo Brevo exige conferência, pois pode já ter sido aceita", async () => {
  productionReminders();
  sendDuplicate = true;
  const result = await POST(request());
  expect((await result.json()).uncertain).toBe(1);
  expect(outcome).toBe("send_uncertain");
});
it.each([400, 429, 500])(
  "Brevo HTTP %s mantém falha explícita ou incerteza sem repetir",
  async (status) => {
    productionReminders();
    sendStatus = status;
    await POST(request());
    expect(outcome).toBe(status < 500 ? "send_rejected" : "send_uncertain");
    expect(
      transport.mock.calls.filter(([url]) =>
        String(url).endsWith("/v3/smtp/email"),
      ),
    ).toHaveLength(1);
  },
);
it("timeout Brevo após POST não provoca segunda tentativa", async () => {
  productionReminders();
  postFailure = true;
  expect((await (await POST(request())).json()).uncertain).toBe(1);
  expect(outcome).toBe("send_uncertain");
  expect(
    transport.mock.calls.filter(([url]) =>
      String(url).endsWith("/v3/smtp/email"),
    ),
  ).toHaveLength(1);
});
it("remetente Brevo inativo bloqueia envio antes do POST", async () => {
  productionReminders();
  relay = true;
  await POST(request());
  expect(posted).toBeNull();
  expect(outcome).toBe("preflight_failed");
});
it("confirmação Brevo ilegível permanece incerta", async () => {
  productionReminders();
  badConfirmation = true;
  await POST(request());
  expect(outcome).toBe("send_uncertain");
});
it("preview não obtém fila nem acessa provedor", async () => {
  productionReminders();
  vi.stubEnv("VERCEL_ENV", "preview");
  expect((await POST(request())).status).toBe(503);
  expect(transport).not.toHaveBeenCalled();
});
function schedulerEnvironment() {
  productionReminders();
  vi.stubEnv(
    "REMINDERS_SCHEDULER_SECRET",
    "fictitious-scheduler-secret-at-least-32-chars",
  );
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
}
it("nonce consumido impede replay antes de novo acesso ao provedor", async () => {
  schedulerEnvironment();
  expect((await POST(signedProbe())).status).toBe(200);
  expect((await POST(signedProbe())).status).toBe(401);
  expect(
    transport.mock.calls.filter(([url]) => String(url).endsWith("/v3/senders")),
  ).toHaveLength(1);
  expect(posted).toBeNull();
});
it.each([-31000, 121000])(
  "assinatura fora da validade %sms é recusada sem banco",
  async (offset) => {
    schedulerEnvironment();
    vi.setSystemTime(new Date(Date.parse("2030-01-01T00:00:00Z") + offset));
    expect((await POST(signedProbe())).status).toBe(401);
    expect(transport).not.toHaveBeenCalled();
  },
);
it.each(["signature", "nonce", "operation"])(
  "alterar %s invalida assinatura",
  async (field) => {
    schedulerEnvironment();
    let req = signedProbe();
    if (field === "signature")
      req.headers.set("X-Prazo-Signature", "0".repeat(64));
    if (field === "nonce") req.headers.set("X-Prazo-Nonce", calculationId);
    if (field === "operation")
      req = new Request(req, {
        body: JSON.stringify({ operation: "dispatch" }),
      });
    expect((await POST(req)).status).toBe(401);
    expect(transport).not.toHaveBeenCalled();
  },
);
it("chamada agendada de dispatch consome nonce antes de obter sua fila", async () => {
  schedulerEnvironment();
  const req = new Request(signedProbe(), {
    body: JSON.stringify({ operation: "dispatch" }),
  });
  req.headers.set(
    "X-Prazo-Signature",
    "3f6312adac62c1cea3005cd874b00ecc667dc9ab158ac9e3a5ea0593cdc8223d",
  );
  const result = await POST(req);
  expect((await result.json()).accepted).toBe(1);
  expect(String(transport.mock.calls[0][0])).toContain(
    "consume_reminder_invocation",
  );
  expect(JSON.parse(String(transport.mock.calls[0][1]?.body))).toEqual({
    p_nonce: token,
    p_timestamp: 1893456000,
    p_operation: "dispatch",
  });
});
it("probe identifica somente o IP bloqueado sem refletir mensagem bruta", async () => {
  schedulerEnvironment();
  providerBlocked = true;
  const result = await POST(signedProbe());
  expect(result.status).toBe(503);
  expect(await result.json()).toEqual({
    probe: true,
    providerReady: false,
    code: "provider_ip_blocked",
    ip: "192.0.2.1",
  });
  expect(posted).toBeNull();
});
