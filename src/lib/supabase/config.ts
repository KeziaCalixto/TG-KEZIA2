export function getPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    // Privileged credentials must never enter a public client.
    if (!key.startsWith("sb_publishable_")) return null;
    return { url, key };
  } catch {
    return null;
  }
}

export function isSupabaseConfigured() {
  return getPublicConfig() !== null;
}
