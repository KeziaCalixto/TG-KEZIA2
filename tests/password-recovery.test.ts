import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/recovery/route";
import { GET as callback } from "@/app/auth/callback/route";
import { createClient } from "@/lib/supabase/server";
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const resetPasswordForEmail = vi.fn();
const exchangeCodeForSession = vi.fn();
const origin = "http://127.0.0.1:3000";
const request = (email: unknown = "fixture@example.test", from = origin) =>
  new Request(`${origin}/api/auth/recovery`, {
    method: "POST",
    headers: { Origin: from, "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo: "https://external.invalid" }),
  });
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture");
  resetPasswordForEmail.mockReset();
  exchangeCodeForSession.mockReset();
  vi.mocked(createClient)
    .mockReset()
    .mockResolvedValue({
      auth: { resetPasswordForEmail, exchangeCodeForSession },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
});
afterEach(() => vi.unstubAllEnvs());
describe("recuperação por e-mail e PKCE", () => {
  it("recusa CSRF e e-mail inválido antes de chamar o provedor", async () => {
    expect(
      (await POST(request(undefined, "https://external.invalid"))).status,
    ).toBe(403);
    expect((await POST(request("invalid"))).status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });
  it("fixa o callback e não revela existência da conta nem detalhes internos", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(resetPasswordForEmail).toHaveBeenCalledWith("fixture@example.test", {
      redirectTo: `${origin}/auth/callback?flow=recovery`,
    });
    expect(await response.text()).not.toContain("user");
    resetPasswordForEmail.mockResolvedValue({
      error: { status: 500, message: "private SMTP detail" },
    });
    expect(await (await POST(request())).text()).not.toContain(
      "private SMTP detail",
    );
  });
  it("trata limite de envio e ausência de configuração", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { status: 429 } });
    expect((await POST(request())).status).toBe(429);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect((await POST(request())).status).toBe(503);
  });
  it("só direciona à definição de senha após trocar código válido", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await callback(
      new Request(
        `${origin}/auth/callback?flow=recovery&code=fixture&next=https://external.invalid`,
      ),
    );
    expect(response.headers.get("location")).toBe(
      `${origin}/conta/definir-senha?auth=recovery`,
    );
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    exchangeCodeForSession.mockResolvedValue({ error: { message: "private" } });
    expect(
      (
        await callback(
          new Request(`${origin}/auth/callback?flow=recovery&code=expired`),
        )
      ).headers.get("location"),
    ).toBe(`${origin}/entrar?auth=callback-error`);
    exchangeCodeForSession.mockClear();
    await callback(new Request(`${origin}/auth/callback?flow=recovery`));
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
