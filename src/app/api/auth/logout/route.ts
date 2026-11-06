import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSameOrigin, privateJson } from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return privateJson({ error: "Origem não permitida." }, 403);
  if (!isSupabaseConfigured())
    return privateJson({ error: "Contas ainda não configuradas." }, 503);
  const client = await createClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error)
    return privateJson(
      { error: "Não foi possível sair. Tente novamente." },
      503,
    );
  return privateJson({ success: true });
}
