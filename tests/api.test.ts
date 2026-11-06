import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as calculate } from "@/app/api/calculate/route";
import { POST as save, GET as history } from "@/app/api/history/route";
import { GET as session } from "@/app/api/auth/session/route";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
afterEach(() => vi.unstubAllEnvs());
const input = {
  regime: "civil",
  court: "TJSP",
  locality: "São Paulo",
  medium: "electronic",
  communication: "publication",
  eventDate: "2026-10-06",
  days: 5,
};
const request = (body: unknown) =>
  new Request("http://localhost/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("contratos HTTP da aplicação", () => {
  it("valida e calcula no servidor, com resposta sem cache", async () => {
    const response = await calculate(request(input));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect((await response.json()).dueDate).toBe("2026-10-14");
  });
  it("rejeita resultado ou calendário injetado no corpo", async () => {
    const response = await calculate(
      request({ ...input, dueDate: "2026-10-07" }),
    );
    expect(response.status).toBe(400);
  });
  it("não recebe dias corridos como civil comum", async () => {
    const response = await calculate(request({ ...input, regime: "penal" }));
    expect(response.status).toBe(400);
  });
  it("retorna incompleto sem vencimento em caso de lacuna", async () => {
    const response = await calculate(
      request({ ...input, eventDate: "2026-12-17", days: 2 }),
    );
    const body = await response.json();
    expect(body.status).toBe("incomplete");
    expect(body.dueDate).toBeNull();
  });
  it("recusa JSON malformado e payload excessivo", async () => {
    expect(
      (
        await calculate(
          new Request("http://localhost/api/calculate", {
            method: "POST",
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await calculate(request({ text: "x".repeat(20_000) }))).status,
    ).toBe(413);
  });
  it("bloqueia mutações do histórico vindas de outra origem", async () => {
    const response = await save(
      new Request("http://localhost/api/history", {
        method: "POST",
        headers: {
          Origin: "http://attacker.invalid",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      }),
    );
    expect(response.status).toBe(403);
  });
  it("informa ausência de configuração sem expor credenciais ou fingir persistência", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect((await history()).status).toBe(503);
    const response = await session();
    expect(await response.json()).toEqual({ configured: false, user: null });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
