import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  credentials,
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
    return privateJson({ error: "Cadastro ainda não configurado." }, 503);
  const input = credentials(await readJson(request));
  if (!input)
    return privateJson(
      { error: "Informe um e-mail válido e senha de 8 a 128 caracteres." },
      400,
    );
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...input,
    options: {
      emailRedirectTo: new URL(
        "/auth/callback",
        requestOrigin(request),
      ).toString(),
    },
  });
  if (error?.status === 429)
    return privateJson(
      {
        error:
          "Muitas tentativas de envio. Aguarde um pouco antes de tentar novamente. Se recebeu um convite, abra o link do e-mail para continuar.",
      },
      429,
    );
  if (error)
    return privateJson(
      { error: "Não foi possível cadastrar. Tente novamente mais tarde." },
      400,
    );
  return privateJson({
    message:
      "Se o cadastro puder ser realizado, você receberá um e-mail de confirmação. Verifique sua caixa de entrada.",
    requiresEmailConfirmation: true,
  });
}
