import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/history/route";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { calculateForMvp } from "@/application/calculate";

// Mock only external Auth/PostgREST transport. Real ownership is tested locally.
const databaseFetch = vi.fn<typeof fetch>();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => {
    const client = createSupabaseClient(
      "http://127.0.0.1:54321",
      "public-test-key",
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: databaseFetch },
      },
    );
    client.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "owner", is_anonymous: false } },
      error: null,
    });
    return client;
  },
}));
const input = {
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-10-06",
  days: 15,
};
function configure(rows: unknown[], total = rows.length) {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  databaseFetch.mockResolvedValue(
    new Response(JSON.stringify(rows), {
      headers: {
        "Content-Type": "application/json",
        "Content-Range": `0-${Math.max(0, rows.length - 1)}/${total}`,
      },
    }),
  );
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.clearAllMocks();
  databaseFetch.mockReset();
});
describe("histórico — contrato de organização", () => {
  it("link de lembrete consulta somente o ID indicado sob o proprietário", async () => {
    const id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    configure([], 0);
    expect(
      (
        await GET(
          new Request(`http://localhost/api/history?calculationId=${id}`),
        )
      ).status,
    ).toBe(200);
    const query = new URL(String(databaseFetch.mock.calls[0][0]));
    expect(query.searchParams.get("id")).toBe(`eq.${id}`);
    expect(query.searchParams.get("owner_id")).toBe("eq.owner");
  });
  it("página esvaziada pode receber PGRST103; recupera o total sob o mesmo proprietário/filtro", async () => {
    configure([]);
    databaseFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "PGRST103", message: "range" }), {
        status: 416,
        headers: { "Content-Type": "application/json" },
      }),
    );
    databaseFetch.mockResolvedValueOnce(
      new Response(null, { headers: { "Content-Range": "*/10" } }),
    );
    const response = await GET(
      new Request("http://localhost/api/history?page=2&regime=labor"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.calculations).toEqual([]);
    expect(body.pagination.total).toBe(10);
    expect(body.pagination.totalPages).toBe(1);
    const recount = new URL(String(databaseFetch.mock.calls[1][0]));
    expect(recount.searchParams.get("owner_id")).toBe("eq.owner");
    expect(recount.searchParams.get("input->>regime")).toBe("eq.labor");
  });
  it.each([
    "page=0",
    "page=1001",
    "page=1.5",
    "page=abc",
    "page=",
    "page=1&page=2",
    "pageSize=0",
    "pageSize=51",
    "regime=penal",
    "regime=civil&regime=labor",
  ])("recusa consulta inválida %s", async (query) => {
    configure([]);
    const response = await GET(
      new Request(`http://localhost/api/history?${query}`),
    );
    expect(response.status).toBe(400);
    expect(databaseFetch).not.toHaveBeenCalled();
  });
  it("vazio e página além do total preservam limites e contagem", async () => {
    configure([], 0);
    expect((await (await GET()).json()).pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });
    configure([], 2);
    const later = await (
      await GET(new Request("http://localhost/api/history?page=3&pageSize=2"))
    ).json();
    expect(later.calculations).toEqual([]);
    expect(later.pagination).toEqual({
      page: 3,
      pageSize: 2,
      total: 2,
      totalPages: 1,
      hasPrevious: true,
      hasNext: false,
    });
  });
  it("memória ilegível ou incompleta não ganha situação de vencimento", async () => {
    const incomplete = calculateForMvp({
      ...input,
      eventDate: "2026-12-18",
      days: 2,
    });
    configure([
      { id: "invalid", result_snapshot: { dueDate: "2020-01-01" } },
      { id: "incomplete", result_snapshot: incomplete },
    ]);
    const body = await (await GET()).json();
    expect(
      body.calculations.map((row: { dueStatus: string }) => row.dueStatus),
    ).toEqual(["undetermined", "undetermined"]);
  });
  it("falha de consulta ou contagem não é apresentada como histórico vazio", async () => {
    configure([]);
    databaseFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect((await GET()).status).toBe(503);
    databaseFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "internal", code: "bad_query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const response = await GET();
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("internal");
  });
  it("compara a data original com o dia de São Paulo, mantendo a memória intacta", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T02:59:00Z")); // Ainda 21/10 em SP.
    const snapshot = calculateForMvp(input); // 28/10; snapshot representa versão antiga.
    const saved = {
      ...snapshot,
      dueDate: "2026-10-22",
      metadata: { ...snapshot.metadata, engineVersion: "old" },
    };
    configure([{ id: "old", input, result_snapshot: saved }]);
    const first = await (await GET()).json();
    expect(first.asOfDate).toBe("2026-10-21");
    expect(first.timeZone).toBe("America/Sao_Paulo");
    expect(first.calculations[0].dueStatus).toBe("future");
    expect(first.calculations[0].result_snapshot).toEqual(saved);
    expect(first.calculations[0].recomputed).toBeNull();
    vi.setSystemTime(new Date("2026-10-22T03:00:00Z"));
    configure([{ id: "old", input, result_snapshot: saved }]);
    const second = await (await GET()).json();
    expect(second.asOfDate).toBe("2026-10-22");
    expect(second.calculations[0].dueStatus).toBe("today");
    vi.setSystemTime(new Date("2026-10-23T03:00:00Z"));
    configure([{ id: "old", input, result_snapshot: saved }]);
    expect((await (await GET()).json()).calculations[0].dueStatus).toBe("past");
  });
  it("filtra o ramo antes de paginar, preserva proprietário e desempate", async () => {
    configure(
      [
        {
          id: "saved",
          title: "Teste",
          input,
          result_snapshot: calculateForMvp(input),
          created_at: "2026-10-22T12:00:00Z",
        },
      ],
      5,
    );
    const response = await GET(
      new Request(
        "http://localhost/api/history?page=2&pageSize=2&regime=labor",
      ),
    );
    const body = await response.json();
    expect(body.pagination).toEqual({
      page: 2,
      pageSize: 2,
      total: 5,
      totalPages: 3,
      hasPrevious: true,
      hasNext: true,
    });
    const url = new URL(String(databaseFetch.mock.calls[0][0]));
    expect(url.searchParams.get("owner_id")).toBe("eq.owner");
    expect(url.searchParams.get("input->>regime")).toBe("eq.labor");
    expect(url.searchParams.get("offset")).toBe("2");
    expect(url.searchParams.get("limit")).toBe("2");
    expect(url.searchParams.get("order")).toBe("created_at.desc,id.desc");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
  it("recusa parâmetros desconhecidos antes de consultar o banco", async () => {
    configure([]);
    const response = await GET(
      new Request("http://localhost/api/history?owner_id=outro"),
    );
    expect(response.status).toBe(400);
  });
});
