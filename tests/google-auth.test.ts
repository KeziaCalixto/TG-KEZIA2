import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/google/route";
import { GET as callback } from "@/app/auth/callback/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const signInWithOAuth = vi.fn();
const exchangeCodeForSession = vi.fn();
const origin = "https://tg-kezia2.vercel.app";
const authUrl =
  "https://fixture.supabase.co/auth/v1/authorize?provider=google&code_challenge=fixture";
const request = (from = origin) =>
  new Request(`${origin}/api/auth/google?next=https://external.invalid`, {
    method: "POST",
    headers: { Origin: from },
  });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fixture.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture");
  signInWithOAuth.mockReset();
  exchangeCodeForSession.mockReset();
  vi.mocked(createClient)
    .mockReset()
    .mockResolvedValue({
      auth: { signInWithOAuth, exchangeCodeForSession },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
});
afterEach(() => vi.unstubAllEnvs());

describe("início do OAuth Google no servidor", () => {
  it("recusa origem externa antes de iniciar OAuth", async () => {
    expect((await POST(request("https://external.invalid"))).status).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
  });
  it("fixa Google e callback da mesma origem, sem aceitar destino do navegador", async () => {
    signInWithOAuth.mockResolvedValue({ data: { url: authUrl }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(authUrl);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
  });
  it("recupera ausência de configuração com destino fixo", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const response = await POST(request());
    expect(response.headers.get("location")).toBe(
      `${origin}/entrar?auth=google-error`,
    );
    expect(createClient).not.toHaveBeenCalled();
  });
  it("não redireciona para URL externa ou de outro provedor", async () => {
    for (const url of [
      "https://external.invalid",
      "https://fixture.supabase.co/auth/v1/authorize?provider=github",
      "invalid",
    ]) {
      signInWithOAuth.mockResolvedValue({ data: { url }, error: null });
      const response = await POST(request());
      expect(response.headers.get("location")).toBe(
        `${origin}/entrar?auth=google-error`,
      );
    }
  });
  it("não revela erro ou segredo do provedor", async () => {
    signInWithOAuth.mockRejectedValue(new Error("private provider details"));
    const response = await POST(request());
    expect(response.headers.get("location")).toBe(
      `${origin}/entrar?auth=google-error`,
    );
    expect(await response.text()).not.toContain("private provider details");
  });
});

describe("retorno PKCE compartilhado por e-mail e Google", () => {
  it("troca o código e usa destino fixo, sem refletir next", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await callback(
      new Request(
        `${origin}/auth/callback?code=fixture-code&next=https://external.invalid`,
      ),
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith("fixture-code");
    expect(response.headers.get("location")).toBe(`${origin}/?auth=confirmed`);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("trata cancelamento sem trocar código nem refletir descrição", async () => {
    const response = await callback(
      new Request(
        `${origin}/auth/callback?error=access_denied&error_description=private-detail&code=unexpected`,
      ),
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      `${origin}/entrar?auth=callback-error`,
    );
  });
  it("trata código expirado ou indisponibilidade com erro genérico", async () => {
    exchangeCodeForSession
      .mockResolvedValueOnce({ error: { message: "private" } })
      .mockRejectedValueOnce(new Error("private"));
    for (let i = 0; i < 2; i++) {
      const response = await callback(
        new Request(`${origin}/auth/callback?code=expired`),
      );
      expect(response.headers.get("location")).toBe(
        `${origin}/entrar?auth=callback-error`,
      );
    }
  });
});
