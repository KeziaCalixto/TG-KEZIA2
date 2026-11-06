type InviteFragment =
  | { kind: "invite"; accessToken: string; refreshToken: string }
  | { kind: "error" };

// The email invitation uses an implicit fragment, independently of signup PKCE.
// Parse only this supported flow; never reflect provider errors or destinations.
export function readInviteFragment(hash: string): InviteFragment | null {
  const values = new URLSearchParams(hash.replace(/^#/, ""));
  if (
    ![
      "access_token",
      "refresh_token",
      "error",
      "error_code",
      "error_description",
    ].some((name) => values.has(name))
  )
    return null;
  const accessToken = values.get("access_token");
  const refreshToken = values.get("refresh_token");
  if (
    values.has("error") ||
    values.has("error_code") ||
    values.has("error_description") ||
    values.get("type") !== "invite" ||
    !accessToken ||
    !refreshToken ||
    accessToken.length > 8192 ||
    refreshToken.length > 2048
  )
    return { kind: "error" };
  return { kind: "invite", accessToken, refreshToken };
}
