import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSameOrigin, privateJson, readJson } from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  if (!isSupabaseConfigured())
    return privateJson({ error: "Acesso à conta não configurado." }, 503);
  const input = await readJson(request);
  if (
    !input ||
    typeof input.password !== "string" ||
    input.password.length < 8 ||
    input.password.length > 128 ||
    input.password !== input.confirmation
  )
    return privateJson(
      { error: "Use de 8 a 128 caracteres e confirme a mesma senha." },
      400,
    );
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return privateJson(
      { error: "Entre na sua conta para definir uma senha." },
      401,
    );
  const updated = await client.auth.updateUser({ password: input.password });
  if (updated.error)
    return privateJson(
      {
        error:
          "Não foi possível salvar a senha. Tente outra senha ou entre novamente.",
      },
      400,
    );
  return privateJson({ message: "Senha definida." });
}
