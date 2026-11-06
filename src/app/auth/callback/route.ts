import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/supabase/http";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  let success = false;
  if (
    !params.has("error") &&
    code &&
    code.length <= 8192 &&
    isSupabaseConfigured()
  ) {
    try {
      const client = await createClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      success = !error;
    } catch {
      success = false;
    }
  }
  const recovery = params.get("flow") === "recovery";
  const target = new URL(
    success ? (recovery ? "/conta/definir-senha" : "/") : "/entrar",
    requestOrigin(request),
  );
  target.searchParams.set(
    "auth",
    success ? (recovery ? "recovery" : "confirmed") : "callback-error",
  );
  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
