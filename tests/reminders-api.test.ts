import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { POST, GET, DELETE } from "@/app/api/reminders/route";
import { createClient } from "@supabase/supabase-js";
import { calculateForMvp } from "@/application/calculate";
vi.mock("server-only", () => ({}));
const io = vi.hoisted(() => ({
  database: vi.fn<typeof fetch>(),
  user: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => {
    const client = createClient(
      "http://127.0.0.1:54321",
      "sb_publishable_test",
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: io.database },
      },
    );
    client.auth.getUser = io.user;
    return client;
  },
}));
const id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const reminderId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
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
function response(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
function request(body: unknown, method = "POST") {
  return new Request("http://localhost/api/reminders", {
    method,
    headers: { Origin: "http://localhost", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.stubEnv("REMINDERS_MODE", "local");
  vi.stubEnv("REMINDERS_APP_URL", "http://127.0.0.1:3000");
  vi.stubEnv("REMINDERS_MAILPIT_URL", "http://127.0.0.1:54324");
  vi.stubEnv("REMINDERS_SUPABASE_SECRET_KEY", "sb_secret_test");
  vi.stubEnv(
    "REMINDERS_DISPATCH_SECRET",
    "test-only-secret-with-at-least-32-characters",
  );
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  io.user.mockResolvedValue({
    data: {
      user: {
        id: "owner",
        email: "owner@example.invalid",
        email_confirmed_at: "2026-01-01",
        is_anonymous: false,
      },
    },
    error: null,
  });
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2030-01-04T11:59:00Z"));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  io.database.mockReset();
  io.user.mockReset();
});
it("recusa origem externa antes de qualquer agendamento", async () => {
  const response = await POST(
    new Request("http://localhost/api/reminders", {
      method: "POST",
      headers: {
        Origin: "https://external.invalid",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        calculationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        leadDays: 1,
        hour: 9,
      }),
    }),
  );
  expect(response.status).toBe(403);
});
it("fica indisponível sem habilitação local explícita e não consulta dados", async () => {
  vi.stubEnv("REMINDERS_MODE", "");
  expect(
    await (
      await GET(new Request("http://localhost/api/reminders?ids=" + id))
    ).json(),
  ).toEqual({ available: false, reminders: [] });
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
  ).toBe(503);
  expect(io.database).not.toHaveBeenCalled();
});
it("destino remoto desabilita o recurso local", async () => {
  vi.stubEnv("REMINDERS_MAILPIT_URL", "https://remote.invalid");
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
  ).toBe(503);
});
it.each([
  { email: "x@example.invalid" },
  { owner_id: "other" },
  { sendAt: "2030-01-01" },
  { leadDays: 2 },
  { hour: 8 },
])("recusa campos e opções arbitrários %j", async (extra) => {
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9, ...extra })))
      .status,
  ).toBe(400);
  expect(io.database).not.toHaveBeenCalled();
});
it("recusa pessoa sem sessão ou e-mail confirmado", async () => {
  io.user.mockResolvedValueOnce({ data: { user: null }, error: null });
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
  ).toBe(401);
  io.user.mockResolvedValueOnce({
    data: { user: { id: "owner", email: "x@example.invalid" } },
    error: null,
  });
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
  ).toBe(403);
});
it("não agenda cálculo ausente ou alheio", async () => {
  io.database.mockResolvedValue(response(null));
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
  ).toBe(404);
  const url = new URL(String(io.database.mock.calls[0][0]));
  expect(url.searchParams.get("owner_id")).toBe("eq.owner");
});
it.each([{}, { ...snapshot, status: "incomplete", dueDate: null }])(
  "memória inválida/incompleta não é agendada",
  async (value) => {
    io.database.mockResolvedValue(response({ result_snapshot: value }));
    expect(
      (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
    ).toBe(409);
    expect(io.database).toHaveBeenCalledTimes(1);
  },
);
it("rejeita horário exatamente igual ao agora, sem RPC", async () => {
  vi.setSystemTime(new Date("2030-01-04T12:00:00Z"));
  io.database.mockResolvedValue(response({ result_snapshot: snapshot }));
  expect(
    (await POST(request({ calculationId: id, leadDays: 3, hour: 9 }))).status,
  ).toBe(409);
  expect(io.database).toHaveBeenCalledTimes(1);
});
it("agenda pelo original, enviando somente ID e opções à RPC", async () => {
  io.database
    .mockResolvedValueOnce(response({ result_snapshot: snapshot }))
    .mockResolvedValueOnce(response(reminderId));
  const result = await POST(
    request({ calculationId: id, leadDays: 3, hour: 9 }),
  );
  expect(result.status).toBe(201);
  expect(await result.json()).toEqual({ id: reminderId });
  expect(JSON.parse(String(io.database.mock.calls[1][1]?.body))).toEqual({
    p_calculation_id: id,
    p_lead_days: 3,
    p_hour: 9,
  });
  expect(result.headers.get("Cache-Control")).toBe("private, no-store");
});
it.each([
  ["23505", 409],
  ["P0002", 404],
  ["internal", 503],
])("trata erro %s sem expor conteúdo interno", async (code, status) => {
  io.database
    .mockResolvedValueOnce(response({ result_snapshot: snapshot }))
    .mockResolvedValueOnce(
      response({ code, message: "sensitive-provider-text" }, 400),
    );
  const result = await POST(
    request({ calculationId: id, leadDays: 1, hour: 9 }),
  );
  expect(result.status).toBe(status);
  expect(JSON.stringify(await result.json())).not.toContain(
    "sensitive-provider-text",
  );
});
it("cancelar todos solicita RPC sem escolher proprietário", async () => {
  io.database.mockResolvedValue(response(2));
  expect(await (await DELETE(request({ all: true }, "DELETE"))).json()).toEqual(
    { cancelled: 2 },
  );
  expect(JSON.parse(String(io.database.mock.calls[0][1]?.body))).toEqual({
    p_id: null,
  });
});
it("cancelar ID inexistente ou alheio não confirma exclusão", async () => {
  io.database.mockResolvedValue(response(0));
  expect((await DELETE(request({ id: reminderId }, "DELETE"))).status).toBe(
    404,
  );
});
it("listagem limita IDs e não aceita parâmetros repetidos", async () => {
  expect(
    (
      await GET(
        new Request("http://localhost/api/reminders?ids=" + id + "&ids=" + id),
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await GET(
        new Request(
          "http://localhost/api/reminders?ids=" + Array(51).fill(id).join(","),
        ),
      )
    ).status,
  ).toBe(400);
  io.database.mockResolvedValue(response([]));
  expect(
    await (
      await GET(new Request("http://localhost/api/reminders?ids=" + id))
    ).json(),
  ).toEqual({ available: true, reminders: [] });
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
}
it("produção explicitamente configurada lista somente o modo Brevo", async () => {
  productionReminders();
  io.database.mockResolvedValue(response([]));
  const result = await GET(
    new Request("http://localhost/api/reminders?ids=" + id),
  );
  expect(await result.json()).toEqual({
    available: true,
    mode: "brevo",
    reminders: [],
  });
  expect(String(io.database.mock.calls[0][0])).toContain(
    "/rpc/list_deadline_reminders_for_mode",
  );
  expect(JSON.parse(String(io.database.mock.calls[0][1]?.body))).toEqual({
    p_ids: [id],
    p_mode: "brevo",
  });
});
it("agendamento externo escolhe o modo no servidor e preserva opções", async () => {
  productionReminders();
  io.database
    .mockResolvedValueOnce(response({ result_snapshot: snapshot }))
    .mockResolvedValueOnce(response(reminderId));
  expect(
    (
      await POST(
        request({
          calculationId: id,
          leadDays: 1,
          hour: 9,
          externalEmailConsent: true,
        }),
      )
    ).status,
  ).toBe(201);
  expect(String(io.database.mock.calls[1][0])).toContain(
    "/rpc/schedule_deadline_reminder_for_mode",
  );
  expect(JSON.parse(String(io.database.mock.calls[1][1]?.body))).toEqual({
    p_calculation_id: id,
    p_lead_days: 1,
    p_hour: 9,
    p_mode: "brevo",
  });
});
it("tela local antiga não pode ativar envio externo após troca de ambiente", async () => {
  productionReminders();
  expect(
    (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
  ).toBe(409);
  expect(io.database).not.toHaveBeenCalled();
});
it.each([
  ["VERCEL_ENV", "preview"],
  ["VERCEL_ENV", "development"],
  ["VERCEL_ENV", ""],
  ["REMINDERS_DELIVERY_ENABLED", "false"],
  ["REMINDERS_APP_URL", "https://preview.invalid"],
  ["NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"],
  ["BREVO_API_KEY", ""],
  ["BREVO_API_KEY", "xsmtpsib-fictitious-test-key"],
  ["BREVO_SENDER_EMAIL", "invalid"],
  ["REMINDERS_SUPABASE_SECRET_KEY", "sb_publishable_fictitious"],
])(
  "configuração externa inválida %s não consulta nem agenda",
  async (name, value) => {
    productionReminders();
    vi.stubEnv(name, value);
    expect(
      await (
        await GET(new Request("http://localhost/api/reminders?ids=" + id))
      ).json(),
    ).toEqual({ available: false, reminders: [] });
    expect(
      (await POST(request({ calculationId: id, leadDays: 1, hour: 9 }))).status,
    ).toBe(503);
    expect(io.database).not.toHaveBeenCalled();
  },
);
