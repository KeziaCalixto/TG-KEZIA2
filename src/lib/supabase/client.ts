"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicConfig } from "./config";

export function createClient() {
  const config = getPublicConfig();
  if (!config) throw new Error("Supabase não configurado.");
  // Invitation fragments are consumed explicitly by InviteSessionBridge.
  // PKCE email and OAuth codes remain exclusive to the server callback.
  return createBrowserClient(config.url, config.key, {
    auth: { detectSessionInUrl: false },
  });
}
