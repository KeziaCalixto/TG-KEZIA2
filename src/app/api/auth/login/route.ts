import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  credentials,
  isSameOrigin,
  privateJson,
  readJson,
} from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  if (!isSupabaseConfigured())
    return privateJson({ error: "Acesso à conta ainda não configurado." }, 503);
  const input = credentials(await readJson(request));
  if (!input)
    return privateJson(
      { error: "Informe um e-mail válido e senha de 8 a 128 caracteres." },
      400,
    );
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error)
    return privateJson(
      {
        error:
          "Não foi possível entrar. Confira os dados e a confirmação do e-mail.",
      },
      401,
    );
  return privateJson({ user: { id: data.user.id, email: data.user.email } });
}
