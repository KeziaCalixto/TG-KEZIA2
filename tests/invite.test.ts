import { describe, expect, it } from "vitest";
import { readInviteFragment } from "@/lib/supabase/invite";

describe("retorno de convite administrativo", () => {
  it("distingue convite implícito do cadastro PKCE", () => {
    expect(
      readInviteFragment(
        "#access_token=example&refresh_token=refresh&type=invite&expires_in=3600",
      ),
    ).toEqual({
      kind: "invite",
      accessToken: "example",
      refreshToken: "refresh",
    });
    expect(readInviteFragment("#conteudo")).toBeNull();
    expect(readInviteFragment("")).toBeNull();
    expect(readInviteFragment("#code=pkce")).toBeNull();
  });
  it("recusa fragmentos incompletos ou fluxos diferentes", () => {
    for (const fragment of [
      "#access_token=example&type=invite",
      "#refresh_token=example&type=invite",
      "#access_token=example&refresh_token=refresh&type=recovery",
      "#access_token=example&refresh_token=refresh",
    ])
      expect(readInviteFragment(fragment)).toEqual({ kind: "error" });
  });
  it("não reflete erros do provedor ou destinos enviados na URL", () => {
    expect(
      readInviteFragment(
        "#error=access_denied&error_description=untrusted&next=https://attacker.invalid",
      ),
    ).toEqual({ kind: "error" });
    expect(
      readInviteFragment(
        "#access_token=example&refresh_token=refresh&type=invite&next=https://attacker.invalid",
      ),
    ).toEqual({
      kind: "invite",
      accessToken: "example",
      refreshToken: "refresh",
    });
  });
  it("limita credenciais excessivas", () => {
    expect(
      readInviteFragment(
        `#access_token=${"x".repeat(8193)}&refresh_token=refresh&type=invite`,
      ),
    ).toEqual({ kind: "error" });
    expect(
      readInviteFragment(
        `#access_token=example&refresh_token=${"x".repeat(2049)}&type=invite`,
      ),
    ).toEqual({ kind: "error" });
  });
});
