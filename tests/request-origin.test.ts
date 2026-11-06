import { describe, expect, it } from "vitest";
import { isSameOrigin, requestOrigin } from "@/lib/supabase/http";

describe("origem HTTP atrás do proxy local Next.js", () => {
  const local = (origin?: string, host = "127.0.0.1:3000") =>
    new Request("http://localhost:3000/api/auth/signup", {
      headers: { Host: host, ...(origin ? { Origin: origin } : {}) },
    });

  it("preserva o endereço loopback do navegador normalizado pelo proxy", () => {
    const request = local("http://127.0.0.1:3000");
    expect(isSameOrigin(request)).toBe(true);
    expect(requestOrigin(request)).toBe("http://127.0.0.1:3000");
  });
  it("recusa origem ausente, externa ou com outra porta/esquema", () => {
    for (const origin of [
      undefined,
      "http://attacker.invalid",
      "http://127.0.0.1:4000",
      "https://127.0.0.1:3000",
    ])
      expect(isSameOrigin(local(origin))).toBe(false);
  });
  it("não transforma Host externo ou porta diferente em origem de callback", () => {
    for (const host of [
      "attacker.invalid",
      "127.0.0.1:4000",
      "localhost:3000@attacker.invalid",
    ])
      expect(requestOrigin(local(undefined, host))).toBe(
        "http://localhost:3000",
      );
  });
  it("preserva origem pública sem confiar em Host ou forwarded headers", () => {
    const request = new Request("https://app.example.com/auth/callback", {
      headers: {
        Host: "attacker.invalid",
        "X-Forwarded-Host": "attacker.invalid",
        Origin: "https://app.example.com",
      },
    });
    expect(requestOrigin(request)).toBe("https://app.example.com");
    expect(isSameOrigin(request)).toBe(true);
  });
});
