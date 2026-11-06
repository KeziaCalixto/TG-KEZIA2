import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/password/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const getUser = vi.fn();
const updateUser = vi.fn();
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/auth/password", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser, updateUser },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  getUser.mockReset();
  updateUser.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
describe("definição de senha sob identidade verificada", () => {
  it("recusa origem externa antes de acessar a sessão", async () => {
    expect((await POST(request({}, "http://attacker.invalid"))).status).toBe(
      403,
    );
    expect(getUser).not.toHaveBeenCalled();
  });
  it("recusa tamanho e confirmação inválidos", async () => {
    for (const body of [
      { password: "short", confirmation: "short" },
      { password: "valid-password", confirmation: "different" },
      { password: "x".repeat(129), confirmation: "x".repeat(129) },
    ])
      expect((await POST(request(body))).status).toBe(400);
    expect(getUser).not.toHaveBeenCalled();
  });
  it("recusa sessão ausente sem alterar credenciais", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(
      (
        await POST(
          request({
            password: "valid-password",
            confirmation: "valid-password",
          }),
        )
      ).status,
    ).toBe(401);
    expect(updateUser).not.toHaveBeenCalled();
  });
  it("não permite escolher outro usuário e não devolve a senha", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "verified-user" } },
      error: null,
    });
    updateUser.mockResolvedValue({ error: null });
    const response = await POST(
      request({
        password: "valid-password",
        confirmation: "valid-password",
        id: "another-user",
        owner_id: "another-user",
      }),
    );
    expect(response.status).toBe(200);
    expect(updateUser).toHaveBeenCalledWith({ password: "valid-password" });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ message: "Senha definida." });
  });
  it("não expõe erros internos do provedor", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "verified-user" } },
      error: null,
    });
    updateUser.mockResolvedValue({
      error: { message: "internal provider error" },
    });
    const response = await POST(
      request({ password: "valid-password", confirmation: "valid-password" }),
    );
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("internal provider error");
  });
});
