import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  isSameOrigin,
  privateJson,
  readJson,
  requestOrigin,
} from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  if (!isSupabaseConfigured())
    return privateJson(
      { error: "Recuperação de senha ainda não configurada." },
      503,
    );
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return privateJson({ error: "Informe um e-mail válido." }, 400);
  try {
    const client = await createClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${requestOrigin(request)}/auth/callback?flow=recovery`,
    });
    if (error?.status === 429)
      return privateJson(
        {
          error:
            "Muitas tentativas de envio. Aguarde um pouco antes de tentar novamente.",
        },
        429,
      );
    if (error)
      return privateJson(
        {
          error:
            "Não foi possível solicitar a recuperação. Tente novamente mais tarde.",
        },
        503,
      );
    return privateJson({
      message:
        "Se houver uma conta elegível para esse e-mail, você receberá um link para definir uma nova senha. Verifique também o spam e abra o link neste mesmo navegador.",
    });
  } catch {
    return privateJson(
      {
        error:
          "Não foi possível solicitar a recuperação. Tente novamente mais tarde.",
      },
      503,
    );
  }
}
