import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/signup/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
const signUp = vi.fn();
const origin = "https://tg-kezia2.vercel.app";
const request = () =>
  new Request(`${origin}/api/auth/signup`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "fixture@example.test",
      password: "fixture-password",
    }),
  });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");
  signUp.mockReset();
  vi.mocked(createClient).mockResolvedValue({
    auth: { signUp },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
});
afterEach(() => vi.unstubAllEnvs());

describe("cadastro hospedado e limite de envio", () => {
  it("explica o intervalo entre envios sem expor a mensagem interna", async () => {
    signUp.mockResolvedValue({
      error: {
        status: 429,
        code: "over_email_send_rate_limit",
        message: "private provider details",
      },
    });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    const body = await response.json();
    expect(body.error).toContain("Aguarde");
    expect(body.error).toContain("convite");
    expect(body.error).not.toContain("private provider details");
  });
  it("preserva erro genérico para falhas SMTP diferentes de limite", async () => {
    signUp.mockResolvedValue({
      error: { status: 500, message: "private SMTP details" },
    });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("private SMTP details");
  });
  it("usa a origem HTTPS do cadastro no callback sem revelar se a conta existe", async () => {
    signUp.mockResolvedValue({ error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { emailRedirectTo: `${origin}/auth/callback` },
      }),
    );
    const body = await response.json();
    expect(body.requiresEmailConfirmation).toBe(true);
    expect(body).not.toHaveProperty("user");
  });
});
