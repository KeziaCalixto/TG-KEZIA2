import { isSupabaseConfigured } from "@/lib/supabase/config";
import { privateJson } from "@/lib/supabase/http";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured())
    return privateJson({ configured: false, user: null });
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  return privateJson({
    configured: true,
    user:
      error || !data.user ? null : { id: data.user.id, email: data.user.email },
  });
}
