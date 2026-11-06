import { NextResponse } from "next/server";
import { getPublicConfig } from "@/lib/supabase/config";
import { isSameOrigin, privateJson, requestOrigin } from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";

function redirect(target: URL) {
  const response = NextResponse.redirect(target, 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  const failure = new URL("/entrar?auth=google-error", requestOrigin(request));
  const config = getPublicConfig();
  if (!config) return redirect(failure);
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: new URL(
          "/auth/callback",
          requestOrigin(request),
        ).toString(),
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url) return redirect(failure);
    const target = new URL(data.url);
    if (
      target.origin !== new URL(config.url).origin ||
      target.pathname !== "/auth/v1/authorize" ||
      target.searchParams.get("provider") !== "google"
    )
      return redirect(failure);
    return redirect(target);
  } catch {
    return redirect(failure);
  }
}
